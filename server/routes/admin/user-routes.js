const express = require("express");

const {
  getAllUsersForAdmin,
  getOrdersByUserForAdmin,
} = require("../../controllers/admin/user-controller");

const router = express.Router();

router.get("/get", getAllUsersForAdmin);
router.get("/:userId/orders", getOrdersByUserForAdmin);

module.exports = router;
