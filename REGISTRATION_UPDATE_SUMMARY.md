# Registration Flow Update Summary

## ✅ Changes Completed

### 1. **Database Schema Update**
- Created `supabase_add_player_photos.sql` to add `player1_photo_url` and `player2_photo_url` columns
- **Action Required:** Run this SQL script in Supabase SQL Editor

### 2. **Image Upload Functionality**
- Created `src/utils/imageUpload.js` with functions to:
  - Upload player photos to Supabase Storage
  - Create image previews before upload
  - Validate file types and sizes (max 5MB)

### 3. **Registration Form Updates**
- Added professional photo upload fields for both Player 1 and Player 2
- Added photo preview functionality
- Added photo validation (required field)
- Updated form state to include photo data
- Photos are uploaded before payment processing

### 4. **Review Step Enhancement**
- Added photo display in review step
- Shows uploaded photos for both players before final submission

### 5. **Second Edition Updates**
- Updated tournament date from "December 20, 2025" to "Saturday, May 23, 2026"
- Updated tournament_id from `'2v2-nov-2025'` to `'2v2-may-2026'`
- Updated references from "inaugural tournament" to "May 2026 tournament" or "Second Edition"
- Updated success message to reflect May 2026 date

### 6. **Team Name Tracking**
- Team names are already tracked in the database via `team_name` field
- Team names are used for organizing photos in storage (folder structure)

### 7. **Database Integration**
- Updated `supabaseClient.js` to save photo URLs to database
- Photos are stored with team name-based folder structure

## 🔧 Setup Required in Supabase

### Step 1: Run SQL Migration
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `supabase_add_player_photos.sql`
3. Run the SQL script

### Step 2: Create Storage Bucket
1. Go to Supabase Dashboard → Storage
2. Create a new bucket named: `tournament-assets`
3. Set bucket to **Public** (for public access to photos)
4. Configure bucket policies:
   - **Insert Policy:** Allow anonymous users to upload
   - **Select Policy:** Allow public read access

### Step 3: Storage Bucket Policies (SQL)
Run this in SQL Editor after creating the bucket:

```sql
-- Allow anonymous uploads to player-photos folder
CREATE POLICY "Allow anonymous uploads"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'tournament-assets' AND (storage.foldername(name))[1] = 'player-photos');

-- Allow public read access
CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'tournament-assets');
```

## 📋 Features Added

### Photo Upload
- **File Types:** JPG, PNG (any image format)
- **Max Size:** 5MB per photo
- **Storage Location:** `tournament-assets/player-photos/{team-name}/{player-number}-{timestamp}.{ext}`
- **Validation:** Required field for both players
- **Preview:** Shows preview before upload

### Form Flow
1. **Step 1:** Team Name
2. **Step 2:** Player 1 Info + **Professional Photo**
3. **Step 3:** Player 2 Info + **Professional Photo**
4. **Step 4:** Review (shows photos) + Payment
5. **Step 5:** Success

## 🎯 Key Updates

### Tournament Information
- **Tournament:** Second Edition - May 2026
- **Date:** Saturday, May 23, 2026
- **Tournament ID:** `2v2-may-2026`
- **Format:** 2v2 Teams (12 Teams, 24 Players)

### Team Name Tracking
- Team names are stored in `team_name` column
- Used for organizing photos in storage
- Displayed throughout the registration process

## ⚠️ Important Notes

1. **Storage Bucket:** Must be created before photo uploads will work
2. **Bucket Policies:** Must allow anonymous uploads for registration flow
3. **Photo URLs:** Stored in database after successful upload
4. **Error Handling:** If photo upload fails, payment is not processed

## 🚀 Testing Checklist

- [ ] Run SQL migration script
- [ ] Create `tournament-assets` storage bucket
- [ ] Set bucket policies (public read, anonymous upload)
- [ ] Test photo upload in registration form
- [ ] Verify photos appear in review step
- [ ] Verify photos are saved to database
- [ ] Verify photos are accessible via public URL
- [ ] Test with different image formats (JPG, PNG)
- [ ] Test file size validation (try >5MB file)
- [ ] Verify team name is used in folder structure
