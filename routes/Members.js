const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  updateMember,
  createMember,
  getMembers,
  multDeleteMember,
  getMember,
  getRateMember,
} = require("../controller/Members");

router
  .route("/")
  .post(protect, authorize("admin", "operator"), createMember)
  .get(getMembers);

router.route("/rate").get(getRateMember);

router.route("/delete").delete(protect, authorize("admin"), multDeleteMember);
router
  .route("/:id")
  .get(getMember)
  .put(protect, authorize("admin", "operator"), updateMember);

module.exports = router;
