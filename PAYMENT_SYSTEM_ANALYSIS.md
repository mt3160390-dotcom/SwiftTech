# SwiftTech E-Commerce: Complete Payment System Analysis

---

## EXECUTIVE SUMMARY

The SwiftTech payment system currently supports **two payment methods**:

1. **PayPal** (with payment gateway integration)
2. **Cash on Delivery (COD)** (direct payment at delivery)

However, the **PayPal payment button is missing from the checkout UI**, so currently only COD is functional. The backend is fully configured for PayPal integration with proper routes and handlers.

---

## 1. CURRENT PAYMENT METHODS AVAILABLE

### A. Cash on Delivery (COD) ✅ FUNCTIONAL

- **Type**: Post-payment method
- **Status**: "pending" → Changed to "pending" in checkout flow
- **Flow**: Customer pays when order is delivered
- **UI Implementation**: Button active on checkout page

### B. PayPal ⚠️ CONFIGURED BUT NO UI BUTTON

- **Type**: Pre-payment method
- **Status**: "paid" → Immediately set as "paid" when order created
- **Flow**: Customer redirected to PayPal approval page
- **Payment Gateway**: PayPal REST SDK v1.8.1
- **Mode**: Sandbox (development)
- **UI Implementation**: **MISSING** - No PayPal button on checkout

---

## 2. FILE PATHS - PAYMENT-RELATED CODE

### Backend - Server Side

| Component             | File Path                                     |
| --------------------- | --------------------------------------------- |
| PayPal Helper         | `server/helpers/paypal.js`                    |
| Order Model           | `server/models/Order.js`                      |
| Shop Order Controller | `server/controllers/shop/order-controller.js` |
| Shop Order Routes     | `server/routes/shop/order-routes.js`          |
| Server Configuration  | `server/server.js`                            |
| Package Dependencies  | `server/package.json`                         |

### Frontend - Client Side

| Component             | File Path                                                    |
| --------------------- | ------------------------------------------------------------ |
| Checkout Page         | `client/src/pages/shopping-view/checkout.jsx`                |
| PayPal Return Handler | `client/src/pages/shopping-view/paypal-return.jsx`           |
| Payment Success Page  | `client/src/pages/shopping-view/payment-success.jsx`         |
| Order Redux Slice     | `client/src/store/shop/order-slice/index.js`                 |
| Cart Items Display    | `client/src/components/shopping-view/cart-items-content.jsx` |
| Address Selection     | `client/src/components/shopping-view/address.jsx`            |

---

## 3. PAYPAL HELPER/INTEGRATION FILE

### File: `server/helpers/paypal.js`

```javascript
const paypal = require("paypal-rest-sdk");

paypal.configure({
  mode: "sandbox", // Development/Testing mode
  client_id:
    "AWQqsWQCjkaOmxXvjTvsV2EEfbnbFAmIXJWCLeGqr-sE27hEUxJaJuNdpLS0rFRbeL-qm6veKhA9QZS9",
  client_secret:
    "EONlmTcduQykwniMlr1GAvXCSy4boGNVDIQ89OY5DN_FRHbBg7kI1UwnhPpE4ve6IE2mbV18V5M29RR1",
});

module.exports = paypal;
```

### Key Configuration Details

| Setting         | Value          | Purpose                                  |
| --------------- | -------------- | ---------------------------------------- |
| `mode`          | "sandbox"      | Development/Testing environment          |
| `client_id`     | AWQqsWQCjka... | Public key for PayPal API authentication |
| `client_secret` | EONlmTcdu...   | Secret key for PayPal API authentication |

### ⚠️ SECURITY ISSUE

- **Credentials are hardcoded** in the source file (NOT in environment variables)
- **Should be moved to .env file** for production security
- Current credentials are exposed in version control

### PayPal Integration Library

- **Package**: `paypal-rest-sdk` v1.8.1
- **Type**: Official PayPal REST API SDK
- **Usage**: Handles payment creation, capture, and execution

---

## 4. PAYMENT CONTROLLER - HOW PAYMENTS ARE PROCESSED

### File: `server/controllers/shop/order-controller.js`

#### Function 1: `createOrder()` - PAYMENT INITIATION

**Purpose**: Creates an order and initiates PayPal payment

