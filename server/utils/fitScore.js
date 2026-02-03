// server/utils/fitScore.js
// =========================
// SKILL MATCH
// =========================
function computeSkillMatch(userSkills = [], jobSkills = []) {
  if (!jobSkills.length) {
    return {
      score: 0,
      matched: [],
      missingMust: [],
      mustCount: 0,
      matchedMustCount: 0,
      matchedOptionalCount: 0,
    };
  }

  let score = 0;
  let maxScore = 0;

  const matched = [];
  const missingMust = [];

  let matchedMustCount = 0;
  let matchedOptionalCount = 0;

  const mustCount = jobSkills.filter((s) => s.must).length;

  for (const js of jobSkills) {
    const userSkill = userSkills.find((s) => s.id === js.id);

    if (js.must) {
      const r = handleMustSkill(js, userSkill);
      score += r.score;
      maxScore += r.max;

      if (r.matched) {
        matched.push(js.id);
        matchedMustCount++;
      }
      if (r.missing) {
        missingMust.push(js.id);
      }
    } else {
      const r = handleOptionalSkill(js, userSkill);
      score += r.score;
      maxScore += r.max;

      if (r.matched) {
        matched.push(js.id);
        matchedOptionalCount++;
      }
    }
  }

  const finalScore = maxScore ? score / maxScore : 0;

  return {
    score: Number(finalScore.toFixed(4)),
    matched,
    missingMust,
    mustCount,
    matchedMustCount,
    matchedOptionalCount,
  };
}

function handleMustSkill(js, userSkill) {
  const { weight = 1 } = js;
  const max = weight * 5;

  if (!userSkill) {
    return { score: 0, matched: false, missing: true, max };
  }

  const userW = userSkill.w ?? 0;

  const base = Math.min(userW / weight, 1);

  const bonus = userW > weight ? Math.min((userW - weight) * 0.2, 0.2) : 0;

  const score = (base + bonus) * max;

  return {
    score,
    matched: true,
    missing: false,
    max,
  };
}

function handleOptionalSkill(js, userSkill) {
  const { weight = 1 } = js;
  const max = weight * 1;

  if (!userSkill) {
    return { score: 0, matched: false, max };
  }

  const userW = userSkill.w ?? 0;

  const base = Math.min(userW / weight, 1);

  const bonus = userW > weight ? Math.min((userW - weight) * 0.1, 0.1) : 0;

  const score = (base + bonus) * max;

  return {
    score,
    matched: true,
    max,
  };
}

// =========================
// TAG MATCH
// =========================
function computeTagMatch(userTags = [], jobTags = []) {
  // CHỈNH: thêm hasData
  if (!userTags.length || !jobTags.length) {
    return {
      score: 0.2,
      matched: [],
      hasData: false,
    };
  }

  const userMap = new Map(userTags.map((t) => [t.id, t.weight]));
  let score = 0;
  let maxScore = 0;

  const matched = [];

  for (const jt of jobTags) {
    const jobW = jt.weight || 1;
    maxScore += jobW;

    const userW = userMap.get(jt.id);
    if (userW !== undefined) {
      score += Math.min(userW, jobW);
      matched.push(jt.id);
    }
  }

  const raw = maxScore ? score / maxScore : 0;
  const visible = 0.2 + raw * 0.8;

  return {
    score: Number(visible.toFixed(4)),
    matched: matched.slice(0, 3),
    hasData: true,
  };
}

// =========================
// LOCATION MATCH
// =========================
function computeLocationMatch(userLoc, jobLoc) {
  if (!userLoc || !jobLoc) {
    return {
      score: 0.3,
      matched: false,
      level: "neutral",
    };
  }

  const matched = userLoc.includes(jobLoc) || jobLoc.includes(userLoc);

  return {
    score: matched ? 1 : 0.3,
    matched,
    level: matched ? "match" : "neutral",
  };
}

