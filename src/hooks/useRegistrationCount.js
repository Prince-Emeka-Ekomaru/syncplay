import { useState, useEffect, useCallback } from 'react';
import { getRegistrationCount } from '../supabaseClient';

/**
 * Custom hook to fetch and track registration count
 * @param {boolean} realtime - Whether to poll for updates (default: false)
 * @param {number} interval - Polling interval in ms (default: 30000 = 30 seconds)
 * @param {string} tournamentId - Tournament ID to filter by (default: '2v2-may-2026')
 */
export const useRegistrationCount = (realtime = false, interval = 30000, tournamentId = '2v2-may-2026') => {
  const [count, setCount] = useState(0);
  const [slotsRemaining, setSlotsRemaining] = useState(12);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const MAX_SLOTS = 12;

  const fetchCount = useCallback(async () => {
    try {
      const currentCount = await getRegistrationCount(tournamentId);
      setCount(currentCount);
      setSlotsRemaining(Math.max(0, MAX_SLOTS - currentCount));
      setError(null);
    } catch (err) {
      console.error('Error fetching registration count:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [tournamentId]);

  useEffect(() => {
    // Initial fetch
    fetchCount();

    // Set up polling if realtime is enabled
    if (realtime) {
      const intervalId = setInterval(fetchCount, interval);
      return () => clearInterval(intervalId);
    }
  }, [realtime, interval, fetchCount]);

  return {
    count,
    slotsRemaining,
    totalSlots: MAX_SLOTS,
    isFull: count >= MAX_SLOTS,
    loading,
    error,
    refresh: fetchCount
  };
};

