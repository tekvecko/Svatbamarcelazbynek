import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const photos = pgTable("photos", {
  id: serial("id").primaryKey(),
  filename: varchar("filename", { length: 255 }).notNull(),
  originalName: varchar("original_name", { length: 255 }).notNull(),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
  likes: integer("likes").default(0).notNull(),
  approved: boolean("approved").default(false).notNull(),
  authorName: varchar("author_name", { length: 255 }),
  isPhotoBooth: boolean("is_photo_booth").default(false).notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

// Table for mapping Cloudinary photos to our database IDs
export const cloudinaryPhotos = pgTable("cloudinary_photos", {
  id: serial("id").primaryKey(),
  cloudinaryId: varchar("cloudinary_id", { length: 255 }).notNull().unique(),
  cloudinaryUrl: text("cloudinary_url").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
  originalName: varchar("original_name", { length: 255 }),
  likes: integer("likes").default(0).notNull(),
  approved: boolean("approved").default(true).notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const photoLikes = pgTable("photo_likes", {
  id: serial("id").primaryKey(),
  photoId: integer("photo_id").references(() => photos.id).notNull(),
  userSession: varchar("user_session", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const photoComments = pgTable("photo_comments", {
  id: serial("id").primaryKey(),
  photoId: integer("photo_id").references(() => photos.id).notNull(),
  author: varchar("author", { length: 255 }).notNull(),
  text: text("text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const playlistSongs = pgTable("playlist_songs", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  artist: varchar("artist", { length: 255 }),
  suggestion: text("suggestion").notNull(),
  likes: integer("likes").default(0).notNull(),
  approved: boolean("approved").default(true).notNull(),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
});

export const songLikes = pgTable("song_likes", {
  id: serial("id").primaryKey(),
  songId: integer("song_id").references(() => playlistSongs.id).notNull(),
  userSession: varchar("user_session", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const weddingDetails = pgTable("wedding_details", {
  id: serial("id").primaryKey(),
  coupleNames: varchar("couple_names", { length: 255 }).notNull(),
  weddingDate: timestamp("wedding_date").notNull(),
  venue: varchar("venue", { length: 255 }).notNull(),
  venueAddress: text("venue_address"),
  allowUploads: boolean("allow_uploads").default(true).notNull(),
  moderateUploads: boolean("moderate_uploads").default(false).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Metadata storage for dynamic content
export const siteMetadata = pgTable("site_metadata", {
  id: serial("id").primaryKey(),
  metaKey: varchar("meta_key", { length: 255 }).notNull().unique(),
  metaValue: text("meta_value"),
  metaType: varchar("meta_type", { length: 50 }).default("string").notNull(), // string, number, boolean, json
  description: text("description"),
  category: varchar("category", { length: 100 }).default("general").notNull(),
  isEditable: boolean("is_editable").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Wedding schedule storage
export const weddingSchedule = pgTable("wedding_schedule", {
  id: serial("id").primaryKey(),
  time: varchar("time", { length: 10 }).notNull(), // e.g. "12:00"
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  orderIndex: integer("order_index").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// AI Photo Enhancement Analysis
export const photoEnhancements = pgTable("photo_enhancements", {
  id: serial("id").primaryKey(),
  photoId: integer("photo_id").references(() => photos.id, { onDelete: "cascade" }).notNull(),
  overallScore: integer("overall_score").notNull(),
  primaryIssues: text("primary_issues").array(),
  suggestions: text("suggestions").notNull(), // JSON string
  strengths: text("strengths").array(),
  weddingContext: text("wedding_context").notNull(), // JSON string
  detailedScores: text("detailed_scores"), // JSON string for technical, artistic, etc. scores
  enhancementPotential: text("enhancement_potential"), // JSON string for enhancement metrics
  professionalInsights: text("professional_insights"), // JSON string for photography techniques, cultural context
  enhancementPreview: text("enhancement_preview"),
  analysisDate: timestamp("analysis_date").defaultNow().notNull(),
  isVisible: boolean("is_visible").default(true).notNull(),
  analysisMetadata: text("analysis_metadata"), // JSON string for AI model, timing, etc.
});

// AI Generated Captions
export const aiCaptions = pgTable("ai_captions", {
  id: serial("id").primaryKey(),
  photoId: integer("photo_id").references(() => photos.id, { onDelete: "cascade" }).notNull(),
  caption: text("caption").notNull(),
  isApproved: boolean("is_approved").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// AI Playlist Suggestions
export const aiPlaylistSuggestions = pgTable("ai_playlist_suggestions", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  artist: varchar("artist", { length: 255 }).notNull(),
  genre: varchar("genre", { length: 100 }),
  mood: varchar("mood", { length: 100 }),
  weddingMoment: varchar("wedding_moment", { length: 100 }),
  reasoning: text("reasoning"),
  popularity: integer("popularity").default(5).notNull(),
  isApproved: boolean("is_approved").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// AI Wedding Advice
export const aiWeddingAdvice = pgTable("ai_wedding_advice", {
  id: serial("id").primaryKey(),
  category: varchar("category", { length: 100 }).notNull(),
  advice: text("advice").notNull(),
  priority: varchar("priority", { length: 20 }).default("medium").notNull(),
  timeframe: varchar("timeframe", { length: 100 }),
  actionItems: text("action_items").array(),
  isVisible: boolean("is_visible").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// AI Guest Messages Analysis
export const aiGuestMessages = pgTable("ai_guest_messages", {
  id: serial("id").primaryKey(),
  originalMessage: text("original_message").notNull(),
  analyzedMessage: text("analyzed_message"),
  sentiment: varchar("sentiment", { length: 20 }).default("neutral").notNull(),
  tone: varchar("tone", { length: 50 }),
  isAppropriate: boolean("is_appropriate").default(true).notNull(),
  suggestedResponse: text("suggested_response"),
  guestName: varchar("guest_name", { length: 255 }),
  isApproved: boolean("is_approved").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// AI Wedding Stories
export const aiWeddingStories = pgTable("ai_wedding_stories", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  story: text("story").notNull(),
  photoIds: text("photo_ids").array(),
  timeline: text("timeline").array(),
  isPublished: boolean("is_published").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const photosRelations = relations(photos, ({ many }) => ({
  likes: many(photoLikes),
  comments: many(photoComments),
}));

export const photoLikesRelations = relations(photoLikes, ({ one }) => ({
  photo: one(photos, {
    fields: [photoLikes.photoId],
    references: [photos.id],
  }),
}));

export const photoCommentsRelations = relations(photoComments, ({ one }) => ({
  photo: one(photos, {
    fields: [photoComments.photoId],
    references: [photos.id],
  }),
  cloudinaryPhoto: one(cloudinaryPhotos, {
    fields: [photoComments.photoId],
    references: [cloudinaryPhotos.id],
  }),
}));

export const cloudinaryPhotosRelations = relations(cloudinaryPhotos, ({ many }) => ({
  comments: many(photoComments),
}));

export const playlistSongsRelations = relations(playlistSongs, ({ many }) => ({
  likes: many(songLikes),
}));

export const songLikesRelations = relations(songLikes, ({ one }) => ({
  song: one(playlistSongs, {
    fields: [songLikes.songId],
    references: [playlistSongs.id],
  }),
}));

export const photoEnhancementsRelations = relations(photoEnhancements, ({ one }) => ({
  photo: one(photos, {
    fields: [photoEnhancements.photoId],
    references: [photos.id],
  }),
}));

export const aiCaptionsRelations = relations(aiCaptions, ({ one }) => ({
  photo: one(photos, {
    fields: [aiCaptions.photoId],
    references: [photos.id],
  }),
}));

// Insert schemas
export const insertPhotoSchema = createInsertSchema(photos).omit({
  id: true,
  likes: true,
  uploadedAt: true,
});

export const insertPlaylistSongSchema = createInsertSchema(playlistSongs).omit({
  id: true,
  likes: true,
  submittedAt: true,
});

export const insertWeddingDetailsSchema = createInsertSchema(weddingDetails, {
  weddingDate: z.coerce.date(),
}).omit({
  id: true,
  updatedAt: true,
});

export const updateWeddingDetailsSchema = createInsertSchema(weddingDetails, {
  weddingDate: z.coerce.date().optional(),
}).omit({
  id: true,
  updatedAt: true,
}).partial();

export const insertSiteMetadataSchema = createInsertSchema(siteMetadata).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateSiteMetadataSchema = insertSiteMetadataSchema.partial();

export const insertWeddingScheduleSchema = createInsertSchema(weddingSchedule).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateWeddingScheduleSchema = insertWeddingScheduleSchema.partial();

// Types
export type Photo = typeof photos.$inferSelect;
export type InsertPhoto = z.infer<typeof insertPhotoSchema>;
export type PhotoLike = typeof photoLikes.$inferSelect;
export type PhotoComment = typeof photoComments.$inferSelect;
export type PlaylistSong = typeof playlistSongs.$inferSelect;
export type InsertPlaylistSong = z.infer<typeof insertPlaylistSongSchema>;
export type WeddingDetails = typeof weddingDetails.$inferSelect;
export type InsertWeddingDetails = z.infer<typeof insertWeddingDetailsSchema>;
export type UpdateWeddingDetails = z.infer<typeof updateWeddingDetailsSchema>;
export type SiteMetadata = typeof siteMetadata.$inferSelect;
export type InsertSiteMetadata = z.infer<typeof insertSiteMetadataSchema>;
export type UpdateSiteMetadata = z.infer<typeof updateSiteMetadataSchema>;
export type WeddingScheduleItem = typeof weddingSchedule.$inferSelect;
export type InsertWeddingScheduleItem = z.infer<typeof insertWeddingScheduleSchema>;
export type UpdateWeddingScheduleItem = z.infer<typeof updateWeddingScheduleSchema>;

export type CloudinaryPhoto = typeof cloudinaryPhotos.$inferSelect;
export const insertCloudinaryPhotoSchema = createInsertSchema(cloudinaryPhotos).omit({
  id: true,
  likes: true,
  uploadedAt: true,
});
export type InsertCloudinaryPhoto = z.infer<typeof insertCloudinaryPhotoSchema>;

// Photo Enhancement schemas
export const insertPhotoEnhancementSchema = createInsertSchema(photoEnhancements).omit({
  id: true,
  analysisDate: true,
});

export const updatePhotoEnhancementSchema = insertPhotoEnhancementSchema.partial();

export type PhotoEnhancement = typeof photoEnhancements.$inferSelect;
export type InsertPhotoEnhancement = z.infer<typeof insertPhotoEnhancementSchema>;
export type UpdatePhotoEnhancement = z.infer<typeof updatePhotoEnhancementSchema>;

// AI Types
export const insertAiCaptionSchema = createInsertSchema(aiCaptions);
export const insertAiPlaylistSuggestionSchema = createInsertSchema(aiPlaylistSuggestions);
export const insertAiWeddingAdviceSchema = createInsertSchema(aiWeddingAdvice);
export const insertAiGuestMessageSchema = createInsertSchema(aiGuestMessages);
export const insertAiWeddingStorySchema = createInsertSchema(aiWeddingStories);

export type AiCaption = typeof aiCaptions.$inferSelect;
export type InsertAiCaption = z.infer<typeof insertAiCaptionSchema>;

export type AiPlaylistSuggestion = typeof aiPlaylistSuggestions.$inferSelect;
export type InsertAiPlaylistSuggestion = z.infer<typeof insertAiPlaylistSuggestionSchema>;

export type AiWeddingAdvice = typeof aiWeddingAdvice.$inferSelect;
export type InsertAiWeddingAdvice = z.infer<typeof insertAiWeddingAdviceSchema>;

export type AiGuestMessage = typeof aiGuestMessages.$inferSelect;
export type InsertAiGuestMessage = z.infer<typeof insertAiGuestMessageSchema>;

export type AiWeddingStory = typeof aiWeddingStories.$inferSelect;
export type InsertAiWeddingStory = z.infer<typeof insertAiWeddingStorySchema>;
