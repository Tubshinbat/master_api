const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  createPartner,
  getPartners,
  getCountPartner,
  multDeletePartner,
  updatePartner,
  getPartner,
  getUserPartners,
  createUserPartner,
  updateUserPartner,
} = require("../controller/Partner");
const {
  memberRoles,
  memberProtect,
  memberHardProtect,
} = require("../middleware/memberRoles");

router
  .route("/")
  .post(protect, authorize("admin", "operator", "partner"), createPartner)
  .get(getPartners);

router
  .route("/count")
  .get(protect, authorize("admin", "operator"), getCountPartner);

router.route("/delete").delete(protect, authorize("admin"), multDeletePartner);

router.route("/users").get(memberHardProtect, getUserPartners);
router.route("/create-user").post(memberHardProtect, createUserPartner);
router.route("/update-user/:id").put(memberHardProtect, updateUserPartner);

router
  .route("/:id")
  .get(getPartner)
  .put(protect, authorize("admin", "operator", "partner"), updatePartner);

module.exports = router;
