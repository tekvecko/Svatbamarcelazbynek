import { db } from "./db";
import { photos, photoLikes, photoComments, playlistSongs, songLikes, weddingDetails, siteMetadata, weddingSchedule, cloudinaryPhotos, type Photo, type InsertPhoto, type PhotoComment, type PlaylistSong, type InsertPlaylistSong, type WeddingDetails, type InsertWeddingDetails, type UpdateWeddingDetails, type SiteMetadata, type InsertSiteMetadata, type UpdateSiteMetadata, type WeddingScheduleItem, type InsertWeddingScheduleItem, type UpdateWeddingScheduleItem, type CloudinaryPhoto, type InsertCloudinaryPhoto } from "@shared/schema";
import { eq, sql, desc, and, asc } from "drizzle-orm";

export interface IStorage {
  // Photo operations
  getPhotos(approved?: boolean): Promise<Photo[]>;
  getPhoto(id: number): Promise<Photo | undefined>;
  createPhoto(photo: InsertPhoto): Promise<Photo>;
  approvePhoto(id: number): Promise<void>;
  deletePhoto(id: number): Promise<void>;

  // Photo likes
  togglePhotoLike(photoId: number, userSession: string): Promise<{ liked: boolean; likes: number }>;

  // Photo comments
  getPhotoComments(photoId: number): Promise<PhotoComment[]>;
  addPhotoComment(photoId: number, author: string, text: string): Promise<PhotoComment>;

  // Playlist operations
  getPlaylistSongs(): Promise<PlaylistSong[]>;
  createPlaylistSong(song: InsertPlaylistSong): Promise<PlaylistSong>;
  toggleSongLike(songId: number, userSession: string): Promise<{ liked: boolean; likes: number }>;
  deletePlaylistSong(id: number): Promise<void>;

  // Wedding details
  getWeddingDetails(): Promise<WeddingDetails | undefined>;
  updateWeddingDetails(details: UpdateWeddingDetails): Promise<WeddingDetails>;
  createWeddingDetails(details: InsertWeddingDetails): Promise<WeddingDetails>;

  // Site metadata
  getSiteMetadata(key?: string): Promise<SiteMetadata[]>;
  getSiteMetadataByKey(key: string): Promise<SiteMetadata | undefined>;
  setSiteMetadata(metadata: InsertSiteMetadata): Promise<SiteMetadata>;
  updateSiteMetadata(key: string, updates: UpdateSiteMetadata): Promise<SiteMetadata>;
  deleteSiteMetadata(key: string): Promise<void>;

  // Wedding schedule
  getWeddingSchedule(): Promise<WeddingScheduleItem[]>;
  createWeddingScheduleItem(item: InsertWeddingScheduleItem): Promise<WeddingScheduleItem>;
  updateWeddingScheduleItem(id: number, updates: UpdateWeddingScheduleItem): Promise<WeddingScheduleItem>;
  deleteWeddingScheduleItem(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getPhotos(approved?: boolean): Promise<Photo[]> {
    // First get photos
    let photosQuery = db.select().from(photos).orderBy(desc(photos.uploadedAt));
    
    if (approved !== undefined) {
      photosQuery = photosQuery.where(eq(photos.approved, approved)) as any;
    }

    const photoResults = await photosQuery;
    
    // Then add comment counts
    const photosWithCounts = await Promise.all(
      photoResults.map(async (photo) => {
        const commentCountResult = await db
          .select({ count: sql<number>`COUNT(*)::int` })
          .from(photoComments)
          .where(eq(photoComments.photoId, photo.id));
        
        return {
          ...photo,
          commentCount: commentCountResult[0]?.count || 0
        };
      })
    );

    return photosWithCounts;
  }

  async getPhoto(id: number): Promise<Photo | undefined> {
    const [photo] = await db.select().from(photos).where(eq(photos.id, id));
    return photo;
  }

  async createPhoto(photo: InsertPhoto): Promise<Photo> {
    const [newPhoto] = await db.insert(photos).values(photo).returning();
    return newPhoto;
  }

  async approvePhoto(id: number): Promise<void> {
    await db.update(photos).set({ approved: true }).where(eq(photos.id, id));
  }

  async deletePhoto(id: number): Promise<void> {
    // Get photo to extract Cloudinary public_id
    const [photo] = await db.select().from(photos).where(eq(photos.id, id));

    if (photo && photo.filename) {
      try {
        // Delete from Cloudinary if it's a Cloudinary image
        if (!photo.url.includes('unsplash.com')) {
          const cloudinary = (await import('./cloudinary')).default;
          await cloudinary.uploader.destroy(photo.filename);
        }
      } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
      }
    }

    await db.delete(photoLikes).where(eq(photoLikes.photoId, id));
    await db.delete(photoComments).where(eq(photoComments.photoId, id));
    await db.delete(photos).where(eq(photos.id, id));
  }

  async getPhotoComments(photoId: number): Promise<PhotoComment[]> {
    return await db.select().from(photoComments)
      .where(eq(photoComments.photoId, photoId))
      .orderBy(photoComments.createdAt);
  }

  async addPhotoComment(photoId: number, author: string, text: string): Promise<PhotoComment> {
    const [comment] = await db.insert(photoComments)
      .values({ photoId, author, text })
      .returning();
    return comment;
  }

