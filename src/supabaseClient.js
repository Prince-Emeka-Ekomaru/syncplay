import { createClient } from '@supabase/supabase-js';
import { getEntryFee } from './utils/priceManager';

// Supabase configuration
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!');
  console.log('Please check your .env file');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to get registration count for current tournament
export async function getRegistrationCount(tournamentId = '2v2-may-2026') {
  try {
    const { count, error } = await supabase
      .from('registrations')
      .select('*', { count: 'exact', head: true })
      .eq('payment_status', 'completed')
      .eq('tournament_id', tournamentId);

    if (error) {
      console.error('Error getting count:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Error:', error);
    return 0;
  }
}

// Helper function to check if registration is full
export async function isRegistrationFull(tournamentId = '2v2-may-2026') {
  const count = await getRegistrationCount(tournamentId);
  return count >= 12;
}

// Helper function to save registration
export async function saveRegistration(paymentReference, formData, paymentGateway = 'paystack', paymentAmount = null) {
  try {
    const amount = paymentAmount || await getEntryFee();
    
    const { data, error } = await supabase
      .from('registrations')
      .insert([
        {
          payment_reference: paymentReference,
          payment_status: 'completed',
          payment_amount: amount,
          payment_gateway: paymentGateway,
          team_name: formData.teamName,
          player1_name: formData.player1Name,
          player1_email: formData.player1Email,
          player1_phone: formData.player1Phone,
          player1_gamer_tag: formData.player1GamerTag,
          player1_platform: formData.player1Platform,
          player1_photo_url: formData.player1PhotoUrl || null,
          player2_name: formData.player2Name,
          player2_email: formData.player2Email,
          player2_phone: formData.player2Phone,
          player2_gamer_tag: formData.player2GamerTag,
          player2_platform: formData.player2Platform,
          player2_photo_url: formData.player2PhotoUrl || null,
          tournament_id: '2v2-may-2026',
          registration_source: 'website'
        }
      ])
      .select();

    if (error) {
      // Only log error details once, avoid duplicate logging
      const errorInfo = {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        paymentReference: paymentReference
      };
      console.error('Error saving registration:', errorInfo);
      throw error;
    }

    console.log('Registration saved successfully:', data);
    return data;
  } catch (error) {
    // Avoid duplicate error logging - the error was already logged above
    if (error.code) {
      // This is a Supabase error, already logged above
      throw error;
    }
    // This is a different error (network, etc.)
    console.error('Save registration error:', {
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
}

// Helper function to get all registrations (for admin)
export async function getAllRegistrations() {
  try {
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .eq('payment_status', 'completed')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching registrations:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Fetch error:', error);
    return [];
  }
}

