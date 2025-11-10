const { toStr } = require("./_helpers");

const toApplicationDTO = (a) => {
  if (!a) {
    return null;
  }
  return {
    id: toStr(a.id),
    job_id: toStr(a.job_id),
    applicant_id: toStr(a.applicant_id),
    cover_letter: a.cover_letter,
    cv: a.cv ?? null,
    phone: a.phone ?? null,
    status: a.status, // <-- thêm theo schema
    reviewed_by: a.reviewed_by,
    reviewed_at: a.reviewed_at,
    review_note: a.review_note,
    fit_score: a.fit_score ?? 0, // <-- thêm theo schema (nullable, default 0)
    created_at: a.created_at,
    // optional includes
    job: a.job ? { id: toStr(a.job.id), title: a.job.title } : undefined,
    applicant: a.applicant
      ? {
          id: toStr(a.applicant.id),
          name: a.applicant.name,
          email: a.applicant.email,
          avatar: a.applicant.avatar,
        }
      : undefined,
    updated_at: a.updated_at,
  };
};

module.exports = { toApplicationDTO };
