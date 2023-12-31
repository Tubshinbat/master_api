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
  .post(protect, createExperience)
  .get(memberProtect, getExperiences);

router
  .route("/:id")
  .get(memberProtect, getExperience)
  .put(protect, updateExperience)
  .delete(protect, deleteExperience);

module.exports = router;
