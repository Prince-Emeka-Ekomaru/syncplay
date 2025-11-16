# How to Check Vercel Function Logs for Kora Pay Error

## 🔍 Step-by-Step Guide

### Step 1: Go to Vercel Dashboard
1. Visit: https://vercel.com/dashboard
2. Log in to your account
3. Select your **syncplay** project

### Step 2: Navigate to Functions
1. Click on your project
2. Click **Functions** tab (in the top navigation)
3. You should see: `api/create-kora-payment`

### Step 3: View Function Logs
1. Click on `api/create-kora-payment`
2. You'll see a list of recent invocations
3. Click on the **most recent one** (the one from your test)
4. View the logs

### Step 4: Look for These Logs
You should see:
- `Kora Pay API Request:` - Shows what we sent
- `Kora Pay API Response:` - Shows what Kora Pay returned
- `Kora Pay API Error:` - Shows detailed error

### Step 5: Copy the Error Details
Look for:
- **Status code** (e.g., 400, 422, 500)
- **Error message** from Kora Pay
- **Full response body** from Kora Pay

---

## 📋 What to Share

Please share:
1. The **status code** from Kora Pay response
2. The **error message** from Kora Pay
3. The **full response body** (if available)
4. The **request body** we sent (from `Kora Pay API Request` log)

This will help identify the exact issue!

---

## 🔗 Direct Link
If you know your project name, you can go directly to:
`https://vercel.com/[your-username]/syncplay/functions`

