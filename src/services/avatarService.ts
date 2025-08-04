import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { storage, auth } from '../config/firebase';

export class AvatarService {
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private static readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  static validateFile(file: File): string | null {
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return 'Please select a valid image file (JPEG, PNG, GIF, or WebP)';
    }

    if (file.size > this.MAX_FILE_SIZE) {
      return 'File size must be less than 5MB';
    }

    return null;
  }

  static async compressImage(file: File, maxWidth: number = 800, quality: number = 0.8): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        const { width, height } = img;
        let { width: newWidth, height: newHeight } = img;

        if (width > maxWidth) {
          newWidth = maxWidth;
          newHeight = (height * maxWidth) / width;
        }

        // Set canvas dimensions
        canvas.width = newWidth;
        canvas.height = newHeight;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, newWidth, newHeight);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          file.type,
          quality
        );
      };

      img.src = URL.createObjectURL(file);
    });
  }

  static async uploadAvatar(file: File): Promise<string> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be authenticated to upload avatar');
    }

    // Validate file
    const validationError = this.validateFile(file);
    if (validationError) {
      throw new Error(validationError);
    }

    try {
      // Compress image if needed
      const compressedFile = await this.compressImage(file);

      // Create unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const extension = compressedFile.name.split('.').pop();
      const filename = `avatars/${user.uid}/${timestamp}_${randomString}.${extension}`;

      // Upload to Firebase Storage
      const storageRef = ref(storage, filename);
      const snapshot = await uploadBytes(storageRef, compressedFile);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Update user profile
      await updateProfile(user, { photoURL: downloadURL });

      return downloadURL;
    } catch (error) {
      console.error('Avatar upload error:', error);
      throw new Error('Failed to upload avatar. Please try again.');
    }
  }

  static async deleteCurrentAvatar(): Promise<void> {
    const user = auth.currentUser;
    if (!user || !user.photoURL) {
      return;
    }

    try {
      // Delete from storage if it's a Firebase Storage URL
      if (user.photoURL.includes('firebasestorage.googleapis.com')) {
        const storageRef = ref(storage, user.photoURL);
        await deleteObject(storageRef);
      }

      // Update user profile
      await updateProfile(user, { photoURL: null });
    } catch (error) {
      console.error('Avatar deletion error:', error);
      throw new Error('Failed to delete avatar. Please try again.');
    }
  }

  static generateInitials(displayName: string | null): string {
    if (!displayName) return 'T'; // Tamu (Guest)

    return displayName
      .split(' ')
      .map(name => name.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }

  static generateAvatarColor(userId: string): string {
    const colors = [
      '#F43F5E', // Rose
      '#EF4444', // Red
      '#F97316', // Orange
      '#F59E0B', // Amber
      '#EAB308', // Yellow
      '#84CC16', // Lime
      '#22C55E', // Green
      '#10B981', // Emerald
      '#14B8A6', // Teal
      '#06B6D4', // Cyan
      '#0EA5E9', // Sky
      '#3B82F6', // Blue
      '#6366F1', // Indigo
      '#8B5CF6', // Violet
      '#A855F7', // Purple
      '#D946EF', // Fuchsia
    ];

    // Generate consistent color based on user ID
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  }
}