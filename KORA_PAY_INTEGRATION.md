# Kora Pay Integration Guide

## Overview

Your syncplay eSports platform now uses **Kora Pay** as the primary payment gateway, replacing Paystack. Kora Pay offers secure payment processing for Nigerian businesses.

---

## ✅ What's Been Implemented

### 1. **Payment Service Updated**
- **File:** `src/services/paymentService.js`
- **Changes:**
  - Removed Paystack integration
  - Added Kora Pay integration
  - Kora Pay uses redirect-based checkout flow

### 2. **Registration Form Updated**
- **File:** `src/pages/Register.js`
- **Features:**
  - Handles Kora Pay redirect flow
  - Processes callback after payment
  - Saves registration after successful payment

### 3. **Admin Settings Updated**
- **File:** `src/pages/AdminPaymentSettings.js`
- **Route:** `/admin/payment-settings`
- **Features:**
  - Enable/disable Kora Pay
  - Set Kora Pay as default gateway

### 4. **Database Schema Updated**
- **File:** `payment_settings_schema.sql`
- **Changes:**
  - `paystack_enabled` → `kora_enabled`
  - Default gateway changed to `kora`

---

## 🚀 Setup Instructions

### Step 1: Get Kora Pay Account

1. **Sign up at:** https://www.korahq.com/
2. **Complete onboarding:**
   - Provide business information
   - Submit required documents
   - Wait for account approval

### Step 2: Get API Keys

1. **Log in to Kora Dashboard:**
   - https://dashboard.korapay.com/
2. **Navigate to:** Settings → Product & Payment Settings → API Configuration
3. **Copy your keys:**
   - **Public Key** (starts with `pk_` or `pk_test_`)
   - **Secret Key** (keep this secure, backend only)

### Step 3: Update Environment Variables

**For Local Development (.env):**
```env
# Kora Pay - Public Key (Frontend)
REACT_APP_KORA_PUBLIC_KEY=pk_live_8WPWSgWgGAPBsabjQhPRKqpTW3BMb9eH5Ra6wHk7

# Kora Pay - Secret Key (Backend Only - DO NOT use in frontend!)
# Get from Kora Dashboard → Settings → API Keys
# KORA_SECRET_KEY=sk_live_your_secret_key_here

# Kora Pay - Encryption Key (Backend Only - for webhook verification)
# Get from Kora Dashboard → Settings → API Keys
# KORA_ENCRYPTION_KEY=your_encryption_key_here
```

**⚠️ IMPORTANT SECURITY NOTES:**
- **Public Key** (`pk_live_...`) → Safe for frontend, add to `.env` and Vercel
- **Secret Key** (`sk_live_...`) → **NEVER** expose in frontend! Backend only!
- **Encryption Key** → Backend only, for webhook verification

**For Vercel Production:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. **Remove:** `REACT_APP_PAYSTACK_PUBLIC_KEY` (if exists)
3. **Add:** `REACT_APP_KORA_PUBLIC_KEY` = `pk_live_8WPWSgWgGAPBsabjQhPRKqpTW3BMb9eH5Ra6wHk7`
4. **DO NOT** add secret key or encryption key to Vercel frontend environment
5. **Redeploy** your application

### Step 4: Run Database Migration

1. **Go to Supabase Dashboard:**
   - https://supabase.com/dashboard
   - Select your project
   - Go to **SQL Editor**

2. **Run the updated SQL script:**
   ```sql
   -- Copy and paste contents of payment_settings_schema.sql
   -- This updates the payment_settings table to use Kora Pay
   ```

3. **If you already have payment_settings table:**
   ```sql
   -- Update existing table
   ALTER TABLE payment_settings 
   DROP COLUMN IF EXISTS paystack_enabled,
   ADD COLUMN IF NOT EXISTS kora_enabled BOOLEAN DEFAULT true;
   
   UPDATE payment_settings 
   SET active_gateway = 'kora' 
   WHERE active_gateway = 'paystack';
   ```

### Step 5: Configure Payment Settings

1. **Access Admin Dashboard:**
   - Go to: `https://yourdomain.com/admin/payment-settings`

2. **Configure Settings:**
   - ✅ Enable Kora Pay
   - ✅/❌ Enable/Disable Flutterwave (optional)
   - Set Kora Pay as default

3. **Save Settings**

---

## 📋 How Kora Pay Works

### Payment Flow:

