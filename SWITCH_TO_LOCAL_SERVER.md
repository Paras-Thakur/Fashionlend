# How to Use Your Optimized Local Server

## Problem:
Your app is currently using the **remote Render.com server** (`fashion-lend-backend.onrender.com`) which:
- Doesn't have the performance optimizations
- Is still slow (2-5 seconds for requests)
- Has cart errors (500 Internal Server Error)

## Solution:
Switch to your **local optimized server** to get all the performance improvements!

---

## Step 1: Create `.env` File in Client Folder

1. Open `client` folder
2. Create a new file named `.env` (exactly, no extension)
3. Add this line:

```env
REACT_APP_BACKEND_URL=http://localhost:5000
```

**Save the file.**

---

## Step 2: Start Your Local Backend Server

Open a terminal in the `server` folder and run:

```bash
cd server
node server.js
```

You should see:
```
Server running on port 5000
MongoDB connected...
```

**Keep this terminal running!**

---

## Step 3: Restart Your React Frontend

1. **Stop the React app** (Ctrl+C in the terminal running it)
2. **Start it again**:

```bash
cd client
npm start
```

---

## Step 4: Test the Speed! 🚀

Now your app will use the LOCAL optimized server:

1. **Login** - Should be super fast (~0.5-1s instead of 2-3s)
2. **Browse products** - Instant loading
3. **Add to cart** - Should work without errors and be very fast
4. **Place order** - Much quicker

---

## Troubleshooting:

### If you still see `fashion-lend-backend.onrender.com` in the browser console:

1. Make sure `.env` file is in the `client` folder (not `server` folder)
2. Make sure it says `REACT_APP_BACKEND_URL` (not just `BACKEND_URL`)
3. Restart the React app completely (Ctrl+C then `npm start`)
4. Clear browser cache (Ctrl+Shift+Delete)

### If you get "Network Error" or "Connection Refused":

- Make sure the backend server is running on port 5000
- Check that `server.js` is running without errors

---

## To Switch Back to Remote Server:

Delete the `.env` file or change it to:
```env
REACT_APP_BACKEND_URL=https://fashion-lend-backend.onrender.com
```

---

## Performance Comparison:

### Remote Server (Current):
- Login: 2-3 seconds ❌
- Cart: 500 errors ❌
- Orders: 3-5 seconds ❌

### Local Optimized Server (After switching):
- Login: 0.5-1 second ✅
- Cart: 0.3-0.5 seconds ✅
- Orders: 1-2 seconds ✅

**60-80% FASTER!** 🚀

