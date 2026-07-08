# Price Display Locations in SwiftTech Ecommerce

## Summary

This document lists all locations in the codebase where prices are displayed to users. Prices are shown using the Indian Rupee (₹) symbol and include regular prices, sale prices, cart totals, and order amounts.

---

## 1. ADMIN VIEW - PRODUCT MANAGEMENT

### 1.1 Admin Product Tile Component

**File:** [client/src/components/admin-view/product-tile.jsx](client/src/components/admin-view/product-tile.jsx)

**Displays:** Product regular price and sale price (if applicable)

**Line Numbers:**

- Line 26-29: Regular price display with conditional strikethrough if sale price exists
  - `product?.price` - Regular price with rupee symbol: `₹{product?.price}`
  - Line 26: Conditional className for strikethrough: `{product?.salePrice > 0 ? "line-through" : ""}`
- Line 31-32: Sale price display
  - `product?.salePrice` - Sale price with rupee symbol: `₹{product?.salePrice}`
  - Shown only if `product?.salePrice > 0`

**Context:** Admin product listing/grid view where admins can see and manage products

---

## 2. ADMIN VIEW - ORDERS MANAGEMENT

### 2.1 Admin Orders Table Component

**File:** [client/src/components/admin-view/orders.jsx](client/src/components/admin-view/orders.jsx)

**Displays:** Total order amount for each order in table format

**Line Numbers:**

- Line 53: Table header label
  - `<TableHead>Order Price</TableHead>`
- Line 78: Order total amount display in table cell
  - `<TableCell>₹{orderItem?.totalAmount}</TableCell>`

**Context:** Admin dashboard showing list of all orders with their amounts

---

### 2.2 Admin Order Details Component

**File:** [client/src/components/admin-view/order-details.jsx](client/src/components/admin-view/order-details.jsx)

**Displays:** Order total amount and individual item prices

**Line Numbers:**

- Line 58: "Order Price" label
  - `<p className="font-medium text-sm">Order Price</p>`
- Line 59: Order total amount display
  - `<Label className="text-sm">₹{orderDetails?.totalAmount}</Label>`
- Line 95: Individual cart item price in order details
  - `<span>Price: ₹{item.price}</span>`

**Context:** Detailed view of a specific order showing full order information including all items and prices

---

## 3. SHOPPING VIEW - PRODUCT BROWSING

### 3.1 Shopping Product Tile Component

**File:** [client/src/components/shopping-view/product-tile.jsx](client/src/components/shopping-view/product-tile.jsx)

**Displays:** Product regular price and sale price in product cards on listing/home pages

**Line Numbers:**

- Line 34-39: Regular price with conditional strikethrough formatting
  - `product?.price` - Regular price: `₹{product?.price}`
  - Line 34: Conditional strikethrough class: `{product?.salePrice > 0 ? "line-through" : ""}`
- Line 40-43: Sale price display (conditional)
  - `product?.salePrice` - Sale price: `₹{product?.salePrice}`
  - Only displayed if `product?.salePrice > 0`

**Context:** Product cards displayed on product listing pages and home page. Shows price for each product in grid format

---

### 3.2 Shopping Product Details Modal

**File:** [client/src/components/shopping-view/product-details.jsx](client/src/components/shopping-view/product-details.jsx)

**Displays:** Product regular price and sale price in detailed product view modal

**Line Numbers:**

- Line 143-147: Regular price display with conditional strikethrough
  - `productDetails?.price` - Regular price: `₹{productDetails?.price}`
  - Line 143-145: Conditional strikethrough: `${productDetails?.salePrice > 0 ? "line-through" : ""}`
- Line 148-152: Sale price display (conditional)
  - `productDetails?.salePrice` - Sale price: `₹{productDetails?.salePrice}`
  - Only displayed if `productDetails?.salePrice > 0`

**Context:** Modal dialog that opens when user clicks on a product to see full details including prices, description, reviews, and add-to-cart button

---

## 4. SHOPPING VIEW - CART MANAGEMENT

### 4.1 Cart Items Content Component

**File:** [client/src/components/shopping-view/cart-items-content.jsx](client/src/components/shopping-view/cart-items-content.jsx)

**Displays:** Total price for each cart item (unit price × quantity)

**Line Numbers:**

- Line 96-101: Cart item total price calculation and display
  - Displays price with currency: `₹`
  - Calculation: `(cartItem?.salePrice > 0 ? cartItem?.salePrice : cartItem?.price) * cartItem?.quantity`
  - Formatted to 2 decimal places: `.toFixed(2)`

**Context:** Individual cart item display showing quantity controls and total price per item. Displayed in cart drawer/modal and checkout page

---

### 4.2 Cart Wrapper Component

**File:** [client/src/components/shopping-view/cart-wrapper.jsx](client/src/components/shopping-view/cart-wrapper.jsx)

**Displays:** Total cart amount/grand total

**Line Numbers:**

- Line 9-18: Total cart amount calculation
  - `totalCartAmount` variable
  - Calculation: Sum of `(salePrice if > 0, else price) * quantity` for each item
- Line 35-37: Display of total in cart sheet
  - Label: `<span className="font-bold">Total</span>`
  - Amount: `<span className="font-bold">₹{totalCartAmount}</span>`

**Context:** Cart summary shown in the cart sidebar/sheet when user opens cart, displays grand total before checkout

---

## 5. SHOPPING VIEW - CHECKOUT & PAYMENT

### 5.1 Checkout Page

**File:** [client/src/pages/shopping-view/checkout.jsx](client/src/pages/shopping-view/checkout.jsx)

**Displays:** Cart item prices and total checkout amount

**Line Numbers:**

