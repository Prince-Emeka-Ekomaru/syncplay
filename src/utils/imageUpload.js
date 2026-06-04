import { supabase } from '../supabaseClient';

/**
 * Upload player photo to Supabase Storage
 * @param {File} file - The image file to upload
 * @param {string} teamName - Team name for folder organization
 * @param {string} playerNumber - 'player1' or 'player2'
 * @returns {Promise<string>} - URL of the uploaded image
 */
export async function uploadPlayerPhoto(file, teamName, playerNumber) {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('Image size must be less than 5MB');
    }

    // Sanitize team name for folder path
    const sanitizedTeamName = teamName
      .replace(/[^a-zA-Z0-9]/g, '-')
      .toLowerCase()
      .substring(0, 50);

    // Create unique filename with timestamp
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    const fileName = `${playerNumber}-${timestamp}.${fileExt}`;
    const filePath = `player-photos/${sanitizedTeamName}/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('tournament-assets') // Make sure this bucket exists in Supabase
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('tournament-assets')
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      throw new Error('Failed to get image URL');
    }

    return urlData.publicUrl;
  } catch (error) {
    console.error('Image upload error:', error);
    throw error;
  }
}

/**
 * Create a preview URL from a file (for display before upload)
 * @param {File} file - The image file
 * @returns {Promise<string>} - Data URL for preview
 */
export function createImagePreview(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
