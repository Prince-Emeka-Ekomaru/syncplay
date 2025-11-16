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
 * Kora Pay uses a redirect-based checkout flow
 */
export function initializeKoraPayment(config) {
  return new Promise((resolve, reject) => {
    // Kora Pay redirects to their checkout page
    // We'll construct the checkout URL with required parameters
    const amount = config.amount / 100; // Convert from kobo to Naira
    
    // Kora Pay checkout URL format
    // Note: In production, you should create payment links via Kora API
    // For now, we use the redirect URL pattern
    const checkoutParams = new URLSearchParams({
      public_key: config.publicKey,
      amount: amount.toString(),
      currency: 'NGN',
      reference: config.reference,
      email: config.email,
      callback_url: `${window.location.origin}${window.location.pathname}?payment=kora&ref=${config.reference}`,
      metadata: JSON.stringify({
        teamName: config.metadata?.teamName,
        player1Name: config.metadata?.player1Name,
        player2Name: config.metadata?.player2Name,
      }),
    });

    const koraCheckoutUrl = `https://checkout.korapay.com/?${checkoutParams.toString()}`;
    
    // Store payment reference for verification after redirect
    sessionStorage.setItem('kora_payment_reference', config.reference);
    sessionStorage.setItem('kora_payment_redirect', 'true');
    
    // Redirect to Kora Pay checkout
    window.location.href = koraCheckoutUrl;
    
    // Note: This will redirect away from the page
    // The callback will be handled when user returns via URL params
    // We'll check for payment status in the Register component on mount
  });
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