  async togglePhotoLike(photoId: number, userSession: string): Promise<{ liked: boolean; likes: number }> {
    const [existingLike] = await db
      .select()
      .from(photoLikes)
      .where(and(eq(photoLikes.photoId, photoId), eq(photoLikes.userSession, userSession)));

    if (existingLike) {
      // Remove like
      await db.delete(photoLikes).where(eq(photoLikes.id, existingLike.id));
      await db
        .update(photos)
        .set({ likes: sql`${photos.likes} - 1` })
        .where(eq(photos.id, photoId));

      const [photo] = await db.select().from(photos).where(eq(photos.id, photoId));
      return { liked: false, likes: photo.likes };
    } else {
      // Add like
      await db.insert(photoLikes).values({ photoId, userSession });
      await db
        .update(photos)
        .set({ likes: sql`${photos.likes} + 1` })
        .where(eq(photos.id, photoId));

      const [photo] = await db.select().from(photos).where(eq(photos.id, photoId));
      return { liked: true, likes: photo.likes };
    }
  }

  async getPlaylistSongs(): Promise<PlaylistSong[]> {
    return await db.select().from(playlistSongs).where(eq(playlistSongs.approved, true)).orderBy(desc(playlistSongs.submittedAt));
  }

  async createPlaylistSong(song: InsertPlaylistSong): Promise<PlaylistSong> {
    const [newSong] = await db.insert(playlistSongs).values(song).returning();
    return newSong;
  }

  async toggleSongLike(songId: number, userSession: string): Promise<{ liked: boolean; likes: number }> {
    const [existingLike] = await db
      .select()
      .from(songLikes)
      .where(and(eq(songLikes.songId, songId), eq(songLikes.userSession, userSession)));

    if (existingLike) {
      // Remove like
      await db.delete(songLikes).where(eq(songLikes.id, existingLike.id));
      await db
        .update(playlistSongs)
        .set({ likes: sql`${playlistSongs.likes} - 1` })
        .where(eq(playlistSongs.id, songId));

      const [song] = await db.select().from(playlistSongs).where(eq(playlistSongs.id, songId));
      return { liked: false, likes: song.likes };
    } else {
      // Add like
      await db.insert(songLikes).values({ songId, userSession });
      await db
        .update(playlistSongs)
        .set({ likes: sql`${playlistSongs.likes} + 1` })
        .where(eq(playlistSongs.id, songId));

      const [song] = await db.select().from(playlistSongs).where(eq(playlistSongs.id, songId));
      return { liked: true, likes: song.likes };
    }
  }

  async deletePlaylistSong(id: number): Promise<void> {
    await db.delete(songLikes).where(eq(songLikes.songId, id));
    await db.delete(playlistSongs).where(eq(playlistSongs.id, id));
  }

  async getWeddingDetails(): Promise<WeddingDetails | undefined> {
    const [details] = await db.select().from(weddingDetails).limit(1);
    return details;
  }

  async updateWeddingDetails(details: UpdateWeddingDetails): Promise<WeddingDetails> {
    const [updated] = await db
      .update(weddingDetails)
      .set({ ...details, updatedAt: new Date() })
      .returning();

    if (!updated) {
      throw new Error("Wedding details not found");
    }

    return updated;
  }

  async createWeddingDetails(details: InsertWeddingDetails): Promise<WeddingDetails> {
    const [newDetails] = await db.insert(weddingDetails).values(details).returning();
    return newDetails;
  }

  // Site metadata methods
  async getSiteMetadata(key?: string): Promise<SiteMetadata[]> {
    let query = db.select().from(siteMetadata);

    if (key) {
      query = query.where(eq(siteMetadata.metaKey, key)) as any;
    }

    return await query;
  }

  async getSiteMetadataByKey(key: string): Promise<SiteMetadata | undefined> {
    const [metadata] = await db.select().from(siteMetadata).where(eq(siteMetadata.metaKey, key));
    return metadata;
  }

  async setSiteMetadata(metadata: InsertSiteMetadata): Promise<SiteMetadata> {
    const existing = await this.getSiteMetadataByKey(metadata.metaKey);

    if (existing) {
      // Update existing metadata
      const [updated] = await db
        .update(siteMetadata)
        .set({ ...metadata, updatedAt: new Date() })
        .where(eq(siteMetadata.metaKey, metadata.metaKey))
        .returning();
      return updated;
    } else {
      // Create new metadata
      const [newMetadata] = await db.insert(siteMetadata).values(metadata).returning();
      return newMetadata;
    }
  }

  async updateSiteMetadata(key: string, updates: UpdateSiteMetadata): Promise<SiteMetadata> {
    const [updated] = await db
      .update(siteMetadata)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(siteMetadata.metaKey, key))
      .returning();

    if (!updated) {
      throw new Error(`Site metadata with key '${key}' not found`);
    }

    return updated;
  }

  async deleteSiteMetadata(key: string): Promise<void> {
    await db.delete(siteMetadata).where(eq(siteMetadata.metaKey, key));
  }

  async getWeddingSchedule(): Promise<WeddingScheduleItem[]> {
    return await db.select().from(weddingSchedule)
      .where(eq(weddingSchedule.isActive, true))
      .orderBy(asc(weddingSchedule.orderIndex));
  }

  async createWeddingScheduleItem(item: InsertWeddingScheduleItem): Promise<WeddingScheduleItem> {
    const [newItem] = await db.insert(weddingSchedule).values(item).returning();
    return newItem;
  }

  async updateWeddingScheduleItem(id: number, updates: UpdateWeddingScheduleItem): Promise<WeddingScheduleItem> {
    const [updatedItem] = await db.update(weddingSchedule)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(weddingSchedule.id, id))
      .returning();
    return updatedItem;
  }

  async deleteWeddingScheduleItem(id: number): Promise<void> {
    await db.delete(weddingSchedule).where(eq(weddingSchedule.id, id));
  }
}

export const storage = new DatabaseStorage();