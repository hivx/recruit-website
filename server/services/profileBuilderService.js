// services/profileBuilderService.js
const cfg = require("../config/profile.config");
const prisma = require("../utils/prisma");

//event_type in user_interest_history -> EVENT_WEIGHT in /profile.config.js
const EVENT_ALIAS = {
  open_detail: "view",
  add_favorite: "favorite",
  remove_favorite: "unfavorite",
  apply_with_cv: "apply",
};

const toKey = (s) =>
  String(s || "")
    .trim()
    .toLowerCase();

// Chuyển tags (TEXT hoặc JSON) -> mảng
function toArrayTags(val) {
  if (!val) {
    return [];
  }
  if (Array.isArray(val)) {
    return val;
  }
  if (typeof val === "string") {
    try {
      const arr = JSON.parse(val);
      return Array.isArray(arr) ? arr : val.split(",").map((s) => s.trim());
    } catch {
      return val.split(",").map((s) => s.trim());
    }
  }
  return [];
}

// Time decay: exp(-Δt / tau)
function decayFactor(recordedAt) {
  try {
    const dt = new Date(recordedAt).getTime();
    const days = Math.max(0, (Date.now() - dt) / (24 * 3600 * 1000));
    return Math.exp(-days / cfg.TIME_DECAY_DAYS);
  } catch {
    return 1;
  }
}

// Lấy top K tag có điểm cao nhất
function normalizeTopK(map, K) {
  const arr = Object.entries(map)
    .filter(([, v]) => Number.isFinite(v) && v !== 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, K);
  const max = arr.length ? Math.max(...arr.map(([, v]) => v)) : 1;
  return arr.map(([name, v]) => ({
    name,
    weight: max ? Number((v / max).toFixed(4)) : 0,
  }));
}

// Debounce rebuild để tránh chạy liên tục
async function shouldRebuild(userId) {
  const prof = await prisma.userBehaviorProfile.findUnique({
    where: { user_id: BigInt(userId) },
    select: { updated_at: true },
  });
  if (!prof) {
    return true;
  }
  const mins = (Date.now() - new Date(prof.updated_at).getTime()) / 60000;
  return mins >= cfg.MIN_REBUILD_INTERVAL_MINUTES;
}

// ================== service chính =====================

exports.rebuildForUser = async (userId) => {
  const uid = BigInt(userId);

  // Kiểm tra có cần rebuild không
  if (!(await shouldRebuild(uid))) {
    return { skipped: true, reason: "too_soon" };
  }

  // Lấy dữ liệu cần thiết
  const since = calcSince(cfg.HISTORY_WINDOW_DAYS);
  const [pref, events] = await fetchUserSignals(uid, since);

  // Phân tích hành vi từ events
  const { tagScore, locScore, salarySumW, weightSum } =
    analyzeUserEvents(events);

  // Áp dụng CareerPreference
  applyPreferencePrior(pref, tagScore, locScore);

  // Tính toán kết quả tổng hợp
  const { main_location, avg_salary, topTags } = computeAggregates(
    pref,
    tagScore,
    locScore,
    salarySumW,
    weightSum,
  );

  // Ghi vào DB
  const saved = await upsertBehaviorProfile(uid, {
    main_location,
    avg_salary,
    topTags,
  });

  // Trả kết quả
  return buildResponse(userId, saved);
};

//
// ──────────────────────────────── HÀM PHỤ ────────────────────────────────
//

function calcSince(days) {
  return new Date(Date.now() - days * 24 * 3600 * 1000);
}

async function fetchUserSignals(uid, since) {
  return Promise.all([
    prisma.careerPreference.findUnique({
      where: { user_id: uid },
      include: { tags: { include: { tag: true } } },
    }),
    prisma.userInterestHistory.findMany({
      where: { user_id: uid, recorded_at: { gte: since } },
      orderBy: { recorded_at: "desc" },
      take: 2000,
    }),
  ]);
}

