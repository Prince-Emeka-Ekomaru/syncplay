# Vercel Environment Variable Setup - Kora Pay

## ⚠️ Current Issue
Error: "Server configuration error. KORA_SECRET_KEY not found"

## ✅ Solution Steps

### Step 1: Verify Environment Variable in Vercel

1. **Go to Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Select your **syncplay** project

2. **Navigate to Settings:**
   - Click on your project
   - Go to **Settings** tab
   - Click **Environment Variables** in the left sidebar

3. **Check if `KORA_SECRET_KEY` exists:**
   - Look for: `KORA_SECRET_KEY`
   - Value should be your Kora Pay secret key (starts with `sk_live_`)

4. **If it doesn't exist, add it:**
   - Click **Add New**
   - **Key:** `KORA_SECRET_KEY`
   - **Value:** Your Kora Pay secret key (get from Kora Dashboard)
   - **Environment:** Select **Production**, **Preview**, and **Development**
   - Click **Save**

### Step 2: Redeploy After Adding Environment Variable

**IMPORTANT:** After adding/updating environment variables, you MUST redeploy!

1. **Go to Deployments tab:**
   - Click **Deployments** in your project
   - Find the latest deployment
   - Click the **three dots (⋯)** menu
   - Click **Redeploy**
   - Or click **Redeploy** button at the top

2. **Wait for deployment to complete:**
   - Usually takes 1-2 minutes
   - Check the deployment logs for any errors

### Step 3: Verify Environment Variable is Available

After redeploy, check Vercel Function logs:

1. **Go to Functions tab:**
   - Click **Functions** in your project
   - Find `api/create-kora-payment`
   - Click on it to view logs

2. **Test the function:**
   - Try making a payment again
   - Check the logs to see if `KORA_SECRET_KEY` is available

---

## 🔍 Troubleshooting

### Issue: Environment variable still not found after redeploy

**Solution 1: Check Environment Scope**
- Make sure `KORA_SECRET_KEY` is enabled for **Production** environment
- If testing on preview, enable for **Preview** too

**Solution 2: Check Variable Name**
- Ensure it's exactly: `KORA_SECRET_KEY` (case-sensitive)
- No extra spaces or typos

**Solution 3: Check Vercel Project Settings**
- Go to Settings → General
- Make sure you're in the correct project
- Check if there are multiple projects with similar names

**Solution 4: Manual Redeploy**
- Go to Deployments
- Click "Redeploy" on the latest deployment
- Select "Use existing Build Cache" = **No**
- This forces a fresh build with new environment variables

---

## 📝 Quick Checklist

- [ ] `KORA_SECRET_KEY` added to Vercel Environment Variables
- [ ] Value is your Kora Pay secret key (starts with `sk_live_`)
- [ ] Enabled for **Production** environment (and Preview if needed)
- [ ] **Redeployed** after adding the variable
- [ ] Checked Function logs for errors
- [ ] Tested payment flow again

---

## 🧪 Test After Setup

1. Go to: https://syncplay.co/register
2. Fill out registration form
3. Submit payment
4. Should redirect to Kora Pay checkout (not show error)

---

## 📞 If Still Not Working

1. **Check Vercel Function Logs:**
   - Functions → `api/create-kora-payment` → Logs
   - Look for error messages

2. **Check Browser Console:**
   - Open Developer Tools (F12)
   - Network tab → Look for `/api/create-kora-payment`
   - Check the response

3. **Verify API Route:**
   - The file should be at: `api/create-kora-payment.js`
   - Should be in the root of your project (same level as `package.json`)

---

**After adding the environment variable and redeploying, the error should be resolved!**

