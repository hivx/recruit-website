const express = require("express");

const router = express.Router();
const skillController = require("../controllers/skillController");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// GET danh sách kỹ năng có sẵn
router.get("/", skillController.listSkills);

// GET, PUT, DELETE kỹ năng của chính mình
router.get(
  "/my-skills",
  authMiddleware,
  authorizeRoles("applicant", "admin"),
  skillController.getMySkills,
);

// thêm hoặc cập nhật kỹ năng của chính mình
router.put(
  "/my-skills",
  authMiddleware,
  authorizeRoles("applicant", "admin"),
  skillController.addOrUpdate,
);

// xóa kỹ năng của chính mình
router.delete(
  "/my-skills/:skillId",
  authMiddleware,
  authorizeRoles("applicant", "admin"),
  skillController.remove,
);

module.exports = router;
