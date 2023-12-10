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

router.route("/").post(protect, createReward).get(memberProtect, getRewards);

router
  .route("/:id")
  .get(memberProtect, getReward)
  .put(protect, updateReward)
  .delete(protect, deleteReward);

module.exports = router;
