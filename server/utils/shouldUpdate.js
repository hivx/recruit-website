//server/utils/shouldUpdate.js
const shouldUpdate = (v) =>
  !(
    v === undefined ||
    v === null ||
    (typeof v === "string" && v.trim() === "")
  );
module.exports = { shouldUpdate };
