import React, { useState, useRef } from 'react';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { useAuth } from '../../hooks/useAuth';
import { DefaultProfilePicture } from '../ui/DefaultProfilePicture';

interface ProfilePictureUploadProps {
  onSuccess?: (url: string) => void;
  onError?: (error: string) => void;
}

export const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  onSuccess,
  onError
}) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      onError?.('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      onError?.('Image must be smaller than 5MB');
      return;
    }

    setUploading(true);

    try {
      const storage = getStorage();
      const storageRef = ref(storage, `users/${user.uid}/profile/${Date.now()}-${file.name}`);
      
      // Upload file
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      // Update Firebase Auth profile
      await updateProfile(user, {
        photoURL: downloadURL
      });

      onSuccess?.(downloadURL);
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      onError?.('Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <div className="relative group">
        {user?.photoURL ? (
          <img
            src={user.photoURL}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border-4 border-primary"
          />
        ) : (
          <DefaultProfilePicture size={96} className="border-4 border-primary" />
        )}
        
        <button
          onClick={triggerFileSelect}
          disabled={uploading}
          className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 rounded-full flex items-center justify-center transition-all duration-200 group-hover:bg-opacity-20"
        >
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {uploading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </div>
        </button>
        
        {uploading && (
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <div className="bg-primary text-white text-xs px-2 py-1 rounded-full">
              Uploading...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};