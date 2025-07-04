import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";

const API_BASE_URL = "";
const IS_STATIC = !import.meta.env.DEV; // Use static mode in production

export interface Photo {
  id: number;
  filename: string;
  originalName: string;
  url: string;
  thumbnailUrl: string;
  likes: number;
  approved: boolean;
  uploadedAt: string;
  commentCount?: number;
}

export interface PlaylistSong {
  id: number;
  title: string;
  artist: string;
  likes: number;
  addedAt: string;
}

export interface PhotoComment {
  id: number;
  photoId: number;
  author: string;
  text: string;
  createdAt: string;
}

export interface WeddingDetails {
  id: number;
  coupleNames: string;
  weddingDate: string;
  venue: string;
  venueAddress: string;
  allowUploads: boolean;
  moderateUploads: boolean;
}

// Static data for when API is not available
const STATIC_WEDDING_DETAILS: WeddingDetails = {
  id: 1,
  coupleNames: "Marcela & Zbyněk",
  weddingDate: "2025-10-11T14:00:00",
  venue: "Stará pošta, Kovalovice",
  venueAddress: "Kovalovice 109, 664 07 Kovalovice",
  allowUploads: false, // Disable uploads in static mode
  moderateUploads: false,
};

const STATIC_PHOTOS: Photo[] = [
  {
    id: 1,
    filename: "wedding-ceremony-1.jpg",
    originalName: "Svatební obřad - výměna prstenů",
    url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop",
    thumbnailUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop",
    likes: 0,
    approved: true,
    uploadedAt: new Date().toISOString(),
    commentCount: 0
  },
  {
    id: 2,
    filename: "wedding-kiss-2.jpg", 
    originalName: "První polibek jako manželé",
    url: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&h=600&fit=crop",
    thumbnailUrl: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400&h=300&fit=crop",
    likes: 0,
    approved: true,
    uploadedAt: new Date().toISOString(),
    commentCount: 0
  },
  {
    id: 3,
    filename: "wedding-rings-3.jpg",
    originalName: "Svatební prsteny na polštářku",
    url: "https://images.unsplash.com/photo-1594241483888-76ad31b7e17a?w=800&h=600&fit=crop",
    thumbnailUrl: "https://images.unsplash.com/photo-1594241483888-76ad31b7e17a?w=400&h=300&fit=crop",
    likes: 0,
    approved: true,
    uploadedAt: new Date().toISOString(),
    commentCount: 0
  },
  {
    id: 4,
    filename: "wedding-dance-4.jpg",
    originalName: "První tanec",
    url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&h=600&fit=crop",
    thumbnailUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=300&fit=crop",
    likes: 0,
    approved: true,
    uploadedAt: new Date().toISOString(),
    commentCount: 0
  },
  {
    id: 5,
    filename: "wedding-bouquet-5.jpg",
    originalName: "Nevěstin pugét",
    url: "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800&h=600&fit=crop",
    thumbnailUrl: "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=400&h=300&fit=crop",
    likes: 0,
    approved: true,
    uploadedAt: new Date().toISOString(),
    commentCount: 0
  }
];

