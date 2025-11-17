# Kora Pay Payment Links Setup

## ✅ No Manual Link Creation Needed!

**You DON'T need to create payment links manually in the dashboard.**

The code automatically creates payment links via the API when users submit the registration form.

---

## 🔧 What the Code Does

1. **User submits registration form**
2. **Code calls our backend API** (`/api/create-kora-payment`)
3. **Backend calls Kora Pay Payment Links API** to create a link dynamically
4. **User is redirected** to the payment link
5. **After payment**, user is redirected back to your site

**Everything is automatic!** No manual link creation needed.

---

## ⚙️ Dashboard Configuration (If Needed)

### Check These Settings:

1. **Go to Kora Pay Dashboard:**
   - https://dashboard.korapay.com/
   - Log in

2. **Check API Settings:**
   - Settings → API → Make sure API is enabled
   - Verify your API keys are active

3. **Check Payment Links Settings (if available):**
   - Settings → Payment Links → Make sure it's enabled
   - Some dashboards require enabling the feature first

4. **Check Redirect URLs (if required):**
   - Settings → Redirect URLs
   - Add: `https://www.syncplay.co/register`
   - (This might not be needed for Payment Links, but check if the API still fails)

---

## 🧪 Testing

1. **Try the payment flow:**
   - Fill out registration form
   - Submit payment
   - Should automatically create a payment link and redirect

2. **Check Vercel Logs:**
   - If it fails, check which API endpoint worked
   - Look for: "Payment Links API" or "Charges API" in logs

---

## 📝 Summary

- ❌ **Don't create links manually** - Code does it automatically
- ✅ **Check dashboard settings** - Make sure API/Payment Links are enabled
- ✅ **Test the flow** - It should work automatically

The payment links are created **on-demand** for each registration, so you don't need to pre-create them!