function analyzeUserEvents(events) {
  const tagScore = Object.create(null);
  const locScore = Object.create(null);
  let salarySumW = 0;
  let weightSum = 0;

  for (const e of events) {
    const stdEvent = EVENT_ALIAS[String(e.event_type).toLowerCase()] || null;
    if (!stdEvent) {
      continue;
    }

    const baseW = cfg.EVENT_WEIGHT[stdEvent] ?? 0;
    if (!baseW) {
      continue;
    }

    const w = baseW * decayFactor(e.recorded_at);
    addTags(tagScore, e.tags, w);

    // ---- LOCATION: lấy từ job.location; nếu null -> bỏ qua ----
    const locFromJob = e.job?.location || null;
    addLocation(locScore, locFromJob, w);

    ({ salarySumW, weightSum } = addSalary(
      e,
      stdEvent,
      w,
      salarySumW,
      weightSum,
    ));
  }

  return { tagScore, locScore, salarySumW, weightSum };
}

function addTags(tagScore, tags, weight) {
  const arr = toArrayTags(tags);
  for (const t of arr) {
    const k = toKey(t);
    if (!k) {
      continue;
    }
    tagScore[k] = (tagScore[k] || 0) + weight;
  }
}

function addLocation(locScore, loc, weight) {
  const key = toKey(loc);
  if (key) {
    locScore[key] = (locScore[key] || 0) + weight;
  }
}

function addSalary(e, stdEvent, weight, sum, wSum) {
  if (!["favorite", "apply"].includes(stdEvent)) {
    return { salarySumW: sum, weightSum: wSum };
  }

  const mid = Number(e.avg_salary) || 0;
  if (mid > 0) {
    sum += weight * mid;
    wSum += weight;
  }
  return { salarySumW: sum, weightSum: wSum };
}

function applyPreferencePrior(pref, tagScore, locScore) {
  if (!pref) {
    return;
  }

  for (const t of pref.tags || []) {
    const k = toKey(t.tag?.name);
    if (k) {
      tagScore[k] = (tagScore[k] || 0) + cfg.PRIOR.tag;
    }
  }

  const loc = toKey(pref.desired_location);
  if (loc) {
    locScore[loc] = (locScore[loc] || 0) + cfg.PRIOR.location;
  }
}

function computeAggregates(pref, tagScore, locScore, salarySumW, weightSum) {
  const topTags = normalizeTopK(tagScore, cfg.TOPK_TAGS);
  const main_location = computeMainLocation(locScore, pref);
  const avg_salary = computeAvgSalary(salarySumW, weightSum, pref);
  return { main_location, avg_salary, topTags };
}

function computeMainLocation(locScore, pref) {
  const locArr = Object.entries(locScore).sort((a, b) => b[1] - a[1]);
  if (locArr.length) {
    return locArr[0][0];
  }
  return pref?.desired_location || null;
}

// HÀM ĐÃ SỬA: blend giữa hành vi và lương mong muốn
function computeAvgSalary(salarySumW, weightSum, pref) {
  const desiredSalary = Number(pref?.desired_salary) || 0;

  if (weightSum > 0 && desiredSalary > 0) {
    const behaviorSalary = weightSum > 0 ? (salarySumW || 0) / weightSum : 0;
    const blendRatio = 1 - cfg.PRIOR.desSalaryWe; // 70% hành vi, 30% mong muốn
    return Math.round(
      blendRatio * behaviorSalary + (1 - blendRatio) * desiredSalary,
    );
  }

  if (weightSum > 0) {
    return Math.round(salarySumW / weightSum);
  }

  if (cfg.PRIOR.salaryFallback && desiredSalary > 0) {
    return desiredSalary;
  }

  return null;
}

async function upsertBehaviorProfile(
  uid,
  { main_location, avg_salary, topTags },
) {
  return prisma.userBehaviorProfile.upsert({
    where: { user_id: uid },
    update: {
      avg_salary: avg_salary ?? null,
      main_location: main_location || null,
      tags: topTags,
      updated_at: new Date(),
    },
    create: {
      user_id: uid,
      avg_salary: avg_salary ?? null,
      main_location: main_location || null,
      tags: topTags,
    },
  });
}

function buildResponse(userId, saved) {
  return {
    user_id: String(userId),
    avg_salary: saved.avg_salary ?? null,
    main_location: saved.main_location || null,
    tags: saved.tags || [],
    skipped: false,
  };
}
