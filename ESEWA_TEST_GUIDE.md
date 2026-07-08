# eSewa Payment Integration - Testing Guide

## What Changed (Simplified Approach)

Instead of hidden form submission, we now use **direct URL redirect**:

- Simpler, more reliable
- Works on all browsers
- No form submission issues
- Better debugging

---

## Step-by-Step Testing

### 1. Start Your Servers

**Terminal 1 - Backend:**

```bash
cd server
node server.js
# Should see: "Database connected" and "Server running on port 5000"
```

**Terminal 2 - Frontend:**

```bash
cd client
npm run dev
# Should see: "VITE v..." and "Local: http://localhost:5173"
```

### 2. Open Browser Console

Press **F12** or right-click → **Inspect** → **Console** tab

Clear everything:

```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### 3. Add Product to Cart

1. Go to http://localhost:5173
2. Click on any product
3. Click "Add to Cart"
4. Go to cart → **Checkout**

### 4. Add Delivery Address

1. Scroll to "Add New Address"
2. Fill form:
   - **Address:** Any address (e.g., "Thamel, Kathmandu")
   - **City:** Select from dropdown (e.g., "Kathmandu")
   - **Postal Code:** Any code (e.g., "44600")
   - **Phone:** Any number (e.g., "9841234567")
3. Click **"Add"**
4. ✅ Should see address appear with **RED BORDER** (auto-selected)

### 5. Test eSewa Payment

Click **"Pay with eSewa"**

**Watch the Console (F12)** for these logs:

```
=== Initiating eSewa Payment ===
Order Data: {...}
Backend Response: {success: true, data: {...}}
Redirect URL: https://uat.esewa.com.np/...
Order ID: [MONGO_ID]
Redirecting to eSewa...
```

✅ **You should be redirected to eSewa payment page**

### 6. Complete eSewa Payment

Once at eSewa page:

1. Use test credentials:
   - **Merchant Code:** EPAYTEST (auto-filled)
   - **Mobile/Email:** Any test value
   - **PIN:** Any value

2. Look for confirmation button and click it

### 7. Payment Confirmation

You'll be redirected back to:
`http://localhost:5173/shop/esewa-return?status=COMPLETE&refId=...&amt=...`

**Watch Console** for:

```
=== Processing eSewa Return ===
All return parameters: {...}
eSewa Status: COMPLETE
Verifying payment with backend...
Backend verification response: {success: true}
```

✅ Should see **"Payment Successful!"** alert
✅ Should redirect to your account orders page

---

## Troubleshooting

### Error: "Order ID not found"

- **Problem:** sessionStorage was cleared or payment initiated in different tab
- **Solution:** Must complete payment in same browser session

### Error: "URL_CACHE_MISS" on eSewa page

- **Problem:** Signature mismatch or invalid parameters
- **Check:**
  - Backend server logs for "Signature string"
  - Ensure `.env` has correct ESEWA credentials
  - Amount must be integer (no decimals)

### No redirect to eSewa

- **Problem:** Backend error
- **Check:** Terminal where `node server.js` runs for error messages
- **Look for:** "=== Initiating eSewa Payment ===" in server logs

### Payment shows but doesn't return

- **Problem:** Success URL misconfigured
- **Check:** In `.env`:
  ```
  ESEWA_SUCCESS_URL=http://localhost:5173/shop/esewa-return
  ESEWA_FAILURE_URL=http://localhost:5173/shop
  ```

---

## Verify Everything Works

### Checklist:

- ✅ Nepali city dropdown shows in address form
- ✅ Address auto-selects (red border)
- ✅ Console shows "Redirecting to eSewa..."
- ✅ Redirected to eSewa payment page
- ✅ After eSewa, see "Payment Successful!" alert
- ✅ Order appears in your Account → Orders

### If Stuck:

1. Clear console: `localStorage.clear(); sessionStorage.clear();`
2. Copy **all** console output and share with me
3. Screenshot of what you see
4. Any error messages

---

## Next Steps After Testing

Once working:

1. Test "Cash on Delivery" too
2. Check admin panel to see new orders
3. Admin can verify order status
4. Then you can go live with real credentials

---

**All changes are backward compatible** - existing functionality remains unchanged!
