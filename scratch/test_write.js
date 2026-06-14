const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yzoqnqubnwoijrwtdroj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6b3FucXVibndvaWpyd3Rkcm9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMzAxNjYsImV4cCI6MjA3NjkwNjE2Nn0.6D9GhIhDjk8v5SZ0JanKGmALoE9NISUqwS0y2SUCCyU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testWrite() {
  console.log('Testing write using anon key (unauthenticated)...');
  try {
    const { data, error } = await supabase
      .from('player_ratings')
      .upsert({
        gamer_tag: 'TestPlayer123',
        attack: 75,
        defense: 75,
        passing: 75,
        consistency: 75,
        clutch: 75,
        mp: 1,
        wins: 1,
        draws: 0,
        losses: 0,
        goals: 2,
        gd: 2,
        points: 3,
        updated_at: new Date().toISOString()
      }, { onConflict: 'gamer_tag' });

    if (error) {
      console.error('Write failed:', error);
    } else {
      console.log('Write succeeded:', data);
    }
  } catch (err) {
    console.error('Exception during write:', err);
  }
}

testWrite();
