const { toStr } = require("./_helpers");

const toCompanyDTO = (c) => {
  if (!c) {
    return null;
  }
  return {
    id: toStr(c.id),
    legal_name: c.legal_name,
    registration_number: c.registration_number,
    tax_id: c.tax_id,
    country_code: c.country_code,
    registered_address: c.registered_address,
    incorporation_date: c.incorporation_date,
    owner_id: toStr(c.owner_id),
    created_at: c.created_at,
    updated_at: c.updated_at,
    verification: c.verification
      ? {
          status: c.verification.status,
          rejection_reason: c.verification.rejection_reason ?? null,
          submitted_at: c.verification.submitted_at ?? null,
          verified_at: c.verification.verified_at ?? null,
          reviewed_by: toStr(c.verification.reviewed_by),
        }
      : null,
  };
};

module.exports = { toCompanyDTO };
