const cfg = require("../config/profile.config");
const { extractTopKeywords } = require("../utils/keywordExtractor");
const prisma = require("../utils/prisma");

// event_type in user_interest_history -> EVENT_WEIGHT in /profile.config.js
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
function toArray(val) {
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

// Lấy top K có điểm cao nhất
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

// ================== SERVICE CHÍNH =====================

exports.rebuildForUser = async (userId) => {
  const uid = BigInt(userId);

  if (!(await shouldRebuild(uid))) {
    return { skipped: true, reason: "too_soon" };
  }

  const since = calcSince(cfg.HISTORY_WINDOW_DAYS);
  const [pref, events] = await fetchUserSignals(uid, since);

  const { tagScore, keywordScore, locScore, salarySumW, weightSum } =
    analyzeUserEvents(events);

  applyPreferencePrior(pref, tagScore, locScore);

  const { main_location, avg_salary, topTags, topKeywords } = computeAggregates(
    pref,
    tagScore,
    keywordScore,
    locScore,
    salarySumW,
    weightSum,
  );

  const saved = await upsertBehaviorProfile(uid, {
    main_location,
    avg_salary,
    topTags,
    topKeywords,
  });

  return buildResponse(userId, saved);
};

// ──────────────────────────────── HÀM PHỤ ────────────────────────────────

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
  const keywordScore = Object.create(null);
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

    // --- TAGS ---
    addToMap(tagScore, e.tags, w);

    // --- KEYWORDS ---
    let kwArr = toArray(e.keywords); // e.keywords có thể undefined

    // nếu chưa có keywords → sinh từ job_title
    if (!kwArr || kwArr.length === 0) {
      if (e.job_title) {
        const extracted = extractTopKeywords(e.job_title);
        kwArr = extracted.map((k) => k.name);
      }
    }

    addToMap(keywordScore, kwArr, w);

    // --- LOCATION ---
    addToMap(locScore, e.location, w);

    // --- SALARY ---
    ({ salarySumW, weightSum } = addSalary(
      e,
      stdEvent,
      w,
      salarySumW,
      weightSum,
    ));
  }

  return { tagScore, keywordScore, locScore, salarySumW, weightSum };
}

function addToMap(scoreMap, field, weight) {
  const arr = toArray(field);
  for (const t of arr) {
    const k = toKey(t);
    if (!k) {
      continue;
    }
    scoreMap[k] = (scoreMap[k] || 0) + weight;
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

function computeAggregates(
  pref,
  tagScore,
  keywordScore,
  locScore,
  salarySumW,
  weightSum,
) {
  const topTags = normalizeTopK(tagScore, cfg.TOPK_TAGS);
  const topKeywords = normalizeTopK(keywordScore, cfg.TOPK_KEYWORDS || 10);
  const main_location = computeMainLocation(locScore, pref);
  const avg_salary = computeAvgSalary(salarySumW, weightSum, pref);
  return { main_location, avg_salary, topTags, topKeywords };
}

function computeMainLocation(locScore, pref) {
  const locArr = Object.entries(locScore).sort((a, b) => b[1] - a[1]);
  if (locArr.length) {
    return locArr[0][0];
  }
  return pref?.desired_location || null;
}

// Blend giữa hành vi và lương mong muốn
function computeAvgSalary(salarySumW, weightSum, pref) {
  const desiredSalary = Number(pref?.desired_salary) || 0;
  const ratio = cfg.PRIOR.desSalaryWe ?? 0.3; // 30% mong muốn

  if (weightSum > 0 && desiredSalary > 0) {
    const behaviorSalary = salarySumW / weightSum;
    return Math.round((1 - ratio) * behaviorSalary + ratio * desiredSalary);
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
  { main_location, avg_salary, topTags, topKeywords },
) {
  return prisma.userBehaviorProfile.upsert({
    where: { user_id: uid },
    update: {
      avg_salary: avg_salary ?? null,
      main_location: main_location || null,
      tags: topTags,
      keywords: topKeywords, // <── thêm trường keyword
      updated_at: new Date(),
    },
    create: {
      user_id: uid,
      avg_salary: avg_salary ?? null,
      main_location: main_location || null,
      tags: topTags,
      keywords: topKeywords,
    },
  });
}

function buildResponse(userId, saved) {
  return {
    user_id: String(userId),
    avg_salary: saved.avg_salary ?? null,
    main_location: saved.main_location || null,
    tags: saved.tags || [],
    keywords: saved.keywords || [],
    skipped: false,
  };
}
