const { toStr } = require("./_helpers");

const toUserDTO = (u) => {
  if (!u) {
    return null;
  }
  return {
    id: toStr(u.id),
    name: u.name,
    email: u.email,
    avatar: u.avatar,
    role: u.role,
    isVerified: u.isVerified,
    company: u.company
      ? {
          id: toStr(u.company.id),
          legal_name: u.company.legal_name,
          verificationStatus: u.company.verification?.status ?? null,
        }
      : null,
  };
};

module.exports = { toUserDTO };
