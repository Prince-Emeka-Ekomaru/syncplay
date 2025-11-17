# 🚀 Supabase Setup Guide

## ✅ What's Been Done

Your syncplay eSports website now has:
- ✅ Supabase client integrated
- ✅ Registration form saves to database
- ✅ Real-time slot countdown (32 teams max)
- ✅ Admin dashboard to view registrations
- ✅ Export to CSV functionality
- ✅ Full registration tracking

---

## 🔧 Setup Steps (5 Minutes)

### Step 1: Create .env File

Create a file called `.env` in your project root (`/Users/mac/Documents/GitHub/syncplay/.env`):

```bash
# Paystack Configuration
REACT_APP_PAYSTACK_PUBLIC_KEY=pk_test_8feb288b3a38f66acf10ba6803ff9c6bad09e10a

# Supabase Configuration
REACT_APP_SUPABASE_URL=https://yzoqnqubnwoijrwtdroj.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6b3FucXVibndvaWpyd3Rkcm9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMzAxNjYsImV4cCI6MjA3NjkwNjE2Nn0.6D9GhIhDjk8v5SZ0JanKGmALoE9NISUqwS0y2SUCCyU
```

---

### Step 2: Run SQL Schema in Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `yzoqnqubnwoijrwtdroj`
3. Click on "SQL Editor" in the left sidebar
4. Click "New Query"
5. Copy and paste the entire contents of `supabase_schema.sql` (located in project root)
6. Click "Run" or press `Cmd + Enter`
7. You should see: ✅ Success message

---

### Step 3: Test the Setup

1. **Start your development server:**
   ```bash
   cd /Users/mac/Documents/GitHub/syncplay
   npm start
   ```

2. **Test registration:**
   - Go to: http://localhost:3000/register
   - You should see "32/32 Teams Available"
   - Fill out a test registration (use test payment on Paystack)
   - After payment, check if it saved

3. **View registrations (Admin):**
   - Go to: http://localhost:3000/admin/registrations
   - You should see your test registration

---

## 📊 Features You Now Have

### 1. Registration Page (`/register`)
- ✅ Real-time slot counter
- ✅ Shows "X/32 Teams Available"
- ✅ Warning when <= 10 slots left
- ✅ Automatically closes when full
- ✅ Saves to database after payment

### 2. Admin Dashboard (`/admin/registrations`)
- ✅ View all registrations in a table
- ✅ Search by team name, player, or email
- ✅ Sort by date or team name
- ✅ Export to CSV for Excel
- ✅ Live stats: teams, players, revenue
- ✅ Refresh button to check for new registrations

### 3. Slot Tracking
- ✅ Counts from 0 to 32 teams
- ✅ Real-time updates
- ✅ Shows remaining slots
- ✅ Prevents over-registration

---

## 🎯 Database Schema

Your `registrations` table includes:

**Team Info:**
- Team Name

**Player 1:**
- Name
- Email
- Phone
- Gamer Tag (PSN ID)
- Platform (PlayStation)

**Player 2:**
- Name
- Email
- Phone
- Gamer Tag (PSN ID)
- Platform (PlayStation)

**Payment:**
- Payment Reference (from Paystack)
- Payment Status (completed/pending/failed)
- Payment Amount (₦100,000)
- Payment Date

**Meta:**
- Registration Date
- Tournament ID (`2v2-nov-2025`)
- Status (active/cancelled/disqualified)

---

## 🔒 Security Features

✅ **Row Level Security (RLS)** enabled
✅ Anonymous users can INSERT and SELECT (for registration)
✅ Only authenticated users can UPDATE/DELETE (for admin)
✅ Secure API keys (anon key is public, secret key is private)

---

## 📱 How to Use

### For Public Users:
1. Visit `/register`
2. Fill out form
3. Pay ₦100,000 via Paystack
4. Data automatically saved to Supabase
5. Slots counter updates

### For You (Admin):
1. Visit `/admin/registrations`
2. View all registered teams
3. Search/sort/filter
4. Export CSV for tournament bracket
5. Contact players via email/phone

---

## 🚨 Important Notes

1. **Keep .env file SECRET**
   - Never commit to Git
   - Already added to .gitignore

2. **Admin Page is Public**
   - Currently `/admin/registrations` is accessible to anyone
   - For production, you should add password protection
   - We can add Supabase Auth later if needed

3. **Testing Payments**
   - Use Paystack test mode
   - Test Card: 4084 0840 8408 4081
   - Expiry: Any future date
   - CVV: 408

4. **Database Limits (Free Tier)**
   - 500 MB database
   - 2 GB bandwidth/month
   - Unlimited API requests
   - **Your 32 teams = ~100 KB (well within limits!)**

---

## 🎉 What Happens Now

### When Someone Registers:
1. User fills form → 4 steps
2. User clicks "Submit Registration"
3. Paystack popup opens → User pays ₦100,000
4. Payment succeeds → Paystack returns reference
5. **Your code saves to Supabase** ✅
6. Success page shown
7. Slot counter decrements

### When 32nd Team Registers:
1. Slot counter shows "0/32 Teams Available"
2. Registration form is disabled
3. Shows "Registration Full!" message
4. Offers waiting list option

---

## 🛠️ Troubleshooting

### "Error: supabaseUrl is required"
- **Fix**: Make sure .env file exists and is named exactly `.env`
- Restart your dev server after creating .env

### "Error saving registration"
- **Fix**: Check if SQL schema was run successfully
- Go to Supabase Dashboard → Table Editor → Should see "registrations" table

### "Slot counter shows 0"
- **Fix**: Check Supabase connection
- Open browser console → Should not see errors
- Check if REACT_APP_SUPABASE_URL is correct in .env

### "Admin page is blank"
- **Fix**: Check browser console for errors
- Make sure you ran the SQL schema
- Try refreshing the page

---

## 📞 Support

If you encounter issues:
1. Check browser console (F12)
2. Check Supabase Dashboard → Logs
3. Check if .env variables are loaded (console.log them)

---

## 🎯 Next Steps

After this works:

1. **Test with Real Data**
   - Register 2-3 test teams
   - Check admin dashboard
   - Export CSV

2. **Launch Marketing**
   - Share registration link
   - Monitor admin dashboard
   - Watch slots fill up!

3. **Future Enhancements** (After Dec 20)
   - Add authentication to admin page
   - Email confirmations (SendGrid/Mailgun)
   - SMS notifications
   - Live bracket display
   - Real-time match scoring

---

## ✅ Quick Checklist

Before going live:

- [ ] Created `.env` file with keys
- [ ] Ran `supabase_schema.sql` in Supabase
- [ ] Tested registration flow
- [ ] Verified data saves to database
- [ ] Checked admin dashboard works
- [ ] Tested CSV export
- [ ] Tested with Paystack test mode
- [ ] Ready to launch! 🚀

---

**Good luck with your tournament! 🏆**

