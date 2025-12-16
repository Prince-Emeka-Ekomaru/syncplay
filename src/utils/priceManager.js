// Price Management Utility
// Stores and retrieves tournament entry fee from Supabase

import { supabase } from '../supabaseClient';

const PRICE_STORAGE_KEY = 'syncplay_entry_fee';
const DEFAULT_PRICE = 2000000; // 20,000 Naira in kobo
let cachedPrice = null;
let priceLoadPromise = null;

/**
 * Get the current entry fee in kobo from Supabase
 * Falls back to localStorage cache if Supabase is unavailable
 * @returns {Promise<number>} Entry fee in kobo
 */
export async function getEntryFee() {
  // Return cached price if available
  if (cachedPrice !== null) {
    return cachedPrice;
  }

  // If already loading, return the same promise
  if (priceLoadPromise) {
    return priceLoadPromise;
  }

  // Load from Supabase
  priceLoadPromise = (async () => {
    try {
      const { data, error } = await supabase
        .from('payment_settings')
        .select('entry_fee')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.warn('Error loading entry fee from Supabase:', error);
        // Fallback to localStorage
        return getEntryFeeFromLocalStorage();
      }

      if (data && data.entry_fee) {
        const price = parseInt(data.entry_fee, 10);
        if (!isNaN(price) && price > 0) {
          cachedPrice = price;
          // Also cache in localStorage as backup
          localStorage.setItem(PRICE_STORAGE_KEY, price.toString());
          return price;
        }
      }

      // Fallback to localStorage
      return getEntryFeeFromLocalStorage();
    } catch (error) {
      console.error('Error loading entry fee:', error);
      return getEntryFeeFromLocalStorage();
    } finally {
      priceLoadPromise = null;
    }
  })();

  return priceLoadPromise;
}

/**
 * Get entry fee from localStorage (fallback)
 * @returns {number} Entry fee in kobo
 */
function getEntryFeeFromLocalStorage() {
  try {
    const saved = localStorage.getItem(PRICE_STORAGE_KEY);
    if (saved) {
      const price = parseInt(saved, 10);
      if (!isNaN(price) && price > 0) {
        cachedPrice = price;
        return price;
      }
    }
  } catch (error) {
    console.error('Error loading entry fee from localStorage:', error);
  }
  cachedPrice = DEFAULT_PRICE;
  return DEFAULT_PRICE;
}

/**
 * Set the entry fee in Supabase
 * @param {number} priceInNaira - Price in Naira (will be converted to kobo)
 * @returns {Promise<boolean>} Success status
 */
export async function setEntryFee(priceInNaira) {
  try {
    const priceInKobo = Math.round(priceInNaira * 100);
    if (priceInKobo <= 0) {
      console.error('Invalid price: must be greater than 0');
      return false;
    }

    // Update Supabase
    const { error } = await supabase
      .from('payment_settings')
      .update({ entry_fee: priceInKobo })
      .eq('id', '00000000-0000-0000-0000-000000000001'); // Default settings ID

    if (error) {
      console.error('Error saving entry fee to Supabase:', error);
      // Fallback to localStorage
      localStorage.setItem(PRICE_STORAGE_KEY, priceInKobo.toString());
      cachedPrice = priceInKobo;
      return true; // Still return true since we saved to localStorage
    }

    // Update cache
    cachedPrice = priceInKobo;
    localStorage.setItem(PRICE_STORAGE_KEY, priceInKobo.toString());
    return true;
  } catch (error) {
    console.error('Error saving entry fee:', error);
    // Fallback to localStorage
    try {
      const priceInKobo = Math.round(priceInNaira * 100);
      localStorage.setItem(PRICE_STORAGE_KEY, priceInKobo.toString());
      cachedPrice = priceInKobo;
      return true;
    } catch (localError) {
      console.error('Error saving to localStorage:', localError);
      return false;
    }
  }
}

/**
 * Clear the cached price (useful after updates)
 */
export function clearPriceCache() {
  cachedPrice = null;
  priceLoadPromise = null;
}

/**
 * Get the current entry fee in Naira (for display)
 * Synchronous version that uses cache
 * @returns {number} Entry fee in Naira
 */
export function getEntryFeeInNaira() {
  const price = cachedPrice || getEntryFeeFromLocalStorage();
  return price / 100;
}

/**
 * Get the current entry fee in Naira (async version)
 * @returns {Promise<number>} Entry fee in Naira
 */
export async function getEntryFeeInNairaAsync() {
  const price = await getEntryFee();
  return price / 100;
}

/**
 * Format price for display
 * @param {number} priceInKobo - Price in kobo (optional, uses current price if not provided)
 * @returns {string} Formatted price string
 */
export function formatPrice(priceInKobo = null) {
  const price = priceInKobo || cachedPrice || getEntryFeeFromLocalStorage();
  return `₦${(price / 100).toLocaleString()}`;
}

