const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  imageUpload,
  travelImgUpload,
  fileRemove,
  allFileUpload,
} = require("../controller/imageUpload");

router
  .route("/")
  .post(
    protect,
    authorize("admin", "operator", "partner", "member"),
    imageUpload
  );
router
  .route("/")
  .delete(
    protect,
    authorize("admin", "operator", "partner", "member"),
    fileRemove
  );
router
  .route("/file")
  .post(protect, authorize("admin", "operator"), allFileUpload);
router
  .route("/travel/:id")
  .post(protect, authorize("admin", "operator"), travelImgUpload);

module.exports = router;
