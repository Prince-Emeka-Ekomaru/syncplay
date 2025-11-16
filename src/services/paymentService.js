/**
 * Payment Service Abstraction Layer
 * Supports Kora Pay payment gateway
 */

// Payment Gateway Configuration
export const PAYMENT_GATEWAYS = {
  KORA: 'kora',
};

// Default payment gateway (can be overridden by admin settings)
let activeGateway = PAYMENT_GATEWAYS.KORA;

// Gateway availability (can be controlled by admin)
let availableGateways = {
  [PAYMENT_GATEWAYS.KORA]: true,
};

/**
 * Initialize payment gateway from Supabase settings
 */
export async function initializePaymentGateways(supabase) {
  try {
    const { data, error } = await supabase
      .from('payment_settings')
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned, which is fine for first setup
      console.warn('Payment settings not found, using defaults:', error);
      return;
    }

    if (data) {
      activeGateway = data.active_gateway || PAYMENT_GATEWAYS.KORA;
      availableGateways = {
        [PAYMENT_GATEWAYS.KORA]: data.kora_enabled !== false,
      };
    }
  } catch (error) {
    console.warn('Error loading payment settings, using defaults:', error);
  }
}

/**
 * Set active payment gateway
 */
export function setActiveGateway(gateway) {
  if (availableGateways[gateway]) {
    activeGateway = gateway;
  } else {
    console.warn(`Gateway ${gateway} is not available`);
  }
}

/**
 * Get active payment gateway
 */
export function getActiveGateway() {
  return activeGateway;
}

/**
 * Get available payment gateways
 */
export function getAvailableGateways() {
  return Object.keys(availableGateways).filter(
    (gateway) => availableGateways[gateway]
  );
}

/**
 * Check if a gateway is available
 */
export function isGatewayAvailable(gateway) {
  return availableGateways[gateway] === true;
}

/**
 * Kora Pay Payment Handler
 * Creates payment link via backend API (which uses secret key)
 */
export async function initializeKoraPayment(config) {
  const amount = config.amount / 100; // Convert from kobo to Naira
  const callbackUrl = `${window.location.origin}${window.location.pathname}?payment=kora&ref=${config.reference}`;
  
  // Store payment reference for verification after redirect
  sessionStorage.setItem('kora_payment_reference', config.reference);
  sessionStorage.setItem('kora_payment_redirect', 'true');
  
  try {
    // Call backend API to create payment link
    const response = await fetch('/api/create-kora-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount,
        email: config.email,
        reference: config.reference,
        callback_url: callbackUrl,
        metadata: {
          teamName: config.metadata?.teamName,
          player1Name: config.metadata?.player1Name,
          player2Name: config.metadata?.player2Name,
        },
      }),
    });

    const data = await response.json();

    console.log('Backend API Response:', {
      status: response.status,
      data: data,
    });

    if (data.success && data.checkout_url) {
      // Redirect to Kora Pay checkout
      window.location.href = data.checkout_url;
    } else {
      // Show more detailed error
      const errorMsg = data.message || 
                      data.error?.message || 
                      data.koraResponse?.message ||
                      'Failed to create payment link';
      
      console.error('Payment link creation failed:', {
        message: errorMsg,
        fullResponse: data,
      });
      
      throw new Error(errorMsg);
    }
  } catch (error) {
    console.error('Kora Pay payment initialization error:', error);
    throw new Error(error.message || 'Failed to initialize payment. Please try again.');
  }
}


/**
 * Main payment initialization function
 */
export async function initializePayment(paymentConfig, selectedGateway = null) {
  const gateway = selectedGateway || activeGateway;

  // Validate gateway is available
  if (!isGatewayAvailable(gateway)) {
    throw new Error(`Payment gateway ${gateway} is not available`);
  }

  // Prepare payment config
  const config = {
    reference: paymentConfig.reference || `SP-${Date.now()}`,
    email: paymentConfig.email,
    amount: paymentConfig.amount, // Amount in kobo
    publicKey: paymentConfig.publicKey,
    metadata: paymentConfig.metadata || {},
  };

  // Route to appropriate gateway
  switch (gateway) {
    case PAYMENT_GATEWAYS.KORA:
      return initializeKoraPayment(config);

    default:
      throw new Error(`Unsupported payment gateway: ${gateway}`);
  }
}

/**
 * Get payment gateway display name
 */
export function getGatewayDisplayName(gateway) {
  const names = {
    [PAYMENT_GATEWAYS.KORA]: 'Kora Pay',
  };
  return names[gateway] || gateway;
}

/**
 * Get payment gateway icon/logo
 */
export function getGatewayIcon(gateway) {
  const icons = {
    [PAYMENT_GATEWAYS.KORA]: 'fas fa-credit-card',
  };
  return icons[gateway] || 'fas fa-money-bill-wave';
}

