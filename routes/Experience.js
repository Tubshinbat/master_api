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
  .get(getExperiences);

router
  .route("/:id")
  .get(protect, memberProtect, memberRoles, getExperience)
  .put(protect, memberProtect, memberRoles, updateExperience)
  .delete(protect, memberProtect, memberRoles, deleteExperience);

module.exports = router;
