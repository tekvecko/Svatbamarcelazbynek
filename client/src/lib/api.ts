import { apiRequest } from "./queryClient";

export interface Photo {
  id: number;
  filename: string;
  originalName: string;
  url: string;
  thumbnailUrl: string;
  likes: number;
  approved: boolean;
  uploadedAt: string;
}

export interface PlaylistSong {
  id: number;
  title: string;
  artist?: string;
  suggestion: string;
  likes: number;
  approved: boolean;
  submittedAt: string;
}

export interface WeddingDetails {
  id: number;
  coupleNames: string;
  weddingDate: string;
  venue: string;
  venueAddress?: string;
  allowUploads: boolean;
  moderateUploads: boolean;
  updatedAt: string;
}

export const api = {
  // Wedding details
  getWeddingDetails: async (): Promise<WeddingDetails> => {
    const response = await apiRequest("GET", "/api/wedding-details");
    return response.json();
  },

  updateWeddingDetails: async (details: Partial<WeddingDetails>): Promise<WeddingDetails> => {
    const response = await apiRequest("PATCH", "/api/wedding-details", details);
    return response.json();
  },

  // Photos
  getPhotos: async (approved?: boolean): Promise<Photo[]> => {
    const params = approved !== undefined ? `?approved=${approved}` : '';
    const response = await apiRequest("GET", `/api/photos${params}`);
    return response.json();
  },

  uploadPhotos: async (files: FileList): Promise<Photo[]> => {
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('photos', file);
      });

      const response = await fetch('/api/photos/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(`Upload failed: ${errorData.message || response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Photo upload error:', error);
      throw error;
    }
  },

  togglePhotoLike: async (photoId: number): Promise<{ liked: boolean; likes: number }> => {
    const response = await apiRequest("POST", `/api/photos/${photoId}/like`);
    return response.json();
  },

  deletePhoto: async (photoId: number): Promise<void> => {
    await apiRequest("DELETE", `/api/photos/${photoId}`);
  },

  approvePhoto: async (photoId: number): Promise<void> => {
    await apiRequest("PATCH", `/api/photos/${photoId}/approve`);
  },

  // Playlist
  getPlaylist: async (): Promise<PlaylistSong[]> => {
    const response = await apiRequest("GET", "/api/playlist");
    return response.json();
  },

  addSong: async (song: { suggestion: string; title?: string; artist?: string }): Promise<PlaylistSong> => {
    const response = await apiRequest("POST", "/api/playlist", song);
    return response.json();
  },

  toggleSongLike: async (songId: number): Promise<{ liked: boolean; likes: number }> => {
    const response = await apiRequest("POST", `/api/playlist/${songId}/like`);
    return response.json();
  },

  deleteSong: async (songId: number): Promise<void> => {
    await apiRequest("DELETE", `/api/playlist/${songId}`);
  },
};
