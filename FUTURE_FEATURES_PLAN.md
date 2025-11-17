# 🎮 syncplay eSports - Future Features Plan

**Date:** October 23, 2025  
**Status:** Implementation Roadmap

---

## 📺 1. LIVE EVENTS ON YOUTUBE

### **Current State:**
❌ No live streaming integration  
❌ No "LIVE NOW" indicators  
❌ No way to watch tournaments  

### **Recommended Solution:**

#### **Phase 1: YouTube Live Integration (Pre-Tournament)**

**Add to Events Page:**
```javascript
// New section on Events page
<section className="live-streaming">
  <div className="container">
    {isLive && (
      <div className="live-banner">
        <span className="live-indicator">🔴 LIVE NOW</span>
        <h2>2v2 Tournament - LIVE</h2>
      </div>
    )}
    
    <div className="youtube-embed">
      <iframe
        src="https://www.youtube.com/embed/YOUR_STREAM_ID?autoplay=1"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>

    <div className="live-info">
      <h3>TOURNAMENT BRACKETS</h3>
      {/* Display current matches */}
    </div>
  </div>
</section>
```

**Features:**
- ✅ YouTube live embed
- ✅ "LIVE NOW" red pulsing indicator
- ✅ Chat embed (YouTube chat)
- ✅ Current match info
- ✅ Next match schedule
- ✅ Live bracket/standings

**Files to Create:**
- `src/pages/Live.js` - New page for live events
- `src/pages/Live.css` - Styling
- `src/components/YouTubePlayer.js` - Reusable YouTube embed

**Add to Navigation:**
```javascript
// In Navbar.js
<li className="nav-item">
  <Link to="/live" className="nav-link nav-link-live">
    {isLive && <span className="live-dot">🔴</span>}
    LIVE
  </Link>
</li>
```

---

#### **Phase 2: Scheduled Streams (Day Before Tournament)**

**Add Stream Schedule Feature:**
```javascript
const streamSchedule = {
  tournamentId: "2v2-nov-30",
  streamUrl: "https://youtube.com/watch?v=...",
  startTime: "2025-11-30T15:00:00Z",
  status: "scheduled", // scheduled | live | ended
  viewCount: 0,
  chatEnabled: true
};
```

**Features:**
- ⏰ Countdown to stream start
- 🔔 "Notify Me" button (adds to calendar)
- 📺 Pre-stream info and hype
- 🎬 Previous stream highlights

---

#### **Phase 3: Post-Event VODs (After Tournament)**

**Archive System:**
```javascript
const pastStreams = [
  {
    id: 1,
    title: "2v2 EA Sports FC 26 Tournament - Finals",
    date: "December 20, 2025",
    youtubeId: "VIDEO_ID",
    thumbnail: "thumbnail.jpg",
    duration: "3:45:00",
    views: 15234,
    highlights: [
      { time: "00:15:30", label: "Epic Goal by Team Alpha" },
      { time: "01:30:00", label: "Championship Match Begins" },
      { time: "03:20:00", label: "Final Goal & Winner Announcement" }
    ]
  }
];
```

**Where to Display:**
1. **News Page** - Embedded stream recaps
2. **Events Page** - Past events section with VOD links
3. **New "Videos" Page** - Full video archive

---

### **Implementation Priority:**

| Feature | Priority | Timeline |
|---------|----------|----------|
| Basic YouTube embed | 🔴 HIGH | Before Dec 20 |
| Live indicator | 🔴 HIGH | Before Dec 20 |
| Stream schedule | 🟡 MEDIUM | 1 week before |
| VOD archive | 🟢 LOW | After tournament |
| Highlights/clips | 🟢 LOW | Week after tournament |

---

## 📊 2. PREVIOUS EVENTS DISPLAY

### **Current State:**
✅ "We're Just Getting Started" placeholder message  
❌ No way to store tournament results  
❌ No bracket display system  

### **Recommended Solution:**

#### **Phase 1: Simple Results Display (After Dec 20)**

