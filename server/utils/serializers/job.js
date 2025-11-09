const { toStr } = require("./_helpers");

const toJobDTO = (job) => {
  if (!job) {
    return null;
  }
  const mapTags = (tags) =>
    Array.isArray(tags)
      ? tags.map((jt) => ({
          jobId: toStr(jt.jobId ?? job.id),
          tagId: jt.tagId,
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
    type: job.type ?? null,
    level: job.level ?? null,
    requirements: job.requirements,
    created_by: toStr(job.created_by),
    company_id: toStr(job.company_id),

    company: job.company
      ? { id: toStr(job.company.id), legal_name: job.company.legal_name }
      : null,
    tags: mapTags(job.tags),
    requiredSkills: job.requiredSkills
      ? job.requiredSkills.map((r) => ({
          skill_id: r.skill_id ?? r.skill?.id,
          skill_name: r.skill?.name || null,
          importance: r.importance,
          years_required: r.years_required,
          must_have: r.must_have,
        }))
      : [],
    approval: job.approval
      ? {
          id: toStr(job.approval.id),
          status: job.approval.status, // pending|approved|rejected
          reason: job.approval.reason ?? null, // <-- thêm theo schema
          auditor_id: toStr(job.approval.auditor_id), // <-- thêm theo schema
          audited_at: job.approval.audited_at ?? null, // <-- sửa tên
        }
      : null,
    created_at: job.created_at,
    updated_at: job.updated_at,
  };
};

module.exports = { toJobDTO };
