const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const { uploadFile } = require("../controller/fileUpload");
const { memberProtect, memberRoles } = require("../middleware/memberRoles");

router.route("/").post(protect, uploadFile);
router.route("/member").post(memberProtect, memberRoles, uploadFile);
module.exports = router;