```
FLOW:
1. Extracts order data from request body
2. BUILDS PayPal payment JSON with transaction details
3. Calls paypal.payment.create() to get approval URL
4. SAVES order to MongoDB (even before payment confirmation)
5. Returns approval URL to frontend for redirect
```

**Input Parameters (req.body)**:

```javascript
{
  userId: String,
  cartItems: Array,        // Product items with productId, title, image, price, quantity
  addressInfo: Object,     // Delivery address details
  orderStatus: String,     // "pending"
  paymentMethod: String,   // "COD" or "PayPal"
  paymentStatus: String,   // "pending" for COD, "paid" for PayPal (incorrect logic)
  totalAmount: Number,     // Total order value in rupees
  orderDate: Date,
  orderUpdateDate: Date,
  paymentId: String,       // Initially null/undefined
  payerId: String,         // Initially null/undefined
  cartId: String
}
```

**PayPal Payment JSON Structure**:

```javascript
{
  intent: "sale",          // Transaction type
  payer: {
    payment_method: "paypal"
  },
  redirect_urls: {
    return_url: "http://localhost:5173/shop/paypal-return",    // Success callback
    cancel_url: "http://localhost:5173/shop/paypal-cancel",    // Cancel callback
  },
  transactions: [
    {
      item_list: {
        items: [
          {
            name: "Product Title",
            sku: "productId",
            price: "99.99",
            currency: "USD",
            quantity: 1
          }
        ]
      },
      amount: {
        currency: "USD",
        total: "99.99"
      },
      description: "description"
    }
  ]
}
```

**Response**:

```javascript
{
  success: true,
  approvalURL: "https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_express-checkout&token=EC-...",
  orderId: "507f1f77bcf86cd799439011"
}
```

**⚠️ ISSUE FOUND**: Order is saved to database BEFORE payment is confirmed. If payment fails, order still exists with incomplete payment status.

---

#### Function 2: `capturePayment()` - PAYMENT CAPTURE

**Purpose**: Completes payment after user approves on PayPal

```
FLOW:
1. Receives paymentId, payerId, orderId from frontend
2. RETRIEVES order from database
3. UPDATES order:
   - paymentStatus = "paid"
   - orderStatus = "confirmed"
   - paymentId = received paymentId
   - payerId = received payerId
4. REDUCES product stock for each cart item
5. DELETES cart from database
6. SAVES updated order
```

**Input Parameters (req.body)**:

```javascript
{
  paymentId: String,       // From PayPal callback
  payerId: String,         // From PayPal callback
  orderId: String          // From sessionStorage (currentOrderId)
}
```

**Response**:

```javascript
{
  success: true,
  message: "Order confirmed",
  data: {
    // Complete updated order object
  }
}
```

---

#### Function 3: `getAllOrdersByUser()` - FETCH ORDERS

**Purpose**: Retrieves all orders for a specific user

**Route**: `GET /api/shop/order/list/:userId`

---

#### Function 4: `getOrderDetails()` - FETCH SINGLE ORDER

**Purpose**: Retrieves detailed information for a specific order

**Route**: `GET /api/shop/order/details/:id`

---

## 5. PAYMENT ROUTES - ENDPOINTS

### File: `server/routes/shop/order-routes.js`

#### All Available Endpoints

| HTTP Method | Endpoint        | Function               | Purpose                               |
| ----------- | --------------- | ---------------------- | ------------------------------------- |
| POST        | `/create`       | `createOrder()`        | Initiates order + PayPal payment      |
| POST        | `/capture`      | `capturePayment()`     | Completes payment after user approval |
| GET         | `/list/:userId` | `getAllOrdersByUser()` | Fetch user's all orders               |
| GET         | `/details/:id`  | `getOrderDetails()`    | Get single order details              |

#### Full URLs (Development)

```
POST   http://localhost:5000/api/shop/order/create
POST   http://localhost:5000/api/shop/order/capture
GET    http://localhost:5000/api/shop/order/list/{userId}
GET    http://localhost:5000/api/shop/order/details/{orderId}
```

---

## 6. FRONTEND PAYMENT FLOW

### File: `client/src/pages/shopping-view/checkout.jsx`

