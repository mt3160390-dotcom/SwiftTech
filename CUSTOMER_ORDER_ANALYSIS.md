# Customer Order View System Analysis - SwiftTech Ecommerce

## Overview

The customer order system allows users to view their complete order history and detailed information about each order. Orders are tracked with status updates and payment information.

---

## 1. CUSTOMER ORDERS PAGE/COMPONENT

### Main Entry Point

**File:** [client/src/pages/shopping-view/account.jsx](client/src/pages/shopping-view/account.jsx)

- This is the customer account page accessible at `/shop/account`
- Contains tabs for "Orders" and "Address"
- Uses a tabbed interface with UI components
- Imports `ShoppingOrders` component to display the orders list

### Orders Display Component

**File:** [client/src/components/shopping-view/orders.jsx](client/src/components/shopping-view/orders.jsx)

- Displays a table of customer order history
- Table columns: Order ID, Order Date, Order Status, Order Price, Details Action
- Shows color-coded order status badges:
  - Green for "confirmed"
  - Red for "rejected"
  - Black for pending/other statuses
- Has a modal dialog to view detailed order information

### Order Details Modal Component

**File:** [client/src/components/shopping-view/order-details.jsx](client/src/components/shopping-view/order-details.jsx)

- Modal dialog that displays complete order information
- Triggered when user clicks "View Details" button

---

## 2. REDUX STORE FOR CUSTOMER ORDERS

**File:** [client/src/store/shop/order-slice/index.js](client/src/store/shop/order-slice/index.js)

### Store State Structure

```javascript
{
  approvalURL: null,           // PayPal approval URL during checkout
  isLoading: false,            // Loading state for async operations
  orderId: null,               // Current order ID being processed
  orderList: [],               // Array of all customer orders
  orderDetails: null           // Detailed information for selected order
}
```

### Redux Actions (Async Thunks)

1. **createNewOrder** - Creates a new order with cart items
2. **capturePayment** - Captures PayPal payment
3. **getAllOrdersByUserId** - Fetches all orders for a customer
4. **getOrderDetails** - Fetches detailed information for a specific order

### Redux Actions (Synchronous)

1. **resetOrderDetails** - Clears the currently viewed order details

---

## 3. API ENDPOINTS FOR FETCHING CUSTOMER ORDERS

**File:** [server/routes/shop/order-routes.js](server/routes/shop/order-routes.js)

### Endpoints

| Method | Route                          | Purpose                    |
| ------ | ------------------------------ | -------------------------- |
| POST   | `/api/shop/order/create`       | Create a new order         |
| POST   | `/api/shop/order/capture`      | Capture PayPal payment     |
| GET    | `/api/shop/order/list/:userId` | Get all orders by user ID  |
| GET    | `/api/shop/order/details/:id`  | Get specific order details |

### How Orders Are Fetched

- **By User ID:** `GET /api/shop/order/list/:userId`
  - Queries MongoDB Order collection with `{ userId }`
  - Returns array of all orders matching the user
  - Returns 404 if no orders found

- **By Order ID:** `GET /api/shop/order/details/:id`
  - Queries single order by order `_id`
  - Returns 404 if order not found

---

## 4. ORDER CONTROLLER - CUSTOMER ORDER FUNCTIONS

**File:** [server/controllers/shop/order-controller.js](server/controllers/shop/order-controller.js)

### Exported Functions

#### `getAllOrdersByUser(req, res)`

- **Purpose:** Retrieve all orders for a specific customer
- **Parameters:** `userId` from route params
- **Query:** `Order.find({ userId })`
- **Returns:** Array of orders or 404 error

```javascript
const { userId } = req.params;
const orders = await Order.find({ userId });
```

#### `getOrderDetails(req, res)`

- **Purpose:** Retrieve complete details of a specific order
- **Parameters:** Order `id` from route params
- **Query:** `Order.findById(id)`
- **Returns:** Complete order object with all nested data

```javascript
const { id } = req.params;
const order = await Order.findById(id);
```

#### `createOrder(req, res)`

- **Purpose:** Create new order and initiate PayPal payment
- **Stores:** Order with initial status ("pending")
- **Also updates:** Product stock when order is captured

#### `capturePayment(req, res)`

- **Purpose:** Finalize payment and update order status
- **Updates:**
  - `paymentStatus` = "paid"
  - `orderStatus` = "confirmed"
  - Product stock reduced
  - Cart deleted

---

## 5. ORDER INFORMATION CURRENTLY DISPLAYED TO CUSTOMERS

### In Order List Table

