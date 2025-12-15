// Price Management Utility
// Stores and retrieves tournament entry fee

const PRICE_STORAGE_KEY = 'syncplay_entry_fee';
const DEFAULT_PRICE = 5000000; // 50,000 Naira in kobo

/**
 * Get the current entry fee in kobo
 * @returns {number} Entry fee in kobo
 */
export function getEntryFee() {
  try {
    const saved = localStorage.getItem(PRICE_STORAGE_KEY);
    if (saved) {
      const price = parseInt(saved, 10);
      return isNaN(price) ? DEFAULT_PRICE : price;
    }
  } catch (error) {
    console.error('Error loading entry fee:', error);
  }
  return DEFAULT_PRICE;
}

/**
 * Set the entry fee
 * @param {number} priceInNaira - Price in Naira (will be converted to kobo)
 * @returns {boolean} Success status
 */
export function setEntryFee(priceInNaira) {
  try {
    const priceInKobo = Math.round(priceInNaira * 100);
    if (priceInKobo <= 0) {
      console.error('Invalid price: must be greater than 0');
      return false;
    }
    localStorage.setItem(PRICE_STORAGE_KEY, priceInKobo.toString());
    return true;
  } catch (error) {
    console.error('Error saving entry fee:', error);
    return false;
  }
}

/**
 * Get the current entry fee in Naira (for display)
 * @returns {number} Entry fee in Naira
 */
export function getEntryFeeInNaira() {
  return getEntryFee() / 100;
}

/**
 * Format price for display
 * @param {number} priceInKobo - Price in kobo (optional, uses current price if not provided)
 * @returns {string} Formatted price string
 */
export function formatPrice(priceInKobo = null) {
  const price = priceInKobo || getEntryFee();
  return `₦${(price / 100).toLocaleString()}`;
}

