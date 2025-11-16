# Kora Pay Backend Setup Guide

## ⚠️ Problem
Kora Pay requires creating payment links via their API using your **secret key**. Since secret keys can't be used in frontend code, you need a backend endpoint.

## ✅ Solution
Create a simple backend API endpoint that creates Kora Pay payment links.

---

## Option 1: Simple Node.js Backend (Quick Setup)

### Step 1: Install Dependencies
```bash
npm install express axios cors dotenv
```

### Step 2: Create Backend File
Create `backend/kora-payment-api.js` (already created for you)

### Step 3: Create `.env` file in backend folder
```env
KORA_SECRET_KEY=sk_live_your_secret_key_here
PORT=3001
```

### Step 4: Run Backend
```bash
node backend/kora-payment-api.js
```

### Step 5: Update Frontend
Update `src/services/paymentService.js` to call your backend endpoint instead of Kora Pay directly.

---

## Option 2: Vercel Serverless Function (Recommended)

### Step 1: Create API Route
Create `api/create-kora-payment.js`:

```javascript
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { amount, email, reference, callback_url, metadata } = req.body;

  try {
    const response = await fetch('https://api.korapay.com/merchant/api/v1/charges/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.KORA_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount,
        currency: 'NGN',
        reference: reference,
        customer: { email, name: metadata?.teamName || 'Customer' },
        callback_url: callback_url,
        metadata: metadata || {},
      }),
    });

    const data = await response.json();
    
    if (data.data && data.data.checkout_url) {
      return res.status(200).json({
        success: true,
        checkout_url: data.data.checkout_url,
      });
    }
    
    return res.status(500).json({ success: false, message: 'Failed to create payment link' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
```

### Step 2: Add Secret Key to Vercel
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add: `KORA_SECRET_KEY` = `sk_live_your_secret_key_here`
3. **Important:** Only add to Production/Preview, NOT to frontend environment

### Step 3: Update Frontend
Update payment service to call `/api/create-kora-payment` instead of Kora Pay directly.

---

## Option 3: Netlify Functions

Similar to Vercel, create a serverless function in `netlify/functions/create-kora-payment.js`

---

## Update Frontend Code

Once you have the backend endpoint, update `src/services/paymentService.js`:

```javascript
export async function initializeKoraPayment(config) {
  const amount = config.amount / 100; // Convert from kobo to Naira
  const callbackUrl = `${window.location.origin}${window.location.pathname}?payment=kora&ref=${config.reference}`;
  
  sessionStorage.setItem('kora_payment_reference', config.reference);
  
  try {
    // Call YOUR backend endpoint
    const response = await fetch('/api/create-kora-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: amount,
        email: config.email,
        reference: config.reference,
        callback_url: callbackUrl,
        metadata: config.metadata,
      }),
    });

    const data = await response.json();
    
    if (data.success && data.checkout_url) {
      window.location.href = data.checkout_url;
    } else {
      throw new Error(data.message || 'Failed to create payment link');
    }
  } catch (error) {
    console.error('Payment initialization error:', error);
    throw error;
  }
}
```

---

## Quick Test

1. Set up backend endpoint
2. Test with Postman/curl:
```bash
curl -X POST http://localhost:3001/api/create-kora-payment \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100000,
    "email": "test@example.com",
    "reference": "TEST-001",
    "callback_url": "https://yoursite.com/register?payment=kora&ref=TEST-001",
    "metadata": {"teamName": "Test Team"}
  }'
```

3. Should return a `checkout_url` that you can open in browser

---

## Which Option to Choose?

- **Option 1 (Node.js)**: Good for local development
- **Option 2 (Vercel Functions)**: Best for production (same platform as your frontend)
- **Option 3 (Netlify)**: If you're using Netlify

**Recommendation:** Use **Option 2 (Vercel Functions)** since your frontend is already on Vercel.

---

## Next Steps

1. Choose an option above
2. Set up the backend endpoint
3. Update frontend code to use the endpoint
4. Test payment flow
5. Deploy to production

