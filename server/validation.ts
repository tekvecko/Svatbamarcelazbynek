// Input validation utilities for server-side security

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
export const ALLOWED_IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|gif|webp)$/i;

/**
 * Validates uploaded file
 */
export function validateImageFile(file: Express.Multer.File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    return { valid: false, error: 'Invalid file type. Only JPEG, PNG, GIF, and WEBP are allowed.' };
  }

  // Check file extension
  if (!ALLOWED_IMAGE_EXTENSIONS.test(file.originalname)) {
    return { valid: false, error: 'Invalid file extension' };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` };
  }

  return { valid: true };
}

/**
 * Sanitizes a string for safe database storage
 */
export function sanitizeString(input: string, maxLength: number = 255): string {
  if (!input) return '';
  
  return input
    .trim()
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .substring(0, maxLength);
}

/**
 * Validates pagination parameters
 */
export function validatePagination(page?: number, limit?: number): { page: number; limit: number } {
  const validPage = Math.max(1, Math.round(page || 1));
  const validLimit = Math.min(100, Math.max(1, Math.round(limit || 12)));
  
  return { page: validPage, limit: validLimit };
}

/**
 * Validates ID parameter
 */
export function validateId(id: string | number): number | null {
  const parsed = parseInt(String(id), 10);
  return isNaN(parsed) || parsed < 1 ? null : parsed;
}