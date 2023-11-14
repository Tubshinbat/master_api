const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  createResearch,
  getResearchs,
  getResearch,
  updateResearch,
  deleteResearch,
} = require("../controller/Research");
const { memberProtect, memberRoles } = require("../middleware/memberRoles");

router
  .route("/")
  .post(protect, memberProtect, memberRoles, createResearch)
  .get(getResearchs);

router
  .route("/:id")
  .get(protect, memberProtect, memberRoles, getResearch)
  .put(protect, memberProtect, memberRoles, updateResearch)
  .delete(protect, memberProtect, memberRoles, deleteResearch);

module.exports = router;
