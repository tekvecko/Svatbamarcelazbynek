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
        weddingContext: JSON.parse(enhancement.weddingContext)
      });
    } catch (error) {
      console.error("Error fetching photo enhancement:", error);
      res.status(500).json({ message: "Failed to fetch photo enhancement" });
    }
  });

  app.post('/api/photos/:id/analyze', async (req, res) => {
    try {
      const photoId = parseInt(req.params.id);
      
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
          weddingContext: JSON.parse(existingEnhancement.weddingContext)
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
        enhancementPreview,
        isVisible: true
      });

      res.json({
        ...enhancement,
        suggestions: analysisResult.suggestions,
        weddingContext: analysisResult.weddingContext
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
        enhancementPreview,
        isVisible: true
      });

      res.json({
        ...enhancement,
        suggestions: analysisResult.suggestions,
        weddingContext: analysisResult.weddingContext
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

  // AI Photo Caption Generation
  app.post('/api/photos/:id/ai-caption', async (req, res) => {
    try {
      const photoId = parseInt(req.params.id);
      const photo = await storage.getPhoto(photoId);
      
      if (!photo) {
        return res.status(404).json({ message: "Photo not found" });
      }

      const caption = await generatePhotoCaption(photo.filename);
      
      const aiCaption = await storage.createAiCaption({
        photoId,
        caption,
        isApproved: false
      });

      res.json(aiCaption);
    } catch (error) {
      console.error("Error generating AI caption:", error);
      res.status(500).json({ message: "Failed to generate AI caption" });
    }
  });

  app.get('/api/photos/:id/ai-captions', async (req, res) => {
    try {
      const photoId = parseInt(req.params.id);
      const captions = await storage.getAiCaptions(photoId);
      res.json(captions);
    } catch (error) {
      console.error("Error fetching AI captions:", error);
      res.status(500).json({ message: "Failed to fetch AI captions" });
    }
  });

  app.patch('/api/ai-captions/:id/approve', async (req, res) => {
    try {
      const captionId = parseInt(req.params.id);
      await storage.approveAiCaption(captionId);
      res.json({ message: "Caption approved" });
    } catch (error) {
      console.error("Error approving AI caption:", error);
      res.status(500).json({ message: "Failed to approve AI caption" });
    }
  });

  // AI Playlist Suggestions
  app.post('/api/ai-playlist-suggestions', async (req, res) => {
    try {
      const weddingDetails = await storage.getWeddingDetails();
      const coupleNames = weddingDetails?.coupleNames || "Marcela & Zbyněk";
      const preferences = req.body.preferences || [];
      const weddingStyle = req.body.weddingStyle || "moderní";

      const suggestions = await generatePlaylistSuggestions(coupleNames, weddingStyle, preferences);
      
      const savedSuggestions = await Promise.all(
        suggestions.map(suggestion => 
          storage.createAiPlaylistSuggestion({
            title: suggestion.title,
            artist: suggestion.artist,
            genre: suggestion.genre,
            mood: suggestion.mood,
            weddingMoment: suggestion.weddingMoment,
            reasoning: suggestion.reasoning,
            popularity: suggestion.popularity,
            isApproved: false
          })
        )
      );

      res.json(savedSuggestions);
    } catch (error) {
      console.error("Error generating AI playlist suggestions:", error);
      res.status(500).json({ message: "Failed to generate AI playlist suggestions" });
    }
  });

  app.get('/api/ai-playlist-suggestions', async (req, res) => {
    try {
      const suggestions = await storage.getAiPlaylistSuggestions();
      res.json(suggestions);
    } catch (error) {
      console.error("Error fetching AI playlist suggestions:", error);
      res.status(500).json({ message: "Failed to fetch AI playlist suggestions" });
    }
  });

  app.patch('/api/ai-playlist-suggestions/:id/approve', async (req, res) => {
    try {
      const suggestionId = parseInt(req.params.id);
      await storage.approveAiPlaylistSuggestion(suggestionId);
      res.json({ message: "Playlist suggestion approved" });
    } catch (error) {
      console.error("Error approving AI playlist suggestion:", error);
      res.status(500).json({ message: "Failed to approve AI playlist suggestion" });
    }
  });

  // AI Wedding Advice
  app.post('/api/ai-wedding-advice', async (req, res) => {
    try {
      const weddingDetails = await storage.getWeddingDetails();
      const weddingDate = weddingDetails?.weddingDate ? new Date(weddingDetails.weddingDate) : new Date("2025-10-11T14:00:00");
      const venue = weddingDetails?.venue || "Stará pošta, Kovalovice";
      const guestCount = req.body.guestCount || 50;

      const adviceList = await generateWeddingAdvice(weddingDate, venue, guestCount);
      
      const savedAdvice = await Promise.all(
        adviceList.map(advice => 
          storage.createAiWeddingAdvice({
            category: advice.category,
            advice: advice.advice,
            priority: advice.priority,
            timeframe: advice.timeframe,
            actionItems: advice.actionItems,
            isVisible: true
          })
        )
      );

      res.json(savedAdvice);
    } catch (error) {
      console.error("Error generating AI wedding advice:", error);
      res.status(500).json({ message: "Failed to generate AI wedding advice" });
    }
  });

  app.get('/api/ai-wedding-advice', async (req, res) => {
    try {
      const advice = await storage.getAiWeddingAdvice();
      res.json(advice);
    } catch (error) {
      console.error("Error fetching AI wedding advice:", error);
      res.status(500).json({ message: "Failed to fetch AI wedding advice" });
    }
  });

  // AI Guest Message Analysis
  app.post('/api/ai-guest-messages', async (req, res) => {
    try {
      const { message, guestName } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      const analysis = await analyzeGuestMessage(message);
      
      const savedMessage = await storage.createAiGuestMessage({
        originalMessage: message,
        analyzedMessage: analysis.message,
        sentiment: analysis.sentiment,
        tone: analysis.tone,
        isAppropriate: analysis.isAppropriate,
        suggestedResponse: analysis.suggestedResponse,
        guestName: guestName || null,
        isApproved: analysis.isAppropriate
      });

      res.json(savedMessage);
    } catch (error) {
      console.error("Error analyzing AI guest message:", error);
      res.status(500).json({ message: "Failed to analyze AI guest message" });
    }
  });

  app.get('/api/ai-guest-messages', async (req, res) => {
    try {
      const messages = await storage.getAiGuestMessages();
      res.json(messages);
    } catch (error) {
      console.error("Error fetching AI guest messages:", error);
      res.status(500).json({ message: "Failed to fetch AI guest messages" });
    }
  });

  // AI Wedding Story Generation
  app.post('/api/ai-wedding-stories', async (req, res) => {
    try {
      const weddingDetails = await storage.getWeddingDetails();
      const coupleNames = weddingDetails?.coupleNames || "Marcela & Zbyněk";
      const photos = await storage.getPhotos(true);
      const schedule = await storage.getWeddingSchedule();
      
      const photoUrls = photos.map(photo => photo.filename);
      const timeline = schedule.map(item => `${item.time}: ${item.title}`);
      
      const story = await generateWeddingStory(coupleNames, photoUrls, timeline);
      
      const savedStory = await storage.createAiWeddingStory({
        title: `Příběh svatby ${coupleNames}`,
        story,
        photoIds: photos.map(photo => photo.id.toString()),
        timeline: timeline,
        isPublished: false
      });

      res.json(savedStory);
    } catch (error) {
      console.error("Error generating AI wedding story:", error);
      res.status(500).json({ message: "Failed to generate AI wedding story" });
    }
  });

  app.get('/api/ai-wedding-stories', async (req, res) => {
    try {
      const stories = await storage.getAiWeddingStories();
      res.json(stories);
    } catch (error) {
      console.error("Error fetching AI wedding stories:", error);
      res.status(500).json({ message: "Failed to fetch AI wedding stories" });
    }
  });

  app.patch('/api/ai-wedding-stories/:id/publish', async (req, res) => {
    try {
      const storyId = parseInt(req.params.id);
      await storage.publishAiWeddingStory(storyId);
      res.json({ message: "Wedding story published" });
    } catch (error) {
      console.error("Error publishing AI wedding story:", error);
      res.status(500).json({ message: "Failed to publish AI wedding story" });
    }
  });

  // AI Photo Analysis for Enhanced Gallery
  app.post('/api/photos/:id/ai-analysis', async (req, res) => {
    try {
      const photoId = parseInt(req.params.id);
      const photo = await storage.getPhoto(photoId);
      
      if (!photo) {
        return res.status(404).json({ message: "Photo not found" });
      }

      const analysis = await analyzeWeddingPhoto(photo.filename);
      
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing photo with AI:", error);
      res.status(500).json({ message: "Failed to analyze photo with AI" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