#### Step-by-Step Checkout Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    CHECKOUT PAGE LOADS                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │ Display Address Selection  │
        │ Display Cart Items         │
        │ Display Order Total        │
        │ Show Payment Method Buttons │
        └────────────┬───────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
    COD BUTTON            PAYPAL BUTTON
    (PRESENT)             (MISSING ⚠️)
         │                       │
         ▼                       ▼
  handleOrderPlace   handleOrderPlace
  ("COD")            ("PayPal")
         │                       │
         └───────────┬───────────┘
                     │
```

#### handleOrderPlacement() Function

**Triggered by**: Button click (COD or PayPal)

**Validation Checks**:

1. ✅ Cart is not empty
2. ✅ Address is selected
3. ✅ Payment method is provided

**Order Data Prepared**:

```javascript
{
  userId: "user123",
  cartId: "cart456",
  cartItems: [
    {
      productId: "prod1",
      title: "Product Name",
      image: "url",
      price: 99.99,
      quantity: 2
    }
  ],
  addressInfo: {
    addressId: "addr1",
    address: "123 Street",
    city: "City",
    pincode: "12345",
    phone: "9876543210",
    notes: "Special instructions"
  },
  orderStatus: "pending",
  paymentMethod: "COD" or "PayPal",
  paymentStatus: "pending" (for COD) or "paid" (for PayPal),
  totalAmount: 199.98,
  orderDate: new Date(),
  orderUpdateDate: new Date()
}
```

**Redux Action Called**: `dispatch(createNewOrder(orderData))`

**Response Handling**:

- ✅ Success: Shows success alert, redirects to homepage "/"
- ❌ Failure: Shows error alert

---

### File: `client/src/store/shop/order-slice/index.js`

#### Redux Thunk: `createNewOrder`

**Async Function Flow**:

```
1. Makes POST request to http://localhost:5000/api/shop/order/create
2. Sends orderData in request body
3. For COD:
   - Receives: { success: true, orderId: "..." }
   - Stores orderId in sessionStorage as "currentOrderId"
   - User sees success message and redirected to home
4. For PayPal:
   - Receives: { success: true, approvalURL: "...", orderId: "..." }
   - Stores orderId in sessionStorage as "currentOrderId"
   - Should redirect to approvalURL (BUT NO CODE TO DO THIS ⚠️)
```

**Issue**: No code redirects user to PayPal approval URL!

---

### File: `client/src/pages/shopping-view/paypal-return.jsx`

#### PayPal Redirect Handler

**Route**: `/shop/paypal-return?paymentId=...&PayerID=...`

**Flow**:

```
1. Page mounts after user approves payment on PayPal
2. Extracts paymentId and PayerID from URL query params
3. Retrieves orderId from sessionStorage ("currentOrderId")
4. Calls Redux action: dispatch(capturePayment({...}))
5. On success:
   - Removes orderId from sessionStorage
   - Redirects to "/shop/payment-success"
```

---

### File: `client/src/pages/shopping-view/payment-success.jsx`

#### Payment Success Page

**Route**: `/shop/payment-success`

**Display**:

- Message: "Payment is successfull!"
- Button: "View Orders" links to `/shop/account`

---

## 7. ENVIRONMENT VARIABLES NEEDED

### Current Status

⚠️ **NO .env file exists** in the project

### Required Environment Variables for PayPal

```env
# PayPal Configuration
PAYPAL_MODE=sandbox                          # or "live" for production
PAYPAL_CLIENT_ID=your_paypal_client_id       # Public key
PAYPAL_CLIENT_SECRET=your_paypal_secret      # Secret key

# Server Configuration
PORT=5000                                    # API server port
MONGODB_URI=mongodb://localhost:27017/swifttech  # MongoDB connection
CORS_ORIGIN=http://localhost:5173          # Frontend URL

# Cloudinary (for image uploads)
CLOUDINARY_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

