const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  createExperience,
  getExperiences,
  getExperience,
  updateExperience,
  deleteExperience,
} = require("../controller/Experience");
const { memberProtect, memberRoles } = require("../middleware/memberRoles");

router
  .route("/")
  .post(protect, memberProtect, memberRoles, createExperience)
  .get(memberProtect, getExperiences);

router
  .route("/:id")
  .get(memberProtect, memberRoles, getExperience)
  .put(memberProtect, memberRoles, updateExperience)
  .delete(memberProtect, memberRoles, deleteExperience);

module.exports = router;
