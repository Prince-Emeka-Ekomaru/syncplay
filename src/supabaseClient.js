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

// Helper function to get registration count
export async function getRegistrationCount() {
  try {
    const { count, error } = await supabase
      .from('registrations')
      .select('*', { count: 'exact', head: true })
      .eq('payment_status', 'completed');

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
export async function isRegistrationFull() {
  const count = await getRegistrationCount();
  return count >= 32;
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
          player2_name: formData.player2Name,
          player2_email: formData.player2Email,
          player2_phone: formData.player2Phone,
          player2_gamer_tag: formData.player2GamerTag,
          player2_platform: formData.player2Platform,
          tournament_id: '2v2-nov-2025',
          registration_source: 'website'
        }
      ])
      .select();

    if (error) {
      console.error('Error saving registration:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        paymentReference: paymentReference
      });
      throw error;
    }

    console.log('Registration saved successfully:', data);
    return data;
  } catch (error) {
    console.error('Save registration error:', error);
    console.error('Full error object:', error);
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

