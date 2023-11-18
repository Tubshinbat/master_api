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
  .post(memberProtect, memberRoles, createResearch)
  .get(getResearchs);

router
  .route("/:id")
  .get(memberProtect, memberRoles, getResearch)
  .put(memberProtect, memberRoles, updateResearch)
  .delete(memberProtect, memberRoles, deleteResearch);

module.exports = router;
