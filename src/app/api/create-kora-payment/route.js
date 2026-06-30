/**
 * POST /api/create-kora-payment
 * Server-side handler to create a Kora Pay checkout link.
 * Uses the secret key (server-only) to call the Kora API.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { amount, email, reference, callback_url, metadata } = body;

    const secretKey = process.env.KORA_SECRET_KEY;

    if (!secretKey || secretKey.includes('YOUR_SECRET_KEY')) {
      console.error('KORA_SECRET_KEY not configured');
      return Response.json(
        { success: false, message: 'Kora Pay secret key is not configured on the server.' },
        { status: 500 }
      );
    }

    if (!amount || !email || !reference) {
      return Response.json(
        { success: false, message: 'Missing required fields: amount, email, reference.' },
        { status: 400 }
      );
    }

    // Clean up metadata to remove null, undefined, or empty string values,
    // which cause Korapay validation errors (e.g. metadata.player2Name is not allowed to be empty)
    const cleanMetadata = {};
    if (metadata && typeof metadata === 'object') {
      for (const [key, val] of Object.entries(metadata)) {
        if (val !== null && val !== undefined && val !== '') {
          cleanMetadata[key] = val;
        }
      }
    }
    cleanMetadata.source = 'syncplay-registration';

    const requestBody = {
      reference,
      amount,         // in Naira — converted from kobo by paymentService.js before reaching here
      currency: 'NGN',
      customer: {
        email,
        name: cleanMetadata.teamName || cleanMetadata.player1Name || 'Syncplay Player',
      },
      notification_url: callback_url,
      redirect_url: callback_url,
      channels: ['card', 'bank_transfer', 'pay_with_bank'],
      metadata: cleanMetadata,
    };

    console.log('Calling Kora Pay API with:', JSON.stringify(requestBody, null, 2));

    // Call Kora Pay Initialize API (correct endpoint for redirect-based checkout)
    const koraResponse = await fetch('https://api.korapay.com/merchant/api/v1/charges/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${secretKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    const koraData = await koraResponse.json();

    console.log('Kora Pay API response [HTTP', koraResponse.status, ']:', JSON.stringify(koraData, null, 2));

    // Kora Pay initialize response: { status: true, data: { checkout_url: '...', reference: '...' } }
    const checkoutUrl = koraData.data?.checkout_url || koraData.data?.link;
    if (koraData.status === true && checkoutUrl) {
      return Response.json({
        success: true,
        checkout_url: checkoutUrl,
        reference: koraData.data?.reference || reference,
      });
    }

    // Extract meaningful error from Kora's response
    const errorMessage =
      koraData.message ||
      koraData.error ||
      koraData.data?.message ||
      `Kora Pay error (HTTP ${koraResponse.status})`;

    console.error('Kora Pay returned error:', errorMessage);

    return Response.json(
      { success: false, message: errorMessage, koraResponse: koraData },
      { status: koraResponse.status || 400 }
    );

  } catch (err) {
    console.error('Error in /api/create-kora-payment:', err);
    return Response.json(
      { success: false, message: err.message || 'Internal server error.' },
      { status: 500 }
    );
  }
}