**Data Structure:**
```javascript
const pastEvents = [
  {
    id: 1,
    title: "Inaugural 2v2 EA Sports FC 26 Tournament",
    date: "December 20, 2025",
    format: "2v2",
    teams: 32,
    prizePool: "₦1,500,000",
    
    // Winners
    winner: {
      team: "Elite Strikers",
      players: ["ProGamer_SP", "ElitePlayer_99"],
      prize: "₦750,000",
      flag: "🇳🇬"
    },
    
    runnerUp: {
      team: "Goal Machines",
      players: ["Striker_Pro", "Finisher_01"],
      prize: "₦450,000",
      flag: "🇳🇬"
    },
    
    thirdPlace: {
      team: "Dream Team FC",
      players: ["MidMaestro", "DefendKing"],
      prize: "₦300,000",
      flag: "🇳🇬"
    },
    
    // Media
    highlights: "https://youtube.com/watch?v=...",
    fullStream: "https://youtube.com/watch?v=...",
    photos: ["photo1.jpg", "photo2.jpg"],
    
    // Stats
    totalGoals: 124,
    totalMatches: 31,
    avgGoalsPerMatch: 4.0,
    topScorer: {
      player: "ProGamer_SP",
      goals: 15
    },
    
    // Bracket data
    bracket: {
      // Tournament bracket structure
    }
  }
];
```

**Display on Events Page:**
```javascript
// Replace "We're Just Getting Started" with:
<section className="past-events">
  <div className="container">
    <h2>PAST EVENTS</h2>
    
    {pastEvents.map(event => (
      <div className="past-event-card">
        <div className="event-header">
          <h3>{event.title}</h3>
          <span className="event-date">{event.date}</span>
        </div>
        
        <div className="winners-podium">
          {/* 1st, 2nd, 3rd place display */}
          <div className="winner-card gold">
            <div className="trophy">🏆</div>
            <h4>{event.winner.team}</h4>
            <p>{event.winner.players.join(" & ")}</p>
            <span className="prize">{event.winner.prize}</span>
          </div>
          {/* Similar for 2nd and 3rd */}
        </div>
        
        <div className="event-stats">
          <div className="stat">
            <span className="stat-value">{event.totalMatches}</span>
            <span className="stat-label">Matches</span>
          </div>
          <div className="stat">
            <span className="stat-value">{event.totalGoals}</span>
            <span className="stat-label">Goals</span>
          </div>
          {/* More stats */}
        </div>
        
        <div className="event-media">
          <a href={event.highlights} className="btn btn-primary">
            <i className="fab fa-youtube"></i> Watch Highlights
          </a>
          <Link to={`/events/${event.id}/bracket`} className="btn btn-secondary">
            View Full Bracket
          </Link>
        </div>
      </div>
    ))}
  </div>
</section>
```

---

#### **Phase 2: Full Bracket Display**

**Create New Page: Event Details**
- Route: `/events/:id` or `/tournaments/:id/results`
- Show full tournament bracket
- Interactive bracket visualization
- Match-by-match results
- Player stats

**Libraries to Consider:**
- `react-tournament-bracket` - Pre-built bracket component
- Custom SVG bracket - More control
- D3.js - Interactive visualizations

---

#### **Phase 3: Player Profiles & Leaderboard (Week After Tournament)**

**Enable Players Page:**
```javascript
// Update Players.js to show real data
const players = [
  {
    id: 1,
    name: "ProGamer_SP",
    team: "Elite Strikers",
    gamerTag: "ProSP_NG",
    rank: 1,
    earnings: "₦375,000", // 50% of team prize
    tournaments: 1,
    wins: 7,
    losses: 0,
    winRate: 100,
    avgGoalsPerMatch: 2.1,
    avatar: "avatar1.jpg",
    stats: {
      totalMatches: 7,
      totalGoals: 15,
      assists: 8,
      cleanSheets: 3
    }
  }
];
```

---

### **Implementation Priority:**

| Feature | Priority | Timeline |
|---------|----------|----------|
| Winner announcement | 🔴 HIGH | Day of tournament |
| Simple results display | 🔴 HIGH | 1 day after |
| VOD links | 🟡 MEDIUM | 2 days after |
| Full bracket view | 🟡 MEDIUM | 3-5 days after |
| Player leaderboard | 🟢 LOW | 1 week after |
| Stats & analytics | 🟢 LOW | 2 weeks after |

---

## ⚽ 3. TEAM SELECTION IN REGISTRATION

### **Current State:**
❌ Players don't select FIFA/eFootball teams  
❌ No rating restrictions  
❌ No team balance mechanism  

