const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  createParticipation,
  getParticipations,
  getParticipation,
  updateParticipation,
  deleteParticipation,
} = require("../controller/Participation");
const { memberProtect, memberRoles } = require("../middleware/memberRoles");

router
  .route("/")
  .post(memberProtect, memberRoles, createParticipation)
  .get(memberProtect, getParticipations);

router
  .route("/:id")
  .get(memberProtect, memberRoles, getParticipation)
  .put(memberProtect, memberRoles, updateParticipation)
  .delete(memberProtect, memberRoles, deleteParticipation);

module.exports = router;
