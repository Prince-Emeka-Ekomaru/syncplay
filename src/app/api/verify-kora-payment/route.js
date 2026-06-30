/**
 * POST /api/verify-kora-payment
 * Server-side handler to verify a Kora Pay transaction status.
 */
export async function POST(request) {
  try {
    const { reference } = await request.json();
    const secretKey = process.env.KORA_SECRET_KEY;

    if (!secretKey || secretKey.includes('YOUR_SECRET_KEY')) {
      console.error('KORA_SECRET_KEY not configured');
      return Response.json(
        { success: false, message: 'Kora Pay secret key is not configured on the server.' },
        { status: 500 }
      );
    }

    if (!reference) {
      return Response.json(
        { success: false, message: 'Missing transaction reference.' },
        { status: 400 }
      );
    }

    console.log(`Verifying Kora Pay transaction reference: ${reference}`);

    // Call Kora Pay verify charge API
    const response = await fetch(`https://api.korapay.com/merchant/api/v1/charges/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    console.log(`Kora Pay verification response [HTTP ${response.status}]:`, JSON.stringify(result, null, 2));

    // Korapay status must be true and transaction status must be 'success'
    if (response.status === 200 && result.status === true && result.data?.status === 'success') {
      return Response.json({
        success: true,
        message: 'Payment verified successfully.'
      });
    }

    return Response.json(
      { 
        success: false, 
        message: result.message || 'Payment has not been completed.', 
        koraStatus: result.data?.status || 'failed' 
      },
      { status: 400 }
    );

  } catch (err) {
    console.error('Error verifying payment:', err);
    return Response.json(
      { success: false, message: 'Internal server error during verification.' },
      { status: 500 }
    );
  }
}
