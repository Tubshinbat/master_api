const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  createMenu,
  getMenus,
  deleteMenu,
  getMenu,
  updateMenu,
  changePosition,
} = require("../controller/MemberCategories");

router
  .route("/")
  .post(protect, authorize("admin", "operator"), createMenu)
  .get(getMenus);

router.route("/change").post(protect, authorize("admin"), changePosition);

router
  .route("/:id")
  .get(getMenu)
  .put(protect, authorize("admin", "operator"), updateMenu)
  .delete(protect, authorize("admin"), deleteMenu);

module.exports = router;
