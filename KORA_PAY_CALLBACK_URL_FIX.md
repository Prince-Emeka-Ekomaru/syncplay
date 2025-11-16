# Kora Pay Callback URL Validation Error Fix

## 🔴 Current Error
```
Status: 422 (Unprocessable Entity)
Error: validation_error
Message: "It seems there's an issue with your input. Please correct it and try again."
Data: { callback_url: [Object] }
```

## ✅ Solution Steps

### Step 1: Register Callback URL in Kora Pay Dashboard

**Most payment gateways require you to whitelist/register callback URLs.**

1. **Go to Kora Pay Dashboard:**
   - https://dashboard.korapay.com/
   - Log in to your account

2. **Find Settings/Webhooks/Callback URLs:**
   - Look for: **Settings**, **Webhooks**, **API Settings**, or **Callback URLs**
   - This is usually under: **Settings → API** or **Settings → Webhooks**

3. **Add Your Callback URL:**
   - Add: `https://www.syncplay.co/register`
   - Or: `https://syncplay.co/register`
   - Some gateways need the full URL with query params, others just the base

4. **Save the Settings**

---

### Step 2: Check Kora Pay API Documentation

1. **Go to Kora Pay Developer Docs:**
   - https://developers.korapay.com/
   - Look for API documentation

2. **Check Required Fields:**
   - Verify the exact field name (callback_url vs redirect_url)
   - Check if callback URL needs to be registered
   - See example requests

---

### Step 3: Try Different URL Formats

If registration doesn't work, try these formats:

**Option 1: Base URL only (no query params)**
```javascript
callback_url: 'https://www.syncplay.co/register'
```

**Option 2: Use redirect_url instead**
```javascript
redirect_url: 'https://www.syncplay.co/register?payment=kora&ref=...'
```

**Option 3: Remove callback_url entirely**
Some APIs use webhooks instead of redirect URLs.

---

## 🔧 What I've Updated

I've updated the code to try `redirect_url` in addition to `callback_url`. But the **most likely fix** is registering the URL in your Kora Pay dashboard.

---

## 📝 Next Steps

1. **Check Kora Pay Dashboard** for callback URL registration
2. **Register** `https://www.syncplay.co/register` (or `https://syncplay.co/register`)
3. **Test again** after registration
4. **If still fails**, check Kora Pay API docs for exact field requirements

---

## 🆘 If You Can't Find Callback URL Settings

Contact Kora Pay support:
- Email: support@korapay.com
- Ask: "How do I register/whitelist callback URLs for API payments?"
- Share: Your callback URL: `https://www.syncplay.co/register`

