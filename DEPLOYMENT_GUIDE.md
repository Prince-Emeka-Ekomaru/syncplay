# 🚀 syncplay eSports - Complete Deployment Guide

**Date:** October 25, 2025  
**Status:** Ready to Deploy!

---

## ✅ STEP 1: CREATE GITHUB REPOSITORY (5 minutes)

### **Option A: Using GitHub Website** (Easiest)

1. **Go to GitHub:**
   - Visit: https://github.com/new
   - (If not logged in, log in first)

2. **Create New Repository:**
   ```
   Repository name: syncplay
   Description: Nigeria's Premier eSports Platform - EA Sports FC 26 & eBasketball Tournaments
   Visibility: Public (or Private if you prefer)
   
   ❌ DON'T initialize with README (we already have code)
   ❌ DON'T add .gitignore (we already have one)
   ❌ DON'T add license yet
   ```

3. **Click "Create repository"**

4. **Copy the commands shown** (they'll look like this):
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/syncplay.git
   git branch -M main
   git push -u origin main
   ```

---

### **Option B: Using GitHub CLI** (If you have it)

```bash
gh repo create syncplay --public --source=. --remote=origin --push
```

---

## ✅ STEP 2: PUSH TO GITHUB

Once you've created the repository on GitHub, run these commands:

```bash
cd /Users/mac/Documents/GitHub/syncplay

# Add GitHub as remote (use your actual GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/syncplay.git

# Rename branch to main (if not already)
git branch -M main

# Push to GitHub
git push -u origin main
```

**You'll be prompted for:**
- GitHub username
- Personal Access Token (or password if 2FA not enabled)

---

## ✅ STEP 3: DEPLOY TO VERCEL (10 minutes)

### **Why Vercel?**
- ✅ FREE for personal projects
- ✅ Automatic deployments from GitHub
- ✅ Built-in SSL/HTTPS
- ✅ Global CDN
- ✅ Perfect for React apps
- ✅ Easy environment variables

---

### **3.1: Sign Up for Vercel**

1. Go to: https://vercel.com/signup
2. Click **"Continue with GitHub"** (easiest!)
3. Authorize Vercel to access your GitHub
4. Complete signup

---

### **3.2: Import Your Project**

1. **From Vercel Dashboard:**
   - Click **"Add New..."** → **"Project"**
   - Click **"Import"** next to your `syncplay` repository

2. **Configure Project:**
   ```
   Project Name: syncplay
   Framework Preset: Create React App (auto-detected)
   Root Directory: ./
   Build Command: npm run build (auto-filled)
   Output Directory: build (auto-filled)
   Install Command: npm install (auto-filled)
   ```

3. **Click "Deploy"** (Don't add env vars yet!)

---

### **3.3: Add Environment Variables**

⚠️ **IMPORTANT:** After first deployment completes:

1. Go to your project on Vercel
2. Click **"Settings"** → **"Environment Variables"**
3. Add these variables:

**Variable 1:**
```
Name:  REACT_APP_PAYSTACK_PUBLIC_KEY
Value: pk_test_8feb288b3a38f66acf10ba6803ff9c6bad09e10a
```
**⚠️ NOTE:** This is TEST key. Switch to LIVE key before real launch!

**Variable 2:**
```
Name:  REACT_APP_SUPABASE_URL
Value: https://yzoqnqubnwoijrwtdroj.supabase.co
```

**Variable 3:**
```
Name:  REACT_APP_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6b3FucXVibndvaWpyd3Rkcm9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMzAxNjYsImV4cCI6MjA3NjkwNjE2Nn0.6D9GhIhDjk8v5SZ0JanKGmALoE9NISUqwS0y2SUCCyU
```

4. **Click "Save"**
5. Go to **"Deployments"** tab
6. Click the **"..."** menu on latest deployment
7. Click **"Redeploy"**

---

### **3.4: Your Site is Live!**

Vercel will give you a URL like:
```
https://syncplay.vercel.app
```

**Test it immediately!**
- Visit the site
- Click through all pages
- Test a registration (use test card)
- Check all social links

---

## ✅ STEP 4: CONFIGURE CUSTOM DOMAIN (5 minutes)

### **4.1: Get syncplay.co DNS Settings from Vercel**

1. In Vercel project settings
2. Click **"Domains"**
3. Enter: `syncplay.co`
4. Click **"Add"**
5. Vercel will show you DNS records:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

---

### **4.2: Update Your Domain Provider**

1. Go to where you bought `syncplay.co` (e.g., Namecheap, GoDaddy, Qservers)
2. Find **DNS settings** or **Name servers**
3. Add the DNS records Vercel provided
4. Save changes

**DNS propagation takes 5 minutes to 48 hours** (usually ~30 minutes)

---

### **4.3: Verify Domain**

1. Wait 30 minutes
2. Visit: https://syncplay.co
3. Should redirect to your site! ✅
4. SSL automatically enabled by Vercel

---

## ⚠️ CRITICAL: SWITCH TO PAYSTACK LIVE KEY

### **Before Accepting Real Payments:**

**Current (TEST):**
```
pk_test_8feb288b3a38f66acf10ba6803ff9c6bad09e10a
```

**Need (LIVE):**
```
pk_live_XXXXXXXXXXXXXXXXXXXXX
```

---

### **How to Get Live Key:**

1. **Go to Paystack Dashboard:**
   - https://dashboard.paystack.com/settings/developer

2. **Switch to "LIVE" mode** (toggle at top)

3. **Copy "Public Key"**

4. **Update in Vercel:**
   - Settings → Environment Variables
   - Edit `REACT_APP_PAYSTACK_PUBLIC_KEY`
   - Paste live key
   - Save
   - Redeploy

---

### **⚠️ WHEN TO SWITCH:**

**USE TEST KEY:** 
- ✅ During development
- ✅ Testing registration flow
- ✅ Before official launch

**USE LIVE KEY:**
- ✅ November 1st launch
- ✅ When accepting real registrations
- ✅ Real money transactions

---

## ✅ STEP 5: TEST PRODUCTION SITE

### **Full Testing Checklist:**

**Navigation:**
- [ ] Visit homepage
- [ ] Click all navbar links
- [ ] Test mobile menu
- [ ] Test language selector
- [ ] Test tournament dropdown
- [ ] Check social sidebar links

**Pages:**
- [ ] Home - All sections load
- [ ] Events - 2v2 tournament shows
- [ ] Tournaments - All cards display
- [ ] Register - Form works
- [ ] News - Articles load
- [ ] Contact - Form validates
- [ ] Players - "Coming soon" shows
- [ ] Comparison - "Coming soon" shows
- [ ] Privacy - Content readable
- [ ] Terms - Content readable
- [ ] Tournament Rules - Content readable

**Functionality:**
- [ ] Registration form (all 4 steps)
- [ ] Paystack payment modal opens
- [ ] After payment, redirects to home
- [ ] Admin panel accessible: /admin/registrations
- [ ] Slot counter updates
- [ ] Language switching works

**Social Links:**
- [ ] Instagram: https://www.instagram.com/syncplay_esports/
- [ ] YouTube: https://www.youtube.com/@syncplayEsports
- [ ] TikTok: https://www.tiktok.com/@syncplay_esport
- [ ] X/Twitter: https://x.com/SyncplayEsport
- [ ] Discord: https://discord.gg/utstb8rGgM
- [ ] All links open correct pages

**Mobile:**
- [ ] Test on iPhone
- [ ] Test on Android
- [ ] All buttons tappable
- [ ] Text readable
- [ ] Payment works

---

## 🎯 POST-DEPLOYMENT CHECKLIST

### **Immediate (Today):**
- [ ] Test registration with test card
- [ ] Verify email confirmations sent
- [ ] Check admin dashboard shows registrations
- [ ] Test all social media links
- [ ] Share site with 2-3 friends for feedback

### **Before Launch (Oct 26-31):**
- [ ] Add profile pictures to all social accounts
- [ ] Update bios with Discord link
- [ ] Create launch graphics
- [ ] Schedule launch posts
- [ ] Switch to Paystack LIVE key
- [ ] Do final test registration with real card (₦100)

### **Launch Day (Nov 1):**
- [ ] Post across all platforms at 10 AM
- [ ] Monitor registrations hourly
- [ ] Respond to all inquiries within 2 hours
- [ ] Engage with comments
- [ ] Share registration milestones

---

## 🔧 TROUBLESHOOTING

### **Issue: Site not loading**
**Solution:**
- Check Vercel deployment status
- View deployment logs for errors
- Verify environment variables are set
- Clear browser cache

---

### **Issue: Payment not working**
**Solution:**
- Check Paystack key is correct
- Verify you're using test key for testing
- Check browser console for errors
- Test in incognito mode

---

### **Issue: Database not saving**
**Solution:**
- Verify Supabase URL is correct
- Check Supabase anon key is correct
- Go to Supabase dashboard → check table exists
- View browser console for errors

---

### **Issue: Domain not working**
**Solution:**
- Wait 30 minutes (DNS propagation)
- Check DNS records are correct
- Verify domain is active
- Try clearing DNS cache

---

## 📊 DEPLOYMENT CHECKLIST

```
✅ Git initialized
✅ Code committed
⏳ GitHub repository created          ← DO NOW
⏳ Code pushed to GitHub               ← DO NOW
⏳ Vercel account created              ← DO NOW
⏳ Project deployed to Vercel          ← DO NOW
⏳ Environment variables added         ← DO NOW
⏳ Production tested                   ← DO NOW
⏳ Custom domain configured            ← DO LATER
⏳ Paystack LIVE key (before Nov 1)   ← DO BEFORE LAUNCH
```

---

## 🎯 QUICK COMMANDS

### **If you make changes later:**

```bash
cd /Users/mac/Documents/GitHub/syncplay

# Stage changes
git add .

# Commit changes
git commit -m "Description of changes"

# Push to GitHub (auto-deploys to Vercel!)
git push origin main
```

**Vercel automatically redeploys when you push to GitHub!** 🚀

---

## 🔗 USEFUL LINKS

### **Your Links (After Deployment):**
- **Production Site:** https://syncplay.vercel.app (temporary)
- **Custom Domain:** https://syncplay.co (after DNS setup)
- **Admin Panel:** https://syncplay.co/admin/registrations
- **GitHub Repo:** https://github.com/YOUR_USERNAME/syncplay
- **Vercel Dashboard:** https://vercel.com/dashboard

### **Service Dashboards:**
- **Vercel:** https://vercel.com/dashboard
- **GitHub:** https://github.com
- **Paystack:** https://dashboard.paystack.com
- **Supabase:** https://supabase.com/dashboard

---

## ✅ YOU'RE ALMOST LIVE!

**What you've done:**
✅ Built complete platform  
✅ Set up database & payments  
✅ Created social media accounts  
✅ Committed code to git  

**What's left:**
⏳ Push to GitHub (5 min)  
⏳ Deploy to Vercel (10 min)  
⏳ Test production (10 min)  

**Total time: ~25 minutes to be LIVE! 🚀**

---

## 🎉 AFTER DEPLOYMENT

Once deployed, you'll have:
- ✅ Live website at syncplay.vercel.app
- ✅ Automatic deployments (push to GitHub = auto-deploy!)
- ✅ SSL/HTTPS enabled
- ✅ Global CDN for fast loading
- ✅ Ready to accept registrations
- ✅ Ready for November 1st launch!

---

**LET'S DO THIS! 🚀**

Follow the steps above and you'll be live in minutes!

**Questions? I'm here to help! 💪**

