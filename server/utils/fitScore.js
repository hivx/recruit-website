function computeSkillMatch(userSkills = [], jobSkills = []) {
  if (!jobSkills.length) {
    return 0;
  }

  let score = 0;
  let maxScore = 0;

  for (const js of jobSkills) {
    const { id, weight = 1, must } = js;
    const userSkill = userSkills.find((s) => s.id === id);
    const userW = userSkill?.w ?? 0;

    // ======== MUST-HAVE ========
    if (must) {
      const mustW = weight * 5; // trọng số rất lớn
      maxScore += mustW;

      if (userSkill) {
        // user có skill must ⇒ điểm gần như đạt max
        const base = Math.min(userW, 1); // userW 0–1
        score += base * mustW;

        // BONUS nếu user mạnh hơn yêu cầu
        if (userW > weight) {
          score += (userW - weight) * mustW * 0.2;
        }
      }
      continue;
    }

    // ======== OPTIONAL ========
    const optW = weight * 1;
    maxScore += optW;

    if (userSkill) {
      // optional có ⇒ thưởng nhẹ
      score += userW * optW * 0.8;
    } else {
      // optional thiếu ⇒ KHÔNG phạt mạnh: chỉ phạt 20% NhẸ
      score += optW * 0.2;
    }
  }

  return Number((score / maxScore).toFixed(4));
}

function computeTagMatch(userTags = [], jobTags = []) {
  if (!userTags.length || !jobTags.length) {
    return 0;
  }

  let score = 0;
  const maxScore = jobTags.reduce((s, t) => s + t.weight, 0);

  for (const jt of jobTags) {
    const match = userTags.find((ut) => ut.id === jt.id);
    if (match) {
      score += Math.min(match.weight, jt.weight);
    }
  }

  return Number((score / maxScore).toFixed(4));
}

function computeLocationMatch(userLoc, jobLoc) {
  if (!userLoc || !jobLoc) {
    return 0;
  }
  return userLoc === jobLoc ? 1 : 0;
}

function computeSalaryMatch(expected, jobSalary) {
  if (!expected || !jobSalary) {
    return 1;
  }

  if (jobSalary === expected) {
    return 1;
  }

  if (jobSalary < expected) {
    return Number((jobSalary / expected).toFixed(4));
  }

  const ratio = jobSalary / expected;

  if (ratio <= 1.25) {
    return 1.1;
  }
  if (ratio <= 1.5) {
    return 1.25;
  }
  if (ratio <= 1.75) {
    return 1.3;
  }
  if (ratio <= 2) {
    return 1.4;
  }

  return 1.5;
}

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

  const finalScore = 0.4 * skill + 0.25 * tag + 0.25 * salary + 0.1 * location;

  return Number(finalScore.toFixed(4));
}

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

  // USER-CENTRIC WEIGHTS
  const finalScore =
    0.15 * skill + // user thiếu skill vẫn có thể apply job, nên giảm
    0.4 * tag + // user thích ngành nào thì gợi ý ngành đó
    0.3 * salary + // phù hợp lương
    0.15 * location; // user muốn làm ở đâu

  return Number(finalScore.toFixed(4));
}

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

  // JOB-CENTRIC WEIGHTS
  const finalScore =
    0.5 * skill + // trọng số cao nhất: job yêu cầu skill
    0.2 * tag +
    0.15 * salary +
    0.15 * location;

  return Number(finalScore.toFixed(4));
}

module.exports = {
  computeFitScore,
  computeSkillMatch,
  computeTagMatch,
  computeLocationMatch,
  computeSalaryMatch,
  computeJobFitScore,
  computeCandidateFitScore,
};
