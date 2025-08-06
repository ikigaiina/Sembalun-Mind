import React, { useState } from 'react';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';

interface ProfileHeaderProps {
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    joinedDate: Date;
    level?: string;
    currentStreak: number;
    totalSessions: number;
    totalMinutes: number;
    badges?: string[];
  };
  isEditable?: boolean;
  onEdit?: () => void;
  onAvatarUpload?: (file: File) => void;
  className?: string;
}

/**
 * Comprehensive user profile header component
 * 
 * Features:
 * - User information display
 * - Avatar with upload capability
 * - Quick stats overview
 * - Achievement badges
 * - Level progression
 * - Edit profile functionality
 * - Accessibility support
 * - Responsive design
 */
export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  isEditable = false,
  onEdit,
  onAvatarUpload,
  className = ''
}) => {
  const [isAvatarHovered, setIsAvatarHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Calculate level progress (mock calculation)
  const getLevelProgress = () => {
    const sessionsForNextLevel = Math.ceil(user.totalSessions / 10) * 10;
    const progress = (user.totalSessions / sessionsForNextLevel) * 100;
    return Math.min(progress, 100);
  };

  // Format join date
  const formatJoinDate = (date: Date): string => {
    return new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'long'
    }).format(date);
  };

  // Handle avatar upload
  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onAvatarUpload) {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size must be less than 5MB');
        return;
      }
      onAvatarUpload(file);
    }
  };

  // Generate initials from name
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get level badge color
  const getLevelColor = (level?: string) => {
    switch (level?.toLowerCase()) {
      case 'pemula':
        return 'bg-green-100 text-green-800';
      case 'menengah':
        return 'bg-blue-100 text-blue-800';
      case 'lanjutan':
        return 'bg-purple-100 text-purple-800';
      case 'ahli':
        return 'bg-gold-100 text-gold-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className={`profile-header ${className}`} padding="large">
      <div className="flex items-start space-x-6">
        {/* Avatar Section */}
        <div className="relative">
          <div
            className="relative w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-primary to-accent"
            onMouseEnter={() => setIsAvatarHovered(true)}
            onMouseLeave={() => setIsAvatarHovered(false)}
          >
            {user.avatar && !imageError ? (
              <img
                src={user.avatar}
                alt={`Avatar ${user.name}`}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                {getInitials(user.name)}
              </div>
            )}

            {/* Upload Overlay */}
            {isEditable && isAvatarHovered && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <label className="cursor-pointer text-white text-center">
                  <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-xs">Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    aria-label="Upload foto profil"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Online Status */}
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>

        {/* User Information */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-heading text-gray-800 mb-1">
                {user.name}
              </h1>
              <p className="text-gray-600 font-body text-sm mb-2">
                {user.email}
              </p>
              <p className="text-gray-500 font-body text-xs">
                Bergabung {formatJoinDate(user.joinedDate)}
              </p>
            </div>

            {isEditable && (
              <Button
                onClick={onEdit}
                variant="outline"
                size="small"
                className="flex items-center space-x-2"
                aria-label="Edit profil"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Edit</span>
              </Button>
            )}
          </div>

          {/* Level Badge */}
          {user.level && (
            <div className="flex items-center space-x-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(user.level)}`}>
                {user.level}
              </span>
              
              {/* Level Progress */}
              <div className="flex-1 max-w-32">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">Progress</span>
                  <span className="text-xs text-gray-500">{Math.round(getLevelProgress())}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
                    style={{ width: `${getLevelProgress()}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-800 mb-1">
                {user.currentStreak}
              </div>
              <div className="text-xs text-gray-500">Hari Berturut</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-800 mb-1">
                {user.totalSessions}
              </div>
              <div className="text-xs text-gray-500">Sesi Selesai</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-800 mb-1">
                {Math.round(user.totalMinutes / 60)}h
              </div>
              <div className="text-xs text-gray-500">Total Waktu</div>
            </div>
          </div>

          {/* Achievement Badges */}
          {user.badges && user.badges.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Pencapaian Terbaru</h3>
              <div className="flex space-x-2">
                {user.badges.slice(0, 5).map((badge, index) => (
                  <div
                    key={index}
                    className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white text-sm font-bold"
                    title={badge}
                  >
                    {badge.charAt(0)}
                  </div>
                ))}
                {user.badges.length > 5 && (
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 text-xs font-medium">
                    +{user.badges.length - 5}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Motivational Message */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center space-x-3 text-sm text-gray-600">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>
            {user.currentStreak > 0 
              ? `Luar biasa! Kamu sudah konsisten ${user.currentStreak} hari berturut-turut.`
              : 'Mulai perjalanan mindfulness-mu hari ini!'}
          </span>
        </div>
      </div>

      {/* Accessibility enhancements */}
      <div className="sr-only">
        <h2>Informasi Profil Pengguna</h2>
        <p>Nama: {user.name}</p>
        <p>Email: {user.email}</p>
        <p>Level: {user.level}</p>
        <p>Streak saat ini: {user.currentStreak} hari</p>
        <p>Total sesi: {user.totalSessions}</p>
        <p>Total waktu meditasi: {user.totalMinutes} menit</p>
      </div>
    </Card>
  );
};