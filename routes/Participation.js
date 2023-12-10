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
  .post(protect, createParticipation)
  .get(memberProtect, getParticipations);

router
  .route("/:id")
  .get(memberProtect, getParticipation)
  .put(protect, updateParticipation)
  .delete(protect, deleteParticipation);

module.exports = router;
