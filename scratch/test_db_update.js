const { createClient } = require('/Users/mac/Documents/GitHub/syncplay/node_modules/@supabase/supabase-js');

const supabaseUrl = 'https://yzoqnqubnwoijrwtdroj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6b3FucXVibndvaWpyd3Rkcm9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMzAxNjYsImV4cCI6MjA3NjkwNjE2Nn0.6D9GhIhDjk8v5SZ0JanKGmALoE9NISUqwS0y2SUCCyU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function dumpAllData() {
  console.log('--- Fetching Complete Registrations ---');
  const { data: regs, error: rError } = await supabase
    .from('registrations')
    .select('*')
    .eq('payment_status', 'completed');

  if (rError) {
    console.error('Error fetching registrations:', rError);
  } else {
    regs.forEach((r, idx) => {
      console.log(`\n[${idx+1}] Team: ${r.team_name}`);
      console.log(`   Player 1: ${r.player1_name} | Tag: ${r.player1_gamer_tag} | Email: ${r.player1_email} | Platform: ${r.player1_platform}`);
      console.log(`   Player 2: ${r.player2_name} | Tag: ${r.player2_gamer_tag} | Email: ${r.player2_email} | Platform: ${r.player2_platform}`);
    });
  }
}

dumpAllData();
