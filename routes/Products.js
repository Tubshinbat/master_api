const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  multDeleteProduct,
  getSlugProduct,
} = require("../controller/Products");

router
  .route("/")
  .post(protect, authorize("admin", "operator"), createProduct)
  .get(getProducts);

router.route("/slug/:slug").get(getSlugProduct);

router
  .route("/:id")
  .get(getProduct)
  .put(protect, authorize("admin", "operator"), updateProduct);

router.route("/delete").delete(protect, authorize("admin"), multDeleteProduct);

module.exports = router;
