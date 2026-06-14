const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env file
const envPath = path.join(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([^#=]+)\s*=\s*(.*)$/);
  if (match) {
    const key = match[1].trim();
    let val = match[2].trim();
    // remove quotes if present
    if (val.startsWith('"') && val.endsWith('"')) val = val.substring(1, val.length - 1);
    if (val.startsWith("'") && val.endsWith("'")) val = val.substring(1, val.length - 1);
    env[key] = val;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || 'https://yzoqnqubnwoijrwtdroj.supabase.co';
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY not found in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false }
});

const newArticles = [
  {
    title: 'Syncplay Launches Interactive Community Hub & Real-time Chat',
    excerpt: 'Connect, coordinate, and chat with fellow eSports athletes in real-time. Learn how to use the new Syncplay Community Hub for direct messaging, group match-making, and tournament updates.',
    content: `<p>We are thrilled to officially launch the <strong>Syncplay eSports Community Hub</strong>! This interactive portal is designed to bring competitive gamers, team managers, and eSports fans together in a unified, real-time social platform.</p>
  
  <h3>Key Features of the Community Hub:</h3>
  <ul>
    <li><strong>Real-time Presence:</strong> See who is online in the community sidebar with dynamic status indicators showing their gamer tag and primary gaming platform.</li>
    <li><strong>Direct Messaging (DMs):</strong> Tap on any player's profile to open a secure, private 1v1 conversation. Coordinate practice schedules, matches, and team play.</li>
    <li><strong>Private Group Chats:</strong> Create custom private group channels for your squad or gaming circle. Group creators can invite members, leave rooms, or delete channels.</li>
    <li><strong>Auto-Sync Profile Info:</strong> When you register a community account, the system automatically scans tournament databases to match your registration details, gamer tag, and phone number instantly.</li>
  </ul>
  
  <p>To join the conversation, head over to the <a href="/community" style="color: #E63946; font-weight: bold; text-decoration: none;">Syncplay Community Portal</a>, log in or sign up, and start chatting with the community today!</p>`,
    image_url: '/fc-26-1024x639.jpg',
    category: 'announcements',
    author: 'syncplay Team',
    created_at: '2026-06-13T18:00:00+00:00',
    published: true
  },
  {
    title: 'Behind the Admin Panel: Syncplay Integrates Secure Role-Based Access Control (RBAC)',
    excerpt: 'Discover how our new secure administrative architecture bridges community logins with the admin control panel using Postgres RLS and user metadata.',
    content: `<p>Security and seamless access are crucial for managing an eSports community at scale. Today, we are pulling back the curtain on the new <strong>Syncplay Role-Based Access Control (RBAC)</strong> system, which bridges the gap between our frontend player community and backend administrative workflows.</p>
 
<h3>What is RBAC and How Does It Work?</h3>
<p>Historically, administrator panels were separated by distinct log-in credentials or random system-generated passwords. With our new RBAC architecture, we've integrated administrative roles directly into the <code>public.profiles</code> database table. When a user logs in with their standard syncplay account, the system automatically verifies their credentials and checks if the <code>is_admin</code> flag is set to <code>true</code>.</p>
 
<h3>Key Administrative Features:</h3>
<ul>
  <li><strong>Seamless SSO Entry:</strong> Authenticated administrators will notice a premium, glowing Admin Shield icon (<code>fa-shield-alt</code>) right next to their profile settings button in the community hub. One tap redirects them directly to the admin dashboard.</li>
  <li><strong>Secure Route Guards:</strong> Both client-side page transitions and server-side Supabase API requests are locked down. Any unauthorized access attempts will instantly redirect the user back to safety.</li>
  <li><strong>Unified Navbar & CMS Controls:</strong> We've resolved layout collisions so admins can seamlessly navigate between public-facing news pages and restricted admin areas. Admins can create, update, edit, and delete news posts directly from the browser!</li>
</ul>
 
<p>This integration is a massive step forward in security and operational efficiency. Admins can log in, audit tournament registrations, verify Paystack/Korapay payments, and publish fresh community news—all with a single, unified account.</p>`,
    image_url: '/tournament-media/photos/winners ss.png',
    category: 'announcements',
    author: 'syncplay Team',
    created_at: '2026-06-13T15:30:00+00:00',
    published: true
  },
  {
    title: 'Track Your Rivalry: Head-to-Head Team Comparison & Leaderboards',
    excerpt: 'Analyze your stats, track team placements, and compare your attributes side-by-side on our interactive SVG Radar Charts.',
    content: `<p>Competitive gaming is all about the statistics. To support players, scouts, and fans in analyzing competitive dynamics, Syncplay has introduced advanced analytics tools for the eSports community.</p>
  
  <h3>Syncplay Analytics Suite:</h3>
  <ul>
    <li><strong>Team Leaderboard:</strong> View the absolute rankings of all competing tournament teams. Click any team row to expand it and inspect individual player cards, including their primary platforms and gaming statistics.</li>
    <li><strong>Team-vs-Team Comparison:</strong> Select any two teams side-by-side to compare their overall match performance, group stage points, win rates, goals scored, and goals conceded.</li>
    <li><strong>SVG Radar Charts:</strong> Compare player skill attributes (Attack, Defense, Passing, Consistency, Clutch) plotted dynamically on an overlay radar polygon to visualize strengths and weaknesses.</li>
  </ul>
  
  <p>Explore your competitive rating on the <a href="/players" style="color: #E63946; font-weight: bold; text-decoration: none;">Leaderboard Portal</a> and settle scores in the <a href="/comparison" style="color: #E63946; font-weight: bold; text-decoration: none;">Team Comparison Center</a>!</p>`,
    image_url: '/tournament-media/photos/winners ss.png',
    category: 'announcements',
    author: 'syncplay Team',
    created_at: '2026-06-12T14:00:00+00:00',
    published: true
  },
  {
    title: 'Registration Live: ₦1,500,000 Prize Pool 2v2 Tournament on July 29th',
    excerpt: '32 teams. 64 players. One champion. Register your team today for the July 29th 2v2 Showdown at Twinwaters Rufus & Bee\'s, Lagos.',
    content: `<p>The countdown has officially begun for the highly anticipated <strong>Syncplay eSports Second Edition 2v2 Showdown</strong>! Mark your calendars for <strong>July 29, 2026</strong>, as 32 elite teams of two will gather at <strong>Rufus & Bee's (Twinwaters, Lekki, Lagos)</strong> to battle for supremacy and their share of the ₦1,500,000 cash prize pool.</p>
  
  <h3>Tournament Specifications:</h3>
  <ul>
    <li><strong>Format:</strong> 2v2 EA Sports FC 26. 32 Teams (64 Players total) split into round-robin groups, transitioning to home-and-away double-legged knockout phases and a single-match Grand Final.</li>
    <li><strong>Team Entry Fee:</strong> ₦50,000 per team.</li>
    <li><strong>Spectator Tickets:</strong> ₦5,000 per ticket (includes a pre-loaded Rufus & Bee's Buzz Card with gaming chips/credits).</li>
    <li><strong>Venue:</strong> Rufus & Bee's, Twinwaters Mall, Lekki Phase I, Lagos.</li>
  </ul>
  
  <p>Slots are strictly limited to 32 teams on a first-come, first-served basis. Secure your team's spot at the <a href="/register" style="color: #E63946; font-weight: bold; text-decoration: none;">Registration Page</a> or purchase spectator passes at the <a href="/spectator-register" style="color: #E63946; font-weight: bold; text-decoration: none;">Tickets Page</a>.</p>`,
    image_url: '/ea-sports-fc-26-xbox-one-xbox-series-x-s-microsoft-store-cover.jpg',
    category: 'announcements',
    author: 'syncplay Team',
    created_at: '2026-06-11T10:00:00+00:00',
    published: true
  },
  {
    title: 'Community Playbook: How Gamers are using Syncplay Chats to Form 2v2 Teams',
    excerpt: 'From complete strangers to championship contenders: read how players are utilizing the new chat lobbies to scout partners and coordinate tactics.',
    content: `<p>The launch of the Syncplay eSports Community Hub has completely transformed how local gamers prepare for tournaments. Instead of practicing in isolation or struggling to find reliable partners, players are now utilizing real-time chat lobbies to coordinate strategy and build winning squads.</p>

<h3>Scouting the Perfect Partner</h3>
<p>One of the coolest trends emerging in the community is the use of <strong>SVG Radar Charts</strong> combined with <strong>Direct Messaging (DMs)</strong>. Players are checking out the Leaderboards, analyzing individual skill profiles, and identifying complementary attributes:</p>
<ul>
  <li><strong>The Striker-Defender Match:</strong> An aggressive, high-attack player (e.g., 90+ Attack stat) searches for a partner with strong defensive ratings (e.g., 85+ Defense stat) to form a balanced 2v2 team.</li>
  <li><strong>Real-time Trial Games:</strong> Players use private group chats to set up casual online match lobbies in EA Sports FC 26, test their chemistry, and decide if they want to register together.</li>
  <li><strong>Tactical Coordination:</strong> Registered teams are using private, dedicated threads to coordinate setup styles, custom team formations, and gaming schedules ahead of the July 29th tournament at Rufus & Bee's.</li>
</ul>

<h3>Join the Action</h3>
<p>It has never been easier to get involved. By logging into the <a href="/community" style="color: #E63946; font-weight: bold; text-decoration: none;">Syncplay Community Portal</a>, your gamer profile is automatically linked to your tournament registration. If you're a solo player looking for a team, join the global lounge, make your pitch, and team up before slots sell out!</p>`,
    image_url: '/tournament-media/photos/welcome baji jr.png',
    category: 'announcements',
    author: 'syncplay Team',
    created_at: '2026-06-13T20:00:00+00:00',
    published: true
  }
];

async function seedNews() {
  console.log('Inserting news articles with service role key...');
  
  // Clean up any existing articles with these titles to prevent duplicates
  const titles = newArticles.map(a => a.title);
  const { error: deleteError } = await supabase
    .from('news')
    .delete()
    .in('title', titles);
    
  if (deleteError) {
    console.error('Error cleaning up existing articles:', deleteError);
  }

  const { data, error } = await supabase
    .from('news')
    .insert(newArticles)
    .select();

  if (error) {
    console.error('Error seeding news articles:', error);
  } else {
    console.log('Seeded news articles successfully:', data.map(d => d.title));
  }
}

seedNews();
