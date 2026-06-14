-- =====================================================
-- Syncplay eSports - Seed Historical News Articles
-- Run this in your Supabase SQL Editor:
-- =====================================================

-- Clean up any duplicate initial seeds first to avoid clutter
DELETE FROM public.news WHERE title = 'Registration Now Open - 2v2 EA Sports FC 26 Tournament';

INSERT INTO public.news (title, excerpt, content, image_url, category, author, created_at)
VALUES 
(
  'syncplay eSports Launches - Historic 2v2 Tournament December 20th',
  'syncplay eSports officially launches with our inaugural 2v2 EA Sports FC 26 Tournament on December 20, 2025. Be part of history with our exclusive prize pool for registered teams...',
  '<p>syncplay eSports has officially launched! Our inaugural 2v2 tournament on December 20, 2025 was a massive success, bringing together the region''s top eFootball talent. The event showcased high-level team coordination, strategic depth, and intense matches.</p><p>We want to thank all of our competing teams and spectators for their support during this historic launch. Stay tuned as we build the premier esports platform in Nigeria!</p>',
  '/ea-sports-fc-26-xbox-one-xbox-series-x-s-microsoft-store-cover.jpg',
  'announcements',
  'syncplay Team',
  '2025-10-23 10:00:00+00'
),
(
  'Registration Now Open - 2v2 EA Sports FC 26 Tournament',
  'Registration is officially open for our first tournament! 12 teams will compete for exclusive prizes. Entry fee is ₦20,000 per team (subsidized rate). Secure your spot now...',
  '<p>Our registration window for the inaugural 2v2 tournament was completed successfully, with 12 elite teams securing their spots to compete. Teams went head-to-head for recognition and exclusive prizes in the tournament.</p><p>For future events, keep an eye on our Events page and make sure to register early, as team slots are limited and fill up very quickly!</p>',
  '/fc-26-1024x639.jpg',
  'announcements',
  'syncplay Team',
  '2025-10-23 09:00:00+00'
),
(
  'Meet syncplay - Nigeria''s New eSports Platform',
  'Introducing syncplay eSports, a dedicated platform for competitive eFootball and eBasketball tournaments in Nigeria. We''re building the future of gaming...',
  '<p>syncplay eSports is Nigeria''s newest dedicated platform for competitive sports simulation gaming. Focused on bringing gamers together, we organize professional-grade tournaments for eFootball and eBasketball.</p><p>By partnering with industry experts, experienced organizers, and talented broadcasters, syncplay is set to become your ultimate destination for high-quality esports content and competitive tournaments. Join us on this journey!</p>',
  '/1acc9234056000389336228dc9f195d0570f25a5.png',
  'announcements',
  'syncplay Team',
  '2025-10-22 10:00:00+00'
),
(
  'Tournament Rules & Regulations Released',
  'Complete tournament rules and regulations are now available. Learn about match format, scoring system, and code of conduct for all participants...',
  '<p>To ensure fair play and professional standards, the syncplay eSports committee has officially published the Tournament Rules and Regulations. All participating teams and players must review these guidelines before competing.</p><p>The rules cover game settings (half length, difficulty, controller settings), match reporting, disconnection handling, and our code of conduct. Check our Tournaments page for the complete rulebook.</p>',
  '/ea-sports-fc-26-xbox-one-xbox-series-x-s-microsoft-store-cover.jpg',
  'announcements',
  'syncplay Team',
  '2025-10-22 09:00:00+00'
),
(
  'Future Events - What''s Coming After November',
  'After our inaugural 2v2 tournament, syncplay will host regular Weekend Cups and Championship Series. More tournaments coming soon...',
  '<p>Following our successful December 2025 launch, syncplay is gearing up for a packed schedule of competitive gaming. We are expanding our tournament offerings to include regular Weekend Cups and Championship Series.</p><p>Whether you are a casual gamer looking for fun or a professional player aiming for the top, there will be plenty of opportunities to showcase your skills and win cash prizes.</p>',
  '/49f5b4f9bcc62ca23349c7f4096a7d52b91a7a3f.jpg',
  'announcements',
  'syncplay Team',
  '2025-10-21 10:00:00+00'
),
(
  'eBasketball Coming Soon to syncplay Platform',
  'Following overwhelming community interest, we are planning to launch eBasketball tournaments after our successful eFootball launch. Stay tuned...',
  '<p>Following overwhelming feedback and requests from the Nigerian gaming community, syncplay is excited to announce that eBasketball tournaments will be joining our lineup soon!</p><p>We are currently working with esports organizers to finalize rules, structure, and schedules for the upcoming basketball events. Stay tuned to our announcements and follow us on social media for updates.</p>',
  '/fc-26-1024x639.jpg',
  'announcements',
  'syncplay Team',
  '2025-10-20 10:00:00+00'
),
(
  'Tournament Champions Crowned - Full Results & Highlights',
  'Our inaugural tournament is complete! View the champions, final standings, prize distribution, and relive the best moments from December 20, 2025.',
  '<p>Our inaugural 2v2 EA Sports FC 26 Tournament has been completed successfully! After intense competition, we''re proud to announce our champions.</p><h3>Final Standings</h3><p><strong>1st Place:</strong> Champions - ₦800,000</p><p><strong>2nd Place:</strong> Runner-Up - ₦400,000</p><p><strong>3rd Place:</strong> Third Place - ₦300,000</p><h3>Tournament Highlights</h3><p>The tournament featured 12 teams competing in a group stage format, followed by knockout rounds. The competition was fierce, with many close matches and incredible displays of skill.</p><p>Thank you to all participants and supporters for making this inaugural tournament a success!</p><div style="margin: 2rem 0; text-align: center;"><a href="/tournaments?tab=standings" style="display: inline-block; padding: 1rem 2rem; background: #E63946; color: white; text-decoration: none; border-radius: 5px; margin: 0.5rem;">View Full Results</a><a href="/gallery" style="display: inline-block; padding: 1rem 2rem; background: #333; color: white; text-decoration: none; border-radius: 5px; margin: 0.5rem;">View Gallery</a></div>',
  '/tournament-media/photos/winners ss.png',
  'tournament-results',
  'syncplay Team',
  '2025-12-20 18:00:00+00'
),
(
  'Tournament Highlights & Best Moments',
  'Relive the most exciting moments, best plays, and memorable highlights from our inaugural 2v2 tournament. Watch interviews, see photos, and celebrate the champions.',
  '<p>Relive the most exciting moments from our inaugural tournament! From incredible goals to nail-biting finishes, the tournament delivered non-stop action.</p><h3>Best Moments</h3><ul><li>Incredible team coordination displays</li><li>Last-minute winning goals</li><li>Outstanding defensive plays</li><li>Championship celebration</li></ul><h3>Player Interviews</h3><p>Watch exclusive interviews with tournament participants, including pre-event predictions, post-match reactions, and winner celebrations.</p><p>Check out our <a href="/gallery?tab=videos">Videos page</a> for full match highlights and player interviews!</p>',
  '/tournament-media/photos/IMG_4596.JPEG',
  'tournament-results',
  'syncplay Team',
  '2025-12-21 10:00:00+00'
),
(
  'Meet Tactical - Inside the Mind of the Champion',
  'We sit down with Tactical, the star player of Team Century, who dominated the inaugural tournament and walked away with the ultimate crown.',
  '<p>At the inaugural syncplay eSports 2v2 Tournament, one name stood out during the knockout phase: <strong>Tactical</strong>. Playing for Team Century alongside his teammate Rhymez, Tactical showcased exceptional decision-making, relentless attacks, and calm composure under pressure.</p><h3>The Road to the Championship</h3><p>Team Century''s path was not easy. Placed in a tough Group C, they had to battle against formidable teams like L''Flames and Temple Boys. While they suffered a few challenges in the group stages, Tactical’s play stepped up significantly in the knockouts.</p><p>In the Quarterfinals, Century dominated Prime Time with a 4-0 clean sheet. The Semifinals saw a tighter 3-2 victory against the skilled y.fola team, leading to a blockbuster final against Orbyters. In the final, Tactical scored two critical goals to secure a 3-2 win and lift the trophy.</p><h3>Tactics and Gaming Style</h3><p>Tactical is known for his fast build-up and high passing accuracy. Scaling with an overall rating of 93 in the syncplay database, his stats (94 Attack, 91 Passing, 92 Clutch) reflect his ability to perform when it matters most.</p><p>"We trained for weeks on coordination," Tactical said in a post-match interview. "In 2v2, you must trust your partner completely. Rhymez held the defense, which gave me the space to create attacks."</p><p>Browse <a href="/players/Tactical" style="color: #E63946; font-weight: bold; text-decoration: none;">Tactical''s player profile page</a> to view his full attributes breakdown and tournament matches history!</p>',
  '/tournament-media/photos/winners ss.png',
  'player-profiles',
  'syncplay Team',
  '2025-12-22 10:00:00+00'
),
(
  'Meet Baji-jr - The Rise of the Runner-Up',
  'An in-depth profile of Baji-jr from Team Orbyters, who led his team to the Grand Final after a dramatic 3-3 semifinal shootout thriller.',
  '<p>While Team Century took home the trophy, the story of the inaugural tournament wouldn''t be complete without highlighting the phenomenal run of <strong>Baji-jr</strong> and Team Orbyters. Alongside his teammate Anife, Baji-jr showcased elite gameplay that carried them all the way to the Grand Final.</p><h3>The Tournament Run</h3><p>Orbyters'' campaign started with a setback in Group B, suffering a tight <strong>1-0 defeat</strong> against y.fola. However, they quickly bounced back in style, dominating Get Psyched with a <strong>4-0 shutout</strong> and outclassing Banters FC in a high-scoring <strong>5-2 victory</strong> to advance to the knockouts.</p><p>In the Quarterfinals, Orbyters kept their momentum going by cruising past Temple Boys with another <strong>4-0 clean sheet</strong>. The Semifinals served up the tournament''s most dramatic fixture: a <strong>3-3 thriller</strong> against Gameverse. With neither side able to find a winner in open play, Baji-jr and Anife kept their nerve to win the penalty shootout and book a spot in the Grand Final.</p><p>The Grand Final was a highly competitive matchup against Team Century. Despite a spirited performance, Orbyters ultimately fell <strong>3-2</strong>, finishing as the proud runner-up of the tournament.</p><h3>Player Attributes & Ratings</h3><p>In the syncplay esports database, Baji-jr is rated at a strong <strong>78 OVR</strong>. His stats reflect a dangerous attacking force and a reliable clutch performer: <strong>87 Attack</strong>, <strong>73 Defense</strong>, <strong>78 Passing</strong>, <strong>70 Consistency</strong>, and a remarkable <strong>84 Clutch</strong> rating.</p><p>Browse <a href="/players/Baji-jr" style="color: #E63946; font-weight: bold; text-decoration: none;">Baji-jr''s player profile page</a> to view his full attributes breakdown and detailed match history!</p>',
  '/tournament-media/photos/welcome baji jr.png',
  'player-profiles',
  'syncplay Team',
  '2025-12-23 10:00:00+00'
);