# JWT Secret
JWT_SECRET=your_jwt_secret
```

### Current Implementation Issue

- PayPal credentials are **hardcoded** in `server/helpers/paypal.js`
- Should be moved to environment variables
- No configuration for production mode

---

## 8. PAYMENT DATA STORED IN ORDER MODEL

### File: `server/models/Order.js`

#### Complete Order Schema

```javascript
{
  userId: String,              // User who placed order
  cartId: String,              // Cart reference
  cartItems: [                 // Products ordered
    {
      productId: String,
      title: String,
      image: String,
      price: String,           // ⚠️ Stored as String (should be Number)
      quantity: Number
    }
  ],
  addressInfo: {               // Shipping address
    addressId: String,
    address: String,
    city: String,
    pincode: String,
    phone: String,
    notes: String
  },
  orderStatus: String,         // pending | confirmed | inProcess | inShipping | delivered | rejected
  paymentMethod: String,       // "COD" or "PayPal"
  paymentStatus: String,       // "pending" or "paid"
  totalAmount: Number,         // Total order amount
  orderDate: Date,             // Order creation timestamp
  orderUpdateDate: Date,       // Last update timestamp
  paymentId: String,           // PayPal transactionId
  payerId: String              // PayPal payerId
}
```

#### Payment-Specific Fields

| Field           | Type   | Purpose                     | Example                                     |
| --------------- | ------ | --------------------------- | ------------------------------------------- |
| `paymentMethod` | String | Payment gateway used        | "COD", "PayPal", "eSewa"                    |
| `paymentStatus` | String | Whether paid or pending     | "pending", "paid"                           |
| `paymentId`     | String | Transaction ID from gateway | PayPal transactionId or eSewa transactionId |
| `payerId`       | String | Who paid (from gateway)     | PayPal payerId or customer ID               |

---

## 9. CURRENT PAYMENT METHODS AVAILABLE TO CUSTOMERS

### Frontend (Checkout Page)

Currently showing:

- ✅ **Cash on Delivery (COD)** - Button present and working
- ❌ **PayPal** - No button on UI (code exists but button missing)

### Backend Support

Route `/api/shop/order/create` accepts:

- ✅ `paymentMethod: "COD"`
- ✅ `paymentMethod: "PayPal"`

### What Customers See Currently

```
Checkout Page:
┌──────────────────────────┐
│   Cart Items             │
│   Address Selection      │
│   Order Total: Rs 199.98 │
├──────────────────────────┤
│ [Cash on Delivery]       │  ✅ Works
│ [PayPal]                 │  ❌ Missing
├──────────────────────────┤
```

---

## 10. PAYMENT FLOW - COMPLETE STEP BY STEP

### Flow for COD (Currently Working)

```
1. Customer adds items to cart
   ↓
2. Clicks "Checkout" → Goes to /shop/checkout
   ↓
3. Selects address
   ↓
4. Clicks "Cash on Delivery" button
   ↓
5. Frontend creates orderData with paymentMethod="COD"
   ↓
6. dispatch(createNewOrder(orderData))
   ↓
7. POST /api/shop/order/create with orderData
   ↓
8. Backend:
   - Creates PayPal payment JSON (not used for COD)
   - Saves order with paymentStatus="pending"
   - Returns orderId
   ↓
9. Frontend stores orderId in sessionStorage
   ↓
10. Success alert shown
    ↓
11. Redirects to homepage "/"
    ↓
12. Order status = "pending"
    Payment status = "pending"
```

### Flow for PayPal (Incomplete - Missing Button)

```
1-5. Same as COD
   ↓
6. dispatch(createNewOrder(orderData))
   ↓
7. POST /api/shop/order/create with orderData
   ↓
8. Backend:
   - Creates PayPal payment JSON with items and amount
   - Calls paypal.payment.create()
   - Gets back approvalURL and paymentInfo
   - Saves order with paymentStatus="paid"
   - Returns { approvalURL, orderId }
   ↓
9. Frontend receives approvalURL and orderId
   ⚠️ BUT NO CODE TO REDIRECT TO approvalURL!
   ↓
10. SUCCESS: User should be redirected to:
    https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_express-checkout&token=EC-...
    ↓
11. User clicks "Buy Now" on PayPal
    ↓
12. PayPal redirects to:
    http://localhost:5173/shop/paypal-return?paymentId=...&PayerID=...
    ↓
13. Frontend page extracts paymentId and payerId
    ↓
14. dispatch(capturePayment({ paymentId, payerId, orderId }))
    ↓
15. POST /api/shop/order/capture with payment details
    ↓
16. Backend:
    - Updates order: paymentStatus="paid", orderStatus="confirmed"
    - Reduces product stock
    - Deletes cart
    - Saves order
    ↓
17. Frontend redirects to /shop/payment-success
    ↓
