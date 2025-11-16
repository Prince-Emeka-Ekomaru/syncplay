# Kora Pay Integration Fix

## Issue
Kora Pay is showing error: "This payment's link seems to be incomplete or wrong"

## Root Cause
Kora Pay requires creating payment links via their API (which needs secret key). We can't use secret key in frontend, so we need a backend endpoint.

## Solution Options

### Option 1: Quick Fix - Use Kora Pay API Endpoint (Recommended)
Create a backend API endpoint that creates the payment link using your secret key.

### Option 2: Use Kora Pay Checkout Widget
If Kora Pay has a JavaScript widget, we can use that instead.

### Option 3: Create Payment Link via Backend
Set up a simple backend (Node.js/Express) that creates payment links.

---

## Immediate Fix - Update Checkout URL Format

The current URL format might be incorrect. Kora Pay might require:
- Different endpoint URL
- Different parameter format
- Payment link created via API first

---

## Recommended: Create Backend Endpoint

Since you have the secret key, create a simple backend endpoint:

```javascript
// backend/api/kora-payment.js
const axios = require('axios');

app.post('/api/create-kora-payment', async (req, res) => {
  const { amount, email, reference, callback_url, metadata } = req.body;
  
  try {
    const response = await axios.post(
      'https://api.korapay.com/merchant/api/v1/charges/initialize',
      {
        amount: amount,
        currency: 'NGN',
        reference: reference,
        customer: {
          email: email,
        },
        callback_url: callback_url,
        metadata: metadata,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.KORA_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    // Return the checkout URL
    res.json({ 
      success: true, 
      checkout_url: response.data.data.checkout_url 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});
```

Then update frontend to call this endpoint first.

---

## Quick Test - Check Kora Pay Dashboard

1. Go to: https://dashboard.korapay.com/
2. Check if there's a "Payment Links" or "Checkout" section
3. See if you can create payment links manually
4. Check the URL format of manually created links

---

## Next Steps

1. Check Kora Pay documentation for frontend integration
2. Create backend endpoint for payment link creation
3. Update frontend to use backend endpoint
4. Test payment flow

