# Paystack Integration Guide for syncplay eSports

This document explains how to integrate Paystack payment processing into the tournament registration system.

## Step 1: Install Paystack Dependencies

Run this command in your project directory:

```bash
npm install react-paystack
```

## Step 2: Get Your Paystack Keys

1. Create an account at https://paystack.com/
2. Go to Settings > API Keys & Webhooks
3. Get your **Public Key** (for frontend) and **Secret Key** (for backend)
4. For testing, use **Test Keys**
5. For production, use **Live Keys**

## Step 3: Environment Variables

Create a `.env` file in your project root (if it doesn't exist):

```env
REACT_APP_PAYSTACK_PUBLIC_KEY=pk_test_your_test_public_key_here
```

## Step 4: Backend Setup (Required for Production)

### Option A: Using Node.js/Express Backend

Create an API endpoint to handle payment verification:

```javascript
// backend/routes/payment.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/verify-payment', async (req, res) => {
  const { reference } = req.body;
  
  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    );
    
    if (response.data.data.status === 'success') {
      // Save registration to database
      // Send confirmation email
      res.json({ success: true, data: response.data.data });
    } else {
      res.json({ success: false, message: 'Payment not successful' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Verification failed' });
  }
});

module.exports = router;
```

### Option B: Using Firebase Cloud Functions

```javascript
// functions/index.js
const functions = require('firebase-functions');
const axios = require('axios');

exports.verifyPayment = functions.https.onCall(async (data, context) => {
  const { reference } = data;
  
  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${functions.config().paystack.secret}`
        }
      }
    );
    
    return { success: true, data: response.data.data };
  } catch (error) {
    throw new functions.https.HttpsError('internal', 'Payment verification failed');
  }
});
```

## Step 5: Frontend Integration

The `Register.js` file has been updated to include Paystack integration. The payment flow works as follows:

1. User fills out registration form (4 steps)
2. On final submission, Paystack popup opens
3. User completes payment
4. Payment reference is verified with backend
5. Success page is shown with confirmation

## Step 6: Email Notifications

After successful payment, send confirmation emails using:

### Option A: EmailJS (Simple, no backend)

```bash
npm install @emailjs/browser
```

### Option B: SendGrid/Mailgun (More reliable)

```bash
npm install @sendgrid/mail
```

## Step 7: Database Storage

Store registration data in:
- **Firebase Firestore** (recommended for quick setup)
- **MongoDB** (if using Node.js backend)
- **PostgreSQL** (for complex querying needs)

## Testing

### Test Cards (Paystack)

**Success:**
- Card: 4084 0840 8408 4081
- CVV: 408
- Expiry: Any future date
- PIN: 0000
- OTP: 123456

**Decline:**
- Card: 5060 6666 6666 6666 (Insufficient funds)

## Production Checklist

- [ ] Replace test keys with live keys
- [ ] Set up webhook endpoints for payment notifications
- [ ] Implement proper error handling
- [ ] Add email confirmations
- [ ] Set up database to store registrations
- [ ] Test with real small amounts before going live
- [ ] Enable 2FA on Paystack dashboard
- [ ] Set up refund policy and process
- [ ] Implement registration limit (32 teams)
- [ ] Add duplicate email/team name checking

## Security Best Practices

1. **Never** expose your secret key in frontend code
2. **Always** verify payments on the backend
3. Use HTTPS in production
4. Validate all form inputs
5. Implement rate limiting for API endpoints
6. Log all payment attempts for auditing
7. Store sensitive data encrypted

## Support

- Paystack Documentation: https://paystack.com/docs
- Paystack Support: support@paystack.com
- React Paystack: https://github.com/ifeanyiNgbor/react-paystack

