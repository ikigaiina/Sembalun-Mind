import React, { useState, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { AvatarService } from '../../services/avatarService';

interface AvatarUploadProps {
  currentPhotoURL?: string | null;
  onSuccess?: (photoURL: string) => void;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({ currentPhotoURL, onSuccess }) => {
  const { updateUserProfile, userProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file using service
    const validationError = AvatarService.validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError('');

    try {
      // Upload to Storage using service
      const photoURL = await AvatarService.uploadAvatar(file);
      
      // Update user profile
      await updateUserProfile({ photoURL });
      setPreview(null);
      onSuccess?.(photoURL);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    setUploading(true);
    setError('');

    try {
      // Delete from storage using service
      await AvatarService.deleteCurrentAvatar();
      
      // Update user profile
      await updateUserProfile({ photoURL: null });
      setPreview(null);
      onSuccess?.('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to remove profile photo');
    } finally {
      setUploading(false);
    }
  };

  const currentPhoto = preview || currentPhotoURL;
  const initials = AvatarService.generateInitials(userProfile?.displayName || null);
  const avatarColor = userProfile?.uid ? AvatarService.generateAvatarColor(userProfile.uid) : '#6B7280';

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
          {currentPhoto ? (
            <img
              src={currentPhoto}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center text-white text-2xl font-bold"
              style={{ backgroundColor: avatarColor }}
            >
              {initials}
            </div>
          )}
        </div>

        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="absolute bottom-0 right-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {error && (
        <p className="text-sm text-red-600 text-center">{error}</p>
      )}

      <div className="text-center">
        <p className="text-sm text-gray-600 mb-2">
          Click the camera icon to upload a new photo
        </p>
        <p className="text-xs text-gray-500">
          JPG, PNG or GIF. Max file size 5MB.
        </p>
      </div>

      {currentPhoto && (
        <Button
          variant="outline"
          onClick={handleRemovePhoto}
          disabled={uploading}
          className="text-red-600 border-red-200 hover:bg-red-50"
        >
          Remove Photo
        </Button>
      )}
    </div>
  );
};