### **The Problem:**
In EA Sports FC 26, teams have different ratings:
- Real Madrid: 86 rating ⚠️
- Barcelona: 85 rating ⚠️
- Lower leagues: 70-75 rating ⚠️

**This creates unfair advantage if not regulated!**

---

### **Recommended Solution:**

#### **Option 1: Fixed Rating Range (RECOMMENDED)**

**Rules:**
- All teams must be **4.5-5 stars** rating
- Balanced competitive play
- Fair for all skill levels

**Add to Registration Form (Step 3):**

```javascript
// After Player 1 & Player 2 info, add Step 3: Team Selection

const teamOptions = [
  // 5-Star Teams
  { name: "Real Madrid", league: "La Liga", rating: 86, stars: 5 },
  { name: "Manchester City", league: "Premier League", rating: 86, stars: 5 },
  { name: "PSG", league: "Ligue 1", rating: 85, stars: 5 },
  { name: "Bayern Munich", league: "Bundesliga", rating: 86, stars: 5 },
  { name: "Barcelona", league: "La Liga", rating: 85, stars: 5 },
  { name: "Liverpool", league: "Premier League", rating: 84, stars: 5 },
  
  // 4.5-Star Teams
  { name: "Arsenal", league: "Premier League", rating: 83, stars: 4.5 },
  { name: "Chelsea", league: "Premier League", rating: 83, stars: 4.5 },
  { name: "Inter Milan", league: "Serie A", rating: 83, stars: 4.5 },
  { name: "Atletico Madrid", league: "La Liga", rating: 83, stars: 4.5 },
  { name: "Juventus", league: "Serie A", rating: 82, stars: 4.5 },
  { name: "AC Milan", league: "Serie A", rating: 82, stars: 4.5 },
  
  // Add more 4.5-5 star teams
];

// In Register.js, add new step:
const renderStep3 = () => (
  <div className="registration-step">
    <h2>Team Selection</h2>
    <p className="step-description">
      Select the teams both players will use. Tournament rules: 4.5-5 star teams only.
    </p>

    <div className="team-selection-grid">
      <div className="player-team-select">
        <h3>Player 1: {formData.player1Name}</h3>
        <select
          name="player1Team"
          value={formData.player1Team}
          onChange={handleChange}
          required
        >
          <option value="">Select Team</option>
          {teamOptions.map(team => (
            <option key={team.name} value={team.name}>
              {team.name} ({team.league}) - {team.stars}⭐
            </option>
          ))}
        </select>
      </div>

      <div className="player-team-select">
        <h3>Player 2: {formData.player2Name}</h3>
        <select
          name="player2Team"
          value={formData.player2Team}
          onChange={handleChange}
          required
        >
          <option value="">Select Team</option>
          {teamOptions.map(team => (
            <option key={team.name} value={team.name}>
              {team.name} ({team.league}) - {team.stars}⭐
            </option>
          ))}
        </select>
      </div>
    </div>

    <div className="team-rules-info">
      <h4>Tournament Rules</h4>
      <ul>
        <li>✅ Both players can use the same team</li>
        <li>✅ You can change teams between matches (bracket stage)</li>
        <li>⚠️ Teams must be 4.5-5 stars only</li>
        <li>⚠️ Custom tactics allowed, attribute boosters NOT allowed</li>
      </ul>
    </div>

    <div className="form-actions">
      <button type="button" onClick={prevStep}>Back</button>
      <button type="button" onClick={nextStep}>Next</button>
    </div>
  </div>
);
```

---

#### **Option 2: Team Draft System (Advanced)**

**Rules:**
- Each team can only be used by ONE player per round
- Forces variety and strategy
- More complex to manage

**Implementation:**
- Track which teams are already selected
- Lock out selected teams in real-time
- Reset after each round

---

#### **Option 3: Open Selection with Handicap (Not Recommended)**

**Rules:**
- Any team allowed
- Apply in-game handicap for higher-rated teams
- Complex to balance

---

### **Recommended Approach:**

✅ **Use Option 1: Fixed Rating Range (4.5-5 stars)**

**Why:**
- Simple to implement
- Easy to enforce
- Fair competition
- Industry standard for tournaments

