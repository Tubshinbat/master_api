const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  createRate,
  getRates,
  getRate,
  multDeleteRate,
} = require("../controller/CompanyRate");

router.route("/").post(createRate).get(getRates);

router.route("/delete").delete(protect, authorize("admin"), multDeleteRate);

router.route("/:id").get(getRate);

module.exports = router;
