# Multiple Payment Gateway Integration Guide

## Overview

Your syncplay eSports platform now supports **multiple payment gateways** with admin control. Users can select between **Paystack** and **Flutterwave**, and admins can enable/disable gateways from the admin dashboard.

---

## ✅ What's Been Implemented

### 1. **Payment Service Abstraction Layer**
- **File:** `src/services/paymentService.js`
- **Purpose:** Unified interface for all payment gateways
- **Features:**
  - Supports Paystack and Flutterwave
  - Easy to add more gateways in the future
  - Admin-configurable gateway availability

### 2. **Payment Gateway Selection UI**
- **File:** `src/pages/Register.js`
- **Features:**
  - Users can select payment method before payment
  - Shows available gateways dynamically
  - Beautiful card-based selection interface
  - Auto-selects default gateway

### 3. **Admin Payment Settings Dashboard**
- **File:** `src/pages/AdminPaymentSettings.js`
- **Route:** `/admin/payment-settings`
- **Features:**
  - Enable/disable payment gateways
  - Set default payment gateway
  - View required environment variables

### 4. **Database Schema**
- **File:** `payment_settings_schema.sql`
- **Table:** `payment_settings`
- **Columns:**
  - `active_gateway` - Default gateway
  - `paystack_enabled` - Enable/disable Paystack
  - `flutterwave_enabled` - Enable/disable Flutterwave

---

## 🚀 Setup Instructions

### Step 1: Run Database Migration

1. **Go to Supabase Dashboard:**
   - https://supabase.com/dashboard
   - Select your project
   - Go to **SQL Editor**

2. **Run the SQL script:**
   ```sql
   -- Copy and paste contents of payment_settings_schema.sql
   ```
   - This creates the `payment_settings` table
   - Adds `payment_gateway` column to `registrations` table

### Step 2: Add Environment Variables

**For Local Development (.env):**
```env
# Paystack (existing)
REACT_APP_PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_key

# Flutterwave (new)
REACT_APP_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST_your_flutterwave_key
```

**For Vercel Production:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   - `REACT_APP_PAYSTACK_PUBLIC_KEY` = `pk_live_your_live_key`
   - `REACT_APP_FLUTTERWAVE_PUBLIC_KEY` = `FLWPUBK_live_your_live_key`
3. **Redeploy** your application

### Step 3: Get Flutterwave Keys

1. **Sign up at:** https://flutterwave.com/
2. **Get your API keys:**
   - Go to Settings → API Keys
   - Copy your **Public Key** (starts with `FLWPUBK_`)
   - For testing: Use **Test Keys**
   - For production: Use **Live Keys**

### Step 4: Configure Payment Settings

1. **Access Admin Dashboard:**
   - Go to: `https://yourdomain.com/admin/payment-settings`

2. **Configure Settings:**
   - ✅ Enable Paystack (if you have keys)
   - ✅ Enable Flutterwave (if you have keys)
   - Select default gateway

3. **Save Settings**

---

## 📋 How It Works

### For Users:

1. **Fill Registration Form** (Steps 1-3)
2. **Review & Select Payment Method** (Step 4):
   - If multiple gateways enabled → Shows selection cards
   - If only one enabled → Auto-selected (no selection shown)
3. **Complete Payment:**
   - Click "Submit Registration"
   - Payment popup opens (Paystack or Flutterwave)
   - Complete payment
   - Registration saved automatically

### For Admins:

1. **Access Settings:**
   - Navigate to `/admin/payment-settings`
2. **Enable/Disable Gateways:**
   - Toggle Paystack on/off
   - Toggle Flutterwave on/off
3. **Set Default:**
   - Choose which gateway is pre-selected
4. **Save Changes:**
   - Settings are saved to Supabase
   - Users see updated options immediately

---

## 🔧 Admin Controls

### Enable/Disable Payment Gateways

**Scenario 1: Paystack Approval Delayed**
- ✅ Keep Paystack enabled (for future use)
- ✅ Enable Flutterwave
- Set Flutterwave as default
- Users can still see both options

