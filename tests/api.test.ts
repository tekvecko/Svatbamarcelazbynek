import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import express from 'express'
import { registerRoutes } from '../server/routes'
import { db } from '../server/db'
import { photos, playlistSongs, weddingDetails, photoLikes, songLikes } from '../shared/schema'
import { sql } from 'drizzle-orm'
import path from 'path'
import fs from 'fs'

let app: express.Express
let server: any

beforeAll(async () => {
  // Setup test environment
  process.env.NODE_ENV = 'test'
  
  app = express()
  app.use(express.json())
  server = await registerRoutes(app)
  
  // Try to clean database, but don't fail if it doesn't work
  // This allows tests to run even with connection issues
  try {
    await db.delete(photoLikes)
    await db.delete(songLikes)
    await db.delete(photos)
    await db.delete(playlistSongs)
    await db.delete(weddingDetails)
    console.log('Database cleaned successfully')
  } catch (error) {
    console.warn('Database cleanup failed, tests may have stale data:', error.message)
    // Continue with tests even if cleanup fails
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

describe('Wedding Details API', () => {
  it('should create default wedding details if none exist', async () => {
    const response = await request(app)
      .get('/api/wedding-details')
      .expect(200)

    expect(response.body).toMatchObject({
      coupleNames: 'Marcela & Zbyněk',
      venue: 'Stará pošta, Kovalovice',
      allowUploads: true,
      moderateUploads: false
    })
    expect(response.body.id).toBeDefined()
  })

  it('should update wedding details', async () => {
    // First create default details
    await request(app).get('/api/wedding-details')

    const updateData = {
      coupleNames: 'Jana & Pavel',
      venue: 'Nové místo',
      allowUploads: false
    }

    const response = await request(app)
      .patch('/api/wedding-details')
      .send(updateData)
      .expect(200)

    expect(response.body).toMatchObject(updateData)
  })

  it('should validate wedding details update data', async () => {
    const invalidData = {
      weddingDate: 'invalid-date'
    }

    await request(app)
      .patch('/api/wedding-details')
      .send(invalidData)
      .expect(400)
  })
})

describe('Photos API', () => {
  it('should get empty photos list initially', async () => {
    const response = await request(app)
      .get('/api/photos')
      .expect(200)

    expect(response.body).toEqual([])
  })

  it('should filter photos by approval status', async () => {
    // Insert test photos
    await db.insert(photos).values([
      {
        filename: 'test1.jpg',
        originalName: 'test1.jpg',
        url: '/uploads/test1.jpg',
        thumbnailUrl: '/uploads/test1.jpg',
        approved: true
      },
      {
        filename: 'test2.jpg',
        originalName: 'test2.jpg',
        url: '/uploads/test2.jpg',
        thumbnailUrl: '/uploads/test2.jpg',
        approved: false
      }
    ])

    const approvedResponse = await request(app)
      .get('/api/photos?approved=true')
      .expect(200)

    const pendingResponse = await request(app)
      .get('/api/photos?approved=false')
      .expect(200)

    expect(approvedResponse.body).toHaveLength(1)
    expect(pendingResponse.body).toHaveLength(1)
    expect(approvedResponse.body[0].approved).toBe(true)
    expect(pendingResponse.body[0].approved).toBe(false)
  })

  it('should handle photo upload without files', async () => {
    await request(app)
      .post('/api/photos/upload')
      .expect(400)
      .expect(res => {
        expect(res.body.message).toBe('No files uploaded')
      })
  })

  it('should toggle photo likes', async () => {
    // Insert test photo
    const [photo] = await db.insert(photos).values({
      filename: 'test.jpg',
      originalName: 'test.jpg',
      url: '/uploads/test.jpg',
      thumbnailUrl: '/uploads/test.jpg',
      approved: true
    }).returning()

    // First like
    const likeResponse = await request(app)
      .post(`/api/photos/${photo.id}/like`)
      .expect(200)

    expect(likeResponse.body).toMatchObject({
      liked: true,
      likes: 1
    })

    // Unlike
    const unlikeResponse = await request(app)
      .post(`/api/photos/${photo.id}/like`)
      .expect(200)

    expect(unlikeResponse.body).toMatchObject({
      liked: false,
      likes: 0
    })
  })

  it('should delete photo and its likes', async () => {
    // Insert test photo
    const [photo] = await db.insert(photos).values({
      filename: 'test.jpg',
      originalName: 'test.jpg',
      url: '/uploads/test.jpg',
      thumbnailUrl: '/uploads/test.jpg',
      approved: true
    }).returning()

    // Add a like
    await request(app).post(`/api/photos/${photo.id}/like`)

    // Delete photo
    await request(app)
      .delete(`/api/photos/${photo.id}`)
      .expect(200)

    // Verify photo is deleted
    const photosResponse = await request(app)
      .get('/api/photos')
      .expect(200)

    expect(photosResponse.body).toHaveLength(0)
  })

  it('should approve photo', async () => {
    // Insert unapproved photo
    const [photo] = await db.insert(photos).values({
      filename: 'test.jpg',
      originalName: 'test.jpg',
      url: '/uploads/test.jpg',
      thumbnailUrl: '/uploads/test.jpg',
      approved: false
    }).returning()

    await request(app)
      .patch(`/api/photos/${photo.id}/approve`)
      .expect(200)

    // Verify photo is approved
    const photosResponse = await request(app)
      .get('/api/photos?approved=true')
      .expect(200)

    expect(photosResponse.body).toHaveLength(1)
    expect(photosResponse.body[0].approved).toBe(true)
  })
})

describe('Playlist API', () => {
  it('should get empty playlist initially', async () => {
    const response = await request(app)
      .get('/api/playlist')
      .expect(200)

    expect(response.body).toEqual([])
  })

  it('should add song to playlist', async () => {
    const songData = {
      suggestion: 'Queen - Bohemian Rhapsody',
      title: 'Bohemian Rhapsody',
      artist: 'Queen'
    }

    const response = await request(app)
      .post('/api/playlist')
      .send(songData)
      .expect(200)

    expect(response.body).toMatchObject(songData)
    expect(response.body.id).toBeDefined()
    expect(response.body.likes).toBe(0)
    expect(response.body.approved).toBe(true)
  })

  it('should validate song data', async () => {
    const invalidData = {
      // missing required suggestion field
      title: 'Test Song'
    }

    await request(app)
      .post('/api/playlist')
      .send(invalidData)
      .expect(400)
  })

  it('should toggle song likes', async () => {
    // Insert test song
    const [song] = await db.insert(playlistSongs).values({
      suggestion: 'Test Song',
      title: 'Test Song',
      approved: true
    }).returning()

    // First like
    const likeResponse = await request(app)
      .post(`/api/playlist/${song.id}/like`)
      .expect(200)

    expect(likeResponse.body).toMatchObject({
      liked: true,
      likes: 1
    })

    // Unlike
    const unlikeResponse = await request(app)
      .post(`/api/playlist/${song.id}/like`)
      .expect(200)

    expect(unlikeResponse.body).toMatchObject({
      liked: false,
      likes: 0
    })
  })

  it('should delete song and its likes', async () => {
    // Insert test song
    const [song] = await db.insert(playlistSongs).values({
      suggestion: 'Test Song',
      title: 'Test Song',
      approved: true
    }).returning()

    // Add a like
    await request(app).post(`/api/playlist/${song.id}/like`)

    // Delete song
    await request(app)
      .delete(`/api/playlist/${song.id}`)
      .expect(200)

    // Verify song is deleted
    const playlistResponse = await request(app)
      .get('/api/playlist')
      .expect(200)

    expect(playlistResponse.body).toHaveLength(0)
  })

  it('should only return approved songs', async () => {
    // Insert approved and unapproved songs
    await db.insert(playlistSongs).values([
      {
        suggestion: 'Approved Song',
        title: 'Approved Song',
        approved: true
      },
      {
        suggestion: 'Unapproved Song',
        title: 'Unapproved Song',
        approved: false
      }
    ])

    const response = await request(app)
      .get('/api/playlist')
      .expect(200)

    expect(response.body).toHaveLength(1)
    expect(response.body[0].suggestion).toBe('Approved Song')
  })
})

describe('User Session Handling', () => {
  it('should handle likes from different user sessions', async () => {
    // Insert test photo
    const [photo] = await db.insert(photos).values({
      filename: 'test.jpg',
      originalName: 'test.jpg',
      url: '/uploads/test.jpg',
      thumbnailUrl: '/uploads/test.jpg',
      approved: true
    }).returning()

    // Like from first user
    const user1Agent = request.agent(app)
    const like1Response = await user1Agent
      .post(`/api/photos/${photo.id}/like`)
      .set('User-Agent', 'User1')
      .expect(200)

    expect(like1Response.body.likes).toBe(1)

    // Like from second user
    const user2Agent = request.agent(app)
    const like2Response = await user2Agent
      .post(`/api/photos/${photo.id}/like`)
      .set('User-Agent', 'User2')
      .expect(200)

    expect(like2Response.body.likes).toBe(2)

    // First user unlikes
    const unlike1Response = await user1Agent
      .post(`/api/photos/${photo.id}/like`)
      .set('User-Agent', 'User1')
      .expect(200)

    expect(unlike1Response.body.likes).toBe(1)
  })
})