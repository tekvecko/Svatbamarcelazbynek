import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import cloudinary from "./cloudinary";
import { insertPhotoSchema, insertPlaylistSongSchema, updateWeddingDetailsSchema, insertWeddingDetailsSchema, insertSiteMetadataSchema, updateSiteMetadataSchema, insertWeddingScheduleSchema, updateWeddingScheduleSchema } from "@shared/schema";
import { z } from "zod";

// Configure multer for memory storage (Cloudinary upload)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

function getUserSession(req: any): string {
  // Simple session ID based on IP and User-Agent
  return Buffer.from(`${req.ip}_${req.get('User-Agent') || 'unknown'}`).toString('base64');
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve static upload page
  app.use('/upload', express.static(path.join(import.meta.dirname, '../client')));

  // Wedding details endpoints
  app.get('/api/wedding-details', async (req, res) => {
    try {
      let details = await storage.getWeddingDetails();
      
      if (!details) {
        // Create default wedding details if none exist
        details = await storage.createWeddingDetails({
          coupleNames: "Marcela & Zbyněk",
          weddingDate: new Date("2025-10-11T14:00:00"),
          venue: "Stará pošta, Kovalovice",
          venueAddress: "Kovalovice 109, 664 07 Kovalovice",
          allowUploads: true,
          moderateUploads: false,
        });
      }
      
      res.json(details);
    } catch (error) {
      console.error("Error fetching wedding details:", error);
      res.status(500).json({ message: "Failed to fetch wedding details" });
    }
  });

  app.patch('/api/wedding-details', async (req, res) => {
    try {
      const validation = updateWeddingDetailsSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid data", errors: validation.error.errors });
      }

      const details = await storage.updateWeddingDetails(validation.data);
      res.json(details);
    } catch (error) {
      console.error("Error updating wedding details:", error);
      res.status(500).json({ message: "Failed to update wedding details" });
    }
  });

  // Cloudinary signed upload endpoint
  app.post('/api/upload-signature', async (req, res) => {
    try {
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
      const apiKey = process.env.CLOUDINARY_API_KEY;
      const apiSecret = process.env.CLOUDINARY_API_SECRET;
      
      if (!cloudName || !apiKey || !apiSecret) {
        return res.status(500).json({ 
          message: "Cloudinary credentials not configured properly" 
        });
      }
      
      const timestamp = Math.round(new Date().getTime() / 1000);
      const signature = cloudinary.utils.api_sign_request(
        {
          timestamp: timestamp,
          folder: 'wedding-photos',
        },
        apiSecret
      );

      res.json({
        signature,
        timestamp,
        cloudName,
        apiKey,
        folder: 'wedding-photos',
      });
    } catch (error) {
      console.error("Error generating upload signature:", error);
      res.status(500).json({ message: "Failed to generate upload signature" });
    }
  });

  // Photo endpoints
  app.get('/api/photos', async (req, res) => {
    try {
      const approved = req.query.approved === 'true' ? true : req.query.approved === 'false' ? false : undefined;
      const photos = await storage.getPhotos(approved);
      res.json(photos);
    } catch (error) {
      console.error("Error fetching photos:", error);
      res.status(500).json({ message: "Failed to fetch photos" });
    }
  });

  // Save photo metadata endpoint (for signed uploads)
  app.post('/api/photos/save', async (req, res) => {
    try {
      const validation = insertPhotoSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid photo data", errors: validation.error.errors });
      }

      const photo = await storage.createPhoto(validation.data);
      res.json(photo);
    } catch (error) {
      console.error("Error saving photo:", error);
      res.status(500).json({ message: "Failed to save photo" });
    }
  });

  app.post('/api/photos/upload', upload.array('photos', 10), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const uploadedPhotos = [];
      
      for (const file of files) {
        try {
          // Upload to Cloudinary
          const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
              {
                resource_type: 'image',
                tags: ['svatba2025'],
                transformation: [
                  { quality: 'auto:good' },
                  { fetch_format: 'auto' }
                ]
              },
              (error, result) => {
                if (error) {
                  console.error('Cloudinary upload error:', error);
                  reject(error);
                } else {
                  resolve(result);
                }
              }
            ).end(file.buffer);
          }) as any;
        
        const photo = await storage.createPhoto({
            filename: uploadResult.public_id,
            originalName: file.originalname,
            url: uploadResult.secure_url,
            thumbnailUrl: cloudinary.url(uploadResult.public_id, {
              width: 400,
              height: 300,
              crop: 'fill',
              quality: 'auto:good',
              fetch_format: 'auto'
            }),
            approved: true, // Auto-approve for now
          });
          
          uploadedPhotos.push(photo);
        } catch (fileError) {
          console.error(`Error uploading file ${file.originalname}:`, fileError);
          // Continue with other files, but log the error
        }
      }

      res.json(uploadedPhotos);
    } catch (error) {
      console.error("Error uploading photos:", error);
      res.status(500).json({ message: "Failed to upload photos" });
    }
  });

  app.post('/api/photos/:id/like', async (req, res) => {
    try {
      const photoId = parseInt(req.params.id);
      const userSession = getUserSession(req);
      
      const result = await storage.togglePhotoLike(photoId, userSession);
      res.json(result);
    } catch (error) {
      console.error("Error toggling photo like:", error);
      res.status(500).json({ message: "Failed to toggle like" });
    }
  });

  app.delete('/api/photos/:id', async (req, res) => {
    try {
      const photoId = parseInt(req.params.id);
      await storage.deletePhoto(photoId);
      res.json({ message: "Photo deleted successfully" });
    } catch (error) {
      console.error("Error deleting photo:", error);
      res.status(500).json({ message: "Failed to delete photo" });
    }
  });

  app.patch('/api/photos/:id/approve', async (req, res) => {
    try {
      const photoId = parseInt(req.params.id);
      await storage.approvePhoto(photoId);
      res.json({ message: "Photo approved successfully" });
    } catch (error) {
      console.error("Error approving photo:", error);
      res.status(500).json({ message: "Failed to approve photo" });
    }
  });

  // Photo comments endpoints
  app.get('/api/photos/:id/comments', async (req, res) => {
    try {
      const photoId = parseInt(req.params.id);
      const comments = await storage.getPhotoComments(photoId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post('/api/photos/:id/comments', async (req, res) => {
    try {
      const photoId = parseInt(req.params.id);
      const { author, text } = req.body;
      
      if (!author || !text) {
        return res.status(400).json({ message: "Author and text are required" });
      }
      
      const comment = await storage.addPhotoComment(photoId, author.trim(), text.trim());
      res.json(comment);
    } catch (error) {
      console.error("Error adding comment:", error);
      res.status(500).json({ message: "Failed to add comment" });
    }
  });

  // Playlist endpoints
  app.get('/api/playlist', async (req, res) => {
    try {
      const songs = await storage.getPlaylistSongs();
      res.json(songs);
    } catch (error) {
      console.error("Error fetching playlist:", error);
      res.status(500).json({ message: "Failed to fetch playlist" });
    }
  });

  app.post('/api/playlist', async (req, res) => {
    try {
      const validation = insertPlaylistSongSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid data", errors: validation.error.errors });
      }

      const song = await storage.createPlaylistSong(validation.data);
      res.json(song);
    } catch (error) {
      console.error("Error adding song to playlist:", error);
      res.status(500).json({ message: "Failed to add song" });
    }
  });

  app.post('/api/playlist/:id/like', async (req, res) => {
    try {
      const songId = parseInt(req.params.id);
      const userSession = getUserSession(req);
      
      const result = await storage.toggleSongLike(songId, userSession);
      res.json(result);
    } catch (error) {
      console.error("Error toggling song like:", error);
      res.status(500).json({ message: "Failed to toggle like" });
    }
  });

  app.delete('/api/playlist/:id', async (req, res) => {
    try {
      const songId = parseInt(req.params.id);
      await storage.deletePlaylistSong(songId);
      res.json({ message: "Song deleted successfully" });
    } catch (error) {
      console.error("Error deleting song:", error);
      res.status(500).json({ message: "Failed to delete song" });
    }
  });

  // Site metadata endpoints
  app.get('/api/metadata', async (req, res) => {
    try {
      const key = req.query.key as string;
      const metadata = await storage.getSiteMetadata(key);
      res.json(metadata);
    } catch (error) {
      console.error("Error fetching metadata:", error);
      res.status(500).json({ message: "Failed to fetch metadata" });
    }
  });

  app.get('/api/metadata/:key', async (req, res) => {
    try {
      const key = req.params.key;
      const metadata = await storage.getSiteMetadataByKey(key);
      if (!metadata) {
        return res.status(404).json({ message: "Metadata not found" });
      }
      res.json(metadata);
    } catch (error) {
      console.error("Error fetching metadata:", error);
      res.status(500).json({ message: "Failed to fetch metadata" });
    }
  });

  app.post('/api/metadata', async (req, res) => {
    try {
      const validation = insertSiteMetadataSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid data", errors: validation.error.errors });
      }

      const metadata = await storage.setSiteMetadata(validation.data);
      res.json(metadata);
    } catch (error) {
      console.error("Error setting metadata:", error);
      res.status(500).json({ message: "Failed to set metadata" });
    }
  });

  app.patch('/api/metadata/:key', async (req, res) => {
    try {
      const key = req.params.key;
      const validation = updateSiteMetadataSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid data", errors: validation.error.errors });
      }

      const metadata = await storage.updateSiteMetadata(key, validation.data);
      res.json(metadata);
    } catch (error) {
      console.error("Error updating metadata:", error);
      res.status(500).json({ message: "Failed to update metadata" });
    }
  });

  app.delete('/api/metadata/:key', async (req, res) => {
    try {
      const key = req.params.key;
      await storage.deleteSiteMetadata(key);
      res.json({ message: "Metadata deleted successfully" });
    } catch (error) {
      console.error("Error deleting metadata:", error);
      res.status(500).json({ message: "Failed to delete metadata" });
    }
  });

  // Cloudinary photos endpoints
  app.get('/api/cloudinary-photos', async (req, res) => {
    try {
      const photos = await storage.getCloudinaryPhotos();
      res.json(photos);
    } catch (error) {
      console.error("Error fetching cloudinary photos:", error);
      res.status(500).json({ message: "Failed to fetch cloudinary photos" });
    }
  });

  app.post('/api/cloudinary-photos/sync', async (req, res) => {
    try {
      // This endpoint will sync photos from Cloudinary folder to database
      const { photos } = req.body;
      const syncedPhotos = await storage.syncCloudinaryPhotos(photos);
      res.json(syncedPhotos);
    } catch (error) {
      console.error("Error syncing cloudinary photos:", error);
      res.status(500).json({ message: "Failed to sync cloudinary photos" });
    }
  });

  app.post('/api/cloudinary-photos/:id/like', async (req, res) => {
    try {
      const photoId = parseInt(req.params.id);
      const userSession = req.ip + req.get('User-Agent') || 'anonymous';
      const result = await storage.toggleCloudinaryPhotoLike(photoId, userSession);
      res.json(result);
    } catch (error) {
      console.error("Error toggling like:", error);
      res.status(500).json({ message: "Failed to toggle like" });
    }
  });

  // Wedding schedule endpoints
  app.get('/api/schedule', async (req, res) => {
    try {
      const schedule = await storage.getWeddingSchedule();
      res.json(schedule);
    } catch (error) {
      console.error("Error fetching schedule:", error);
      res.status(500).json({ message: "Failed to fetch schedule" });
    }
  });

  app.post('/api/schedule', async (req, res) => {
    try {
      const validation = insertWeddingScheduleSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid data", errors: validation.error.errors });
      }

      const scheduleItem = await storage.createWeddingScheduleItem(validation.data);
      res.json(scheduleItem);
    } catch (error) {
      console.error("Error creating schedule item:", error);
      res.status(500).json({ message: "Failed to create schedule item" });
    }
  });

  app.patch('/api/schedule/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validation = updateWeddingScheduleSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid data", errors: validation.error.errors });
      }

      const updatedItem = await storage.updateWeddingScheduleItem(id, validation.data);
      res.json(updatedItem);
    } catch (error) {
      console.error("Error updating schedule item:", error);
      res.status(500).json({ message: "Failed to update schedule item" });
    }
  });

  app.delete('/api/schedule/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteWeddingScheduleItem(id);
      res.json({ message: "Schedule item deleted successfully" });
    } catch (error) {
      console.error("Error deleting schedule item:", error);
      res.status(500).json({ message: "Failed to delete schedule item" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