// =========================
// SALARY MATCH
// =========================
function computeSalaryMatch(expected, jobSalary) {
  // CHỈNH: thêm comparable
  if (!expected || !jobSalary) {
    return {
      score: 1,
      level: null,
      comparable: false,
    };
  }

  if (jobSalary === expected) {
    return { score: 1, level: "near", comparable: true };
  }

  if (jobSalary < expected) {
    return {
      score: Number((jobSalary / expected).toFixed(4)),
      level: "lower",
      comparable: true,
    };
  }

  const ratio = jobSalary / expected;

  if (ratio <= 1.25) {
    return { score: 1.1, level: "higher", comparable: true };
  }
  if (ratio <= 1.5) {
    return { score: 1.25, level: "higher", comparable: true };
  }
  if (ratio <= 1.75) {
    return { score: 1.3, level: "higher", comparable: true };
  }
  if (ratio <= 2) {
    return { score: 1.4, level: "higher", comparable: true };
  }

  return { score: 1.5, level: "higher", comparable: true };
}

// =========================
// FIT SCORE (GENERIC)
// =========================
function buildExplanation(score, skill, tag, location, salary) {
  return {
    overall: getOverallLevel(score),

    skills: {
      matched: skill.matched,
      missingMust: skill.missingMust,
      mustCount: skill.mustCount,
      matchedMustCount: skill.matchedMustCount,
      matchedOptionalCount: skill.matchedOptionalCount,
    },

    tags: {
      matched: tag.matched,
      hasData: tag.hasData,
    },

    location: {
      matched: location.matched,
      level: location.level,
    },

    salary: {
      level: salary.level,
      comparable: salary.comparable,
    },
  };
}

function getOverallLevel(score) {
  if (score > 0.59) {
    return "high";
  }
  if (score > 0.39) {
    return "medium";
  }
  return "low";
}

// =========================
// JOB-CENTRIC (USER -> JOB)
// =========================
function computeFitScore(userVector, jobVector) {
  const skill = computeSkillMatch(
    userVector.skill_profile ?? [],
    jobVector.skill_profile ?? [],
  );

  const tag = computeTagMatch(
    userVector.tag_profile ?? [],
    jobVector.tag_profile ?? [],
  );

  const location = computeLocationMatch(
    userVector.preferred_location,
    jobVector.location,
  );

  const salary = computeSalaryMatch(
    userVector.salary_expected,
    jobVector.salary_avg,
  );

  const score =
    0.4 * skill.score +
    0.25 * tag.score +
    0.25 * salary.score +
    0.1 * location.score;

  const finalScore = Number(score.toFixed(4));

  return {
    score: finalScore,
    explanation: buildExplanation(finalScore, skill, tag, location, salary),
  };
}

// =========================
// USER-CENTRIC (JOB -> USER)
// =========================
function computeJobFitScore(userVector, jobVector) {
  const skill = computeSkillMatch(
    userVector.skill_profile ?? [],
    jobVector.skill_profile ?? [],
  );

  const tag = computeTagMatch(
    userVector.tag_profile ?? [],
    jobVector.tag_profile ?? [],
  );

  const location = computeLocationMatch(
    userVector.preferred_location,
    jobVector.location,
  );

  const salary = computeSalaryMatch(
    userVector.salary_expected,
    jobVector.salary_avg,
  );

  const score =
    0.15 * skill.score +
    0.4 * tag.score +
    0.3 * salary.score +
    0.15 * location.score;

  const finalScore = Number(score.toFixed(4));

  return {
    score: finalScore,
    explanation: buildExplanation(finalScore, skill, tag, location, salary),
  };
}

// =========================
// RECRUITER-CENTRIC (USER -> RECUITER)
// =========================
function computeCandidateFitScore(userVector, jobVector) {
  const skill = computeSkillMatch(
    userVector.skill_profile ?? [],
    jobVector.skill_profile ?? [],
  );

  const tag = computeTagMatch(
    userVector.tag_profile ?? [],
    jobVector.tag_profile ?? [],
  );

  const location = computeLocationMatch(
    userVector.preferred_location,
    jobVector.location,
  );

  const salary = computeSalaryMatch(
    userVector.salary_expected,
    jobVector.salary_avg,
  );

  const score =
    0.5 * skill.score +
    0.2 * tag.score +
    0.15 * salary.score +
    0.15 * location.score;

  const finalScore = Number(score.toFixed(4));

  return {
    score: finalScore,
    explanation: buildExplanation(finalScore, skill, tag, location, salary),
  };
}

module.exports = {
  computeFitScore,
  computeJobFitScore,
  computeCandidateFitScore,
  computeSkillMatch,
  computeTagMatch,
  computeLocationMatch,
  computeSalaryMatch,
};
