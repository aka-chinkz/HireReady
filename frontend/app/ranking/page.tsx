'use client'

/**
 * RANKING PAGE
 * 
 * Displays global and friends leaderboards with dense ranking
 * Ranks users by total solved problems with proper tie-breakers
 */

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Trophy, Users, Medal, ChevronLeft, ChevronRight, UserPlus, UserCheck, Loader2, Search, X } from 'lucide-react'
import { rankingApi, friendsApi } from '@/lib/api'
import ToastContainer, { Toast, ToastType } from '@/components/Toast'

interface RankingUser {
  id: string
  username: string
  avatar_url: string | null
  total_solved: number
  easy_solved: number
  medium_solved: number
  hard_solved: number
  last_solved_at: string | null
  rank: number
  email: string | null
}

interface RankingData {
  users: RankingUser[]
  total_count: number
  page: number
  page_size: number
  current_user_rank: number | null
}

export default function RankingPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'global' | 'friends'>('global')
  const [rankingData, setRankingData] = useState<RankingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [friendships, setFriendships] = useState<Set<string>>(new Set())
  const [loadingFriendships, setLoadingFriendships] = useState<Set<string>>(new Set())
  const [toasts, setToasts] = useState<Toast[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const pageSize = 50

  useEffect(() => {
    const userId = localStorage.getItem('userId')
    setCurrentUserId(userId)
  }, [])

  useEffect(() => {
    loadRankings()
  }, [activeTab, currentPage])

  // Load friendship statuses when rankings change
  useEffect(() => {
    if (rankingData && currentUserId) {
      loadFriendshipStatuses()
    }
  }, [rankingData, currentUserId])

  const loadRankings = async () => {
    if (!currentUserId && activeTab === 'friends') {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      if (activeTab === 'global') {
        const data = await rankingApi.getGlobal(currentPage, pageSize, currentUserId || undefined)
        setRankingData(data)
      } else {
        if (currentUserId) {
          const data = await rankingApi.getFriends(currentUserId, currentPage, pageSize)
          setRankingData(data)
        }
      }
    } catch (error) {
      console.error('Error loading rankings:', error)
      setRankingData(null)
    } finally {
      setLoading(false)
    }
  }

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!rankingData) return []
    if (!searchQuery.trim()) return rankingData.users
    
    const query = searchQuery.toLowerCase().trim()
    return rankingData.users.filter(user => 
      user.username.toLowerCase().includes(query) ||
      (user.email && user.email.toLowerCase().includes(query))
    )
  }, [rankingData, searchQuery])

  const totalPages = useMemo(() => {
    if (!rankingData) return 1
    // If searching, show pages based on filtered results
    if (searchQuery.trim()) {
      return Math.ceil(filteredUsers.length / pageSize)
    }
    return Math.ceil(rankingData.total_count / pageSize)
  }, [rankingData, searchQuery, filteredUsers])

  // Paginate filtered users
  const paginatedUsers = useMemo(() => {
    if (!searchQuery.trim()) return filteredUsers
    const startIdx = (currentPage - 1) * pageSize
    const endIdx = startIdx + pageSize
    return filteredUsers.slice(startIdx, endIdx)
  }, [filteredUsers, currentPage, searchQuery])

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Medal className="w-6 h-6 text-yellow-400" />
    if (rank === 2) return <Medal className="w-6 h-6 text-slate-300" />
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />
    return null
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    } catch {
      return 'Never'
    }
  }

  const loadFriendshipStatuses = async () => {
    if (!currentUserId || !rankingData) return
    
    const friendIds = rankingData.users
      .filter(user => user.id !== currentUserId)
      .map(user => user.id)
    
    for (const friendId of friendIds) {
      try {
        const status = await friendsApi.getFriendshipStatus(currentUserId, friendId)
        if (status.is_friend) {
          setFriendships(prev => new Set(prev).add(friendId))
        }
      } catch (error) {
        console.error(`Error loading friendship status for ${friendId}:`, error)
      }
    }
  }

  const showToast = (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(7)
    setToasts(prev => [...prev, { id, message, type }])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const handleAddFriend = async (friendId: string) => {
    if (!currentUserId) {
      showToast('Please log in to add friends', 'error')
      return
    }

    if (currentUserId === friendId) {
      showToast('Cannot add yourself as a friend', 'error')
      return
    }

    setLoadingFriendships(prev => new Set(prev).add(friendId))

    try {
      const result = await friendsApi.addFriend(currentUserId, friendId)
      if (result.success) {
        setFriendships(prev => new Set(prev).add(friendId))
        showToast(result.message || 'Friend added successfully!', 'success')
      } else {
        showToast(result.message || 'Failed to add friend', 'error')
      }
    } catch (error: any) {
      const message = error.response?.data?.detail || error.message || 'Failed to add friend'
      showToast(message, 'error')
    } finally {
      setLoadingFriendships(prev => {
        const next = new Set(prev)
        next.delete(friendId)
        return next
      })
    }
  }

  const handleRemoveFriend = async (friendId: string) => {
    if (!currentUserId) return

    setLoadingFriendships(prev => new Set(prev).add(friendId))

    try {
      const result = await friendsApi.removeFriend(currentUserId, friendId)
      if (result.success) {
        setFriendships(prev => {
          const next = new Set(prev)
          next.delete(friendId)
          return next
        })
        showToast(result.message || 'Friend removed successfully', 'success')
        // Reload rankings if we're on friends tab
        if (activeTab === 'friends') {
          loadRankings()
        }
      } else {
        showToast(result.message || 'Failed to remove friend', 'error')
      }
    } catch (error: any) {
      const message = error.response?.data?.detail || error.message || 'Failed to remove friend'
      showToast(message, 'error')
    } finally {
      setLoadingFriendships(prev => {
        const next = new Set(prev)
        next.delete(friendId)
        return next
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                <span className="bg-gradient-to-r from-violet-400 via-violet-300 to-cyan-400 bg-clip-text text-transparent drop-shadow-lg">
                  Leaderboard
                </span>
              </h1>
              <p className="text-slate-300 text-lg mt-1">
                Compete with coders worldwide
              </p>
            </div>
          </div>
        </motion.div>

        {/* Current User Rank Badge */}
        {rankingData?.current_user_rank && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-4 mb-6 border-2 border-violet-500/50"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Your Rank</p>
                  <p className="text-2xl font-bold text-white">#{rankingData.current_user_rank}</p>
                </div>
              </div>
              {rankingData.current_user_rank <= 3 && (
                <div className="text-4xl">
                  {getRankIcon(rankingData.current_user_rank)}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-1.5 md:p-2 mb-6 flex gap-1.5 md:gap-2"
        >
          <button
            onClick={() => {
              setActiveTab('global')
              setCurrentPage(1)
              setSearchQuery('') // Clear search when switching tabs
            }}
            className={`flex-1 py-2 md:py-3 px-3 md:px-6 rounded-xl font-semibold transition-all text-sm md:text-base ${
              activeTab === 'global'
                ? 'bg-gradient-to-r from-violet-500 to-cyan-500 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center justify-center gap-1.5 md:gap-2">
              <Users className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">Global Ranking</span>
              <span className="sm:hidden">Global</span>
            </div>
          </button>
          <button
            onClick={() => {
              setActiveTab('friends')
              setCurrentPage(1)
              setSearchQuery('') // Clear search when switching tabs
            }}
            className={`flex-1 py-2 md:py-3 px-3 md:px-6 rounded-xl font-semibold transition-all text-sm md:text-base ${
              activeTab === 'friends'
                ? 'bg-gradient-to-r from-violet-500 to-cyan-500 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center justify-center gap-1.5 md:gap-2">
              <Users className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">Friends Ranking</span>
              <span className="sm:hidden">Friends</span>
            </div>
          </button>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-3 md:p-4 mb-6"
        >
          <div className="relative">
            <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by username or email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1) // Reset to first page when searching
              }}
              className="w-full pl-10 md:pl-12 pr-8 md:pr-10 py-2 md:py-3 text-sm md:text-base bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setCurrentPage(1)
                }}
                className="absolute right-3 md:right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="mt-2 text-xs md:text-sm text-slate-400">
              Found {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'} matching "{searchQuery}"
            </p>
          )}
        </motion.div>

        {/* Leaderboard Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl overflow-hidden"
        >
          {rankingData && (searchQuery.trim() ? filteredUsers.length > 0 : rankingData.users.length > 0) ? (
            <>
              {/* Desktop Table Header */}
              <div className="hidden md:block bg-slate-800/50 border-b border-slate-700 sticky top-0 z-10">
                <div className="grid grid-cols-12 gap-4 px-4 lg:px-6 py-4 text-sm font-semibold text-slate-400">
                  <div className="col-span-1 text-center">Rank</div>
                  <div className="col-span-4">User</div>
                  <div className="col-span-2 text-right">Total</div>
                  <div className="col-span-4 grid grid-cols-3 gap-2 text-center">
                    <span className="text-green-400">Easy</span>
                    <span className="text-yellow-400">Medium</span>
                    <span className="text-red-400">Hard</span>
                  </div>
                  {currentUserId && activeTab === 'global' && (
                    <div className="col-span-1 text-center">Action</div>
                  )}
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-slate-700">
                {(searchQuery.trim() ? paginatedUsers : rankingData.users).map((user, index) => {
                  const isCurrentUser = user.id === currentUserId
                  return (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 hover:bg-slate-800/30 transition-colors ${
                        isCurrentUser ? 'bg-violet-500/10 border-l-4 border-violet-500' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="flex items-center justify-center w-8">
                            {getRankIcon(user.rank) || (
                              <span className="text-base font-bold text-slate-300">#{user.rank}</span>
                            )}
                          </div>
                          <div 
                            className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => router.push(`/profile/${user.id}`)}
                          >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center overflow-hidden flex-shrink-0">
                              {user.avatar_url ? (
                                <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-white font-semibold text-sm">
                                  {user.username.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-semibold truncate text-sm">
                                {user.username}
                                {isCurrentUser && (
                                  <span className="ml-2 text-xs px-1.5 py-0.5 bg-violet-500/20 text-violet-300 rounded">
                                    You
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                        {currentUserId && activeTab === 'global' && !isCurrentUser && (
                          <div onClick={(e) => e.stopPropagation()}>
                            {loadingFriendships.has(user.id) ? (
                              <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                            ) : friendships.has(user.id) ? (
                              <button
                                onClick={() => handleRemoveFriend(user.id)}
                                className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                                title="Remove Friend"
                              >
                                <UserCheck className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleAddFriend(user.id)}
                                className="p-2 bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600 text-white rounded-lg transition-colors"
                                title="Add Friend"
                              >
                                <UserPlus className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <div>
                            <span className="text-slate-400">Total: </span>
                            <span className="text-white font-bold">{user.total_solved}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-green-400">{user.easy_solved}E</span>
                            <span className="text-yellow-400">{user.medium_solved}M</span>
                            <span className="text-red-400">{user.hard_solved}H</span>
                          </div>
                        </div>
                        {user.last_solved_at && (
                          <p className="text-xs text-slate-500">
                            {formatDate(user.last_solved_at)}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              {/* Desktop Table Body */}
              <div className="hidden md:block divide-y divide-slate-700">
                {(searchQuery.trim() ? paginatedUsers : rankingData.users).map((user, index) => {
                  const isCurrentUser = user.id === currentUserId
                  return (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`grid grid-cols-12 gap-4 px-4 lg:px-6 py-4 items-center hover:bg-slate-800/30 transition-colors ${
                        isCurrentUser ? 'bg-violet-500/10 border-l-4 border-violet-500' : ''
                      }`}
                    >
                      {/* Rank */}
                      <div className="col-span-1 flex items-center justify-center gap-2">
                        {getRankIcon(user.rank) || (
                          <span className="text-lg font-bold text-slate-300">#{user.rank}</span>
                        )}
                      </div>

                      {/* User Info */}
                      <div 
                        className="col-span-4 flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => router.push(`/profile/${user.id}`)}
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-white font-semibold text-sm">
                              {user.username.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold truncate">
                            {user.username}
                            {isCurrentUser && (
                              <span className="ml-2 text-xs px-2 py-0.5 bg-violet-500/20 text-violet-300 rounded">
                                You
                              </span>
                            )}
                          </p>
                          {user.last_solved_at && (
                            <p className="text-xs text-slate-400">
                              Last solved: {formatDate(user.last_solved_at)}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Total Solved */}
                      <div className="col-span-2 text-right">
                        <span className="text-xl font-bold text-white">{user.total_solved}</span>
                      </div>

                      {/* Difficulty Breakdown */}
                      <div className="col-span-4 grid grid-cols-3 gap-2 text-center">
                        <span className="text-green-400 font-semibold">{user.easy_solved}</span>
                        <span className="text-yellow-400 font-semibold">{user.medium_solved}</span>
                        <span className="text-red-400 font-semibold">{user.hard_solved}</span>
                      </div>

                      {/* Add Friend Button */}
                      {currentUserId && activeTab === 'global' && !isCurrentUser && (
                        <div className="col-span-1 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                          {loadingFriendships.has(user.id) ? (
                            <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
                          ) : friendships.has(user.id) ? (
                            <button
                              onClick={() => handleRemoveFriend(user.id)}
                              className="px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-1.5"
                              title="Remove Friend"
                            >
                              <UserCheck className="w-4 h-4" />
                              <span className="hidden lg:inline">Friends</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAddFriend(user.id)}
                              className="px-3 py-1.5 text-sm bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600 text-white rounded-lg transition-colors flex items-center gap-1.5"
                              title="Add Friend"
                            >
                              <UserPlus className="w-4 h-4" />
                              <span className="hidden lg:inline">Add</span>
                            </button>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-slate-800/50 border-t border-slate-700 px-4 md:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs sm:text-sm text-slate-400 text-center sm:text-left">
                    {searchQuery.trim() ? (
                      <>
                        Showing {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, filteredUsers.length)} of {filteredUsers.length} results
                      </>
                    ) : (
                      <>
                        Showing {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, rankingData.total_count)} of {rankingData.total_count}
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <span className="px-3 sm:px-4 py-2 text-sm sm:text-base text-white font-semibold">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
                    >
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-12 text-center text-slate-400">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-slate-600" />
              <p className="text-lg">
                {searchQuery.trim() 
                  ? `No users found matching "${searchQuery}"`
                  : activeTab === 'friends' 
                    ? 'No friends rankings available yet'
                    : 'No rankings available yet'}
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}
