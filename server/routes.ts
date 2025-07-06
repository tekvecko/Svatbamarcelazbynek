import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import cloudinary from "./cloudinary";
import { insertPhotoSchema, insertPlaylistSongSchema, updateWeddingDetailsSchema, insertWeddingDetailsSchema, insertSiteMetadataSchema, updateSiteMetadataSchema, insertWeddingScheduleSchema, updateWeddingScheduleSchema, insertPhotoEnhancementSchema } from "@shared/schema";
import { analyzePhotoForEnhancement, generateEnhancementPreview } from "./ai-photo-enhancer";
import { analyzeWeddingPhoto, generatePlaylistSuggestions, generateWeddingAdvice, analyzeGuestMessage, generateWeddingStory, generatePhotoCaption } from "./ai-services";
import { analyzeWeddingPhotoWithHuggingFace, generateImageCaptionWithHuggingFace, checkHuggingFaceAvailability } from "./huggingface-ai";
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

  // Photo endpoints with pagination
  app.get('/api/photos', async (req, res) => {
    try {
      const approved = req.query.approved === 'true' ? true : req.query.approved === 'false' ? false : undefined;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;
      
      const photos = await storage.getPhotos(approved, limit, offset);
      const totalCount = await storage.getPhotosCount(approved);
      
      res.json({
        photos,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
          hasNext: page * limit < totalCount,
          hasPrev: page > 1
        }
      });
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

  app.post('/api/photos/:id/enhance', async (req, res) => {
    try {
      const photoId = parseInt(req.params.id);
      const { enhancement } = req.body;
      
      if (!enhancement) {
        return res.status(400).json({ message: "Enhancement type required" });
      }
      
      // For now, return a mock response since AI enhancement is not fully implemented
      res.json({ 
        success: true, 
        message: "Photo enhancement completed",
        enhancement: enhancement
      });
    } catch (error) {
      console.error("Error enhancing photo:", error);
      res.status(500).json({ message: "Failed to enhance photo" });
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

  // AI Photo Enhancement endpoints
  app.get('/api/photos/:id/enhancement', async (req, res) => {
    try {
      const photoId = parseInt(req.params.id);
      const enhancement = await storage.getPhotoEnhancement(photoId);
      
      if (!enhancement) {
        return res.status(404).json({ message: "Enhancement analysis not found" });
      }
      
      res.json({
        ...enhancement,
        suggestions: JSON.parse(enhancement.suggestions),
        weddingContext: JSON.parse(enhancement.weddingContext),
        detailedScores: enhancement.detailedScores ? JSON.parse(enhancement.detailedScores) : null,
        enhancementPotential: enhancement.enhancementPotential ? JSON.parse(enhancement.enhancementPotential) : null,
        professionalInsights: enhancement.professionalInsights ? JSON.parse(enhancement.professionalInsights) : null,
        analysisMetadata: enhancement.analysisMetadata ? JSON.parse(enhancement.analysisMetadata) : null
      });
    } catch (error) {
      console.error("Error fetching photo enhancement:", error);
      res.status(500).json({ message: "Failed to fetch photo enhancement" });
    }
  });

  app.post('/api/photos/:id/analyze', async (req, res) => {
    try {
      const photoId = parseInt(req.params.id);
      
      if (isNaN(photoId)) {
        return res.status(400).json({ message: "Invalid photo ID" });
      }
      
      // Get photo details
      const photo = await storage.getPhoto(photoId);
      if (!photo) {
        return res.status(404).json({ message: "Photo not found" });
      }

      // Check if enhancement already exists
      const existingEnhancement = await storage.getPhotoEnhancement(photoId);
      if (existingEnhancement) {
        return res.json({
          ...existingEnhancement,
          suggestions: JSON.parse(existingEnhancement.suggestions),
          weddingContext: JSON.parse(existingEnhancement.weddingContext),
          detailedScores: existingEnhancement.detailedScores ? JSON.parse(existingEnhancement.detailedScores) : null,
          enhancementPotential: existingEnhancement.enhancementPotential ? JSON.parse(existingEnhancement.enhancementPotential) : null,
          professionalInsights: existingEnhancement.professionalInsights ? JSON.parse(existingEnhancement.professionalInsights) : null,
          analysisMetadata: existingEnhancement.analysisMetadata ? JSON.parse(existingEnhancement.analysisMetadata) : null
        });
      }

      // Analyze photo with AI
      const analysisResult = await analyzePhotoForEnhancement(photo.url);
      
      // Generate enhancement preview
      const enhancementPreview = await generateEnhancementPreview(photo.url, analysisResult.suggestions);

      // Save to database
      const enhancement = await storage.createPhotoEnhancement({
        photoId,
        overallScore: analysisResult.overallScore,
        primaryIssues: analysisResult.primaryIssues,
        suggestions: JSON.stringify(analysisResult.suggestions),
        strengths: analysisResult.strengths,
        weddingContext: JSON.stringify(analysisResult.weddingContext),
        detailedScores: analysisResult.detailedScores ? JSON.stringify(analysisResult.detailedScores) : null,
        enhancementPotential: analysisResult.enhancementPotential ? JSON.stringify(analysisResult.enhancementPotential) : null,
        professionalInsights: analysisResult.professionalInsights ? JSON.stringify(analysisResult.professionalInsights) : null,
        enhancementPreview,
        isVisible: true,
        analysisMetadata: analysisResult.analysisMetadata ? JSON.stringify(analysisResult.analysisMetadata) : null
      });

      res.json({
        ...enhancement,
        suggestions: analysisResult.suggestions,
        weddingContext: analysisResult.weddingContext,
        detailedScores: analysisResult.detailedScores,
        enhancementPotential: analysisResult.enhancementPotential,
        professionalInsights: analysisResult.professionalInsights,
        analysisMetadata: analysisResult.analysisMetadata
      });
    } catch (error) {
      console.error("Error analyzing photo:", error);
      
      if (error.message && error.message.includes('GROQ_API_KEY')) {
        return res.status(503).json({ 
          message: "AI analysis service is not available. Please configure GROQ_API_KEY." 
        });
      }
      
      res.status(500).json({ 
        message: "Failed to analyze photo for enhancement",
        details: error.message 
      });
    }
  });

  app.post('/api/photos/:id/reanalyze', async (req, res) => {
    try {
      const photoId = parseInt(req.params.id);
      
      if (isNaN(photoId)) {
        return res.status(400).json({ message: "Invalid photo ID" });
      }
      
      // Get photo details
      const photo = await storage.getPhoto(photoId);
      if (!photo) {
        return res.status(404).json({ message: "Photo not found" });
      }

      // Delete existing enhancement if it exists
      const existingEnhancement = await storage.getPhotoEnhancement(photoId);
      if (existingEnhancement) {
        await storage.deletePhotoEnhancement(existingEnhancement.id);
      }

      // Re-analyze photo with AI
      const analysisResult = await analyzePhotoForEnhancement(photo.url);
      
      // Generate new enhancement preview
      const enhancementPreview = await generateEnhancementPreview(photo.url, analysisResult.suggestions);

      // Save new analysis to database
      const enhancement = await storage.createPhotoEnhancement({
        photoId,
        overallScore: analysisResult.overallScore,
        primaryIssues: analysisResult.primaryIssues,
        suggestions: JSON.stringify(analysisResult.suggestions),
        strengths: analysisResult.strengths,
        weddingContext: JSON.stringify(analysisResult.weddingContext),
        detailedScores: analysisResult.detailedScores ? JSON.stringify(analysisResult.detailedScores) : null,
        enhancementPotential: analysisResult.enhancementPotential ? JSON.stringify(analysisResult.enhancementPotential) : null,
        professionalInsights: analysisResult.professionalInsights ? JSON.stringify(analysisResult.professionalInsights) : null,
        enhancementPreview,
        isVisible: true,
        analysisMetadata: analysisResult.analysisMetadata ? JSON.stringify(analysisResult.analysisMetadata) : null
      });

      res.json({
        ...enhancement,
        suggestions: analysisResult.suggestions,
        weddingContext: analysisResult.weddingContext,
        detailedScores: analysisResult.detailedScores,
        enhancementPotential: analysisResult.enhancementPotential,
        professionalInsights: analysisResult.professionalInsights,
        analysisMetadata: analysisResult.analysisMetadata
      });
    } catch (error) {
      console.error("Error reanalyzing photo:", error);
      
      if (error.message && error.message.includes('GROQ_API_KEY')) {
        return res.status(503).json({ 
          message: "AI analysis service is not available. Please configure GROQ_API_KEY." 
        });
      }
      
      res.status(500).json({ 
        message: "Failed to reanalyze photo",
        details: error.message 
      });
    }
  });

  app.patch('/api/photos/:id/enhancement/visibility', async (req, res) => {
    try {
      const photoId = parseInt(req.params.id);
      const { isVisible } = req.body;

      const enhancement = await storage.getPhotoEnhancement(photoId);
      if (!enhancement) {
        return res.status(404).json({ message: "Enhancement not found" });
      }

      const updated = await storage.updatePhotoEnhancement(enhancement.id, { isVisible });
      res.json(updated);
    } catch (error) {
      console.error("Error updating enhancement visibility:", error);
      res.status(500).json({ message: "Failed to update enhancement visibility" });
    }
  });

  // Hugging Face AI endpoints
  app.get('/api/huggingface/status', async (req, res) => {
    try {
      const status = await checkHuggingFaceAvailability();
      res.json(status);
    } catch (error) {
      console.error("Error checking Hugging Face status:", error);
      res.status(500).json({ message: "Failed to check Hugging Face status" });
    }
  });

  app.post('/api/huggingface/analyze-photo', async (req, res) => {
    try {
      const { imageUrl } = req.body;
      
      if (!imageUrl) {
        return res.status(400).json({ message: "Image URL is required" });
      }

      const analysis = await analyzeWeddingPhotoWithHuggingFace(imageUrl);
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing photo with Hugging Face:", error);
      res.status(500).json({ 
        message: "Failed to analyze photo with Hugging Face",
        details: error.message 
      });
    }
  });

  app.post('/api/huggingface/generate-caption', async (req, res) => {
    try {
      const { imageUrl } = req.body;
      
      if (!imageUrl) {
        return res.status(400).json({ message: "Image URL is required" });
      }

      const caption = await generateImageCaptionWithHuggingFace(imageUrl);
      res.json({ caption });
    } catch (error) {
      console.error("Error generating caption with Hugging Face:", error);
      res.status(500).json({ 
        message: "Failed to generate caption with Hugging Face",
        details: error.message 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
