import { db } from "./db";
import { photos, photoLikes, photoComments, playlistSongs, songLikes, weddingDetails, siteMetadata, weddingSchedule, cloudinaryPhotos, photoEnhancements, aiCaptions, aiPlaylistSuggestions, aiWeddingAdvice, aiGuestMessages, aiWeddingStories, gameChallenges, gameParticipants, gameCompletions, gameAchievements, gameUserAchievements, gameLeaderboard, gameActivities, gameEvents, gameEventParticipants, type Photo, type InsertPhoto, type PhotoComment, type PlaylistSong, type InsertPlaylistSong, type WeddingDetails, type InsertWeddingDetails, type UpdateWeddingDetails, type SiteMetadata, type InsertSiteMetadata, type UpdateSiteMetadata, type WeddingScheduleItem, type InsertWeddingScheduleItem, type UpdateWeddingScheduleItem, type CloudinaryPhoto, type InsertCloudinaryPhoto, type PhotoEnhancement, type InsertPhotoEnhancement, type UpdatePhotoEnhancement, type AiCaption, type InsertAiCaption, type AiPlaylistSuggestion, type InsertAiPlaylistSuggestion, type AiWeddingAdvice, type InsertAiWeddingAdvice, type AiGuestMessage, type InsertAiGuestMessage, type AiWeddingStory, type InsertAiWeddingStory, type GameChallenge, type InsertGameChallenge, type GameParticipant, type InsertGameParticipant, type GameCompletion, type InsertGameCompletion, type GameAchievement, type GameUserAchievement, type GameLeaderboard, type GameActivity, type InsertGameActivity, type GameEvent, type InsertGameEvent, type GameEventParticipant } from "@shared/schema";
import { eq, sql, desc, and, asc } from "drizzle-orm";

export interface IStorage {
  // Photo operations
  getPhotos(approved?: boolean, limit?: number, offset?: number): Promise<Photo[]>;
  getPhotosCount(approved?: boolean): Promise<number>;
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

  // Cloudinary photos operations
  getCloudinaryPhotos(): Promise<CloudinaryPhoto[]>;
  syncCloudinaryPhotos(photos: any[]): Promise<CloudinaryPhoto[]>;
  toggleCloudinaryPhotoLike(photoId: number, userSession: string): Promise<{ liked: boolean; likes: number }>;

  // Photo enhancements
  getPhotoEnhancement(photoId: number): Promise<PhotoEnhancement | undefined>;
  createPhotoEnhancement(enhancement: InsertPhotoEnhancement): Promise<PhotoEnhancement>;
  updatePhotoEnhancement(id: number, updates: UpdatePhotoEnhancement): Promise<PhotoEnhancement>;
  deletePhotoEnhancement(photoId: number): Promise<void>;

  // AI Features
  getAiCaptions(photoId: number): Promise<AiCaption[]>;
  createAiCaption(caption: InsertAiCaption): Promise<AiCaption>;
  approveAiCaption(captionId: number): Promise<void>;
  deleteAiCaption(captionId: number): Promise<void>;

  getAiPlaylistSuggestions(): Promise<AiPlaylistSuggestion[]>;
  createAiPlaylistSuggestion(suggestion: InsertAiPlaylistSuggestion): Promise<AiPlaylistSuggestion>;
  approveAiPlaylistSuggestion(suggestionId: number): Promise<void>;
  deleteAiPlaylistSuggestion(suggestionId: number): Promise<void>;

  getAiWeddingAdvice(): Promise<AiWeddingAdvice[]>;
  createAiWeddingAdvice(advice: InsertAiWeddingAdvice): Promise<AiWeddingAdvice>;
  updateAiWeddingAdvice(adviceId: number, isVisible: boolean): Promise<void>;
  deleteAiWeddingAdvice(adviceId: number): Promise<void>;

  getAiGuestMessages(): Promise<AiGuestMessage[]>;
  createAiGuestMessage(message: InsertAiGuestMessage): Promise<AiGuestMessage>;
  approveAiGuestMessage(messageId: number): Promise<void>;
  deleteAiGuestMessage(messageId: number): Promise<void>;

  getAiWeddingStories(): Promise<AiWeddingStory[]>;
  createAiWeddingStory(story: InsertAiWeddingStory): Promise<AiWeddingStory>;
  publishAiWeddingStory(storyId: number): Promise<void>;
  deleteAiWeddingStory(storyId: number): Promise<void>;

