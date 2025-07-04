import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import { DatabaseStorage } from '../server/storage'
import { db } from '../server/db'
import { photos, playlistSongs, weddingDetails, photoLikes, songLikes } from '../shared/schema'

const storage = new DatabaseStorage()

beforeEach(async () => {
  // Clean database before each test
  await db.delete(photoLikes)
  await db.delete(songLikes)
  await db.delete(photos)
  await db.delete(playlistSongs)
  await db.delete(weddingDetails)
})

afterAll(async () => {
  // Clean up after all tests
  await db.delete(photoLikes)
  await db.delete(songLikes)
  await db.delete(photos)
  await db.delete(playlistSongs)
  await db.delete(weddingDetails)
})

describe('DatabaseStorage - Photos', () => {
  it('should create and retrieve photos', async () => {
    const photoData = {
      filename: 'test.jpg',
      originalName: 'test-photo.jpg',
      url: '/uploads/test.jpg',
      thumbnailUrl: '/uploads/thumb_test.jpg',
      approved: true
    }

    const created = await storage.createPhoto(photoData)
    expect(created).toMatchObject(photoData)
    expect(created.id).toBeDefined()
    expect(created.likes).toBe(0)

    const retrieved = await storage.getPhoto(created.id)
    expect(retrieved).toMatchObject(photoData)
  })

  it('should filter photos by approval status', async () => {
    await storage.createPhoto({
      filename: 'approved.jpg',
      originalName: 'approved.jpg',
      url: '/uploads/approved.jpg',
      thumbnailUrl: '/uploads/approved.jpg',
      approved: true
    })

    await storage.createPhoto({
      filename: 'pending.jpg',
      originalName: 'pending.jpg',
      url: '/uploads/pending.jpg',
      thumbnailUrl: '/uploads/pending.jpg',
      approved: false
    })

    const approvedPhotos = await storage.getPhotos(true)
    const pendingPhotos = await storage.getPhotos(false)
    const allPhotos = await storage.getPhotos()

    expect(approvedPhotos).toHaveLength(1)
    expect(pendingPhotos).toHaveLength(1)
    expect(allPhotos).toHaveLength(2)
    expect(approvedPhotos[0].approved).toBe(true)
    expect(pendingPhotos[0].approved).toBe(false)
  })

  it('should approve photos', async () => {
    const photo = await storage.createPhoto({
      filename: 'test.jpg',
      originalName: 'test.jpg',
      url: '/uploads/test.jpg',
      thumbnailUrl: '/uploads/test.jpg',
      approved: false
    })

    await storage.approvePhoto(photo.id)

    const updated = await storage.getPhoto(photo.id)
    expect(updated?.approved).toBe(true)
  })

  it('should delete photos and associated likes', async () => {
    const photo = await storage.createPhoto({
      filename: 'test.jpg',
      originalName: 'test.jpg',
      url: '/uploads/test.jpg',
      thumbnailUrl: '/uploads/test.jpg',
      approved: true
    })

    // Add some likes
    await storage.togglePhotoLike(photo.id, 'user1')
    await storage.togglePhotoLike(photo.id, 'user2')

    await storage.deletePhoto(photo.id)

    const deletedPhoto = await storage.getPhoto(photo.id)
    expect(deletedPhoto).toBeUndefined()

    const allPhotos = await storage.getPhotos()
    expect(allPhotos).toHaveLength(0)
  })

  it('should handle photo likes correctly', async () => {
    const photo = await storage.createPhoto({
      filename: 'test.jpg',
      originalName: 'test.jpg',
      url: '/uploads/test.jpg',
      thumbnailUrl: '/uploads/test.jpg',
      approved: true
    })

    // First like
    const result1 = await storage.togglePhotoLike(photo.id, 'user1')
    expect(result1.liked).toBe(true)
    expect(result1.likes).toBe(1)

    // Same user likes again (should unlike)
    const result2 = await storage.togglePhotoLike(photo.id, 'user1')
    expect(result2.liked).toBe(false)
    expect(result2.likes).toBe(0)

    // Different user likes
    const result3 = await storage.togglePhotoLike(photo.id, 'user2')
    expect(result3.liked).toBe(true)
    expect(result3.likes).toBe(1)

    // First user likes again
    const result4 = await storage.togglePhotoLike(photo.id, 'user1')
    expect(result4.liked).toBe(true)
    expect(result4.likes).toBe(2)
  })
})

