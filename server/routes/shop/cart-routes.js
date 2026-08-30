const express = require("express");

const {
  addToCart,
  fetchCartItems,
  deleteCartItem,
  updateCartItemQty,
} = require("../../controllers/shop/cart-controller");
const { authMiddleware } = require("../../controllers/auth/auth-controller");

const router = express.Router();

// Protect modifying routes: only authenticated users may add/update/delete
router.post("/add", authMiddleware, addToCart);
router.get("/get/:userId", fetchCartItems); // read-only - allowed
router.put("/update-cart", authMiddleware, updateCartItemQty);
router.delete("/:userId/:productId", authMiddleware, deleteCartItem);

module.exports = router;
