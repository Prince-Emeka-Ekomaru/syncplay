# How to View Vercel Function Logs for Kora Pay

## ❌ What You're Currently On
You're on: **Settings → Functions** (configuration page)
- This is for configuring function settings (regions, compute)
- **NOT** where you view logs

---

## ✅ Where to View Function Logs

### Option 1: Logs Tab (Easiest)
1. **Click "Logs"** in the top navigation bar
   - You should see it next to "Deployments", "Analytics", etc.
2. **Filter by Function:**
   - Look for a filter/search box
   - Type: `create-kora-payment`
   - Or select it from a dropdown
3. **View Recent Logs:**
   - You'll see all log entries for that function
   - Look for entries with timestamps matching your test

---

### Option 2: Functions Invocations (Detailed)
1. **Go to Deployments tab:**
   - Click **"Deployments"** in top navigation
2. **Click on Latest Deployment:**
   - Find the most recent deployment
   - Click on it
3. **Go to Functions Section:**
   - Scroll down to see functions
   - Find `api/create-kora-payment`
   - Click on it
4. **View Invocations:**
   - You'll see a list of function calls
   - Click on the most recent one (from your test)
   - View detailed logs

---

### Option 3: Direct URL (If you know your project)
Try: `https://vercel.com/[your-username]/syncplay/logs`

---

## 🔍 What to Look For

Once you find the logs, look for:
1. **`Kora Pay API Request:`** - Shows what we sent
2. **`Kora Pay API Response:`** - Shows what Kora Pay returned
3. **Status code** (400, 422, 500, etc.)
4. **Error message** from Kora Pay
5. **Full response body**

---

## 📸 Quick Guide

**Current Page (Settings):**
```
Settings → Functions (configuration)
```

**Where to Go (Logs):**
```
Top Nav → Logs → Filter: create-kora-payment
```

OR

```
Deployments → Latest → Functions → api/create-kora-payment → View Invocations
```

---

**Click on "Logs" in the top navigation bar to see the function execution logs!**