**Update Tournament Rules Page:**
```markdown
### Eligible Teams

Only teams rated 4.5-5 stars are allowed:
- Real Madrid, Barcelona, Man City, PSG, Bayern Munich, Liverpool
- Arsenal, Chelsea, Juventus, Inter Milan, Atletico Madrid, AC Milan
- [Full list of 20-30 teams]

Teams NOT allowed:
- Lower league teams (< 4.5 stars)
- Classic teams
- Custom created teams
```

---

### **Implementation Priority:**

| Feature | Priority | Timeline |
|---------|----------|----------|
| Add team selection step | 🔴 HIGH | Before registration opens |
| Create team list (4.5-5★) | 🔴 HIGH | Same time |
| Update tournament rules | 🔴 HIGH | Same time |
| Team validation | 🟡 MEDIUM | Before tournament |
| In-game enforcement check | 🟢 LOW | Day of tournament |

---

## 🛠️ 4. ADMIN PANEL / BACKEND

### **Current State:**
❌ No admin interface  
❌ All data hardcoded  
❌ No way to manage tournaments  
❌ No payment verification system  
❌ No player management  

### **What Admins Need to Do:**

1. **Manage Tournaments**
   - Create new tournaments
   - Edit prize pools, dates
   - Open/close registration
   - Set participant limits

2. **Manage Registrations**
   - View all registered teams
   - Verify payments
   - Approve/reject registrations
   - Send confirmation emails

3. **Manage Brackets**
   - Generate tournament bracket
   - Input match results
   - Update live scores
   - Advance winners

4. **Manage Players**
   - View player profiles
   - Update stats
   - Handle disputes
   - Issue prizes

5. **Content Management**
   - Post news articles
   - Update announcements
   - Manage images/videos
   - Edit pages

---

### **Recommended Solution:**

#### **Phase 1: Minimal Admin Panel (Before Dec 20)**

**Simple Admin Dashboard:**
- View registrations from Paystack
- Manual match management
- Results input form

**Tech Stack:**
- **Option A: Firebase Admin + Simple React Dashboard**
  - Quick setup
  - No backend coding
  - Good for MVP

- **Option B: Separate Admin React App**
  - Reads from Paystack API
  - Google Sheets for data management
  - Manual processes

**Features:**
```
Admin Dashboard v1.0
├── Registrations
│   ├── View all (from Paystack)
│   ├── Payment status
│   └── Export to CSV
├── Tournament Management
│   ├── Bracket generator
│   ├── Match results entry
│   └── Winner announcement
└── Simple Analytics
    ├── Total registrations
    ├── Revenue
    └── Player count
```

---

#### **Phase 2: Full Backend System (After First Tournament)**

**Backend Options:**

**Option 1: Firebase (RECOMMENDED for MVP)**
```
Pros:
✅ No server management
✅ Real-time database
✅ Authentication built-in
✅ Hosting included
✅ Fast setup (1-2 weeks)

Cons:
⚠️ Vendor lock-in
⚠️ Costs scale with usage
⚠️ Limited customization
```

**Option 2: Custom Node.js API**
```
Pros:
✅ Full control
✅ Custom features
✅ Can integrate anything
✅ Own your data

Cons:
⚠️ Need hosting (Heroku/Railway/DigitalOcean)
⚠️ More development time (4-6 weeks)
⚠️ Need to maintain
```

**Option 3: Headless CMS (Strapi/Sanity)**
```
Pros:
✅ Built-in admin panel
✅ Content management
✅ API auto-generated
✅ Good for content-heavy sites

Cons:
⚠️ Learning curve
⚠️ May be overkill
⚠️ Hosting costs
```

---

### **Recommended Architecture:**

```
┌─────────────────────────────────────┐
│     syncplay eSports Website        │
│         (Current React App)         │
└────────────┬────────────────────────┘
             │
             ├─── Reads from ───┐
             │                  │
    ┌────────▼──────────┐  ┌───▼──────────────┐
    │   Paystack API    │  │  Firebase/Backend│
    │  (Payment Data)   │  │  (Tournament Data)│
    └───────────────────┘  └──────────────────┘
                                    ▲
                                    │
                           ┌────────┴─────────┐
                           │  Admin Dashboard │
                           │  (Separate App)  │
                           └──────────────────┘
```

---

### **Admin Dashboard Features (Full System):**

#### **1. Dashboard Home**
```javascript
- Total Revenue: ₦3,200,000
- Registered Teams: 32/32
- Pending Approvals: 2
- Active Tournaments: 1
- Upcoming: 3
- Recent Activity Feed
```

