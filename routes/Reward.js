const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  createReward,
  getRewards,
  getReward,
  updateReward,
  deleteReward,
} = require("../controller/Reward");
const { memberProtect, memberRoles } = require("../middleware/memberRoles");

router
  .route("/")
  .post(protect, memberProtect, memberRoles, createReward)
  .get(getRewards);

router
  .route("/:id")
  .get(protect, memberProtect, memberRoles, getReward)
  .put(protect, memberProtect, memberRoles, updateReward)
  .delete(protect, memberProtect, memberRoles, deleteReward);

module.exports = router;
