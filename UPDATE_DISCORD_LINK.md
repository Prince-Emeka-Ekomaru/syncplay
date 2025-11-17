# 🔗 Update Discord Invite Link

After you create your Discord invite link, you need to update it in **3 files**:

---

## 📝 HOW TO GET YOUR DISCORD INVITE LINK

1. Open Discord
2. Right-click your server name
3. Click "Invite People"
4. Click "Edit invite link" (at bottom)
5. Set these settings:
   - **Expire after:** Never
   - **Max number of uses:** No limit
   - **Grant temporary membership:** OFF
6. Click "Generate a New Link"
7. Copy the link (it will look like: `https://discord.gg/XXXXXX`)

---

## 🔧 FILES TO UPDATE

Once you have your Discord link (e.g., `https://discord.gg/syncplay123`), replace `YOUR_INVITE_CODE` in these 3 files:

### **1. src/components/Navbar.js** (Line 53)
```javascript
<a href="https://discord.gg/YOUR_INVITE_CODE" ...>
```
**Change to:**
```javascript
<a href="https://discord.gg/syncplay123" ...>
```

---

### **2. src/pages/Home.js** (Line 85)
```javascript
<a href="https://discord.gg/YOUR_INVITE_CODE" ...>
```
**Change to:**
```javascript
<a href="https://discord.gg/syncplay123" ...>
```

---

### **3. src/components/Footer.js** (Line 58)
```javascript
<a href="https://discord.gg/YOUR_INVITE_CODE" ...>
```
**Change to:**
```javascript
<a href="https://discord.gg/syncplay123" ...>
```

---

## 🔎 QUICK FIND & REPLACE

**Option 1: Manual**
- Open each file
- Find: `YOUR_INVITE_CODE`
- Replace with your actual code

**Option 2: Terminal (All at once)**
```bash
# Replace YOUR_INVITE_CODE with your actual Discord code (e.g., syncplay123)
cd /Users/mac/Documents/GitHub/syncplay
grep -r "YOUR_INVITE_CODE" src/
# Then manually update in each file shown
```

---

## ✅ AFTER UPDATING

1. Save all 3 files
2. Restart dev server: `npm start`
3. Test Discord link on website
4. Verify it opens your Discord server

---

## 📱 ADD TO YOUR SOCIAL MEDIA BIOS

Once you have the link, add it to:
- Instagram bio
- TikTok bio
- X/Twitter bio
- YouTube channel description
- Facebook about section

**Example Bio:**
```
🎮 Nigeria's Premier eSports Platform
🏆 EA Sports FC 26 Tournaments
📅 First Event: Dec 20
💬 Join Discord: discord.gg/syncplay123
🔗 syncplay.co
```

---

## 🎉 THAT'S IT!

Your Discord will be fully integrated! 🚀

