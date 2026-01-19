'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload } from 'lucide-react'
import { User } from '@/lib/api'

interface EditProfileModalProps {
  user: User
  isOpen: boolean
  onClose: () => void
  onSave: (data: { profile_picture?: string; username?: string }) => Promise<void>
}

// Helper function to compress and resize image
const compressImage = (file: File, maxWidth: number = 400, maxHeight: number = 400, quality: number = 0.8): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        // Calculate new dimensions
        let width = img.width
        let height = img.height
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }
        }
        
        // Create canvas and resize
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          reject(new Error('Failed to create canvas context'))
          return
        }
        
        ctx.drawImage(img, 0, 0, width, height)
        
        // Convert to base64
        const dataUrl = canvas.toDataURL('image/jpeg', quality)
        resolve(dataUrl)
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = e.target?.result as string
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

export default function EditProfileModal({
  user,
  isOpen,
  onClose,
  onSave,
}: EditProfileModalProps) {
  const [username, setUsername] = useState(user.username || user.email?.split('@')[0] || '')
  const [profilePicture, setProfilePicture] = useState<string>(user.profile_picture || '')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [usernameError, setUsernameError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setUsername(user.username || user.email?.split('@')[0] || '')
      setProfilePicture(user.profile_picture || '')
      setSelectedFile(null)
      setPreviewUrl(null)
      setError(null)
      setUsernameError(null)
    }
  }, [isOpen, user])

  // Validate username
  const validateUsername = (value: string): string | null => {
    if (!value || value.trim().length === 0) {
      return 'Username is required'
    }
    if (value.trim().length < 3) {
      return 'Username must be at least 3 characters long'
    }
    if (value.trim().length > 30) {
      return 'Username must be at most 30 characters long'
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
      return 'Username can only contain letters, numbers, underscores, and hyphens'
    }
    return null
  }

  const handleUsernameChange = (value: string) => {
    setUsername(value)
    const error = validateUsername(value)
    setUsernameError(error)
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB')
      return
    }

    setError(null)
    setSelectedFile(file)

    try {
      // Compress and create preview
      const compressedDataUrl = await compressImage(file)
      setPreviewUrl(compressedDataUrl)
      setProfilePicture(compressedDataUrl) // Use compressed image as base64 data URL
    } catch (err) {
      setError('Failed to process image. Please try another file.')
      setSelectedFile(null)
      setPreviewUrl(null)
    }
  }

  const handleRemoveImage = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setProfilePicture('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getDefaultAvatar = (email: string | null, username: string | null): string => {
    const name = username || (email ? email.split('@')[0] : 'User')
    const cleanName = name.replace(/[._-]/g, ' ')
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=a78bfa&color=fff&size=128&bold=true`
  }

  const handleUseDefaultAvatar = () => {
    handleRemoveImage()
    setProfilePicture('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate username
    const usernameValidationError = validateUsername(username)
    if (usernameValidationError) {
      setUsernameError(usernameValidationError)
      setError(usernameValidationError)
      return
    }

    setLoading(true)

    try {
      const updateData: { profile_picture?: string; username?: string } = {}
      const trimmedUsername = username.trim()
      
      // Check if username changed
      const currentUsername = user.username || user.email?.split('@')[0] || ''
      if (trimmedUsername !== currentUsername) {
        updateData.username = trimmedUsername
      }
      
      // Check if profile picture changed
      if (profilePicture !== user.profile_picture) {
        updateData.profile_picture = profilePicture || undefined
      }

      if (Object.keys(updateData).length === 0) {
        setError('No changes to save')
        setLoading(false)
        return
      }

      await onSave(updateData)
      onClose()
    } catch (err: any) {
      const errorMessage = err.message || err.response?.data?.detail || 'Failed to update profile'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const hasChanges = () => {
    const trimmedUsername = username.trim()
    const currentUsername = user.username || user.email?.split('@')[0] || ''
    return (
      trimmedUsername !== currentUsername ||
      profilePicture !== (user.profile_picture || '')
    )
  }

  if (!isOpen) return null

  const displayPicture = previewUrl || profilePicture || getDefaultAvatar(user.email, user.username)

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="glass rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              Edit Profile
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
              type="button"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture Preview */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <img
                  src={displayPicture}
                  alt="Profile Preview"
                  className="w-32 h-32 rounded-full border-4 border-violet-500/50 object-cover shadow-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = getDefaultAvatar(user.email, user.username)
                  }}
                />
              </div>
              
              {/* Image Upload Controls */}
              <div className="flex flex-col items-center gap-2 w-full">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="profile-image-upload"
                />
                <label
                  htmlFor="profile-image-upload"
                  className="flex items-center gap-2 px-4 py-2 bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/50 text-violet-400 rounded-lg cursor-pointer transition-colors text-sm"
                >
                  <Upload className="w-4 h-4" />
                  {selectedFile ? 'Change Image' : 'Upload Image'}
                </label>
                {(previewUrl || profilePicture) && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="text-sm text-red-400 hover:text-red-300 transition-colors"
                  >
                    Remove Image
                  </button>
                )}
                {!previewUrl && !profilePicture && (
                  <button
                    type="button"
                    onClick={handleUseDefaultAvatar}
                    className="text-sm text-slate-400 hover:text-violet-400 transition-colors"
                  >
                    Use default avatar
                  </button>
                )}
              </div>
            </div>

            {/* Username Input */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-400 mb-2">
                Username <span className="text-red-400">*</span>
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                placeholder="Enter your username"
                className={`w-full px-4 py-2 bg-slate-800 border rounded-lg text-white placeholder-slate-500 focus:outline-none transition-colors ${
                  usernameError
                    ? 'border-red-500 focus:border-red-400'
                    : 'border-slate-700 focus:border-violet-500'
                }`}
                required
              />
              {usernameError && (
                <p className="text-xs text-red-400 mt-1">{usernameError}</p>
              )}
              <p className="text-xs text-slate-500 mt-1">
                3-30 characters, letters, numbers, underscores, and hyphens only
              </p>
            </div>

            {/* Error Message */}
            {error && !usernameError && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !hasChanges() || !!usernameError}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