- Line 18-26: Total cart amount calculation
  - `totalCartAmount` - Calculates sum of all items
  - Uses sale price if available: `currentItem?.salePrice > 0 ? currentItem?.salePrice : currentItem?.price`
  - Multiplies by quantity: `* currentItem?.quantity`
- Line 57-60: Price calculation for individual cart items in order (using item's current price)
  - `singleCartItem?.salePrice > 0 ? singleCartItem?.salePrice : singleCartItem?.price`
- Line 74: Total amount stored in order data
  - `totalAmount: totalCartAmount`
- Line 122-123: Display of checkout totals
  - Label: `<span className="font-bold">Total</span>`
  - Amount: `<span className="font-bold">₹{totalCartAmount}</span>`

**Context:** Checkout page showing item review, total amount, and payment method selection (COD or PayPal)

---

## 6. SHOPPING VIEW - ORDER HISTORY

### 6.1 Shopping Orders Component

**File:** [client/src/components/shopping-view/orders.jsx](client/src/components/shopping-view/orders.jsx)

**Displays:** Order total amount in user's order history table

**Line Numbers:**

- Line 52-56: Table header
  - `<TableHead>Order Price</TableHead>`
- Line 69: Order total amount in table row
  - `<TableCell>₹{orderItem?.totalAmount}</TableCell>`

**Context:** User account page showing list of all their past orders with order amounts

---

### 6.2 Shopping Order Details Component

**File:** [client/src/components/shopping-view/order-details.jsx](client/src/components/shopping-view/order-details.jsx)

**Displays:** Order total amount and individual item prices

**Line Numbers:**

- Line 14: "Order Price" label
  - `<p className="font-medium">Order Price</p>`
- Line 15: Order total amount
  - `<Label>₹{orderDetails?.totalAmount}</Label>`
- Line 40: Individual cart item price in order details
  - `<span>Price: ₹{item.price}</span>`

**Context:** Modal showing detailed information for a specific order including all items, prices, and shipping information

---

## 7. SPECIAL CHATBOT COMPONENT

### 7.1 Chatbot Component (Informational Prices)

**File:** [client/src/components/Chatbot.jsx](client/src/components/Chatbot.jsx)

**Displays:** Starting prices for different product categories (informational/hardcoded)

**Line Numbers:**

- Line 41: Laptops starting price: `₹41,000`
- Line 44: Smartphones starting price: `₹24,000`
- Line 47: Headphones starting price: `₹4,000`
- Line 50: Speakers starting price: `₹8,200`
- Line 53: Keyboards starting price: `₹2,500`
- Line 56: Smartwatches starting price: `₹12,500`

**Context:** AI chatbot providing category information to users with starting prices (not live product data)

---

## Price Display Patterns Summary

### Currency Format

- All prices use Indian Rupee (₹) symbol
- Prices are displayed as: `₹{price}` using template literals

### Price Types Displayed

1. **Regular Price** (`price` field)
   - Shown on strikethrough when sale price is available
2. **Sale Price** (`salePrice` field)
   - Highlighted when value > 0
   - Displayed next to or instead of regular price

3. **Total Amount** (`totalAmount` field)
   - Order totals in order history tables and details

4. **Cart Totals** (`totalCartAmount` calculated field)
   - Sum of all items: (sale price or regular price) × quantity

### Decimal Formatting

- Cart item totals: `.toFixed(2)` for 2 decimal places
- Most display contexts: No explicit decimal formatting (relies on server data)

---

## Backend Data Structure References

The following fields from MongoDB models are referenced for pricing:

- **Product Model:**
  - `price` - Regular product price
  - `salePrice` - Discounted sale price (0 if no sale)

- **Order Model:**
  - `totalAmount` - Total order value
  - `cartItems[].price` - Price of each item at time of purchase

- **Cart Model:**
  - Calculated from cart items with product reference data

---

## No Price Displays Found In:

- Address components (`address.jsx`, `address-card.jsx`) - Only show delivery address info
- Filter component (`filter.jsx`) - Only shows filter options, not prices
- Header/Footer components - Navigation only
- Product search page - Renders product tiles which do display prices
- Payment success page - Confirmation only, no prices shown
- PayPal return page - Handle redirects only

---

## Files Summary Table

| File                         | Location                 | Price Fields                  | Lines                  |
| ---------------------------- | ------------------------ | ----------------------------- | ---------------------- |
| product-tile.jsx (admin)     | components/admin-view    | price, salePrice              | 26-32                  |
| product-tile.jsx (shopping)  | components/shopping-view | price, salePrice              | 34-43                  |
| product-details.jsx          | components/shopping-view | price, salePrice              | 143-152                |
| cart-items-content.jsx       | components/shopping-view | salePrice, price, totalAmount | 96-101                 |
| cart-wrapper.jsx             | components/shopping-view | totalCartAmount               | 9-18, 35-37            |
| checkout.jsx                 | pages/shopping-view      | totalCartAmount, price        | 18-26, 74, 122-123     |
| orders.jsx (admin)           | components/admin-view    | totalAmount                   | 53, 78                 |
| order-details.jsx (admin)    | components/admin-view    | totalAmount, price            | 59, 95                 |
| orders.jsx (shopping)        | components/shopping-view | totalAmount                   | 52-56, 69              |
| order-details.jsx (shopping) | components/shopping-view | totalAmount, price            | 15, 40                 |
| Chatbot.jsx                  | components               | Hardcoded prices              | 41, 44, 47, 50, 53, 56 |

---

## Key Findings

✅ **Total Components with Price Displays:** 11 files
✅ **Total Display Points:** 20+ locations where prices are shown to users
✅ **Price Types:** Regular prices, sale prices, totals, and cart amounts
✅ **Consistent Format:** All use ₹ symbol with template literals
✅ **Data Sources:** Product collection, Order collection, and calculated cart totals
