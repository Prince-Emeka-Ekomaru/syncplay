# 🔧 How to Run SQL Schema in Supabase

## ✅ **FIXED: Schema is now safe to run multiple times!**

The error you got was because policies already existed. I've updated the schema to handle this.

---

## 🚀 **Run the Schema (Updated Version)**

### **Step 1: Go to Supabase Dashboard**
```
https://supabase.com/dashboard/project/yzoqnqubnwoijrwtdroj
```

### **Step 2: Open SQL Editor**
1. Click **"SQL Editor"** in left sidebar
2. Click **"New Query"**

### **Step 3: Copy & Paste Schema**
1. Open `supabase_schema.sql` file
2. Select ALL (Cmd + A)
3. Copy (Cmd + C)
4. Paste in Supabase SQL Editor (Cmd + V)

### **Step 4: Run It!**
1. Click **"Run"** button (or press Cmd + Enter)
2. Should see: ✅ **Success! No more errors!**

---

## ✅ **What Changed**

### **Before (Would Error on 2nd Run):**
```sql
CREATE POLICY "Allow anonymous insert"...
-- ❌ Error if policy exists
```

### **After (Safe to Run Multiple Times):**
```sql
DROP POLICY IF EXISTS "Allow anonymous insert"...
CREATE POLICY "Allow anonymous insert"...
-- ✅ Always works!
```

---

## 🎯 **What the Schema Does**

### **1. Creates Table (if not exists)**
- `registrations` table with all fields

### **2. Adds New Columns (if not exists)**
- `player1_tournament_id`
- `player2_tournament_id`

### **3. Creates Indexes**
- For faster database queries

### **4. Sets Up Security**
- Row Level Security (RLS)
- Anonymous can INSERT (register)
- Anonymous can SELECT (check slots)
- Authenticated users can do everything (admin)

### **5. Creates Triggers**
- Auto-update `updated_at` timestamp
- Auto-generate Tournament Player IDs

---

## 📊 **Expected Output**

After running, you should see in Supabase:

### **Tables:**
```
✅ registrations (with all columns including tournament IDs)
```

### **Indexes:**
```
✅ idx_payment_reference
✅ idx_tournament_id
✅ idx_payment_status
✅ idx_created_at
```

### **Policies:**
```
✅ Allow anonymous insert
✅ Allow anonymous select
✅ Allow authenticated full access
```

### **Triggers:**
```
✅ update_registrations_updated_at
✅ assign_tournament_player_ids
```

### **Views:**
```
✅ registration_summary
```

---

## 🧪 **Test It Works**

### **Method 1: Quick Test**
1. In Supabase SQL Editor, run:
```sql
SELECT * FROM registrations;
```
2. Should return empty table (or existing registrations)
3. No errors = ✅ Working!

### **Method 2: Check Table Structure**
1. Go to **"Table Editor"** in Supabase
2. Click **"registrations"** table
3. Should see all columns including:
   - `player1_tournament_id`
   - `player2_tournament_id`

### **Method 3: Test from Your App**
1. Restart your dev server: `npm start`
2. Visit: `http://localhost:3001/register`
3. Should see: **"X/32 Teams Available"**
4. No errors in console = ✅ Working!

---

## 🔧 **Troubleshooting**

### **Error: "relation registrations already exists"**
✅ **This is fine!** The schema handles it with `CREATE TABLE IF NOT EXISTS`

### **Error: "policy already exists"**
✅ **Fixed!** New schema drops existing policies first

### **Error: "column already exists"**
✅ **Fixed!** New schema checks if column exists before adding

### **Error: "trigger already exists"**
✅ **Fixed!** New schema drops existing triggers first

---

## 📝 **Summary**

**You can now run the schema as many times as you want!**

```sql
-- Run once: ✅ Creates everything
-- Run again: ✅ Updates safely
-- Run 100 times: ✅ No errors!
```

---

## 🎉 **Next Steps**

After running the schema successfully:

1. ✅ Check Supabase Table Editor (should see `registrations` table)
2. ✅ Restart your dev server (`npm start`)
3. ✅ Test registration page (`http://localhost:3001/register`)
4. ✅ Test admin dashboard (`http://localhost:3001/admin/registrations`)

---

**Ready to run it? Go ahead! 🚀**

