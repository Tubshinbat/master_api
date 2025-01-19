const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  createCourse,
  getCoursies,
  getSlugCourse,
  getCountCourse,
  multDeleteCourse,
  getSingleCourse,
  updateCourse,
} = require("../controller/Course");

router
  .route("/")
  .post(protect, authorize("admin", "operator"), createCourse)
  .get(getCoursies);

router.route("/slug/:slug").post(getSlugCourse);

router
  .route("/count")
  .get(protect, authorize("admin", "operator"), getCountCourse);

router.route("/delete").delete(protect, authorize("admin"), multDeleteCourse);
router
  .route("/:id")
  .get(getSingleCourse)
  .put(protect, authorize("admin", "operator"), updateCourse);

module.exports = router;