18. Shows "Payment is successfull!"
```

---

## 11. WHERE TO ADD eSEWA INTEGRATION

### Option 1: Minimal Changes (Add eSewa as 3rd Payment Method)

#### 1. Create eSewa Helper File

**New File**: `server/helpers/esewa.js`

```javascript
// eSewa configuration
const esewaConfig = {
  mode: process.env.ESEWA_MODE || "test", // test or production
  merchantCode: process.env.ESEWA_MERCHANT_CODE,
  merchantSecret: process.env.ESEWA_MERCHANT_SECRET,
  merchantAMR: process.env.ESEWA_AMR,
  testUrl: "https://dev.esewa.com.np/api/epay/main/v2/form",
  liveUrl: "https://esewa.com.np/api/epay/main/v2/form",
  successUrl: "http://localhost:5173/shop/esewa-return",
  failureUrl: "http://localhost:5173/shop/esewa-cancel",
  cancelUrl: "http://localhost:5173/shop/esewa-cancel",
};

module.exports = esewaConfig;
```

#### 2. Update Order Controller

**File**: `server/controllers/shop/order-controller.js`

Add new function `create eSewaInitiation()`:

```javascript
const initiateEsewaPayment = async (req, res) => {
  try {
    const {
      userId,
      cartItems,
      addressInfo,
      orderStatus,
      paymentMethod,
      totalAmount,
      orderDate,
      orderUpdateDate,
      cartId,
    } = req.body;

    // Create order with pending status
    const newOrder = new Order({
      userId,
      cartId,
      cartItems,
      addressInfo,
      orderStatus,
      paymentMethod: "eSewa",
      paymentStatus: "pending",
      totalAmount,
      orderDate,
      orderUpdateDate,
    });

    await newOrder.save();

    // Generate eSewa request hash
    // Convert amount to Nepali rupees
    const totalAmountNPR = Math.round(totalAmount * 130); // 1 USD ≈ 130 NPR

    // Create eSewa form data
    const esewaData = {
      amt: totalAmountNPR,
      psc: 0,
      pdc: 0,
      txAmt: 0,
      tAmt: totalAmountNPR,
      pid: newOrder._id.toString(), // Use order ID as product ID
      scd: esewaConfig.merchantCode,
      su: esewaConfig.successUrl,
      fu: esewaConfig.failureUrl,
      cart: cartItems
        .map((item) => `${item.title}(${item.quantity})`)
        .join(", "),
    };

    // Calculate security hash (MD5 of specific field order)
    const hash = generateEsewaHash(esewaData, esewaConfig.merchantSecret);
    esewaData.hrsn = hash;

    res.status(201).json({
      success: true,
      esewaData,
      orderId: newOrder._id,
      esewaUrl: esewaConfig.testUrl,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error initiating eSewa payment",
    });
  }
};
```

#### 3. Add eSewa Capture Function

```javascript
const captureEsewaPayment = async (req, res) => {
  try {
    const { refId, pid, orderId } = req.body; // refId from eSewa response

    // Verify transaction with eSewa API
    const transactionStatus = await verifyEsewaTransaction(refId);

    if (!transactionStatus.success) {
      return res.status(400).json({
        success: false,
        message: "eSewa payment verification failed",
      });
    }

    let order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    order.paymentId = refId; // eSewa reference ID

    // Reduce stock
    for (let item of order.cartItems) {
      let product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${product.title} not found`,
        });
      }
      product.totalStock -= item.quantity;
      await product.save();
    }

    // Delete cart
    const getCartId = order.cartId;
    await Cart.findByIdAndDelete(getCartId);

    await order.save();

    res.status(200).json({
      success: true,
      message: "eSewa payment completed",
      data: order,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "eSewa payment capture failed",
    });
  }
};
```

#### 4. Update Routes

**File**: `server/routes/shop/order-routes.js`

```javascript
router.post("/esewa/initiate", initiateEsewaPayment);
router.post("/esewa/capture", captureEsewaPayment);
```

#### 5. Update Frontend - Add eSewa Button to Checkout

**File**: `client/src/pages/shopping-view/checkout.jsx`

```jsx
// Add new payment button
<Button
  onClick={() => handleOrderPlacement("eSewa")}
  className="w-full bg-purple-600 text-white"
>
  eSewa
</Button>
```

#### 6. Update handleOrderPlacement Function

```javascript
function handleOrderPlacement(paymentMethod) {
  // ... validation code ...

  const orderData = {
    // ... existing fields ...
    paymentMethod,
    paymentStatus: paymentMethod === "COD" ? "pending" : "pending", // eSewa also pending until confirmed
  };

  dispatch(createNewOrder(orderData)).then((data) => {
    if (data?.payload?.success) {
      if (paymentMethod === "eSewa") {
        // Redirect to eSewa with form data
        const { esewaData, esewaUrl } = data.payload;
        submitEsewaForm(esewaUrl, esewaData);
      } else if (paymentMethod === "PayPal") {
        // Redirect to PayPal
        window.location.href = data.payload.approvalURL;
      } else {
        // COD success
        Swal.fire({
          icon: "success",
          title: "Order placed successfully!",
          text: "Your order will be delivered soon. Pay on delivery.",
        }).then(() => navigate("/"));
      }
    }
  });
}
```

#### 7. Create eSewa Return Handler Page

**New File**: `client/src/pages/shopping-view/esewa-return.jsx`

```jsx
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { capturePayment } from "@/store/shop/order-slice";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";

function EsewaReturnPage() {
  const dispatch = useDispatch();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const refId = params.get("refId");
  const oid = params.get("oid");
  const amount = params.get("amt");

  useEffect(() => {
    if (refId && oid) {
      const orderId = JSON.parse(sessionStorage.getItem("currentOrderId"));

      dispatch(captureEsewaPayment({ refId, pid: oid, orderId })).then(
        (data) => {
          if (data?.payload?.success) {
            sessionStorage.removeItem("currentOrderId");
            window.location.href = "/shop/payment-success";
          }
        },
      );
    }
  }, [refId, oid, dispatch]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Processing eSewa Payment...Please wait!</CardTitle>
      </CardHeader>
    </Card>
  );
}

export default EsewaReturnPage;
```

#### 8. Add eSewa Routes to Frontend Router

**Update main router configuration**:

```jsx
{
  path: "esewa-return",
  element: <EsewaReturnPage />
}
```

#### 9. Add Environment Variables

**Create**: `.env` in server root

```env
# eSewa Configuration
ESEWA_MODE=test
ESEWA_MERCHANT_CODE=EPAYTEST
ESEWA_MERCHANT_SECRET=8gBm/:&EnhHEk@54Pm+rwStWW3S7WS08EwMrHyXP&l/F?-
ESEWA_AMR=eSWA_MERCHANT
```

---

### Option 2: Complete Refactoring (Payment Gateway Strategy Pattern)

For better scalability with multiple payment methods:

```
├── server/
│   └── payment-gateways/
│       ├── paymentGateway.interface.js    (Base interface)
│       ├── paypal.gateway.js              (PayPal implementation)
│       ├── esewa.gateway.js               (eSewa implementation)
│       └── cod.gateway.js                 (COD implementation)
│   └── controllers/
│       └── payment-controller.js          (Unified payment controller)
```

This approach:

- ✅ Reduces code duplication
- ✅ Makes adding new payment methods easier
- ✅ Better separation of concerns
- ✅ Easier to test

---

## 12. WHAT NEEDS TO BE MODIFIED TO ADD eSEWA

### Summary of Changes Required

| Item                      | Required Changes                                                   |
| ------------------------- | ------------------------------------------------------------------ |
| **Backend Helpers**       | Create `server/helpers/esewa.js` with eSewa config                 |
| **Order Controller**      | Add `initiateEsewaPayment()` and `captureEsewaPayment()` functions |
| **Order Routes**          | Add POST routes: `/esewa/initiate` and `/esewa/capture`            |
| **Frontend Checkout**     | Add eSewa button to payment options                                |
| **Frontend Redux**        | Update order slice to handle eSewa response data                   |
| **Frontend Pages**        | Create `esewa-return.jsx` page for payment callback                |
| **Frontend Router**       | Add eSewa return route in main router                              |
| **Order Model**           | No changes needed (already supports any paymentMethod/paymentId)   |
| **Environment Variables** | Create `.env` file with eSewa credentials                          |
| **User UI**               | Add eSewa to payment method selection UI                           |

### Priority Level

**High Priority** (Must Have):

1. Create eSewa helper with configuration
2. Add eSewa initiation endpoint
3. Add eSewa capture endpoint
4. Add eSewa button to checkout UI
5. Create eSewa return handler page

**Medium Priority** (Important): 6. Add eSewa routes 7. Update Redux for eSewa support 8. Environment variables setup

**Low Priority** (Nice to Have): 9. Refactor to payment gateway pattern 10. Add payment method tests 11. Add error handling improvements

---

## ISSUES AND RECOMMENDATIONS

### Current Issues Found

| Issue                                 | Severity  | Location                        | Fix                            |
| ------------------------------------- | --------- | ------------------------------- | ------------------------------ |
| PayPal credentials hardcoded          | 🔴 HIGH   | `server/helpers/paypal.js`      | Move to .env file              |
| PayPal button missing from UI         | 🔴 HIGH   | `client/src/pages/checkout.jsx` | Add PayPal button              |
| No redirect to PayPal approval URL    | 🔴 HIGH   | Order slice/checkout            | Add window.location redirect   |
| Order saved before payment confirmed  | 🟡 MEDIUM | `createOrder()`                 | Implement pending status check |
| Price stored as String                | 🟡 MEDIUM | Order model                     | Change to Number type          |
| No .env file                          | 🟡 MEDIUM | Project root                    | Create and document .env       |
| No payment verification               | 🟡 MEDIUM | `capturePayment()`              | Add PayPal API verification    |
| No error handling for failed payments | 🟡 MEDIUM | Order routes                    | Add error pages for failures   |

### Recommendations

1. **Security**: Move all credentials to environment variables
2. **Code Quality**: Implement payment gateway interface pattern
3. **Testing**: Add unit tests for payment flow
4. **Error Handling**: Create failure pages for each payment method
5. **Logging**: Add transaction logging for audit trail
6. **Monitoring**: Implement payment status webhooks
7. **Documentation**: Document each payment flow in code comments

---

## SUMMARY TABLE: PAYMENT METHODS COMPARISON

| Feature                 | COD                          | PayPal                     | eSewa (To Add)               |
| ----------------------- | ---------------------------- | -------------------------- | ---------------------------- |
| **Status**              | ✅ Working                   | ⚠️ Ready (no UI)           | ❌ Not implemented           |
| **Payment Type**        | Post-payment                 | Pre-payment                | Pre-payment                  |
| **Currency**            | Rupees (Rs)                  | USD                        | Nepali Rupees (Rs)           |
| **Frontend Button**     | ✅ Yes                       | ❌ No                      | Need to add                  |
| **Backend Endpoint**    | ✅ Yes                       | ✅ Yes                     | Need to add                  |
| **Verify endpoint**     | ❌ No                        | ❌ No                      | Need to add                  |
| **Order Status**        | pending → delivered          | pending → confirmed        | pending → confirmed          |
| **Payment Status**      | pending → paid (on delivery) | pending → paid (immediate) | pending → paid (on callback) |
| **Setup Complexity**    | Simple                       | Medium                     | Medium                       |
| **Implementation Time** | N/A                          | 2-3 hours                  | 2-3 hours                    |

---

## QUICK REFERENCE

### API Endpoints

```
POST /api/shop/order/create              → Initiate order/payment
POST /api/shop/order/capture             → Confirm PayPal payment
GET  /api/shop/order/list/:userId        → Get user's orders
GET  /api/shop/order/details/:id         → Get single order

POST /api/shop/order/esewa/initiate      → (To add) Initiate eSewa payment
POST /api/shop/order/esewa/capture       → (To add) Confirm eSewa payment
```

### Frontend Routes

```
/shop/checkout                           → Checkout page
/shop/paypal-return                      → PayPal callback
/shop/payment-success                    → Success page
/shop/esewa-return                       → (To add) eSewa callback
```

### Files to Create for eSewa

```
server/helpers/esewa.js                  → Configuration
server/controllers/shop/esewa-payment.js → (Optional) Separate controller
client/src/pages/shopping-view/esewa-return.jsx → Return handler
.env (project root)                      → Environment variables
```

---

## CONCLUSION

The SwiftTech payment system is **partially implemented**:

- ✅ COD is fully functional
- ⚠️ PayPal is configured but missing the frontend button
- ❌ eSewa is not implemented

To make PayPal work: Add the button to checkout and redirect to approval URL.

To add eSewa: Follow the step-by-step guide in Section 11 above.

The architecture is flexible enough to support multiple payment methods with minimal changes.