  // Gamification Features
  // Game Participants
  getGameParticipant(userSession: string): Promise<GameParticipant | undefined>;
  createGameParticipant(participant: InsertGameParticipant): Promise<GameParticipant>;
  updateGameParticipant(id: number, updates: Partial<GameParticipant>): Promise<GameParticipant>;
  
  // Game Challenges
  getGameChallenges(isActive?: boolean): Promise<GameChallenge[]>;
  getGameChallenge(id: number): Promise<GameChallenge | undefined>;
  createGameChallenge(challenge: InsertGameChallenge): Promise<GameChallenge>;
  updateGameChallenge(id: number, updates: Partial<GameChallenge>): Promise<GameChallenge>;
  deleteGameChallenge(id: number): Promise<void>;
  
  // Game Completions
  getGameCompletions(participantId: number): Promise<GameCompletion[]>;
  createGameCompletion(completion: InsertGameCompletion): Promise<GameCompletion>;
  approveGameCompletion(completionId: number, approved: boolean, notes?: string): Promise<void>;
  
  // Game Achievements
  getGameAchievements(): Promise<GameAchievement[]>;
  getUserAchievements(participantId: number): Promise<GameUserAchievement[]>;
  unlockAchievement(participantId: number, achievementId: number): Promise<GameUserAchievement>;
  
  // Game Leaderboard
  getLeaderboard(category?: string, limit?: number): Promise<GameLeaderboard[]>;
  updateLeaderboard(): Promise<void>;
  
  // Game Activities
  createGameActivity(activity: InsertGameActivity): Promise<GameActivity>;
  getGameActivities(participantId?: number, limit?: number): Promise<GameActivity[]>;
  