describe('DatabaseStorage - Playlist', () => {
  it('should create and retrieve playlist songs', async () => {
    const songData = {
      suggestion: 'Queen - Bohemian Rhapsody',
      title: 'Bohemian Rhapsody',
      artist: 'Queen',
      approved: true
    }

    const created = await storage.createPlaylistSong(songData)
    expect(created).toMatchObject(songData)
    expect(created.id).toBeDefined()
    expect(created.likes).toBe(0)

    const songs = await storage.getPlaylistSongs()
    expect(songs).toHaveLength(1)
    expect(songs[0]).toMatchObject(songData)
  })

  it('should only return approved songs', async () => {
    await storage.createPlaylistSong({
      suggestion: 'Approved Song',
      title: 'Approved Song',
      approved: true
    })

    await storage.createPlaylistSong({
      suggestion: 'Unapproved Song',
      title: 'Unapproved Song',
      approved: false
    })

    const songs = await storage.getPlaylistSongs()
    expect(songs).toHaveLength(1)
    expect(songs[0].suggestion).toBe('Approved Song')
  })

  it('should handle song likes correctly', async () => {
    const song = await storage.createPlaylistSong({
      suggestion: 'Test Song',
      title: 'Test Song',
      approved: true
    })

    // First like
    const result1 = await storage.toggleSongLike(song.id, 'user1')
    expect(result1.liked).toBe(true)
    expect(result1.likes).toBe(1)

    // Same user likes again (should unlike)
    const result2 = await storage.toggleSongLike(song.id, 'user1')
    expect(result2.liked).toBe(false)
    expect(result2.likes).toBe(0)

    // Different user likes
    const result3 = await storage.toggleSongLike(song.id, 'user2')
    expect(result3.liked).toBe(true)
    expect(result3.likes).toBe(1)
  })

  it('should delete songs and associated likes', async () => {
    const song = await storage.createPlaylistSong({
      suggestion: 'Test Song',
      title: 'Test Song',
      approved: true
    })

    // Add some likes
    await storage.toggleSongLike(song.id, 'user1')
    await storage.toggleSongLike(song.id, 'user2')

    await storage.deletePlaylistSong(song.id)

    const songs = await storage.getPlaylistSongs()
    expect(songs).toHaveLength(0)
  })
})

describe('DatabaseStorage - Wedding Details', () => {
  it('should create wedding details', async () => {
    const detailsData = {
      coupleNames: 'John & Jane',
      weddingDate: new Date('2025-06-15'),
      venue: 'Beautiful Garden',
      venueAddress: '123 Garden St',
      allowUploads: true,
      moderateUploads: false
    }

    const created = await storage.createWeddingDetails(detailsData)
    expect(created).toMatchObject(detailsData)
    expect(created.id).toBeDefined()
  })

  it('should retrieve wedding details', async () => {
    const detailsData = {
      coupleNames: 'John & Jane',
      weddingDate: new Date('2025-06-15'),
      venue: 'Beautiful Garden',
      allowUploads: true,
      moderateUploads: false
    }

    await storage.createWeddingDetails(detailsData)

    const retrieved = await storage.getWeddingDetails()
    expect(retrieved).toMatchObject(detailsData)
  })

  it('should update wedding details', async () => {
    const originalData = {
      coupleNames: 'John & Jane',
      weddingDate: new Date('2025-06-15'),
      venue: 'Beautiful Garden',
      allowUploads: true,
      moderateUploads: false
    }

    await storage.createWeddingDetails(originalData)

    const updateData = {
      coupleNames: 'Updated Names',
      venue: 'New Venue',
      allowUploads: false
    }

    const updated = await storage.updateWeddingDetails(updateData)
    expect(updated.coupleNames).toBe('Updated Names')
    expect(updated.venue).toBe('New Venue')
    expect(updated.allowUploads).toBe(false)
    expect(updated.moderateUploads).toBe(false) // Should keep original value
  })

  it('should return undefined when no wedding details exist', async () => {
    const details = await storage.getWeddingDetails()
    expect(details).toBeUndefined()
  })
})