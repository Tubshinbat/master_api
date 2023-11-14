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
  .post(protect, memberProtect, memberRoles, createParticipation)
  .get(getParticipations);

router
  .route("/:id")
  .get(protect, memberProtect, memberRoles, getParticipation)
  .put(protect, memberProtect, memberRoles, updateParticipation)
  .delete(protect, memberProtect, memberRoles, deleteParticipation);

module.exports = router;
