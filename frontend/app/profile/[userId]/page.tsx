'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { userApi, User, friendsApi, userStatsApi, ProblemStats, ActivityStatus, rankingApi } from '@/lib/api'
import { User as UserIcon, LogOut, Users, UserPlus, CheckCircle2, Circle, Trophy, Edit } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import ProblemDifficultyPieChart from '@/components/ProblemDifficultyPieChart'
import EditProfileModal from '@/components/EditProfileModal'
import ToastContainer, { Toast, ToastType } from '@/components/Toast'

export default function UserProfilePage() {
  const params = useParams()
  const userId = params?.userId as string
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [friendsCount, setFriendsCount] = useState(0)
  const [followersCount, setFollowersCount] = useState(0)
  const [globalRank, setGlobalRank] = useState<number | null>(null)
  const [problemStats, setProblemStats] = useState<ProblemStats | null>(null)
  const [activityStatus, setActivityStatus] = useState<ActivityStatus | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const currentUserIdFromStorage = localStorage.getItem('userId')
    setCurrentUserId(currentUserIdFromStorage)
    setIsOwnProfile(currentUserIdFromStorage === userId)
    
    if (!userId) {
      router.push('/')
      return
    }

    loadUser(userId)
    loadProblemStats(userId)
    loadActivityStatus(userId)
    loadGlobalRank(userId)
    
    // Only update activity if it's the current user's profile
    if (currentUserIdFromStorage === userId) {
      userStatsApi.updateActivity(userId)
      
      // Update activity every 2 minutes while user is on the page
      const activityInterval = setInterval(() => {
        userStatsApi.updateActivity(userId)
        loadActivityStatus(userId)
      }, 120000) // 2 minutes

      // Refresh activity status every 30 seconds
      const statusInterval = setInterval(() => {
        loadActivityStatus(userId)
      }, 30000) // 30 seconds

      return () => {
        clearInterval(activityInterval)
        clearInterval(statusInterval)
      }
    }
  }, [userId, router])

  const loadUser = async (userId: string) => {
    try {
      const userData = await userApi.get(userId)
      setUser(userData)
      loadFriendCounts(userId)
    } catch (error) {
      console.error('Error loading user:', error)
      showToast('Failed to load user profile', 'error')
    } finally {
      setLoading(false)
    }
  }

  const loadFriendCounts = async (userId: string) => {
    try {
      const counts = await friendsApi.getFriendCounts(userId)
      setFriendsCount(counts.friends_count)
      setFollowersCount(counts.followers_count)
    } catch (error) {
      console.error('Error loading friend counts:', error)
    }
  }

  const loadProblemStats = async (userId: string) => {
    try {
      const stats = await userStatsApi.getProblemStats(userId)
      setProblemStats(stats)
    } catch (error) {
      console.error('Error loading problem stats:', error)
    }
  }

  const loadActivityStatus = async (userId: string) => {
    try {
      const status = await userStatsApi.getActivityStatus(userId)
      setActivityStatus(status)
    } catch (error) {
      console.error('Error loading activity status:', error)
    }
  }

  const formatLastActive = (lastActiveAt: string | null): string => {
    if (!lastActiveAt) return 'Never'
    try {
      return formatDistanceToNow(new Date(lastActiveAt), { addSuffix: true })
    } catch {
      return 'Unknown'
    }
  }

  const loadGlobalRank = async (userId: string) => {
    try {
      const rankingData = await rankingApi.getGlobal(1, 1, userId)
      setGlobalRank(rankingData.current_user_rank)
    } catch (error) {
      console.error('Error loading global rank:', error)
      setGlobalRank(null)
    }
  }

  const getDefaultAvatar = (email: string | null): string => {
    if (!email) {
      return `https://ui-avatars.com/api/?name=User&background=a78bfa&color=fff&size=128`
    }
    const name = email.split('@')[0].replace(/[._-]/g, ' ')
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=a78bfa&color=fff&size=128&bold=true`
  }

  const showToast = (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(7)
    setToasts(prev => [...prev, { id, message, type }])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const handleSaveProfile = async (data: { profile_picture?: string; username?: string }) => {
    if (!user || !isOwnProfile) return
    
    try {
      const updatedUser = await userApi.updateProfile(user.id, data)
      setUser(updatedUser)
      const reloadedUser = await userApi.get(user.id)
      setUser(reloadedUser)
      await loadFriendCounts(user.id)
      loadProblemStats(user.id)
      loadActivityStatus(user.id)
      loadGlobalRank(user.id)
      showToast('Profile updated successfully!', 'success')
    } catch (error: any) {
      console.error('Error updating profile:', error)
      const errorMessage = error.message || 'Failed to update profile'
      showToast(errorMessage, 'error')
      throw error
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('userId')
    localStorage.removeItem('userEmail')
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">User not found</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-violet-500 text-white rounded-lg hover:opacity-90"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="mb-6 flex items-center justify-end">
            {isOwnProfile && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-6 mb-8">
            <div className="relative group">
              {user?.profile_picture && user.profile_picture.trim().length > 0 ? (
                <img
                  key={`profile-img-${user.id}-${user.profile_picture.substring(0, 10)}`}
                  src={user.profile_picture}
                  alt="Profile"
                  className="w-24 h-24 rounded-full border-4 border-violet-500/50 object-cover shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center border-4 border-violet-500/50 shadow-lg">
                  <UserIcon className="w-12 h-12 text-white" />
                </div>
              )}
              {isOwnProfile && (
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="absolute bottom-0 right-0 p-2 bg-violet-500 rounded-full border-4 border-slate-900 hover:bg-violet-600 transition-colors opacity-0 group-hover:opacity-100"
                  title="Edit Profile"
                >
                  <Edit className="w-4 h-4 text-white" />
                </button>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                  {user.username || (user.email ? user.email.split('@')[0] : `User ${user.id.substring(0, 8)}`)}
                </h1>
                {isOwnProfile && (
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
                    title="Edit Profile"
                  >
                    <Edit className="w-4 h-4 text-slate-400 hover:text-violet-400" />
                  </button>
                )}
              </div>
              <p className="text-slate-400 text-lg">
                {user.email || 'No email available'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Profile Cards */}
        <div className="space-y-6">
          {/* Stats Grid - Friends, Followers, Problems Solved, Global Rank */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-2xl p-6 glass-hover cursor-pointer hover:border-violet-500/50 transition-colors"
              onClick={() => router.push('/friends')}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-violet-500/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-violet-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-slate-400 mb-1">Friends</h3>
                  <p className="text-3xl font-bold text-white mb-2">{friendsCount}</p>
                  <p className="text-xs text-slate-500">Users they follow</p>
                </div>
                <UserPlus className="w-5 h-5 text-slate-400" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="glass rounded-2xl p-6 glass-hover"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-cyan-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-slate-400 mb-1">Followers</h3>
                  <p className="text-3xl font-bold text-white mb-2">{followersCount}</p>
                  <p className="text-xs text-slate-500">Users following them</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-2xl p-6 glass-hover"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-slate-400 mb-1">Problems Solved</h3>
                  <p className="text-3xl font-bold text-white mb-2">
                    {problemStats?.total_solved ?? 0}
                  </p>
                  <p className="text-xs text-slate-500">Total solutions</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="glass rounded-2xl p-6 glass-hover cursor-pointer hover:border-yellow-500/50 transition-colors"
              onClick={() => router.push('/ranking')}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-slate-400 mb-1">Global Rank</h3>
                  <p className="text-3xl font-bold text-white mb-2">
                    {globalRank !== null ? `#${globalRank}` : '—'}
                  </p>
                  <p className="text-xs text-slate-500">Their position</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Activity Status */}
          {activityStatus && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="glass rounded-2xl p-6 glass-hover"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  {activityStatus.is_online ? (
                    <Circle className="w-6 h-6 text-green-400 fill-green-400" />
                  ) : (
                    <Circle className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-slate-400 mb-1">Activity Status</h3>
                  <div className="flex items-center gap-3">
                    <p className="text-lg font-semibold text-white">
                      {activityStatus.is_online ? 'Online' : 'Offline'}
                    </p>
                    {!activityStatus.is_online && activityStatus.last_active_at && (
                      <p className="text-sm text-slate-500">
                        Last online {formatLastActive(activityStatus.last_active_at)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Problem Difficulty Distribution */}
          {problemStats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-2xl p-6 glass-hover"
            >
              <h3 className="text-sm font-medium text-slate-400 mb-4">Problem Difficulty Distribution</h3>
              <ProblemDifficultyPieChart
                easySolved={problemStats.easy_solved}
                mediumSolved={problemStats.medium_solved}
                hardSolved={problemStats.hard_solved}
              />
            </motion.div>
          )}

          {/* Account Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-6 glass-hover"
          >
            <h3 className="text-sm font-medium text-slate-400 mb-4">Account Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Account Created</span>
                <span className="text-white">
                  {new Date(user.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Last Updated</span>
                <span className="text-white">
                  {new Date(user.updated_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Edit Profile Modal - Only show for own profile */}
      {user && isOwnProfile && (
        <EditProfileModal
          user={user}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveProfile}
        />
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}
