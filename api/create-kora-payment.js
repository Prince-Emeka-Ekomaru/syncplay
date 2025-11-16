/**
 * Vercel Serverless Function for Kora Pay Payment Link Creation
 * 
 * This creates a payment link using Kora Pay API with your secret key
 * 
 * Environment Variables Required in Vercel:
 * - KORA_SECRET_KEY=sk_live_your_secret_key_here
 */

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed. Use POST.' 
    });
  }

  // Get request body
  const { amount, email, reference, callback_url, metadata } = req.body;

  // Validate required fields
  if (!amount || !email || !reference || !callback_url) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: amount, email, reference, callback_url'
    });
  }

  // Check if secret key is configured
  if (!process.env.KORA_SECRET_KEY) {
    console.error('KORA_SECRET_KEY not configured');
    console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('KORA')));
    return res.status(500).json({
      success: false,
      message: 'Server configuration error. KORA_SECRET_KEY not found. Please check Vercel environment variables.',
      debug: process.env.NODE_ENV || 'unknown'
    });
  }

  try {
    // Kora Pay API format - try different amount formats
    // Amount comes in as Naira from frontend (100000 for 100k Naira)
    // Kora Pay might expect: number in Naira, or string in Naira, or kobo
    
    // Try format 1: Number in Naira (most likely)
    const amountValue = parseFloat(amount);
    
    // Use Kora Pay Payment Links API (simpler, no callback_url registration needed)
    // Payment links are shareable URLs that don't require callback_url
    const requestBody = {
      amount: amountValue, // Amount in Naira (100000 for 100k Naira)
      currency: 'NGN',
      reference: reference,
      customer: {
        email: email,
        name: metadata?.teamName || 'Customer',
      },
      // Payment links don't require callback_url - they redirect after payment
      // But include it if the API accepts it for redirect after payment
      redirect_url: callback_url, // Where to redirect after payment
    };

    // Add metadata if provided
    if (metadata && Object.keys(metadata).length > 0) {
      requestBody.metadata = metadata;
    }

    // Try Payment Links API first (simpler, no callback_url issues)
    // If that doesn't work, fall back to charges/initialize
    const paymentLinksUrl = 'https://api.korapay.com/merchant/api/v1/payment-links';
    const chargesUrl = 'https://api.korapay.com/merchant/api/v1/charges/initialize';
    
    console.log('Kora Pay API Request (Payment Links):', {
      url: paymentLinksUrl,
      body: requestBody,
    });

    // Try Payment Links API first
    let response = await fetch(paymentLinksUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.KORA_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    let data = await response.json();

    // If Payment Links API doesn't exist (404) or fails, try charges/initialize
    if (!response.ok && (response.status === 404 || response.status === 400)) {
      console.log('Payment Links API failed, trying charges/initialize...');
      console.log('Kora Pay API Request (Charges):', {
        url: chargesUrl,
        body: requestBody,
      });
      
      response = await fetch(chargesUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.KORA_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      data = await response.json();
    }

    console.log('Kora Pay API Response:', {
      status: response.status,
      statusText: response.statusText,
      data: data,
    });

    // Check if payment link was created successfully
    // Payment Links API might return different field names
    const paymentLink = data.data?.checkout_url || 
                       data.data?.link || 
                       data.data?.payment_link || 
                       data.data?.url ||
                       data.link ||
                       data.payment_link ||
                       data.url;

    if (response.ok && paymentLink) {
      return res.status(200).json({
        success: true,
        checkout_url: paymentLink,
        reference: data.data?.reference || data.reference || reference,
      });
    }

    // Handle API errors - return detailed error for debugging
    console.error('Kora Pay API Error:', {
      status: response.status,
      statusText: response.statusText,
      data: data,
      requestBody: requestBody,
    });
    
    // Log the detailed callback_url error if available
    if (data.data && data.data.callback_url) {
      console.error('Callback URL Error Details:', JSON.stringify(data.data.callback_url, null, 2));
      console.error('Full Error Data:', JSON.stringify(data.data, null, 2));
    }
    
    // Extract error message from Kora Pay response
    const errorMessage = data.message || 
                        data.error?.message || 
                        data.data?.message ||
                        'Failed to create payment link';
    
    // Include detailed error info
    const errorDetails = {
      message: errorMessage,
      validationErrors: data.data || {},
      callbackUrlError: data.data?.callback_url || null,
    };
    
    return res.status(response.status || 500).json({
      success: false,
      message: errorMessage,
      error: data,
      errorDetails: errorDetails, // More detailed error info
      koraResponse: data, // Include full response for debugging
    });

  } catch (error) {
    console.error('Kora Pay API Request Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create payment link',
      error: error.message,
    });
  }
}