// LocalStorage helpers
const getLocalStorageData = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const setLocalStorageData = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} - ${errorText}`);
  }
  return response.json();
}

export const api = {
  async getWeddingDetails(): Promise<WeddingDetails> {
    if (IS_STATIC) {
      return STATIC_WEDDING_DETAILS;
    }
    const response = await fetch(`${API_BASE_URL}/api/wedding-details`);
    return handleResponse<WeddingDetails>(response);
  },

  async updateWeddingDetails(details: Partial<WeddingDetails>): Promise<WeddingDetails> {
    if (IS_STATIC) {
      throw new Error("Updates not available in static mode");
    }
    const response = await fetch(`${API_BASE_URL}/api/wedding-details`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(details),
    });
    return handleResponse<WeddingDetails>(response);
  },

  async getPhotos(approved?: boolean): Promise<Photo[]> {
    if (IS_STATIC) {
      const storedPhotos = getLocalStorageData('wedding-photos', STATIC_PHOTOS);
      const storedLikes = getLocalStorageData('photo-likes', {} as Record<number, number>);
      const storedComments = getLocalStorageData('photo-comments', {} as Record<number, any[]>);

      return storedPhotos.map(photo => ({
        ...photo,
        likes: storedLikes[photo.id] || 0,
        commentCount: (storedComments[photo.id] || []).length
      }));
    }
    const params = new URLSearchParams();
    if (approved !== undefined) {
      params.append("approved", String(approved));
    }
    const response = await fetch(`${API_BASE_URL}/api/photos?${params}`);
    return handleResponse<Photo[]>(response);
  },

  async uploadPhotos(files: FileList): Promise<Photo[]> {
    if (IS_STATIC) {
      throw new Error("Upload not available in static mode");
    }

    // Get wedding details to check moderation settings
    const weddingDetails = await api.getWeddingDetails();
    const shouldAutoApprove = !weddingDetails.moderateUploads;

    const uploadedPhotos = [];
    
    for (const file of Array.from(files)) {
      try {
        // Get signed upload parameters
        const signatureResponse = await fetch(`${API_BASE_URL}/api/upload-signature`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        
        if (!signatureResponse.ok) {
          throw new Error('Failed to get upload signature');
        }
        
        const { signature, timestamp, cloudName, apiKey, folder } = await signatureResponse.json();
        
        // Upload directly to Cloudinary
        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', apiKey);
        formData.append('timestamp', timestamp.toString());
        formData.append('signature', signature);
        formData.append('folder', folder);
        
        const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData,
        });
        
        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          console.error('Cloudinary upload error:', errorText);
          throw new Error(`Failed to upload to Cloudinary: ${uploadResponse.status} ${errorText}`);
        }
        
        const uploadResult = await uploadResponse.json();
        
        // Save photo metadata to database
        const photoData = {
          filename: uploadResult.public_id,
          originalName: file.name,
          url: uploadResult.secure_url,
          thumbnailUrl: uploadResult.secure_url.replace('/upload/', '/upload/c_thumb,w_300,h_300/'),
          approved: shouldAutoApprove, // Auto-approve based on settings
        };
        
        const saveResponse = await fetch(`${API_BASE_URL}/api/photos/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(photoData),
        });
        
        if (!saveResponse.ok) {
          throw new Error('Failed to save photo metadata');
        }
        
        const savedPhoto = await saveResponse.json();
        uploadedPhotos.push(savedPhoto);
        
      } catch (error) {
        console.error('Error uploading file:', file.name, error);
        throw error;
      }
    }
    
    return uploadedPhotos;
  },

  async togglePhotoLike(photoId: number): Promise<{ liked: boolean; likes: number }> {
    if (IS_STATIC) {
      const userLikes = getLocalStorageData(`user-likes`, {} as Record<number, boolean>);
      const photoLikes = getLocalStorageData('photo-likes', {} as Record<number, number>);

      const isLiked = userLikes[photoId] || false;
      const newLikedState = !isLiked;
      const currentLikes = photoLikes[photoId] || 0;
      const newLikes = newLikedState ? currentLikes + 1 : Math.max(0, currentLikes - 1);

      userLikes[photoId] = newLikedState;
      photoLikes[photoId] = newLikes;

      setLocalStorageData('user-likes', userLikes);
      setLocalStorageData('photo-likes', photoLikes);

      return { liked: newLikedState, likes: newLikes };
    }
    const response = await fetch(`${API_BASE_URL}/api/photos/${photoId}/like`, {
      method: "POST",
    });
    return handleResponse<{ liked: boolean; likes: number }>(response);
  },

  async deletePhoto(photoId: number): Promise<void> {
    if (IS_STATIC) {
      throw new Error("Delete not available in static mode");
    }
    const response = await fetch(`${API_BASE_URL}/api/photos/${photoId}`, {
      method: "DELETE",
    });
    await handleResponse<void>(response);
  },

  async approvePhoto(photoId: number): Promise<void> {
    if (IS_STATIC) {
      throw new Error("Approve not available in static mode");
    }
    const response = await fetch(`${API_BASE_URL}/api/photos/${photoId}/approve`, {
      method: "PATCH",
    });
    await handleResponse<void>(response);
  },

  async getPlaylistSongs(): Promise<PlaylistSong[]> {
    if (IS_STATIC) {
      const storedSongs = getLocalStorageData('playlist-songs', [] as PlaylistSong[]);
      const storedLikes = getLocalStorageData('song-likes', {} as Record<number, number>);

      return storedSongs.map(song => ({
        ...song,
        likes: storedLikes[song.id] || 0
      }));
    }
    const response = await fetch(`${API_BASE_URL}/api/playlist`);
    return handleResponse<PlaylistSong[]>(response);
  },

  async addPlaylistSong(song: { title: string; artist: string }): Promise<PlaylistSong> {
    if (IS_STATIC) {
      const storedSongs = getLocalStorageData('playlist-songs', [] as PlaylistSong[]);
      const newSong: PlaylistSong = {
        id: Date.now(),
        title: song.title,
        artist: song.artist,
        likes: 0,
        addedAt: new Date().toISOString()
      };

      const updatedSongs = [...storedSongs, newSong];
      setLocalStorageData('playlist-songs', updatedSongs);
      return newSong;
    }
    const response = await fetch(`${API_BASE_URL}/api/playlist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(song),
    });
    return handleResponse<PlaylistSong>(response);
  },

  async toggleSongLike(songId: number): Promise<{ liked: boolean; likes: number }> {
    if (IS_STATIC) {
      const userLikes = getLocalStorageData(`user-song-likes`, {} as Record<number, boolean>);
      const songLikes = getLocalStorageData('song-likes', {} as Record<number, number>);

      const isLiked = userLikes[songId] || false;
      const newLikedState = !isLiked;
      const currentLikes = songLikes[songId] || 0;
      const newLikes = newLikedState ? currentLikes + 1 : Math.max(0, currentLikes - 1);

      userLikes[songId] = newLikedState;
      songLikes[songId] = newLikes;

      setLocalStorageData('user-song-likes', userLikes);
      setLocalStorageData('song-likes', songLikes);

      return { liked: newLikedState, likes: newLikes };
    }
    const response = await fetch(`${API_BASE_URL}/api/playlist/${songId}/like`, {
      method: "POST",
    });
    return handleResponse<{ liked: boolean; likes: number }>(response);
  },

  async deletePlaylistSong(songId: number): Promise<void> {
    if (IS_STATIC) {
      const storedSongs = getLocalStorageData('playlist-songs', [] as PlaylistSong[]);
      const updatedSongs = storedSongs.filter(song => song.id !== songId);
      setLocalStorageData('playlist-songs', updatedSongs);
      return;
    }
    const response = await fetch(`${API_BASE_URL}/api/playlist/${songId}`, {
      method: "DELETE",
    });
    await handleResponse<void>(response);
  },

  async getPhotoComments(photoId: number): Promise<PhotoComment[]> {
    if (IS_STATIC) {
      const storedComments = getLocalStorageData('photo-comments', {} as Record<number, PhotoComment[]>);
      return storedComments[photoId] || [];
    }
    const response = await fetch(`${API_BASE_URL}/api/photos/${photoId}/comments`);
    return handleResponse<PhotoComment[]>(response);
  },

  async addPhotoComment(photoId: number, author: string, text: string): Promise<PhotoComment> {
    if (IS_STATIC) {
      const storedComments = getLocalStorageData('photo-comments', {} as Record<number, PhotoComment[]>);
      const newComment: PhotoComment = {
        id: Date.now(),
        photoId,
        author,
        text,
        createdAt: new Date().toISOString()
      };

      const photoComments = storedComments[photoId] || [];
      storedComments[photoId] = [...photoComments, newComment];
      setLocalStorageData('photo-comments', storedComments);
      return newComment;
    }
    const response = await fetch(`${API_BASE_URL}/api/photos/${photoId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ author, text }),
    });
    return handleResponse<PhotoComment>(response);
  },
};