#### **2. Tournament Management**
```javascript
// Create Tournament Form
{
  name: "Weekend Cup #1",
  game: "eFootball",
  format: "1v1",
  date: "2025-12-07",
  time: "15:00",
  maxTeams: 64,
  entryFee: 5000,
  prizePool: 500000,
  platform: "PlayStation",
  ratingLimit: "4.5-5 stars",
  status: "draft" | "open" | "full" | "live" | "completed"
}
```

#### **3. Registration Management**
```javascript
// View all registrations
{
  id: "REG_001",
  tournamentId: "2v2-nov-30",
  teamName: "Elite Strikers",
  players: [
    { name: "John Doe", email: "john@example.com", tag: "ProGamer", team: "Real Madrid" },
    { name: "Jane Smith", email: "jane@example.com", tag: "ElitePlayer", team: "Barcelona" }
  ],
  paymentStatus: "confirmed", // confirmed | pending | failed
  paystackReference: "T123456789",
  amountPaid: 100000,
  registeredAt: "2025-11-15T10:30:00Z",
  status: "approved" // pending | approved | rejected
}

// Actions
- Approve/Reject
- Send confirmation email
- Refund (if needed)
- Edit team details
- View payment proof
```

#### **4. Bracket Management**
```javascript
// Generate bracket
- Auto-generate from registrations
- Manual seeding options
- Random draw
- Export bracket as image

// Input results
- Match ID: SF-1
- Team 1: Elite Strikers - Score: 3
- Team 2: Goal Machines - Score: 2
- Winner: Elite Strikers
- MVP: ProGamer_SP
- Highlights: [link]

// Live updates
- Update scores in real-time
- Bracket updates automatically on website
```

#### **5. Player Management**
```javascript
// Player Database
{
  id: "PLR_001",
  name: "ProGamer_SP",
  email: "progamer@example.com",
  gamerTag: "ProSP_NG",
  platform: "PlayStation",
  psnId: "ProGamerNG",
  
  // Stats (auto-calculated)
  tournaments: 1,
  matches: 7,
  wins: 7,
  losses: 0,
  goals: 15,
  assists: 8,
  earnings: 375000,
  rank: 1,
  
  // Status
  verified: true,
  banned: false,
  warnings: 0
}

// Actions
- Update stats manually
- Issue warning/ban
- Edit profile
- View tournament history
- Contact player
```

#### **6. Content Management**
```javascript
// News Articles
- Create new article
- Edit existing
- Add images/videos
- Publish/unpublish
- Schedule publishing

// Announcements
- Banner notifications
- Email broadcasts
- Social media auto-post
```

#### **7. Analytics**
```javascript
// Revenue
- Total: ₦X
- By tournament
- By month
- Payment methods

// Player Stats
- Total registered
- Active players
- New vs returning
- Geographic distribution

// Tournament Stats
- Participation rates
- Average match duration
- Popular teams used
- Peak viewing times
```

#### **8. Settings**
```javascript
// Platform Settings
- Social media links
- Contact email
- Paystack keys
- YouTube channel
- Discord server

// Tournament Defaults
- Default prize structures
- Standard rules
- Eligible teams list
- Banned players list

// Email Templates
- Confirmation email
- Payment receipt
- Tournament reminder
- Winner announcement
```

---

### **Implementation Roadmap:**

#### **🔴 Phase 1 (Before Dec 20 - 1 Week)**
**Minimal Admin Tools:**
- [ ] Google Sheets integration with Paystack
- [ ] Export registrations to CSV
- [ ] Manual bracket generator (bracket.com or similar)
- [ ] Simple results input form

**Files to Create:**
- `admin-tools/` folder (separate from main app)
- `admin-tools/registrations.html` - View registrations
- `admin-tools/bracket-input.html` - Input results
- Python/Node script to fetch Paystack data

**Estimated Time:** 2-3 days  
**Cost:** $0 (manual tools)

---

#### **🟡 Phase 2 (Week After Tournament - 2-3 Weeks)**
**Basic Admin Dashboard:**
- [ ] Set up Firebase project
- [ ] Create admin authentication
- [ ] Build registration viewer
- [ ] Build tournament manager
- [ ] Build results input system

