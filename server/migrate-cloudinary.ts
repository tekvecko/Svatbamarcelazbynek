
import { storage } from "./storage";
import cloudinary from "./cloudinary";

async function migrateCloudinaryPhotos() {
  try {
    console.log("🔍 Fetching photos from Cloudinary...");
    
    // Fetch all photos from the wedding-photos folder
    const result = await cloudinary.search
      .expression('folder:wedding-photos')
      .sort_by([['created_at', 'desc']])
      .max_results(500)
      .execute();
    
    console.log(`📸 Found ${result.resources.length} photos in Cloudinary`);
    
    if (result.resources.length > 0) {
      console.log("💾 Syncing photos to database...");
      const syncedPhotos = await storage.syncCloudinaryPhotos(result.resources);
      console.log(`✅ Successfully synced ${syncedPhotos.length} photos`);
    } else {
      console.log("ℹ️  No photos found to sync");
    }
    
  } catch (error) {
    console.error("❌ Error migrating Cloudinary photos:", error);
  }
}

// Run migration
migrateCloudinaryPhotos();
