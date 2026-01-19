'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Star, Send, AlertCircle, CheckCircle2 } from 'lucide-react'
import { feedbackApi, FeedbackCreate } from '@/lib/api'

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  pageSource?: string
}

export default function FeedbackModal({ isOpen, onClose, pageSource = 'home' }: FeedbackModalProps) {
  const [message, setMessage] = useState('')
  const [rating, setRating] = useState<number | null>(null)
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!message.trim()) {
      setErrorMessage('Please enter your feedback')
      setSubmitStatus('error')
      return
    }

    if (message.trim().length < 5) {
      setErrorMessage('Feedback must be at least 5 characters long')
      setSubmitStatus('error')
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      const feedbackData: FeedbackCreate = {
        message: message.trim(),
        rating: rating || undefined,
        user_email: email.trim() || undefined,
        page_source: pageSource,
      }

      await feedbackApi.create(feedbackData)

      // Success
      setSubmitStatus('success')
      
      // Reset form after a short delay
      setTimeout(() => {
        setMessage('')
        setRating(null)
        setEmail('')
        setSubmitStatus('idle')
        onClose()
      }, 2000)
    } catch (error: any) {
      setSubmitStatus('error')
      setErrorMessage(error.message || 'Failed to submit feedback. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setMessage('')
      setRating(null)
      setEmail('')
      setSubmitStatus('idle')
      setErrorMessage('')
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-700">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-700">
                <h2 className="text-2xl font-bold text-white">Share Your Feedback</h2>
                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Message (Required) */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">
                    Feedback <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                    placeholder="Tell us what you think about HireReady..."
                    maxLength={5000}
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    {message.length} / 5000 characters
                  </p>
                </div>

                {/* Rating (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Rating (Optional)
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        disabled={isSubmitting}
                        className="p-1 transition-transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            rating && star <= rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-slate-600'
                          }`}
                        />
                      </button>
                    ))}
                    {rating && (
                      <span className="ml-2 text-sm text-slate-400">
                        {rating} / 5
                      </span>
                    )}
                  </div>
                </div>

                {/* Email (Optional) */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="your.email@example.com"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    We&apos;ll only use this to follow up on your feedback if needed
                  </p>
                </div>

                {/* Error Message */}
                {submitStatus === 'error' && errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400"
                  >
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm">{errorMessage}</p>
                  </motion.div>
                )}

                {/* Success Message */}
                {submitStatus === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400"
                  >
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm">Thank you for your feedback!</p>
                  </motion.div>
                )}

                {/* Submit Button */}
                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting || !message.trim()}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-cyan-500 text-white rounded-lg font-semibold hover:from-violet-600 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-violet-500 disabled:hover:to-cyan-500"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Feedback
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-slate-700 text-slate-300 rounded-lg font-semibold hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}