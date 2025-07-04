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
