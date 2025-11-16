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
    // Kora Pay might expect amount in kobo (smallest currency unit)
    // Try both formats: first try kobo, if that fails, try Naira
    // Amount comes in as Naira, convert to kobo (multiply by 100)
    const amountInKobo = Math.round(parseFloat(amount) * 100);
    const amountInNaira = parseFloat(amount).toFixed(2);
    
    // Prepare request body - Try with kobo first (most payment gateways use smallest unit)
    const requestBody = {
      amount: amountInKobo.toString(), // Amount in kobo (100,000 Naira = 10,000,000 kobo)
      currency: 'NGN',
      reference: reference,
      customer: {
        email: email,
        name: metadata?.teamName || 'Customer',
      },
      callback_url: callback_url,
    };

    // Add metadata if provided
    if (metadata && Object.keys(metadata).length > 0) {
      requestBody.metadata = metadata;
    }

    console.log('Kora Pay API Request:', {
      url: 'https://api.korapay.com/merchant/api/v1/charges/initialize',
      body: requestBody,
    });

    // Call Kora Pay API to create payment link
    const response = await fetch('https://api.korapay.com/merchant/api/v1/charges/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.KORA_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    console.log('Kora Pay API Response:', {
      status: response.status,
      statusText: response.statusText,
      data: data,
    });

    // Check if payment link was created successfully
    if (response.ok && data.data && data.data.checkout_url) {
      return res.status(200).json({
        success: true,
        checkout_url: data.data.checkout_url,
        reference: data.data.reference,
      });
    }

    // Handle API errors - return detailed error for debugging
    console.error('Kora Pay API Error:', {
      status: response.status,
      statusText: response.statusText,
      data: data,
      requestBody: requestBody,
    });
    
    // Extract error message from Kora Pay response
    const errorMessage = data.message || 
                        data.error?.message || 
                        data.data?.message ||
                        'Failed to create payment link';
    
    return res.status(response.status || 500).json({
      success: false,
      message: errorMessage,
      error: data,
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

