// server/utils/serializers/user.js
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
    receiveRecommendation: u.receive_recommendation,
    isVerified: u.isVerified,
    created_at: u.created_at,
    updated_at: u.updated_at,
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
