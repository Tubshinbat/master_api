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
} = require("../controller/Partner");

router
  .route("/")
  .post(protect, authorize("admin", "operator"), createPartner)
  .get(getPartners);

router
  .route("/count")
  .get(protect, authorize("admin", "operator"), getCountPartner);

router.route("/delete").delete(protect, authorize("admin"), multDeletePartner);

router
  .route("/:id")
  .get(getPartner)
  .put(protect, authorize("admin", "operator"), updatePartner);

module.exports = router;
