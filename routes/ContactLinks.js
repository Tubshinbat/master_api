const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");
const { memberProtect, memberRoles } = require("../middleware/memberRoles");

const { createContactLink } = require("../controller/ContactLinks");

router
  .route("/")
  .post(protect, authorize("admin", "member", "partner"), createContactLink)
  .get(memberProtect, getExperiences);

router
  .route("/:id")
  .get(memberProtect, getExperience)
  .put(protect, authorize("admin", "member", "partner"), updateExperience)
  .delete(protect, authorize("admin", "member", "partner"), deleteExperience);

module.exports = router;
