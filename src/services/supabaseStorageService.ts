import { supabase } from '../config/supabase'

export interface UploadResult {
  path: string
  fullPath: string
  publicUrl: string
}

export class SupabaseStorageService {
  private static readonly BUCKETS = {
    AVATARS: 'avatars',
    AUDIO: 'audio',
    IMAGES: 'images',
    DOCUMENTS: 'documents'
  }

  // Initialize storage buckets (should be done on the server side)
  static async initializeBuckets(): Promise<void> {
    if (!supabase) {
      console.warn('Supabase not available for bucket initialization')
      return
    }

    const buckets = Object.values(this.BUCKETS)
    
    for (const bucketName of buckets) {
      try {
        const { data: existingBucket } = await supabase.storage.getBucket(bucketName)
        
        if (!existingBucket) {
          await supabase.storage.createBucket(bucketName, {
            public: bucketName !== this.BUCKETS.DOCUMENTS, // Documents private by default
            allowedMimeTypes: this.getAllowedMimeTypes(bucketName),
            fileSizeLimit: this.getFileSizeLimit(bucketName)
          })
          console.log(`✅ Created bucket: ${bucketName}`)
        }
      } catch (error) {
        console.warn(`Could not initialize bucket ${bucketName}:`, error)
      }
    }
  }

  private static getAllowedMimeTypes(bucketName: string): string[] {
    switch (bucketName) {
      case this.BUCKETS.AVATARS:
      case this.BUCKETS.IMAGES:
        return ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      case this.BUCKETS.AUDIO:
        return ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/webm']
      case this.BUCKETS.DOCUMENTS:
        return ['application/pdf', 'text/plain', 'application/json']
      default:
        return []
    }
  }

  private static getFileSizeLimit(bucketName: string): number {
    switch (bucketName) {
      case this.BUCKETS.AVATARS:
        return 2 * 1024 * 1024 // 2MB
      case this.BUCKETS.IMAGES:
        return 10 * 1024 * 1024 // 10MB
      case this.BUCKETS.AUDIO:
        return 100 * 1024 * 1024 // 100MB
      case this.BUCKETS.DOCUMENTS:
        return 50 * 1024 * 1024 // 50MB
      default:
        return 10 * 1024 * 1024 // 10MB default
    }
  }

  // Avatar management
  static async uploadAvatar(userId: string, file: File): Promise<{ data: UploadResult | null; error: any }> {
    if (!supabase) {
      return { data: null, error: new Error('Supabase not available') }
    }

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}-${Date.now()}.${fileExt}`
      const filePath = `${userId}/${fileName}`

      const { data, error } = await supabase.storage
        .from(this.BUCKETS.AVATARS)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (error) {
        return { data: null, error }
      }

      const { data: { publicUrl } } = supabase.storage
        .from(this.BUCKETS.AVATARS)
        .getPublicUrl(filePath)

      return {
        data: {
          path: data.path,
          fullPath: data.fullPath,
          publicUrl
        },
        error: null
      }
    } catch (error) {
      return { data: null, error }
    }
  }

  static async deleteAvatar(filePath: string): Promise<{ error: any }> {
    if (!supabase) {
      return { error: new Error('Supabase not available') }
    }

    const { error } = await supabase.storage
      .from(this.BUCKETS.AVATARS)
      .remove([filePath])

    return { error }
  }

  static getAvatarUrl(filePath: string): string | null {
    if (!supabase) return null

    const { data } = supabase.storage
      .from(this.BUCKETS.AVATARS)
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  // Audio file management
  static async uploadAudio(file: File, path?: string): Promise<{ data: UploadResult | null; error: any }> {
    if (!supabase) {
      return { data: null, error: new Error('Supabase not available') }
    }

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`
      const filePath = path ? `${path}/${fileName}` : fileName