1. **User fills registration form** (Steps 1-3)
2. **User reviews and selects payment method** (Step 4)
3. **User clicks "Submit Registration"**
4. **System redirects to Kora Pay checkout:**
   - User completes payment on Kora's secure page
   - Kora processes payment
   - User is redirected back to your site
5. **System processes callback:**
   - Verifies payment reference
   - Saves registration to database
   - Shows success page

### Important Notes:

- **Kora Pay uses redirect-based checkout** (not popup like Paystack)
- User leaves your site temporarily to complete payment
- After payment, user is redirected back with payment reference
- System automatically processes the callback and saves registration

---

## 🔧 Testing

### Test Mode:

1. **Use test keys:**
   - Public Key: `pk_test_...`
   - Get from Kora dashboard (test mode)

2. **Test Payment:**
   - Fill registration form
   - Select Kora Pay
   - Complete test payment
   - Verify registration is saved

### Test Cards (if available):

Check Kora Pay documentation for test card numbers:
- https://developers.korapay.com/docs

---

## 🔐 Security Notes

1. **Never expose Secret Keys:**
   - Only public keys go in frontend
   - Secret keys stay on backend (for payment verification)

2. **Payment Verification:**
   - Currently, we assume payment is successful if redirect happens
   - **IMPORTANT:** In production, verify payment status via Kora API
   - Implement backend endpoint to verify payment before saving registration

3. **Environment Variables:**
   - ✅ Use `REACT_APP_` prefix for React
   - ✅ Never commit `.env` to Git
   - ✅ Add to Vercel environment variables

---

## 🚨 Troubleshooting

### Issue: "Payment gateway not configured"
**Solution:** Check that environment variable is set:
- `REACT_APP_KORA_PUBLIC_KEY` must be in `.env` and Vercel

### Issue: Redirect doesn't work
**Solution:**
1. Check Kora Pay public key is correct
2. Verify callback URL is set correctly
3. Check browser console for errors

### Issue: Registration not saved after payment
**Solution:**
1. Check browser console for errors
2. Verify Supabase connection
3. Check payment reference matches
4. Verify sessionStorage has pending registration data

### Issue: Payment successful but callback fails
**Solution:**
- Implement backend payment verification
- Use Kora API to verify payment status
- Add error logging

---

## 📝 Backend Payment Verification (Recommended)

For production, you should verify payments on the backend:

```javascript
// Backend endpoint example (Node.js/Express)
app.post('/api/verify-kora-payment', async (req, res) => {
  const { reference } = req.body;
  
  try {
    const response = await axios.get(
      `https://api.korapay.com/merchant/api/v1/transactions/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.KORA_SECRET_KEY}`
        }
      }
    );
    
    if (response.data.status === 'success') {
      // Payment verified, save registration
      res.json({ success: true, data: response.data });
    } else {
      res.json({ success: false, message: 'Payment not successful' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Verification failed' });
  }
});
```

---

## ✅ Checklist

- [ ] Sign up for Kora Pay account
- [ ] Complete Kora Pay onboarding
- [ ] Get Kora Pay API keys (test and live)
- [ ] Add `REACT_APP_KORA_PUBLIC_KEY` to `.env`
- [ ] Add `REACT_APP_KORA_PUBLIC_KEY` to Vercel environment variables
- [ ] Remove `REACT_APP_PAYSTACK_PUBLIC_KEY` from environment
- [ ] Run database migration (`payment_settings_schema.sql`)
- [ ] Update existing payment_settings table (if exists)
- [ ] Configure payment settings at `/admin/payment-settings`
- [ ] Test Kora Pay payment flow
- [ ] Verify registrations save correctly
- [ ] Check admin dashboard shows Kora Pay
- [ ] Implement backend payment verification (recommended)

---

## 📞 Support

**Kora Pay:**
- Website: https://www.korahq.com/
- Dashboard: https://dashboard.korapay.com/
- Documentation: https://developers.korapay.com/docs
- Support: support@korapay.com

---

## 🔄 Migration from Paystack

If you had Paystack configured:

1. **Remove Paystack keys** from environment variables
2. **Run database migration** to update payment_settings table
3. **Update admin settings** to use Kora Pay
4. **Test thoroughly** before going live
5. **Update any documentation** that mentions Paystack

---

**🎉 Your platform now uses Kora Pay! Users will be redirected to Kora's secure checkout page to complete payments.**