| Column       | Source Field  | Display Format           |
| ------------ | ------------- | ------------------------ |
| Order ID     | `_id`         | Full MongoDB ID          |
| Order Date   | `orderDate`   | Date only (split on "T") |
| Order Status | `orderStatus` | Color-coded badge        |
| Order Price  | `totalAmount` | "Rs {amount}" format     |

### In Order Details Modal

| Information      | Source Field    | Display Format                  |
| ---------------- | --------------- | ------------------------------- |
| Order ID         | `_id`           | Full ID                         |
| Order Date       | `orderDate`     | Date only                       |
| Total Price      | `totalAmount`   | "Rs {amount}" format            |
| Payment Method   | `paymentMethod` | Text (e.g., "PayPal")           |
| Payment Status   | `paymentStatus` | Text (e.g., "paid", "pending")  |
| Order Status     | `orderStatus`   | Color-coded badge               |
| Cart Items       | `cartItems[]`   | Title, Quantity, Price per item |
| Shipping Address | `addressInfo`   | Full address details            |

---

## 6. ORDER STATUS FIELDS - AVAILABILITY

### Status Fields Available in Database

| Field           | Current Values                     | Display Status         |
| --------------- | ---------------------------------- | ---------------------- |
| `orderStatus`   | "pending", "confirmed", "rejected" | ✅ Currently displayed |
| `paymentStatus` | "pending", "paid"                  | ✅ Currently displayed |
| `paymentMethod` | "paypal" (currently hardcoded)     | ✅ Currently displayed |

### Order Status Color Coding

```javascript
- "confirmed" → GREEN badge (bg-green-500)
- "rejected" → RED badge (bg-red-600)
- All others → BLACK badge (bg-black)
```

---

## 7. COMPLETE ORDER DATA STRUCTURE

**File:** [server/models/Order.js](server/models/Order.js)

```javascript
{
  userId: String,              // Customer ID
  cartId: String,              // Reference to cart
  cartItems: [                 // Array of ordered items
    {
      productId: String,
      title: String,
      image: String,
      price: String,
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
  orderStatus: String,         // "pending", "confirmed", "rejected"
  paymentMethod: String,       // "paypal"
  paymentStatus: String,       // "pending", "paid"
  totalAmount: Number,         // Total order amount
  orderDate: Date,             // When order was created
  orderUpdateDate: Date,       // When order was last updated
  paymentId: String,           // PayPal payment ID
  payerId: String              // PayPal payer ID
}
```

---

## 8. DATA FLOW SUMMARY

### Customer Views Orders

1. Customer navigates to `/shop/account` (account.jsx)
2. ShoppingOrders component dispatches `getAllOrdersByUserId(user?.id)`
3. Redux thunk calls `GET /api/shop/order/list/:userId`
4. Controller queries `Order.find({ userId })`
5. Orders displayed in table with status badges

### Customer Views Order Details

1. Customer clicks "View Details" button on order row
2. ShoppingOrders dispatches `getOrderDetails(orderItem._id)`
3. Redux thunk calls `GET /api/shop/order/details/:id`
4. Controller queries `Order.findById(id)`
5. Complete order details displayed in modal dialog

---

## 9. WHAT'S DISPLAYED VS MISSING

### ✅ Currently Displayed to Customers

- Order ID
- Order Date
- Order Status with color coding
- Order Total Amount
- Payment Method
- Payment Status
- Individual Cart Item Details (title, quantity, price)
- Shipping Address (full details)

### ❌ Currently Missing/Not Displayed

- Order Update Date (`orderUpdateDate` - not shown)
- Expected Delivery Date (not in model)
- Tracking Number (not in model)
- Estimated Delivery Time (not in model)
- Order Cancellation Option (no UI/API for customer)
- Return/Exchange Option (not implemented)
- Order Timeline/Status History (only current status shown)
- Product Images (available in data but not displayed)
- Product SKU/ID (not shown)

---

## 10. KEY OBSERVATIONS

### Data Retrieval

- Orders are queried **by User ID** from the `userId` field in Order collection
- Single order details retrieved **by Order ID** (`_id`)
- No pagination implemented for order list

### Status Management

- Order status is set during payment capture (only changed to "confirmed" on successful payment)
- Only 3 status options: pending, confirmed, rejected (no "shipped", "delivered", etc.)
- Payment happens through external PayPal integration

### Frontend Integration

- Uses React hooks (useEffect, useState)
- Redux for state management
- Axios for API calls
- Dialog/Modal for detailed view
- Badge component for status visualization

### Limitations

1. No customer-initiated order management (cancel, return, etc.)
2. Static status mapping (only 3 statuses)
3. No order tracking or timeline
4. No notification system for status changes
5. No ability to update shipping info after order
6. No order search or filtering functionality