**Tech Stack:**
- React (separate admin app)
- Firebase (backend)
- Firebase Authentication (admin login)
- Firebase Hosting

**Estimated Time:** 2-3 weeks  
**Cost:** $25-50/month (Firebase Spark/Blaze plan)

---

#### **🟢 Phase 3 (Month 2-3 - 4-6 Weeks)**
**Full Admin System:**
- [ ] Complete tournament CRUD
- [ ] Player management
- [ ] Analytics dashboard
- [ ] Content management
- [ ] Email automation
- [ ] Payment verification automation

**Estimated Time:** 4-6 weeks  
**Cost:** $50-100/month (includes email service)

---

### **Immediate Action for Dec 20 Tournament:**

**Manual Process (No coding needed):**

1. **View Registrations:**
   - Log into Paystack dashboard
   - Export transactions
   - Filter by reference ID

2. **Verify Teams:**
   - Create Google Sheet
   - List all registered teams
   - Check payment status manually
   - Send confirmation emails manually

3. **Generate Bracket:**
   - Use free tool: bracket.com or challonge.com
   - Input teams manually
   - Share bracket link on website

4. **Input Results:**
   - Update bracket on bracket.com
   - Manually update website past events
   - Post results on social media

5. **Announce Winners:**
   - Create news article
   - Update Events page with results
   - Send winner notification email

**This works for first tournament!** Build proper admin system after you validate the concept.

---

## 📅 IMPLEMENTATION TIMELINE

### **Before Dec 20 (3 Weeks)**
**Week 1 (Nov 1-7):**
- [ ] Add team selection to registration ⚽
- [ ] Create eligible teams list
- [ ] Set up manual admin process (Google Sheets)
- [ ] Test payment flow thoroughly

**Week 2 (Nov 8-14):**
- [ ] Add YouTube embed to website 📺
- [ ] Create "LIVE" indicator
- [ ] Set up streaming equipment
- [ ] Test stream

**Week 3 (Nov 15-21):**
- [ ] Final testing
- [ ] Create tournament bracket manually
- [ ] Prepare live stream setup
- [ ] Send reminder emails

**Week 4 (Nov 22-29):**
- [ ] Last-minute registrations
- [ ] Final bracket
- [ ] Stream test
- [ ] Ready for tournament!

---

### **After Dec 20 (Post-Tournament)**
**Week 1 (Dec 1-7):**
- [ ] Post results ✅
- [ ] Upload VODs
- [ ] Create highlights video
- [ ] Update leaderboard with real data

**Week 2-3 (Dec 8-21):**
- [ ] Start building basic admin dashboard
- [ ] Set up Firebase
- [ ] Create admin login

**Month 2 (January):**
- [ ] Full admin system
- [ ] Automated processes
- [ ] Ready for Weekend Cup series

---

## 💰 ESTIMATED COSTS

### **Phase 1 (Manual - Dec 20)**
- $0 - Use free tools

### **Phase 2 (Basic Admin - December)**
- Firebase: $25-50/month
- Domain/Hosting: Already covered
- **Total: $25-50/month**

### **Phase 3 (Full System - January+)**
- Firebase: $50-100/month
- Email Service (SendGrid/Mailgun): $15-30/month
- Streaming (YouTube - Free)
- **Total: $65-130/month**

---

## 🎯 RECOMMENDATIONS

### **For Dec 20 Tournament:**
✅ **Do:**
1. Add team selection to registration (MUST HAVE)
2. Set up YouTube streaming
3. Use manual admin process (Google Sheets + Paystack dashboard)
4. Use free bracket tool (challonge.com)

❌ **Don't:**
1. Try to build full admin system before tournament
2. Over-complicate the process
3. Delay tournament for admin features

### **After First Tournament:**
✅ **Do:**
1. Build proper admin dashboard
2. Automate what you can
3. Learn from what worked/didn't work
4. Plan for scale

---

## 📞 NEXT STEPS

**Tell me:**
1. Do you want to add team selection to registration now?
2. Should I create the YouTube embed for live streaming?
3. Do you want a simple admin tool for managing the Dec 20 tournament?
4. What's your preference: Firebase (easy/fast) or Custom Backend (flexible)?

I can implement any of these features immediately! 🚀

---

**Document Status:** Planning Phase  
**Review Date:** After Dec 20 Tournament  
**Owner:** syncplay eSports Team


