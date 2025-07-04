import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import express from 'express'
import { registerRoutes } from '../server/routes'
import { db } from '../server/db'
import { photos, playlistSongs, weddingDetails, photoLikes, songLikes } from '../shared/schema'
import path from 'path'
import fs from 'fs'

let app: express.Express
let server: any

beforeAll(async () => {
  app = express()
  app.use(express.json())
  server = await registerRoutes(app)
  
  // Ensure uploads directory exists for tests
  const uploadsDir = path.join(process.cwd(), 'uploads')
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
  }
})

afterAll(async () => {
  if (server) {
    server.close()
  }
})

beforeEach(async () => {
  // Clean data before each test
  await db.delete(photoLikes)
  await db.delete(songLikes)
  await db.delete(photos)
  await db.delete(playlistSongs)
  await db.delete(weddingDetails)
})

describe('Full Wedding Website Integration', () => {
  it('should handle complete wedding website workflow', async () => {
    // 1. Get wedding details (should create default)
    const detailsResponse = await request(app)
      .get('/api/wedding-details')
      .expect(200)

    expect(detailsResponse.body).toMatchObject({
      coupleNames: 'Marcela & Zbyněk',
      venue: 'Stará pošta, Kovalovice',
      allowUploads: true,
      moderateUploads: false
    })

    // 2. Update wedding details
    const updateData = {
      coupleNames: 'Test Couple',
      venue: 'Test Venue',
      allowUploads: true,
      moderateUploads: true
    }

    await request(app)
      .patch('/api/wedding-details')
      .send(updateData)
      .expect(200)

    // 3. Add songs to playlist
    const songs = [
      { suggestion: 'Queen - Bohemian Rhapsody', title: 'Bohemian Rhapsody', artist: 'Queen' },
      { suggestion: 'The Beatles - Hey Jude', title: 'Hey Jude', artist: 'The Beatles' },
      { suggestion: 'ABBA - Dancing Queen', title: 'Dancing Queen', artist: 'ABBA' }
    ]

    for (const song of songs) {
      await request(app)
        .post('/api/playlist')
        .send(song)
        .expect(200)
    }

    // 4. Get playlist
    const playlistResponse = await request(app)
      .get('/api/playlist')
      .expect(200)

    expect(playlistResponse.body).toHaveLength(3)

    // 5. Like songs with different users
    const songIds = playlistResponse.body.map((song: any) => song.id)
    
    // User 1 likes first two songs
    await request(app)
      .post(`/api/playlist/${songIds[0]}/like`)
      .set('User-Agent', 'User1')
      .expect(200)

    await request(app)
      .post(`/api/playlist/${songIds[1]}/like`)
      .set('User-Agent', 'User1')
      .expect(200)

    // User 2 likes first and third songs
    await request(app)
      .post(`/api/playlist/${songIds[0]}/like`)
      .set('User-Agent', 'User2')
      .expect(200)

    await request(app)
      .post(`/api/playlist/${songIds[2]}/like`)
      .set('User-Agent', 'User2')
      .expect(200)

    // Check final like counts
    const finalPlaylistResponse = await request(app)
      .get('/api/playlist')
      .expect(200)

    const likeCounts = finalPlaylistResponse.body.map((song: any) => song.likes)
    expect(likeCounts).toEqual([2, 1, 1])

    // 6. Add photos (simulate upload)
    const photoData = [
      {
        filename: 'wedding1.jpg',
        originalName: 'wedding1.jpg',
        url: '/uploads/wedding1.jpg',
        thumbnailUrl: '/uploads/wedding1.jpg',
        approved: false // Should be false due to moderation
      },
      {
        filename: 'wedding2.jpg',
        originalName: 'wedding2.jpg',
        url: '/uploads/wedding2.jpg',
        thumbnailUrl: '/uploads/wedding2.jpg',
        approved: false
      }
    ]

    const insertedPhotos = []
    for (const photo of photoData) {
      const [inserted] = await db.insert(photos).values(photo).returning()
      insertedPhotos.push(inserted)
    }

    // 7. Check pending photos (not approved)
    const pendingPhotosResponse = await request(app)
      .get('/api/photos?approved=false')
      .expect(200)

    expect(pendingPhotosResponse.body).toHaveLength(2)

    // 8. Approve first photo
    await request(app)
      .patch(`/api/photos/${insertedPhotos[0].id}/approve`)
      .expect(200)

    // 9. Check approved photos
    const approvedPhotosResponse = await request(app)
      .get('/api/photos?approved=true')
      .expect(200)

    expect(approvedPhotosResponse.body).toHaveLength(1)
    expect(approvedPhotosResponse.body[0].approved).toBe(true)

    // 10. Like approved photo with multiple users
    const approvedPhotoId = approvedPhotosResponse.body[0].id

    await request(app)
      .post(`/api/photos/${approvedPhotoId}/like`)
      .set('User-Agent', 'User1')
      .expect(200)

    await request(app)
      .post(`/api/photos/${approvedPhotoId}/like`)
      .set('User-Agent', 'User2')
      .expect(200)

    await request(app)
      .post(`/api/photos/${approvedPhotoId}/like`)
      .set('User-Agent', 'User3')
      .expect(200)

    // 11. Check final photo likes
    const finalPhotosResponse = await request(app)
      .get('/api/photos?approved=true')
      .expect(200)

    expect(finalPhotosResponse.body[0].likes).toBe(3)

    // 12. Delete unapproved photo
    await request(app)
      .delete(`/api/photos/${insertedPhotos[1].id}`)
      .expect(200)

    // 13. Verify final state
    const finalPendingResponse = await request(app)
      .get('/api/photos?approved=false')
      .expect(200)

    expect(finalPendingResponse.body).toHaveLength(0)

    const allPhotosResponse = await request(app)
      .get('/api/photos')
      .expect(200)

    expect(allPhotosResponse.body).toHaveLength(1)
    expect(allPhotosResponse.body[0].likes).toBe(3)
  })

  it('should handle admin workflow with moderation disabled', async () => {
    // 1. Set up wedding details with moderation disabled
    await request(app)
      .patch('/api/wedding-details')
      .send({
        coupleNames: 'Admin Test',
        moderateUploads: false,
        allowUploads: true
      })
      .expect(200)

    // 2. Add photos (should be auto-approved)
    const photoData = {
      filename: 'auto-approved.jpg',
      originalName: 'auto-approved.jpg',
      url: '/uploads/auto-approved.jpg',
      thumbnailUrl: '/uploads/auto-approved.jpg',
      approved: true // Auto-approved when moderation is disabled
    }

    const [insertedPhoto] = await db.insert(photos).values(photoData).returning()

    // 3. Check that photo is immediately available
    const photosResponse = await request(app)
      .get('/api/photos?approved=true')
      .expect(200)

    expect(photosResponse.body).toHaveLength(1)
    expect(photosResponse.body[0].approved).toBe(true)

    // 4. Add multiple songs and test bulk operations
    const bulkSongs = Array.from({ length: 10 }, (_, i) => ({
      suggestion: `Test Song ${i + 1}`,
      title: `Song ${i + 1}`,
      artist: `Artist ${i + 1}`
    }))

    for (const song of bulkSongs) {
      await request(app)
        .post('/api/playlist')
        .send(song)
        .expect(200)
    }

    const playlistResponse = await request(app)
      .get('/api/playlist')
      .expect(200)

    expect(playlistResponse.body).toHaveLength(10)

    // 5. Test concurrent likes from multiple users
    const songId = playlistResponse.body[0].id
    const photoId = insertedPhoto.id

    const likePromises = []
    for (let i = 1; i <= 50; i++) {
      likePromises.push(
        request(app)
          .post(`/api/playlist/${songId}/like`)
          .set('User-Agent', `User${i}`)
      )
      
      if (i <= 25) {
        likePromises.push(
          request(app)
            .post(`/api/photos/${photoId}/like`)
            .set('User-Agent', `PhotoUser${i}`)
        )
      }
    }

    await Promise.all(likePromises)

    // 6. Verify final counts
    const finalPlaylistResponse = await request(app)
      .get('/api/playlist')
      .expect(200)

    const finalPhotosResponse = await request(app)
      .get('/api/photos')
      .expect(200)

    expect(finalPlaylistResponse.body[0].likes).toBe(50)
    expect(finalPhotosResponse.body[0].likes).toBe(25)
  })

  it('should handle error cases and edge conditions', async () => {
    // 1. Test invalid photo operations
    await request(app)
      .post('/api/photos/999/like')
      .expect(500) // Photo doesn't exist

    await request(app)
      .delete('/api/photos/999')
      .expect(500) // Photo doesn't exist

    await request(app)
      .patch('/api/photos/999/approve')
      .expect(500) // Photo doesn't exist

    // 2. Test invalid playlist operations
    await request(app)
      .post('/api/playlist/999/like')
      .expect(500) // Song doesn't exist

    await request(app)
      .delete('/api/playlist/999')
      .expect(500) // Song doesn't exist

    // 3. Test invalid wedding details updates
    await request(app)
      .patch('/api/wedding-details')
      .send({ weddingDate: 'invalid-date' })
      .expect(400) // Invalid date format

    // 4. Test missing required fields
    await request(app)
      .post('/api/playlist')
      .send({ title: 'Song without suggestion' })
      .expect(400) // Missing required suggestion field

    // 5. Test uploads disabled
    await request(app)
      .patch('/api/wedding-details')
      .send({ allowUploads: false })
      .expect(200)

    const detailsResponse = await request(app)
      .get('/api/wedding-details')
      .expect(200)

    expect(detailsResponse.body.allowUploads).toBe(false)
  })
})