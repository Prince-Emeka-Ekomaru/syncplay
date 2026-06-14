/**
 * setup_storage.js
 * Creates the required Supabase Storage buckets for the app.
 * 
 * Run once: node setup_storage.js
 * Requires your service role key (get from Supabase Dashboard → Settings → API)
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://yzoqnqubnwoijrwtdroj.supabase.co';

// Paste your service_role key here (Dashboard → Settings → API → service_role)
const SERVICE_ROLE_KEY = process.argv[2] || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SERVICE_ROLE_KEY) {
  console.error('');
  console.error('❌  Missing service role key.');
  console.error('');
  console.error('Usage:');
  console.error('  node setup_storage.js YOUR_SERVICE_ROLE_KEY');
  console.error('');
  console.error('Get it from:');
  console.error('  https://supabase.com/dashboard/project/yzoqnqubnwoijrwtdroj/settings/api');
  console.error('  → "service_role" under Project API keys');
  console.error('');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const BUCKETS = [
  {
    name: 'player-photos',
    public: true,
    fileSizeLimit: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  },
  {
    name: 'news-banners',
    public: true,
    fileSizeLimit: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
];

async function setupBuckets() {
  console.log('🪣  Setting up Supabase Storage buckets...\n');

  for (const bucket of BUCKETS) {
    process.stdout.write(`  Creating bucket "${bucket.name}"... `);

    // Check if bucket already exists
    const { data: existing } = await supabase.storage.getBucket(bucket.name);

    if (existing) {
      console.log('✅  Already exists, skipping.');
      continue;
    }

    const { error } = await supabase.storage.createBucket(bucket.name, {
      public: bucket.public,
      fileSizeLimit: bucket.fileSizeLimit,
      allowedMimeTypes: bucket.allowedMimeTypes,
    });

    if (error) {
      console.log(`❌  Failed: ${error.message}`);
    } else {
      console.log('✅  Created!');
    }
  }

  console.log('\n✅  Done! Your storage buckets are ready.');
  console.log('   Players can now upload photos on the registration page.');
}

setupBuckets().catch(console.error);
