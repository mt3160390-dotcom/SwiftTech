const paypal = require("../../helpers/paypal");
const { createEsewaPaymentData, verifyEsewaTransaction } = require("../../helpers/esewa");
const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");

const createOrder = async (req, res) => {
  try {
    const {
      userId,
      cartItems,
      addressInfo,
      orderStatus,
      paymentMethod,
      paymentStatus,
      totalAmount,
      orderDate,
      orderUpdateDate,
      paymentId,
      payerId,
      cartId,
    } = req.body;

    const create_payment_json = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: "http://localhost:5173/shop/paypal-return",
        cancel_url: "http://localhost:5173/shop/paypal-cancel",
      },
      transactions: [
        {
          item_list: {
            items: cartItems.map((item) => ({
              name: item.title,
              sku: item.productId,
              price: item.price.toFixed(2),
              currency: "USD",
              quantity: item.quantity,
            })),
          },
          amount: {
            currency: "USD",
            total: totalAmount.toFixed(2),
          },
          description: "description",
        },
      ],
    };

    paypal.payment.create(create_payment_json, async (error, paymentInfo) => {
      if (error) {
        console.log(error);

        return res.status(500).json({
          success: false,
          message: "Error while creating paypal payment",
        });
      } else {
        const newlyCreatedOrder = new Order({
          userId,
          cartId,
          cartItems,
          addressInfo,
          orderStatus,
          paymentMethod,
          paymentStatus,
          totalAmount,
          orderDate,
          orderUpdateDate,
          paymentId,
          payerId,
        });

        await newlyCreatedOrder.save();

        const approvalURL = paymentInfo.links.find(
          (link) => link.rel === "approval_url"
        ).href;

        res.status(201).json({
          success: true,
          approvalURL,
          orderId: newlyCreatedOrder._id,
        });
      }
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const capturePayment = async (req, res) => {
  try {
    const { paymentId, payerId, orderId } = req.body;

    let order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order can not be found",
      });
    }

    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    order.paymentId = paymentId;
    order.payerId = payerId;

    for (let item of order.cartItems) {
      let product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Not enough stock for this product ${product.title}`,
        });
      }

      product.totalStock -= item.quantity;

      await product.save();
    }

    const getCartId = order.cartId;
    await Cart.findByIdAndDelete(getCartId);

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order confirmed",
      data: order,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getAllOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ userId });

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "No orders found!",
      });
    }

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const initiateEsewaPayment = async (req, res) => {
  try {
    const {
      userId,
      cartItems,
      addressInfo,
      totalAmount,
      cartId,
    } = req.body;

    console.log("=== eSewa Payment Initiation ===");
    console.log("userId:", userId, "| totalAmount:", totalAmount);

    // Generate payment data first so we have the transaction_uuid
    const tempOrder = { totalAmount };
    const esewaPaymentData = createEsewaPaymentData(tempOrder);

    // Persist order with the transaction_uuid stored in paymentId for later verification
    const newlyCreatedOrder = new Order({
      userId,
      cartId,
      cartItems,
      addressInfo,
      orderStatus: "pending",
      paymentMethod: "eSewa",
      paymentStatus: "pending",
      totalAmount,
      orderDate: new Date(),
      orderUpdateDate: new Date(),
      paymentId: esewaPaymentData.transaction_uuid,
    });

    await newlyCreatedOrder.save();
    console.log("Order created:", newlyCreatedOrder._id);
    console.log("Transaction UUID:", esewaPaymentData.transaction_uuid);

    res.status(201).json({
      success: true,
      data: {
        paymentData: esewaPaymentData.paymentData,
        orderId: newlyCreatedOrder._id,
        formUrl: esewaPaymentData.formUrl,
        transaction_uuid: esewaPaymentData.transaction_uuid,
      },
    });
  } catch (e) {
    console.log("=== eSewa Payment Error ===");
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error initiating eSewa payment",
      error: e.message,
    });
  }
};

const captureEsewaPayment = async (req, res) => {
  try {
    const { orderId, transactionCode, status, totalAmount, transactionUuid } = req.body;

    console.log("eSewa capture request:", { orderId, transactionCode, status, totalAmount, transactionUuid });

    // Basic input validation
    if (!orderId || !status) {
      return res.status(400).json({
        success: false,
        message: "orderId and status are required",
      });
    }

    if (status !== "COMPLETE") {
      return res.status(400).json({
        success: false,
        message: `Payment not completed. Status: ${status}`,
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.paymentStatus === "paid") {
      return res.status(400).json({ success: false, message: "Order already paid" });
    }

    // Use transaction_uuid stored at order-creation time (prevents UUID spoofing)
    const uuidToVerify = order.paymentId || transactionUuid;

    // Verify the transaction
    const verificationResult = await verifyEsewaTransaction({
      transaction_uuid: uuidToVerify,
      total_amount: totalAmount || order.totalAmount,
      transaction_code: transactionCode,
      redirect_status: status,
    });

    if (!verificationResult.success) {
      return res.status(400).json({
        success: false,
        message: verificationResult.message,
      });
    }

    // Mark order as paid and record the eSewa ref_id
    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    order.paymentId = verificationResult.data?.ref_id || transactionCode || uuidToVerify;
    order.orderUpdateDate = new Date();

    // Reduce product stock
    for (const item of order.cartItems) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.title}`,
        });
      }

      if (product.totalStock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Not enough stock for ${product.title}`,
        });
      }

      product.totalStock -= item.quantity;
      await product.save();
    }

    // Clear the cart
    await Cart.findByIdAndDelete(order.cartId);
    await order.save();

    res.status(200).json({
      success: true,
      message: "eSewa payment captured successfully",
      data: order,
    });
  } catch (e) {
    console.log("eSewa capture error:", e);
    res.status(500).json({
      success: false,
      message: "Error capturing eSewa payment",
      error: e.message,
    });
  }
};

module.exports = {
  createOrder,
  capturePayment,
  getAllOrdersByUser,
  getOrderDetails,
  initiateEsewaPayment,
  captureEsewaPayment,
};
