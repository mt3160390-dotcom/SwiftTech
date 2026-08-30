const express = require("express");

const {
  getFilteredProducts,
  getProductDetails,
  getRecommendations,
} = require("../../controllers/shop/products-controller");

const router = express.Router();

router.get("/get", getFilteredProducts);
router.get("/get/:id", getProductDetails);
router.get("/recommendations/:productId", getRecommendations);

module.exports = router;
