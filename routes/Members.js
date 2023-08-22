const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  updateMember,
  createMember,
  getMembers,
  multDeleteMember,
  getMember,
} = require("../controller/Members");

router
  .route("/")
  .post(protect, authorize("admin", "operator"), createMember)
  .get(getMembers);

router.route("/delete").delete(protect, authorize("admin"), multDeleteMember);
router
  .route("/:id")
  .get(getMember)
  .put(protect, authorize("admin", "operator"), updateMember);

module.exports = router;
