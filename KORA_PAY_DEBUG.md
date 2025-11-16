# Kora Pay API Debugging Guide

## Current Error
"It seems there's an issue with your input. Please correct it and try again."

This error suggests the API request format might be incorrect.

---

## How to Debug

### Step 1: Check Vercel Function Logs

1. **Go to Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Select your **syncplay** project

2. **View Function Logs:**
   - Click **Functions** tab
   - Find `api/create-kora-payment`
   - Click on it to view logs

3. **Look for:**
   - `Kora Pay API Request:` - Shows what we're sending
   - `Kora Pay API Response:` - Shows what Kora Pay returns
   - `Kora Pay API Error:` - Shows detailed error info

### Step 2: Check Browser Console

1. **Open Developer Tools** (F12)
2. **Go to Network tab**
3. **Try payment again**
4. **Find `/api/create-kora-payment` request**
5. **Click on it → Response tab**
6. **See the full error response from Kora Pay**

---

## Common Issues & Fixes

### Issue 1: Amount Format
**Problem:** Amount might need to be in kobo (smallest currency unit) not Naira

**Current:** `amount: 100000.00` (Naira)
**Try:** `amount: 10000000` (kobo - 100,000 Naira = 10,000,000 kobo)

### Issue 2: Missing Required Fields
**Problem:** Kora Pay might require additional fields

**Check if needed:**
- `description` field
- `notification_url` (webhook URL)
- `expires_at` (payment link expiration)

### Issue 3: API Endpoint Wrong
**Problem:** The endpoint URL might be incorrect

**Current:** `https://api.korapay.com/merchant/api/v1/charges/initialize`
**Verify:** Check Kora Pay documentation for correct endpoint

### Issue 4: Request Body Structure
**Problem:** The request body structure might be wrong

**Current structure:**
```json
{
  "amount": "100000.00",
  "currency": "NGN",
  "reference": "SP-1234567890",
  "customer": {
    "email": "user@example.com",
    "name": "Team Name"
  },
  "callback_url": "https://...",
  "metadata": {}
}
```

---

## Next Steps

1. **Check Vercel Function Logs** (most important!)
   - This will show the exact error from Kora Pay
   - Copy the error message and share it

2. **Check Kora Pay Dashboard:**
   - Go to: https://dashboard.korapay.com/
   - Check API documentation
   - Look for example requests

3. **Test with Postman/curl:**
   - Try making a direct API call to Kora Pay
   - See what format works

---

## Quick Test - Check Logs

After the next payment attempt, check Vercel logs and share:
- The `Kora Pay API Request` log
- The `Kora Pay API Response` log
- Any error messages

This will help identify the exact issue!

