const crypto = require("crypto");

// eSewa Configuration
const ESEWA_MERCHANT_CODE = process.env.ESEWA_MERCHANT_CODE || "EPAYTEST";
const ESEWA_MERCHANT_SECRET = process.env.ESEWA_MERCHANT_SECRET || "8gBm/:&EnhH.1/q";
const ESEWA_SANDBOX_URL = process.env.ESEWA_SANDBOX_URL || "https://uat.esewa.com.np/api/epay/main/v2/form";
const ESEWA_VERIFY_URL = process.env.ESEWA_VERIFY_URL || "https://uat.esewa.com.np/api/epay/transaction/status/";
const ESEWA_SUCCESS_URL = process.env.ESEWA_SUCCESS_URL || "http://localhost:5173/shop/esewa-return";
const ESEWA_FAILURE_URL = process.env.ESEWA_FAILURE_URL || "http://localhost:5173/shop";

// Generate transaction UUID
const generateTransactionUUID = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Generate eSewa signature
const generateEsewaSignature = (data) => {
  // Signature formula: HMAC-SHA256 of "total_amount=X,transaction_uuid=Y,product_code=Z"
  const signatureString = `total_amount=${data.total_amount},transaction_uuid=${data.transaction_uuid},product_code=${data.product_code}`;
  
  console.log("Signature string:", signatureString);
  console.log("Secret:", ESEWA_MERCHANT_SECRET);
  
  const signature = crypto
    .createHmac("sha256", ESEWA_MERCHANT_SECRET)
    .update(signatureString)
    .digest("base64");
  
  console.log("Generated signature:", signature);
  return signature;
};

// Create eSewa payment form data - Simplified approach
const createEsewaPaymentData = (order) => {
  const transaction_uuid = generateTransactionUUID();
  
  // Ensure totalAmount is a valid number (must be integer for eSewa)
  const totalAmount = Math.ceil(order.totalAmount); // Round up to nearest integer
  
  const paymentData = {
    failure_url: ESEWA_FAILURE_URL,
    product_delivery_charge: "0",
    product_service_charge: "0",
    product_code: ESEWA_MERCHANT_CODE,
    success_url: ESEWA_SUCCESS_URL,
    tax_amount: "0",
    total_amount: String(totalAmount),
    transaction_uuid: transaction_uuid,
    merchant_code: ESEWA_MERCHANT_CODE,
  };

  const signature = generateEsewaSignature(paymentData);
  paymentData.signature = signature;

  // Build URL-encoded parameters for direct redirect
  const params = new URLSearchParams();
  for (const key in paymentData) {
    params.append(key, paymentData[key]);
  }

  const redirectUrl = `${ESEWA_SANDBOX_URL}?${params.toString()}`;

  console.log("=== eSewa Payment Data ===");
  console.log("Total Amount:", totalAmount);
  console.log("Transaction UUID:", transaction_uuid);
  console.log("Redirect URL:", redirectUrl);
  console.log("Parameters:", paymentData);

  return {
    paymentData,
    transaction_uuid,
    formUrl: ESEWA_SANDBOX_URL,
    redirectUrl: redirectUrl, // Direct URL for redirect
  };
};

// Verify eSewa payment (This would be called on payment return)
const verifyEsewaTransaction = async (transactionData) => {
  try {
    const { transaction_code, status, total_amount, transaction_uuid } = transactionData;

    // Validate status
    if (status !== "COMPLETE") {
      return {
        success: false,
        message: "Payment was not completed",
      };
    }

    // In a real implementation, you would verify with eSewa's API
    // For now, we'll trust the transaction data if status is COMPLETE
    // In production, call ESEWA_VERIFY_URL with transaction_code and verify signature

    return {
      success: true,
      message: "Payment verified successfully",
      data: {
        transaction_code,
        total_amount,
        transaction_uuid,
      },
    };
  } catch (error) {
    console.error("eSewa verification error:", error);
    return {
      success: false,
      message: "Failed to verify payment",
      error: error.message,
    };
  }
};

module.exports = {
  ESEWA_MERCHANT_CODE,
  ESEWA_SANDBOX_URL,
  ESEWA_SUCCESS_URL,
  ESEWA_FAILURE_URL,
  generateTransactionUUID,
  generateEsewaSignature,
  createEsewaPaymentData,
  verifyEsewaTransaction,
};
