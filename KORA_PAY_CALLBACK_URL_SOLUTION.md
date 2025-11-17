# Kora Pay Callback URL Solution

## 🔴 Current Error
```
"callback_url is not allowed"
```

## ✅ Solution

Kora Pay **doesn't accept `callback_url` in the API request**. 

### Option 1: Configure in Dashboard (Most Likely)

1. **Go to Kora Pay Dashboard:**
   - https://dashboard.korapay.com/
   - Log in

2. **Find Callback/Webhook Settings:**
   - Settings → API → Webhooks
   - Settings → API → Callback URLs
   - Settings → Integration → Webhooks

3. **Add Your Callback URL:**
   - URL: `https://www.syncplay.co/register`
   - This will be used for all payments

4. **Save Settings**

### Option 2: Use Webhooks Instead

Kora Pay might use webhooks instead of callback URLs:
- Configure webhook URL in dashboard
- Kora Pay will send payment status to your webhook endpoint
- You'll need to create a webhook endpoint to receive notifications

### Option 3: Check Payment Status Manually

After payment, redirect users back to your site and:
- Use the `reference` to check payment status via API
- Verify payment was successful
- Then save registration

---

## 📝 What We've Done

- ✅ Removed `callback_url` from API request (not allowed)
- ✅ Removed `metadata` (was causing errors)
- ✅ Using minimal required fields only

---

## 🔧 Next Steps

1. **Check Kora Pay Dashboard** for callback/webhook settings
2. **Configure callback URL** in dashboard (not in API request)
3. **Test payment flow** again
4. **If callback doesn't work**, implement webhook endpoint or manual status check

---

## 💡 Alternative: Manual Status Check

After user returns from payment:
1. Get the `reference` from URL params
2. Call Kora Pay API to verify payment status
3. If successful, save registration

This might be the way Kora Pay works - no callback URL in request, but you verify status after redirect.