  // Game Events
  getGameEvents(isActive?: boolean): Promise<GameEvent[]>;
  createGameEvent(event: InsertGameEvent): Promise<GameEvent>;
  joinGameEvent(eventId: number, participantId: number): Promise<GameEventParticipant>;
  updateEventScore(eventId: number, participantId: number, score: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getPhotos(approved?: boolean, limit?: number, offset?: number): Promise<Photo[]> {
    // First get photos with pagination
    let photosQuery = db.select().from(photos).orderBy(desc(photos.uploadedAt));

    if (approved !== undefined) {
      photosQuery = photosQuery.where(eq(photos.approved, approved)) as any;
    }

    if (limit !== undefined) {
      photosQuery = photosQuery.limit(limit) as any;
    }

    if (offset !== undefined) {
      photosQuery = photosQuery.offset(offset) as any;
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

  async getPhotosCount(approved?: boolean): Promise<number> {
    let countQuery = db.select({ count: sql<number>`COUNT(*)::int` }).from(photos);

    if (approved !== undefined) {
      countQuery = countQuery.where(eq(photos.approved, approved)) as any;
    }

    const result = await countQuery;
    return result[0]?.count || 0;
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
    // Use transaction to prevent race conditions
    return await db.transaction(async (tx) => {
      const [existingLike] = await tx
        .select()
        .from(photoLikes)
        .where(and(eq(photoLikes.photoId, photoId), eq(photoLikes.userSession, userSession)));

      if (existingLike) {
        // Remove like
        await tx.delete(photoLikes).where(eq(photoLikes.id, existingLike.id));
        await tx
          .update(photos)
          .set({ likes: sql`GREATEST(${photos.likes} - 1, 0)` }) // Prevent negative likes
          .where(eq(photos.id, photoId));

        const [photo] = await tx.select().from(photos).where(eq(photos.id, photoId));
        return { liked: false, likes: photo?.likes || 0 };
      } else {
        // Add like
        await tx.insert(photoLikes).values({ photoId, userSession });
        await tx
          .update(photos)
          .set({ likes: sql`${photos.likes} + 1` })
          .where(eq(photos.id, photoId));

        const [photo] = await tx.select().from(photos).where(eq(photos.id, photoId));
        return { liked: true, likes: photo?.likes || 1 };
      }
    });
  }

  async getPlaylistSongs(): Promise<PlaylistSong[]> {
    return await db.select().from(playlistSongs).where(eq(playlistSongs.approved, true)).orderBy(desc(playlistSongs.submittedAt));
  }

  async createPlaylistSong(song: InsertPlaylistSong): Promise<PlaylistSong> {
    const [newSong] = await db.insert(playlistSongs).values(song).returning();
    return newSong;
  }

  async toggleSongLike(songId: number, userSession: string): Promise<{ liked: boolean; likes: number }> {
    // Use transaction to prevent race conditions
    return await db.transaction(async (tx) => {
      const [existingLike] = await tx
        .select()
        .from(songLikes)
        .where(and(eq(songLikes.songId, songId), eq(songLikes.userSession, userSession)));

      if (existingLike) {
        // Remove like
        await tx.delete(songLikes).where(eq(songLikes.id, existingLike.id));
        await tx
          .update(playlistSongs)
          .set({ likes: sql`GREATEST(${playlistSongs.likes} - 1, 0)` }) // Prevent negative likes
          .where(eq(playlistSongs.id, songId));

        const [song] = await tx.select().from(playlistSongs).where(eq(playlistSongs.id, songId));
        return { liked: false, likes: song?.likes || 0 };
      } else {
        // Add like
        await tx.insert(songLikes).values({ songId, userSession });
        await tx
          .update(playlistSongs)
          .set({ likes: sql`${playlistSongs.likes} + 1` })
          .where(eq(playlistSongs.id, songId));

        const [song] = await tx.select().from(playlistSongs).where(eq(playlistSongs.id, songId));
        return { liked: true, likes: song?.likes || 1 };
      }
    });
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

  // Cloudinary photos implementation
  async getCloudinaryPhotos(): Promise<CloudinaryPhoto[]> {
    return await db.select().from(cloudinaryPhotos).orderBy(desc(cloudinaryPhotos.uploadedAt));
  }

  async syncCloudinaryPhotos(cloudinaryData: any[]): Promise<CloudinaryPhoto[]> {
    const syncedPhotos: CloudinaryPhoto[] = [];
    
    for (const cloudPhoto of cloudinaryData) {
      try {
        // Check if photo already exists
        const [existing] = await db.select().from(cloudinaryPhotos)
          .where(eq(cloudinaryPhotos.cloudinaryId, cloudPhoto.public_id));
        
        if (!existing) {
          const [newPhoto] = await db.insert(cloudinaryPhotos).values({
            cloudinaryId: cloudPhoto.public_id,
            cloudinaryUrl: cloudPhoto.secure_url,
            thumbnailUrl: cloudPhoto.secure_url.replace('/upload/', '/upload/c_thumb,w_300,h_300/'),
            originalName: cloudPhoto.filename || cloudPhoto.public_id,
            approved: true,
          }).returning();
          syncedPhotos.push(newPhoto);
        } else {
          syncedPhotos.push(existing);
        }
      } catch (error) {
        console.error('Error syncing photo:', cloudPhoto.public_id, error);
      }
    }
    
    return syncedPhotos;
  }

  async toggleCloudinaryPhotoLike(photoId: number, userSession: string): Promise<{ liked: boolean; likes: number }> {
    // Check if user has already liked this photo
    const [existingLike] = await db.select().from(photoLikes)
      .where(and(eq(photoLikes.photoId, photoId), eq(photoLikes.userSession, userSession)));

    if (existingLike) {
      // Unlike - remove the like
      await db.delete(photoLikes)
        .where(and(eq(photoLikes.photoId, photoId), eq(photoLikes.userSession, userSession)));
      
      // Decrement like count
      await db.update(cloudinaryPhotos)
        .set({ likes: sql`${cloudinaryPhotos.likes} - 1` })
        .where(eq(cloudinaryPhotos.id, photoId));

      const [photo] = await db.select().from(cloudinaryPhotos).where(eq(cloudinaryPhotos.id, photoId));
      return { liked: false, likes: photo?.likes || 0 };
    } else {
      // Like - add the like
      await db.insert(photoLikes).values({
        photoId,
        userSession,
      });
      
      // Increment like count
      await db.update(cloudinaryPhotos)
        .set({ likes: sql`${cloudinaryPhotos.likes} + 1` })
        .where(eq(cloudinaryPhotos.id, photoId));

      const [photo] = await db.select().from(cloudinaryPhotos).where(eq(cloudinaryPhotos.id, photoId));
      return { liked: true, likes: photo?.likes || 1 };
    }
  }

  // Photo enhancement methods
  async getPhotoEnhancement(photoId: number): Promise<PhotoEnhancement | undefined> {
    const [enhancement] = await db.select().from(photoEnhancements)
      .where(eq(photoEnhancements.photoId, photoId));
    return enhancement;
  }

  async createPhotoEnhancement(enhancement: InsertPhotoEnhancement): Promise<PhotoEnhancement> {
    const [newEnhancement] = await db.insert(photoEnhancements)
      .values(enhancement)
      .returning();
    return newEnhancement;
  }

  async updatePhotoEnhancement(id: number, updates: UpdatePhotoEnhancement): Promise<PhotoEnhancement> {
    const [updatedEnhancement] = await db.update(photoEnhancements)
      .set(updates)
      .where(eq(photoEnhancements.id, id))
      .returning();
    return updatedEnhancement;
  }

  async deletePhotoEnhancement(photoId: number): Promise<void> {
    await db.delete(photoEnhancements).where(eq(photoEnhancements.photoId, photoId));
  }

  // AI Features Implementation
  async getAiCaptions(photoId: number): Promise<AiCaption[]> {
    return await db.select().from(aiCaptions).where(eq(aiCaptions.photoId, photoId));
  }

  async createAiCaption(caption: InsertAiCaption): Promise<AiCaption> {
    const [newCaption] = await db.insert(aiCaptions).values(caption).returning();
    return newCaption;
  }

  async approveAiCaption(captionId: number): Promise<void> {
    await db.update(aiCaptions)
      .set({ isApproved: true })
      .where(eq(aiCaptions.id, captionId));
  }

  async deleteAiCaption(captionId: number): Promise<void> {
    await db.delete(aiCaptions).where(eq(aiCaptions.id, captionId));
  }

  async getAiPlaylistSuggestions(): Promise<AiPlaylistSuggestion[]> {
    return await db.select().from(aiPlaylistSuggestions).orderBy(aiPlaylistSuggestions.popularity);
  }

  async createAiPlaylistSuggestion(suggestion: InsertAiPlaylistSuggestion): Promise<AiPlaylistSuggestion> {
    const [newSuggestion] = await db.insert(aiPlaylistSuggestions).values(suggestion).returning();
    return newSuggestion;
  }

  async approveAiPlaylistSuggestion(suggestionId: number): Promise<void> {
    await db.update(aiPlaylistSuggestions)
      .set({ isApproved: true })
      .where(eq(aiPlaylistSuggestions.id, suggestionId));
  }

  async deleteAiPlaylistSuggestion(suggestionId: number): Promise<void> {
    await db.delete(aiPlaylistSuggestions).where(eq(aiPlaylistSuggestions.id, suggestionId));
  }

  async getAiWeddingAdvice(): Promise<AiWeddingAdvice[]> {
    return await db.select().from(aiWeddingAdvice)
      .where(eq(aiWeddingAdvice.isVisible, true))
      .orderBy(aiWeddingAdvice.priority);
  }

  async createAiWeddingAdvice(advice: InsertAiWeddingAdvice): Promise<AiWeddingAdvice> {
    const [newAdvice] = await db.insert(aiWeddingAdvice).values(advice).returning();
    return newAdvice;
  }

  async updateAiWeddingAdvice(adviceId: number, isVisible: boolean): Promise<void> {
    await db.update(aiWeddingAdvice)
      .set({ isVisible })
      .where(eq(aiWeddingAdvice.id, adviceId));
  }

  async deleteAiWeddingAdvice(adviceId: number): Promise<void> {
    await db.delete(aiWeddingAdvice).where(eq(aiWeddingAdvice.id, adviceId));
  }

  async getAiGuestMessages(): Promise<AiGuestMessage[]> {
    return await db.select().from(aiGuestMessages).orderBy(aiGuestMessages.createdAt);
  }

  async createAiGuestMessage(message: InsertAiGuestMessage): Promise<AiGuestMessage> {
    const [newMessage] = await db.insert(aiGuestMessages).values(message).returning();
    return newMessage;
  }

  async approveAiGuestMessage(messageId: number): Promise<void> {
    await db.update(aiGuestMessages)
      .set({ isApproved: true })
      .where(eq(aiGuestMessages.id, messageId));
  }

  async deleteAiGuestMessage(messageId: number): Promise<void> {
    await db.delete(aiGuestMessages).where(eq(aiGuestMessages.id, messageId));
  }

  async getAiWeddingStories(): Promise<AiWeddingStory[]> {
    return await db.select().from(aiWeddingStories).orderBy(aiWeddingStories.createdAt);
  }

  async createAiWeddingStory(story: InsertAiWeddingStory): Promise<AiWeddingStory> {
    const [newStory] = await db.insert(aiWeddingStories).values(story).returning();
    return newStory;
  }

  async publishAiWeddingStory(storyId: number): Promise<void> {
    await db.update(aiWeddingStories)
      .set({ isPublished: true })
      .where(eq(aiWeddingStories.id, storyId));
  }

  async deleteAiWeddingStory(storyId: number): Promise<void> {
    await db.delete(aiWeddingStories).where(eq(aiWeddingStories.id, storyId));
  }

  // Gamification Features Implementation

  // Game Participants
  async getGameParticipant(userSession: string): Promise<GameParticipant | undefined> {
    const [participant] = await db.select().from(gameParticipants)
      .where(eq(gameParticipants.userSession, userSession));
    return participant;
  }

  async createGameParticipant(participant: InsertGameParticipant): Promise<GameParticipant> {
    const [newParticipant] = await db.insert(gameParticipants).values(participant).returning();
    return newParticipant;
  }

  async updateGameParticipant(id: number, updates: Partial<GameParticipant>): Promise<GameParticipant> {
    const [updatedParticipant] = await db.update(gameParticipants)
      .set({ ...updates, lastActivity: new Date() })
      .where(eq(gameParticipants.id, id))
      .returning();
    return updatedParticipant;
  }

  // Game Challenges
  async getGameChallenges(isActive?: boolean): Promise<GameChallenge[]> {
    let query = db.select().from(gameChallenges).orderBy(asc(gameChallenges.difficultyLevel));
    
    if (isActive !== undefined) {
      query = query.where(eq(gameChallenges.isActive, isActive)) as any;
    }
    
    return await query;
  }

  async getGameChallenge(id: number): Promise<GameChallenge | undefined> {
    const [challenge] = await db.select().from(gameChallenges)
      .where(eq(gameChallenges.id, id));
    return challenge;
  }

  async createGameChallenge(challenge: InsertGameChallenge): Promise<GameChallenge> {
    const [newChallenge] = await db.insert(gameChallenges).values(challenge).returning();
    return newChallenge;
  }

  async updateGameChallenge(id: number, updates: Partial<GameChallenge>): Promise<GameChallenge> {
    const [updatedChallenge] = await db.update(gameChallenges)
      .set(updates)
      .where(eq(gameChallenges.id, id))
      .returning();
    return updatedChallenge;
  }

  async deleteGameChallenge(id: number): Promise<void> {
    await db.delete(gameChallenges).where(eq(gameChallenges.id, id));
  }

  // Game Completions
  async getGameCompletions(participantId: number): Promise<GameCompletion[]> {
    return await db.select().from(gameCompletions)
      .where(eq(gameCompletions.participantId, participantId))
      .orderBy(desc(gameCompletions.completedAt));
  }

  async createGameCompletion(completion: InsertGameCompletion): Promise<GameCompletion> {
    const [newCompletion] = await db.insert(gameCompletions).values(completion).returning();
    
    // Award points to participant
    await db.update(gameParticipants)
      .set({ 
        totalPoints: sql`total_points + ${completion.pointsEarned}`,
        experiencePoints: sql`experience_points + ${completion.pointsEarned}`,
        lastActivity: new Date()
      })
      .where(eq(gameParticipants.id, completion.participantId));

    return newCompletion;
  }

  async approveGameCompletion(completionId: number, approved: boolean, notes?: string): Promise<void> {
    await db.update(gameCompletions)
      .set({ 
        isApproved: approved,
        notes: notes,
        approvedAt: new Date()
      })
      .where(eq(gameCompletions.id, completionId));
  }

  // Game Achievements
  async getGameAchievements(): Promise<GameAchievement[]> {
    return await db.select().from(gameAchievements)
      .orderBy(asc(gameAchievements.category), asc(gameAchievements.pointsReward));
  }

  async getUserAchievements(participantId: number): Promise<GameUserAchievement[]> {
    return await db.select().from(gameUserAchievements)
      .where(eq(gameUserAchievements.participantId, participantId))
      .orderBy(desc(gameUserAchievements.earnedAt));
  }

  async unlockAchievement(participantId: number, achievementId: number): Promise<GameUserAchievement> {
    // Check if already unlocked
    const existing = await db.select().from(gameUserAchievements)
      .where(and(
        eq(gameUserAchievements.participantId, participantId),
        eq(gameUserAchievements.achievementId, achievementId)
      ));

    if (existing.length > 0) {
      return existing[0];
    }

    // Get achievement details for points
    const [achievement] = await db.select().from(gameAchievements)
      .where(eq(gameAchievements.id, achievementId));

    // Unlock achievement
    const [newAchievement] = await db.insert(gameUserAchievements)
      .values({ participantId, achievementId })
      .returning();

    // Award bonus points
    if (achievement && achievement.pointsReward > 0) {
      await db.update(gameParticipants)
        .set({ 
          totalPoints: sql`total_points + ${achievement.pointsReward}`,
          experiencePoints: sql`experience_points + ${achievement.pointsReward}`,
          lastActivity: new Date()
        })
        .where(eq(gameParticipants.id, participantId));
    }

    return newAchievement;
  }

  // Game Leaderboard
  async getLeaderboard(category: string = 'overall', limit: number = 10): Promise<GameLeaderboard[]> {
    return await db.select().from(gameLeaderboard)
      .where(eq(gameLeaderboard.category, category))
      .orderBy(asc(gameLeaderboard.rank))
      .limit(limit);
  }

  async updateLeaderboard(): Promise<void> {
    // Update overall leaderboard
    const participants = await db.select({
      id: gameParticipants.id,
      totalPoints: gameParticipants.totalPoints
    }).from(gameParticipants)
      .orderBy(desc(gameParticipants.totalPoints));

    // Clear existing leaderboard for overall category
    await db.delete(gameLeaderboard).where(eq(gameLeaderboard.category, 'overall'));

    // Insert new rankings
    const leaderboardEntries = participants.map((participant, index) => ({
      participantId: participant.id,
      category: 'overall',
      points: participant.totalPoints,
      rank: index + 1,
      periodStart: new Date(new Date().getFullYear(), 0, 1), // Start of year
      periodEnd: new Date(new Date().getFullYear(), 11, 31), // End of year
    }));

    if (leaderboardEntries.length > 0) {
      await db.insert(gameLeaderboard).values(leaderboardEntries);
    }
  }

  // Game Activities
  async createGameActivity(activity: InsertGameActivity): Promise<GameActivity> {
    const [newActivity] = await db.insert(gameActivities).values(activity).returning();
    
    // Update participant's last activity
    await db.update(gameParticipants)
      .set({ lastActivity: new Date() })
      .where(eq(gameParticipants.id, activity.participantId));

    return newActivity;
  }

  async getGameActivities(participantId?: number, limit: number = 50): Promise<GameActivity[]> {
    let query = db.select().from(gameActivities)
      .orderBy(desc(gameActivities.timestamp));

    if (participantId !== undefined) {
      query = query.where(eq(gameActivities.participantId, participantId)) as any;
    }

    return await query.limit(limit);
  }

  // Game Events
  async getGameEvents(isActive?: boolean): Promise<GameEvent[]> {
    let query = db.select().from(gameEvents)
      .orderBy(asc(gameEvents.startTime));

    if (isActive !== undefined) {
      query = query.where(eq(gameEvents.isActive, isActive)) as any;
    }

    return await query;
  }

  async createGameEvent(event: InsertGameEvent): Promise<GameEvent> {
    const [newEvent] = await db.insert(gameEvents).values(event).returning();
    return newEvent;
  }

  async joinGameEvent(eventId: number, participantId: number): Promise<GameEventParticipant> {
    const [participation] = await db.insert(gameEventParticipants)
      .values({ eventId, participantId })
      .returning();
    return participation;
  }

  async updateEventScore(eventId: number, participantId: number, score: number): Promise<void> {
    await db.update(gameEventParticipants)
      .set({ score })
      .where(and(
        eq(gameEventParticipants.eventId, eventId),
        eq(gameEventParticipants.participantId, participantId)
      ));
  }

}

export const storage = new DatabaseStorage();