# 🎫 Tournament Player ID System

## 📋 Overview

Your syncplay eSports platform now **auto-generates unique Tournament Player IDs** for every registered player!

---

## 🎯 What Gets Generated?

### **Example:**
```
Team Registration #1: "Fire Squad"
├── Player 1: John Doe
│   ├── PSN ID: JohnGamer123 (provided by player)
│   └── Tournament ID: SP-2025-001 ✅ (auto-generated)
│
└── Player 2: Jane Smith
    ├── PSN ID: JaneGamer456 (provided by player)
    └── Tournament ID: SP-2025-002 ✅ (auto-generated)

Team Registration #2: "Thunder Kings"
├── Player 1: Mike Chen
│   ├── PSN ID: MikeTheKing
│   └── Tournament ID: SP-2025-003 ✅
│
└── Player 2: Sarah Lee
    ├── PSN ID: SarahProGamer
    └── Tournament ID: SP-2025-004 ✅

...continues to Team #32 (Players #064)
```

---

## 🔢 ID Format

```
SP-2025-XXX

SP       → syncplay
2025     → Tournament Year
001-064  → Sequential Player Number
```

### **ID Assignment:**
- **Team 1**: SP-2025-001, SP-2025-002
- **Team 2**: SP-2025-003, SP-2025-004
- **Team 3**: SP-2025-005, SP-2025-006
- ...
- **Team 32**: SP-2025-063, SP-2025-064

---

## ❓ PSN ID vs Tournament ID

### **PSN ID (PlayStation Network ID)**
- ✅ **Player provides this**
- ✅ Their existing PlayStation username
- ✅ Example: `JohnGamer123`
- ✅ Used for: Inviting to PlayStation party, finding in-game

### **Tournament ID**
- ✅ **We generate this automatically**
- ✅ Unique identifier in our system
- ✅ Example: `SP-2025-001`
- ✅ Used for: Tournament bracket, scoreboard, leaderboard

---

## 🎮 How It Works

### **Step 1: Player Registers**
```
Player fills form:
- Name: John Doe
- Email: john@email.com
- Phone: 08012345678
- PSN ID: JohnGamer123  ← Player provides
```

### **Step 2: Payment Succeeds**
```
Paystack confirms payment:
- Amount: ₦100,000
- Reference: 1234567890
```

### **Step 3: Database Saves** ✨
```sql
-- Before INSERT (automatic trigger fires):
player1_tournament_id = NULL

-- After INSERT (trigger generates):
player1_tournament_id = 'SP-2025-001'
player2_tournament_id = 'SP-2025-002'
```

### **Step 4: Admin Views**
```
In Admin Dashboard:
┌────────────────────────────────────┐
│ Fire Squad                         │
│ ├── John Doe                       │
│ │   🎫 SP-2025-001                │
│ │   🎮 JohnGamer123 (PSN)         │
│ └── Jane Smith                     │
│     🎫 SP-2025-002                │
│     🎮 JaneGamer456 (PSN)         │
└────────────────────────────────────┘
```

---

## 📊 Where You'll See Tournament IDs

### **1. Admin Dashboard** (`/admin/registrations`)
- Each player shows their Tournament ID
- Displayed under player name
- Red badge: `🎫 SP-2025-001`

### **2. CSV Export**
```csv
Team Name,Player 1 Name,Player 1 Tournament ID,Player 1 PSN ID,...
Fire Squad,John Doe,SP-2025-001,JohnGamer123,...
Thunder Kings,Mike Chen,SP-2025-003,MikeTheKing,...
```

### **3. Database** (Supabase)
- `player1_tournament_id` column
- `player2_tournament_id` column
- Auto-populated on registration

---

## 🎯 Use Cases

### **Tournament Bracket**
```
ROUND OF 16
┌─────────────────────┐
│ Match 1             │
├─────────────────────┤
│ SP-2025-001 vs      │
│ SP-2025-015         │
└─────────────────────┘
```

### **Scoreboard**
```
┌────┬─────────────┬────────┐
│ #  │ Player ID   │ Wins   │
├────┼─────────────┼────────┤
│ 1  │ SP-2025-007 │ 5      │
│ 2  │ SP-2025-023 │ 4      │
│ 3  │ SP-2025-001 │ 4      │
└────┴─────────────┴────────┘
```

### **Team Roster**
```
Team #1: Fire Squad
- SP-2025-001: John Doe (JohnGamer123)
- SP-2025-002: Jane Smith (JaneGamer456)

Team #2: Thunder Kings
- SP-2025-003: Mike Chen (MikeTheKing)
- SP-2025-004: Sarah Lee (SarahProGamer)
```