**Scenario 2: Switch to Paystack Only**
- ✅ Enable Paystack
- ❌ Disable Flutterwave
- Users only see Paystack option

**Scenario 3: Both Available**
- ✅ Enable Paystack
- ✅ Enable Flutterwave
- Users can choose either

---

## 🧪 Testing

### Test Paystack:
1. Use test key: `pk_test_...`
2. Test card: `4084 0840 8408 4081`
3. CVV: `408`, PIN: `0000`, OTP: `123456`

### Test Flutterwave:
1. Use test key: `FLWPUBK_TEST_...`
2. Test card: `5531886652142950`
3. CVV: `564`, Expiry: Any future date
4. OTP: `123456`

---

## 📊 Database Schema

### `payment_settings` Table:
```sql
id                  UUID PRIMARY KEY
active_gateway      TEXT (paystack | flutterwave)
paystack_enabled    BOOLEAN
flutterwave_enabled BOOLEAN
created_at          TIMESTAMP
updated_at          TIMESTAMP
```

### `registrations` Table (Updated):
```sql
payment_gateway     TEXT  -- NEW: Which gateway was used
```

---

## 🔐 Security Notes

1. **Never expose Secret Keys:**
   - Only public keys go in frontend
   - Secret keys stay on backend (if you add one later)

2. **Environment Variables:**
   - ✅ Use `REACT_APP_` prefix for React
   - ✅ Never commit `.env` to Git
   - ✅ Add to Vercel environment variables

3. **Payment Verification:**
   - Always verify payments on backend (future enhancement)
   - Use webhooks for payment confirmations

---

## 🚨 Troubleshooting

### Issue: "Payment gateway not configured"
**Solution:** Check that environment variable is set:
- `REACT_APP_PAYSTACK_PUBLIC_KEY` for Paystack
- `REACT_APP_FLUTTERWAVE_PUBLIC_KEY` for Flutterwave

### Issue: "Gateway not available"
**Solution:** 
1. Check admin settings at `/admin/payment-settings`
2. Ensure gateway is enabled
3. Check environment variables

### Issue: "Flutterwave script not loaded"
**Solution:**
- Check `public/index.html` includes:
  ```html
  <script src="https://checkout.flutterwave.com/v3.js"></script>
  ```

### Issue: Payment popup doesn't open
**Solution:**
- Check browser console for errors
- Verify payment gateway keys are correct
- Check if gateway is enabled in admin settings

---

## 📝 Future Enhancements

1. **Backend Payment Verification:**
   - Verify payments server-side
   - Webhook integration

2. **More Payment Gateways:**
   - Monnify
   - Interswitch
   - Stripe (for international)

3. **Payment Analytics:**
   - Track which gateway is used more
   - Success rates per gateway

4. **Admin Authentication:**
   - Secure admin dashboard
   - Role-based access control

---

## ✅ Checklist

- [ ] Run `payment_settings_schema.sql` in Supabase
- [ ] Add `REACT_APP_FLUTTERWAVE_PUBLIC_KEY` to `.env`
- [ ] Add Flutterwave key to Vercel environment variables
- [ ] Get Flutterwave account (test or live)
- [ ] Configure payment settings at `/admin/payment-settings`
- [ ] Test Paystack payment
- [ ] Test Flutterwave payment
- [ ] Verify registrations save correctly
- [ ] Check admin dashboard shows payment gateway

---

## 📞 Support

**Paystack:**
- Dashboard: https://dashboard.paystack.com
- Docs: https://paystack.com/docs
- Support: support@paystack.com

**Flutterwave:**
- Dashboard: https://dashboard.flutterwave.com
- Docs: https://developer.flutterwave.com/docs
- Support: support@flutterwave.com

---

**🎉 Your platform now supports multiple payment gateways! Users can choose their preferred payment method, and you can switch between gateways instantly from the admin dashboard.**

