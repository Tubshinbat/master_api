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
  .post(memberProtect, memberRoles, createReward)
  .get(getRewards);

router
  .route("/:id")
  .get(memberProtect, memberRoles, getReward)
  .put(memberProtect, memberRoles, updateReward)
  .delete(memberProtect, memberRoles, deleteReward);

module.exports = router;
