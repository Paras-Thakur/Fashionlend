# Stock Management System - Complete Setup

## Current Status
✅ MongoDB stock management is working correctly
✅ Stock decrements properly when saved
✅ `stockStatus` and `availability` update automatically when stock reaches 0

## Problem
The server is running OLD CODE and needs to be restarted to load the updated routes and logging.

## Solution Steps

### 1. RESTART THE SERVER (CRITICAL)

**In Terminal 2 (server terminal):**
1. Press `Ctrl+C` to stop the current server
2. Run: `node server.js`
3. You should see: `Server running on port 5000` and `MongoDB Atlas connected successfully`

### 2. Test the Stock System

#### Step A: Check Current Product Stock
1. Open browser and go to a product detail page
2. Note the current stock quantity
3. Check browser console (F12) - you'll see product data

#### Step B: Place an Order
1. Add product to cart
2. Go to checkout
3. Complete the order

#### Step C: Watch Server Terminal
You should now see detailed logs like:
```
=== VALIDATING STOCK FOR ORDER ===
Checking Product Name:
  - Requested quantity: 1
  - Current stock: 2
  - Availability: true
  - Stock status: in_stock
  ✓ Stock check passed

=== ORDER CREATION: Reserving stock for order ===
[STOCK ADJUSTMENT] Product: Product Name
  Previous stock: 2
  Change: -1
  New stock: 1
  Final stock: 1
  Stock status: in_stock
  Availability: true
```

#### Step D: Verify Stock Update
1. Refresh the product page (wait 10 seconds or hard refresh)
2. Stock should show the decremented value
3. When stock reaches 0, it should show "Out of Stock"

### 3. Expected Behavior

#### When Stock > 0:
- Product shows: "X available"
- "Add to Cart" button is enabled
- Customers can rent the product

#### When Stock = 0:
- Product shows: "Out of Stock"
- "Add to Cart" button shows "Out of Stock" and is disabled
- Alert message: "This item is currently out of stock"
- Backend blocks any rental attempts

#### MongoDB Updates:
- `stock`: 0
- `stockStatus`: "out_of_stock"
- `availability`: false

### 4. Owner Restock Process

Owners can restock through the Owner Dashboard:
1. Go to Owner Dashboard → Products tab
2. Click the green "+" button on any product
3. Choose:
   - **Set exact quantity**: Replace current stock
   - **Add to existing stock**: Increment current stock
4. Enter quantity and save
5. Product becomes available again immediately

### 5. Troubleshooting

#### If stock doesn't update:
1. Check server terminal for errors
2. Verify MongoDB connection is active
3. Hard refresh browser (Ctrl+Shift+R)
4. Check Network tab in browser DevTools for API responses

#### If logs don't appear:
1. Make sure you restarted the server AFTER accepting the code changes
2. Verify the server process ID changed (different PID)
3. Check that you're watching the correct terminal

#### If "Out of Stock" doesn't show:
1. Check MongoDB directly using the test script:
   ```bash
   cd server
   node test-stock.js
   ```
2. Verify product's `availability` and `stockStatus` fields
3. Clear browser cache and reload

### 6. API Endpoints for Testing

#### Get Product Stock:
```
GET /api/products/:id
Response includes: stock, stockStatus, availability
```

#### Restock Product (Owner only):
```
PATCH /api/products/:id/restock
Body: { "quantity": 5, "mode": "set" }
```

#### Create Order:
```
POST /api/orders
Body: { items: [...], shippingAddress: {...}, paymentMethod: "cod" }
```

## Database Schema

### Product Model:
```javascript
{
  stock: Number (min: 0),
  stockStatus: "in_stock" | "out_of_stock",
  availability: Boolean,
  // ... other fields
}
```

### Auto-update on Save:
Every time `product.save()` is called:
1. `stock` is validated (min: 0)
2. `stockStatus` = stock > 0 ? 'in_stock' : 'out_of_stock'
3. `availability` = stock > 0
4. `updatedAt` = current timestamp

## Testing Checklist

- [ ] Server restarted with new code
- [ ] Can see logs in server terminal
- [ ] Product stock decrements after order
- [ ] "Out of Stock" shows when stock = 0
- [ ] Cannot add out-of-stock items to cart
- [ ] Cannot place order for out-of-stock items
- [ ] Owner can restock products
- [ ] Product becomes available after restock
- [ ] Multiple customers can't over-rent (stock validation)
- [ ] Product page auto-refreshes stock status

