const { toStr } = require("./_helpers");

const toJobDTO = (job) => {
  if (!job) {
    return null;
  }

  const mapTags = (tags) =>
    Array.isArray(tags)
      ? tags.map((jt) => ({
          job_id: toStr(jt.job_id),
          tag_id: jt.tag_id,
          tag: jt.tag ? { id: jt.tag.id, name: jt.tag.name } : null,
        }))
      : [];

  return {
    id: toStr(job.id),
    title: job.title,
    description: job.description ?? null,
    location: job.location ?? null,
    salary_min: job.salary_min ?? null,
    salary_max: job.salary_max ?? null,
    requirements: job.requirements,
    created_by: toStr(job.created_by),
    company_id: toStr(job.company_id),

    company: job.company
      ? {
          id: toStr(job.company.id),
          legal_name: job.company.legal_name,
          logo: job.company.logo ?? null,
        }
      : null,

    tags: mapTags(job.tags),

    requiredSkills: Array.isArray(job.requiredSkills)
      ? job.requiredSkills.map((r) => ({
          skill_id: r.skill_id ?? r.skill?.id,
          name: r.skill?.name || null,
          level_required: r.level_required,
          years_required: r.years_required,
          must_have: r.must_have,
        }))
      : [],

    approval: job.approval
      ? {
          id: toStr(job.approval.id),
          status: job.approval.status,
          reason: job.approval.reason ?? null,
          auditor_id: job.approval.auditor_id
            ? toStr(job.approval.auditor_id)
            : null,
          audited_at: job.approval.audited_at ?? null,
        }
      : null,

    vector: job.vector
      ? {
          skill_profile: job.vector.skill_profile,
          tag_profile: job.vector.tag_profile,
          title_keywords: job.vector.title_keywords,
          location: job.vector.location,
          salary_avg: job.vector.salary_avg,
        }
      : null,

    created_at: job.created_at,
    updated_at: job.updated_at,
  };
};

module.exports = { toJobDTO };