      const { data, error } = await supabase.storage
        .from(this.BUCKETS.AUDIO)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        return { data: null, error }
      }

      const { data: { publicUrl } } = supabase.storage
        .from(this.BUCKETS.AUDIO)
        .getPublicUrl(filePath)

      return {
        data: {
          path: data.path,
          fullPath: data.fullPath,
          publicUrl
        },
        error: null
      }
    } catch (error) {
      return { data: null, error }
    }
  }

  static async deleteAudio(filePath: string): Promise<{ error: any }> {
    if (!supabase) {
      return { error: new Error('Supabase not available') }
    }

    const { error } = await supabase.storage
      .from(this.BUCKETS.AUDIO)
      .remove([filePath])

    return { error }
  }

  static getAudioUrl(filePath: string): string | null {
    if (!supabase) return null

    const { data } = supabase.storage
      .from(this.BUCKETS.AUDIO)
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  // Image management
  static async uploadImage(file: File, path?: string): Promise<{ data: UploadResult | null; error: any }> {
    if (!supabase) {
      return { data: null, error: new Error('Supabase not available') }
    }

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`
      const filePath = path ? `${path}/${fileName}` : fileName

      const { data, error } = await supabase.storage
        .from(this.BUCKETS.IMAGES)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        return { data: null, error }
      }

      const { data: { publicUrl } } = supabase.storage
        .from(this.BUCKETS.IMAGES)
        .getPublicUrl(filePath)

      return {
        data: {
          path: data.path,
          fullPath: data.fullPath,
          publicUrl
        },
        error: null
      }
    } catch (error) {
      return { data: null, error }
    }
  }

  static async deleteImage(filePath: string): Promise<{ error: any }> {
    if (!supabase) {
      return { error: new Error('Supabase not available') }
    }

    const { error } = await supabase.storage
      .from(this.BUCKETS.IMAGES)
      .remove([filePath])

    return { error }
  }

  static getImageUrl(filePath: string): string | null {
    if (!supabase) return null

    const { data } = supabase.storage
      .from(this.BUCKETS.IMAGES)
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  // Document management
  static async uploadDocument(userId: string, file: File, path?: string): Promise<{ data: UploadResult | null; error: any }> {
    if (!supabase) {
      return { data: null, error: new Error('Supabase not available') }
    }

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`
      const filePath = path ? `${userId}/${path}/${fileName}` : `${userId}/${fileName}`

      const { data, error } = await supabase.storage
        .from(this.BUCKETS.DOCUMENTS)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        return { data: null, error }
      }

      // Documents are private, so we need to generate signed URLs
      const { data: { publicUrl } } = supabase.storage
        .from(this.BUCKETS.DOCUMENTS)
        .getPublicUrl(filePath)

      return {
        data: {
          path: data.path,
          fullPath: data.fullPath,
          publicUrl
        },
        error: null
      }
    } catch (error) {
      return { data: null, error }
    }
  }

  static async deleteDocument(filePath: string): Promise<{ error: any }> {
    if (!supabase) {
      return { error: new Error('Supabase not available') }
    }

    const { error } = await supabase.storage
      .from(this.BUCKETS.DOCUMENTS)
      .remove([filePath])

    return { error }
  }

  static async getDocumentSignedUrl(filePath: string, expiresIn: number = 3600): Promise<{ signedUrl: string | null; error: any }> {
    if (!supabase) {
      return { signedUrl: null, error: new Error('Supabase not available') }
    }

    const { data, error } = await supabase.storage
      .from(this.BUCKETS.DOCUMENTS)
      .createSignedUrl(filePath, expiresIn)

    return { signedUrl: data?.signedUrl || null, error }
  }

  // Generic file operations
  static async listFiles(bucket: string, path?: string): Promise<{ data: any[] | null; error: any }> {
    if (!supabase) {
      return { data: null, error: new Error('Supabase not available') }
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path)

    return { data, error }
  }

  static async getUserFiles(userId: string, bucket: string): Promise<{ data: any[] | null; error: any }> {
    return this.listFiles(bucket, userId)
  }

  static async moveFile(bucket: string, fromPath: string, toPath: string): Promise<{ error: any }> {
    if (!supabase) {
      return { error: new Error('Supabase not available') }
    }

    const { error } = await supabase.storage
      .from(bucket)
      .move(fromPath, toPath)

    return { error }
  }

  static async copyFile(bucket: string, fromPath: string, toPath: string): Promise<{ error: any }> {
    if (!supabase) {
      return { error: new Error('Supabase not available') }
    }

    const { error } = await supabase.storage
      .from(bucket)
      .copy(fromPath, toPath)

    return { error }
  }

  // Utility functions
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  static validateFile(file: File, maxSize: number, allowedTypes: string[]): { valid: boolean; error?: string } {
    if (file.size > maxSize) {
      return { 
        valid: false, 
        error: `File size must be less than ${this.formatFileSize(maxSize)}` 
      }
    }

    if (!allowedTypes.includes(file.type)) {
      return { 
        valid: false, 
        error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}` 
      }
    }

    return { valid: true }
  }

  // Cleanup utilities
  static async cleanupOldFiles(bucket: string, path: string, olderThanDays: number): Promise<{ deletedCount: number; error: any }> {
    if (!supabase) {
      return { deletedCount: 0, error: new Error('Supabase not available') }
    }

    try {
      const { data: files, error: listError } = await this.listFiles(bucket, path)
      
      if (listError || !files) {
        return { deletedCount: 0, error: listError }
      }

      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)

      const filesToDelete = files.filter(file => {
        const fileDate = new Date(file.updated_at || file.created_at)
        return fileDate < cutoffDate
      })

      if (filesToDelete.length === 0) {
        return { deletedCount: 0, error: null }
      }

      const filePaths = filesToDelete.map(file => 
        path ? `${path}/${file.name}` : file.name
      )

      const { error: deleteError } = await supabase.storage
        .from(bucket)
        .remove(filePaths)

      return { 
        deletedCount: deleteError ? 0 : filesToDelete.length, 
        error: deleteError 
      }
    } catch (error) {
      return { deletedCount: 0, error }
    }
  }
}