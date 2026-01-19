'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Users, UserX, ChevronLeft, Loader2, User as UserIcon } from 'lucide-react'
import { friendsApi, FriendUser } from '@/lib/api'
import ToastContainer, { Toast, ToastType } from '@/components/Toast'

export default function FriendsPage() {
  const [friends, setFriends] = useState<FriendUser[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [removingFriends, setRemovingFriends] = useState<Set<string>>(new Set())
  const [toasts, setToasts] = useState<Toast[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const router = useRouter()
  const pageSize = 20

  useEffect(() => {
    const userId = localStorage.getItem('userId')
    if (!userId) {
      router.push('/')
      return
    }
    setCurrentUserId(userId)
    loadFriends(userId)
  }, [router, currentPage])

  const loadFriends = async (userId: string) => {
    setLoading(true)
    try {
      const data = await friendsApi.getFriendsList(userId, currentPage, pageSize)
      setFriends(data.friends)
      setTotalCount(data.total_count)
    } catch (error) {
      console.error('Error loading friends:', error)
      showToast('Failed to load friends list', 'error')
    } finally {
      setLoading(false)
    }
  }

  const showToast = (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(7)
    setToasts(prev => [...prev, { id, message, type }])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const handleRemoveFriend = async (friendId: string) => {
    if (!currentUserId) return

    setRemovingFriends(prev => new Set(prev).add(friendId))

    try {
      const result = await friendsApi.removeFriend(currentUserId, friendId)
      if (result.success) {
        setFriends(prev => prev.filter(f => f.id !== friendId))
        setTotalCount(prev => prev - 1)
        showToast(result.message || 'Friend removed successfully', 'success')
      } else {
        showToast(result.message || 'Failed to remove friend', 'error')
      }
    } catch (error: any) {
      const message = error.response?.data?.detail || error.message || 'Failed to remove friend'
      showToast(message, 'error')
    } finally {
      setRemovingFriends(prev => {
        const next = new Set(prev)
        next.delete(friendId)
        return next
      })
    }
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  if (loading && friends.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
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
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                  My Friends
                </span>
              </h1>
              <p className="text-slate-300 text-lg">
                {totalCount} {totalCount === 1 ? 'friend' : 'friends'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Friends List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl overflow-hidden"
        >
          {friends.length > 0 ? (
            <>
              <div className="divide-y divide-slate-700">
                {friends.map((friend, index) => (
                  <motion.div
                    key={friend.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-6 hover:bg-slate-800/30 transition-colors flex items-center justify-between"
                  >
                    <div 
                      className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => router.push(`/profile/${friend.id}`)}
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {friend.avatar_url ? (
                          <img src={friend.avatar_url} alt={friend.username} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white font-semibold text-sm">
                            {friend.username.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-lg truncate">{friend.username}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-sm text-slate-400">
                            {friend.total_solved} {friend.total_solved === 1 ? 'problem solved' : 'problems solved'}
                          </span>
                          {friend.rank && (
                            <span className="text-sm text-slate-400">
                              Rank #{friend.rank}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveFriend(friend.id)
                      }}
                      disabled={removingFriends.has(friend.id)}
                      className="ml-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {removingFriends.has(friend.id) ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Removing...</span>
                        </>
                      ) : (
                        <>
                          <UserX className="w-4 h-4" />
                          <span>Remove</span>
                        </>
                      )}
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-slate-800/50 border-t border-slate-700 px-6 py-4 flex items-center justify-between">
                  <div className="text-sm text-slate-400">
                    Showing {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalCount)} of {totalCount}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="px-4 py-2 text-white font-semibold">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors rotate-180"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-12 text-center text-slate-400">
              <Users className="w-16 h-16 mx-auto mb-4 text-slate-600" />
              <p className="text-lg mb-2">No friends yet</p>
              <p className="text-sm text-slate-500 mb-4">
                Start adding friends from the ranking page
              </p>
              <button
                onClick={() => router.push('/ranking')}
                className="px-4 py-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white rounded-lg hover:from-violet-600 hover:to-cyan-600 transition-colors"
              >
                Go to Ranking
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}
