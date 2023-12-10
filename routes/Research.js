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
  .post(protect, createResearch)
  .get(memberProtect, getResearchs);

router
  .route("/:id")
  .get(memberProtect, getResearch)
  .put(protect, updateResearch)
  .delete(protect, deleteResearch);

module.exports = router;
