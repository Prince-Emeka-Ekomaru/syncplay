/**
 * invite_admin.js
 * 
 * Run this ONCE to invite info@syncplay.co as an admin.
 * They'll receive a password setup email from Supabase.
 * 
 * HOW TO GET YOUR SERVICE ROLE KEY:
 * 1. Go to https://supabase.com/dashboard/project/yzoqnqubnwoijrwtdroj/settings/api
 * 2. Copy the "service_role" key (NOT the anon key)
 * 3. Paste it below where it says YOUR_SERVICE_ROLE_KEY_HERE
 * 
 * Then run:  node invite_admin.js
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://yzoqnqubnwoijrwtdroj.supabase.co';
const SERVICE_ROLE_KEY = 'YOUR_SERVICE_ROLE_KEY_HERE'; // ← paste here

const ADMIN_EMAIL = 'info@syncplay.co';
const REDIRECT_URL = 'http://localhost:3000/admin/registrations'; // change to your live URL when deploying

async function inviteAdmin() {
  if (SERVICE_ROLE_KEY === 'YOUR_SERVICE_ROLE_KEY_HERE') {
    console.error('❌ Please paste your Supabase service role key into this script first.');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  console.log(`📧 Inviting ${ADMIN_EMAIL} as admin...`);

  const { data, error } = await supabase.auth.admin.inviteUserByEmail(ADMIN_EMAIL, {
    redirectTo: REDIRECT_URL,
    data: {
      is_admin: true,
      username: 'Syncplay Admin',
    }
  });

  if (error) {
    console.error('❌ Error:', error.message);

    // If user already exists, send a password reset instead
    if (error.message.includes('already been registered') || error.status === 422) {
      console.log('ℹ️  User already exists. Sending password reset email instead...');
      const { error: resetError } = await supabase.auth.admin.generateLink({
        type: 'recovery',
        email: ADMIN_EMAIL,
        options: { redirectTo: REDIRECT_URL }
      });

      if (resetError) {
        console.error('❌ Reset also failed:', resetError.message);
      } else {
        console.log('✅ Password reset email sent to', ADMIN_EMAIL);
      }
    }
    return;
  }

  console.log('✅ Invite sent successfully!');
  console.log('   Email:', ADMIN_EMAIL);
  console.log('   User ID:', data.user?.id);
  console.log('   They will receive an email to set up their password.');
  console.log('   Once done, they can log in at /admin/registrations');
}

inviteAdmin();
