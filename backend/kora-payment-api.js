/**
 * Kora Pay Backend API Endpoint
 * 
 * This is a simple Node.js/Express endpoint to create Kora Pay payment links
 * 
 * Setup:
 * 1. Install dependencies: npm install express axios cors dotenv
 * 2. Create .env file with: KORA_SECRET_KEY=sk_live_your_secret_key_here
 * 3. Run: node backend/kora-payment-api.js
 * 
 * Or deploy to Vercel/Netlify as a serverless function
 */

const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Create Kora Pay payment link
app.post('/api/create-kora-payment', async (req, res) => {
  try {
    const { amount, email, reference, callback_url, metadata } = req.body;

    if (!amount || !email || !reference || !callback_url) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: amount, email, reference, callback_url'
      });
    }

    const response = await axios.post(
      'https://api.korapay.com/merchant/api/v1/charges/initialize',
      {
        amount: amount, // Amount in Naira (not kobo)
        currency: 'NGN',
        reference: reference,
        customer: {
          email: email,
          name: metadata?.teamName || 'Customer',
        },
        callback_url: callback_url,
        metadata: metadata || {},
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.KORA_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data && response.data.data && response.data.data.checkout_url) {
      res.json({
        success: true,
        checkout_url: response.data.data.checkout_url,
        reference: response.data.data.reference,
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to create payment link',
        error: response.data,
      });
    }
  } catch (error) {
    console.error('Kora Pay API Error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: error.response?.data?.message || 'Failed to create payment link',
      error: error.response?.data || error.message,
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Kora Pay API server running on port ${PORT}`);
});

