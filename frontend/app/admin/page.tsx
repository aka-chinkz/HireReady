'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminApi, feedbackApi, FeedbackResponse } from '@/lib/api'
import { Shield, Star, Mail, Calendar, FileText, AlertCircle, Loader2 } from 'lucide-react'

export default function AdminPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState<FeedbackResponse[]>([])
  const [loadingFeedback, setLoadingFeedback] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Get userId from localStorage
    const storedUserId = localStorage.getItem('userId')
    if (!storedUserId) {
      router.push('/')
      return
    }

    setUserId(storedUserId)
    checkAdminAccess(storedUserId)
  }, [router])

  const checkAdminAccess = async (id: string) => {
    try {
      const result = await adminApi.checkAdmin(id)
      setIsAdmin(result.is_admin)
      if (result.is_admin) {
        loadFeedback(id)
      } else {
        setError('Access denied. You do not have admin privileges.')
      }
    } catch (err: any) {
      console.error('Error checking admin status:', err)
      setError('Failed to verify admin access. Please try again.')
      setIsAdmin(false)
    } finally {
      setLoading(false)
    }
  }

  const loadFeedback = async (id: string) => {
    setLoadingFeedback(true)
    setError(null)
    try {
      const data = await feedbackApi.getAll(id, 1000, 0)
      setFeedback(data)
    } catch (err: any) {
      console.error('Error loading feedback:', err)
      setError(err.message || 'Failed to load feedback')
    } finally {
      setLoadingFeedback(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRatingStars = (rating: number | null | undefined) => {
    if (!rating) return null
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-slate-500'
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-slate-400">({rating}/5)</span>
      </div>
    )
  }

  if (loading || isAdmin === null) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500 mx-auto mb-4" />
          <p className="text-slate-400">Checking admin access...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800 rounded-lg border border-red-500/50 p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-slate-400 mb-6">
            {error || 'You do not have admin privileges to access this page.'}
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-lg transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-violet-500" />
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          </div>
          <p className="text-slate-400">View and manage user feedback</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-5 h-5 text-violet-500" />
              <h3 className="text-sm text-slate-400">Total Feedback</h3>
            </div>
            <p className="text-3xl font-bold text-white">{feedback.length}</p>
          </div>
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <h3 className="text-sm text-slate-400">Average Rating</h3>
            </div>
            <p className="text-3xl font-bold text-white">
              {feedback.length > 0
                ? (
                    feedback
                      .filter((f) => f.rating)
                      .reduce((sum, f) => sum + (f.rating || 0), 0) /
                    feedback.filter((f) => f.rating).length
                  ).toFixed(1)
                : 'N/A'}
            </p>
          </div>
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Mail className="w-5 h-5 text-cyan-500" />
              <h3 className="text-sm text-slate-400">With Email</h3>
            </div>
            <p className="text-3xl font-bold text-white">
              {feedback.filter((f) => f.user_email).length}
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Feedback List */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Feedback Entries</h2>
              {loadingFeedback ? (
                <Loader2 className="w-5 h-5 animate-spin text-violet-500" />
              ) : (
                <button
                  onClick={() => userId && loadFeedback(userId)}
                  className="px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-lg transition-colors text-sm"
                >
                  Refresh
                </button>
              )}
            </div>
          </div>

          {loadingFeedback ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-violet-500 mx-auto mb-4" />
              <p className="text-slate-400">Loading feedback...</p>
            </div>
          ) : feedback.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No feedback entries found.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700">
              {feedback.map((item) => (
                <div
                  key={item.id}
                  className="p-6 hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getRatingStars(item.rating)}
                      </div>
                      <p className="text-white whitespace-pre-wrap">{item.message}</p>
                    </div>
                    <div className="text-right text-sm text-slate-400 flex-shrink-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(item.created_at)}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm">
                    {item.user_email && (
                      <div className="flex items-center gap-2 text-slate-400">
                        <Mail className="w-4 h-4" />
                        <span>{item.user_email}</span>
                      </div>
                    )}
                    {item.page_source && (
                      <div className="flex items-center gap-2 text-slate-400">
                        <FileText className="w-4 h-4" />
                        <span>{item.page_source}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
