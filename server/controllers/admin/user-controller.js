const User = require("../../models/User");
const Order = require("../../models/Order");

const getAllUsersForAdmin = async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).select("-password").lean();

    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const userOrders = await Order.find({ userId: user._id.toString() });

        const totalOrders = userOrders.length;
        const totalSpent = userOrders.reduce(
          (sum, order) => sum + Number(order.totalAmount || 0),
          0
        );

        return {
          ...user,
          totalOrders,
          totalSpent,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: usersWithStats,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getOrdersByUserForAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    const orders = await Order.find({ userId }).sort({ orderDate: -1 });

    res.status(200).json({
      success: true,
      data: {
        user,
        orders,
      },
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

module.exports = {
  getAllUsersForAdmin,
  getOrdersByUserForAdmin,
};