---

## 🛠️ Technical Details

### **Database Trigger**
```sql
CREATE OR REPLACE FUNCTION generate_tournament_player_ids()
RETURNS TRIGGER AS $$
DECLARE
  total_players INTEGER;
BEGIN
  -- Count existing players
  SELECT COUNT(*) * 2 INTO total_players FROM registrations;
  
  -- Generate sequential IDs
  NEW.player1_tournament_id := 'SP-2025-' || LPAD((total_players + 1)::TEXT, 3, '0');
  NEW.player2_tournament_id := 'SP-2025-' || LPAD((total_players + 2)::TEXT, 3, '0');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### **How It Counts**
```
Registration #1:
- Current players: 0
- Player 1 gets: 001 (0 + 1)
- Player 2 gets: 002 (0 + 2)

Registration #2:
- Current players: 2
- Player 1 gets: 003 (2 + 1)
- Player 2 gets: 004 (2 + 2)

Registration #32:
- Current players: 62
- Player 1 gets: 063 (62 + 1)
- Player 2 gets: 064 (62 + 2)
```

---

## ✅ Benefits

### **1. Unique Identification**
- No confusion between players with same name
- Easy to reference in brackets/scores
- Professional tournament management

### **2. Automation**
- No manual ID assignment needed
- Eliminates human error
- Instant generation on registration

### **3. Sequential Tracking**
- Know registration order
- Easy to see who registered first
- Clean numbering system

### **4. Future-Proof**
- Can add more fields (rank, rating, etc.)
- Foundation for player profiles
- Easy to expand system

---

## 📱 For Tournament Day

### **Step 1: Export CSV**
```bash
Admin Dashboard → Export CSV
```

### **Step 2: Create Bracket**
```
Use Tournament IDs in bracket software:
- Challonge
- Battlefy
- Custom bracket
```

### **Step 3: Call Matches**
```
"Match 1: SP-2025-001 vs SP-2025-015"
"Match 2: SP-2025-003 vs SP-2025-007"
```

### **Step 4: Track Scores**
```
SP-2025-001: 3 wins
SP-2025-015: 2 wins
Winner: SP-2025-001
```

---

## 🔮 Future Enhancements

### **Phase 2** (After Dec 20):
- Player profile pages (`/player/SP-2025-001`)
- Match history tracking
- Win/loss records
- Rating system

### **Phase 3** (Future tournaments):
- Tournament-specific IDs
  - `SP-DEC-001` (December tournament)
  - `SP-JAN-001` (January tournament)
- Season tracking
- Career statistics

---

## ❓ FAQ

### **Q: What if a player registers for multiple tournaments?**
A: They'll get a new ID for each tournament:
- Nov 2025: `SP-2025-001`
- Dec 2025: `SP-DEC-001`
- Jan 2026: `SP-JAN-001`

### **Q: Can players choose their Tournament ID?**
A: No, it's auto-generated to ensure:
- Uniqueness
- Sequential order
- Fair distribution

### **Q: What if registration is cancelled?**
A: The ID is already assigned and won't be reused. Next player gets the next number.

### **Q: How do I reference a player?**
A: Use either:
- **Tournament ID**: `SP-2025-001` (in brackets/scores)
- **PSN ID**: `JohnGamer123` (for PlayStation invites)
- **Name**: `John Doe` (for announcements)

---

## 🎉 Example Tournament Flow

### **Registration Phase**
```
Day 1: 5 teams register → IDs 001-010
Day 2: 10 teams register → IDs 011-030
Day 3: 17 teams register → IDs 031-064
Total: 32 teams (64 players)
```

### **Tournament Day**
```
Bracket Created:
Group A: SP-2025-001 to SP-2025-016
Group B: SP-2025-017 to SP-2025-032
Group C: SP-2025-033 to SP-2025-048
Group D: SP-2025-049 to SP-2025-064
```

### **Match Calling**
```
"Match 1, Group A:"
"SP-2025-001 (Fire Squad - Player 1)"
"vs"
"SP-2025-015 (Thunder Kings - Player 1)"

PSN Invites:
- Invite: JohnGamer123
- Invite: MikeTheKing
```

### **Score Tracking**
```
SP-2025-001: WIN
SP-2025-015: LOSS
```

---

## 📞 Support

Tournament IDs are now:
- ✅ Automatically generated
- ✅ Displayed in admin dashboard
- ✅ Included in CSV exports
- ✅ Saved in database
- ✅ Sequential and unique

**You're all set for tournament management! 🏆**

