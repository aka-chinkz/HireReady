'use client'

import { useState, useEffect, useRef } from 'react'
import Script from 'next/script'
import { motion } from 'framer-motion'
import { intelligenceApi, User } from '@/lib/api'
import { userApi } from '@/lib/api'
import { RefreshCw, User as UserIcon, Calendar, Target, TrendingUp, Zap, CheckCircle2, Layers, Rocket, MessageSquare } from 'lucide-react'
import { useRouter } from 'next/navigation'
import FeedbackModal from '@/components/FeedbackModal'

interface DashboardProps {
  userId: string
}

export default function Dashboard({ userId }: DashboardProps) {
  const [user, setUser] = useState<User | null>(null)
  const [readiness, setReadiness] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false)
  const router = useRouter()
  const vantaRef = useRef<HTMLDivElement>(null)
  const vantaEffect = useRef<any>(null)

  useEffect(() => {
    loadData()
  }, [userId])

  // Initialize Vanta effect - runs on every mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    const initializeVanta = () => {
      if (!vantaRef.current || !(window as any).VANTA?.NET) return false

      // Clean up existing effect
      if (vantaEffect.current) {
        try {
          vantaEffect.current.destroy()
        } catch (e) {
          // Ignore cleanup errors
        }
        vantaEffect.current = null
      }

      try {
        vantaEffect.current = (window as any).VANTA.NET({
          el: vantaRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          scale: 1.00,
          scaleMobile: 1.00,
          color: 0x6c3fff,
          backgroundColor: 0x0f172a,
          points: 20.00,
          maxDistance: 23.00
        })
        return true
      } catch (error) {
        console.error('Error initializing Vanta:', error)
        return false
      }
    }

    let pollInterval: NodeJS.Timeout | null = null
    let rafId: number | null = null

    const tryInit = () => {
      if (initializeVanta()) {
        return
      }

      // If scripts aren't loaded yet, poll for them
      let attempts = 0
      const maxAttempts = 100 // 10 seconds max
      pollInterval = setInterval(() => {
        attempts++
        if (initializeVanta()) {
          if (pollInterval) clearInterval(pollInterval)
        } else if (attempts >= maxAttempts) {
          if (pollInterval) clearInterval(pollInterval)
        }
      }, 100)
    }

    // Use requestAnimationFrame to ensure DOM is ready
    rafId = requestAnimationFrame(() => {
      rafId = requestAnimationFrame(() => {
        tryInit()
      })
    })

    // Cleanup function
    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }
      if (pollInterval) {
        clearInterval(pollInterval)
      }
      if (vantaEffect.current) {
        try {
          vantaEffect.current.destroy()
        } catch (e) {
          // Ignore cleanup errors
        }
        vantaEffect.current = null
      }
    }
  }, []) // Empty deps - runs on every mount/unmount cycle

  const loadData = async () => {
    setLoading(true)
    try {
      const [userData, readinessData] = await Promise.all([
        userApi.get(userId),
        intelligenceApi.getReadiness(userId),
      ])
      setUser(userData)
      setReadiness(readinessData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    )
  }

  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js"
        strategy="afterInteractive"
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.net.min.js"
        strategy="afterInteractive"
      />
      <div className="min-h-screen relative p-4 md:p-8">
        {/* Vanta.js Background */}
        <div ref={vantaRef} className="fixed inset-0 z-0" style={{ width: '100%', height: '100%' }} />
        
        {/* Dark overlay for text readability */}
        <div className="fixed inset-0 z-[1] bg-slate-900/70" />
        
        {/* Content overlay */}
        <div className="relative z-10 max-w-7xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-16 md:mt-24 mb-24 md:mb-32 text-center py-12 md:py-16"
        >
          <h1 className="text-8xl md:text-9xl font-black mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-violet-400 via-cyan-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent animate-gradient text-glow">
              HireReady
            </span>
          </h1>
          <p className="text-3xl md:text-4xl text-slate-300 font-semibold">
            Built to get you hired.
          </p>
        </motion.div>

        {/* Why Choose HireReady Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 md:mb-20">
            <span className="text-white">Why Choose </span>
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">HireReady</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Preparation That Matches Real Companies */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-2xl p-6 glass-hover"
            >
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center mb-4">
                <Target className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                🎯 Preparation That Matches Real Companies
              </h3>
              <p className="text-slate-300 leading-relaxed">
                HireReady doesn't give you random questions. Your preparation is aligned with what top software companies actually ask, based on role, level, and interview patterns.
              </p>
            </motion.div>

            {/* Card 2: Designed for Consistency */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass rounded-2xl p-6 glass-hover"
            >
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center mb-4">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                🔥 Designed for Consistency
              </h3>
              <p className="text-slate-300 leading-relaxed">
                Most people fail because they stop. HireReady keeps you moving with structured plans, daily goals, and progress tracking — without pressure or noise.
              </p>
            </motion.div>

            {/* Card 3: Know When You're Actually Ready */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass rounded-2xl p-6 glass-hover lg:row-span-2"
            >
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center mb-4">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                📈 Know When You're Actually Ready
              </h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                Practice alone doesn't mean readiness. HireReady tracks accuracy, speed, consistency, and topic mastery to tell you how close you are to interview-ready.
              </p>
              <div className="mt-6 p-4 bg-gradient-to-r from-violet-500/20 to-cyan-500/20 rounded-xl border border-violet-500/30">
                <p className="text-slate-200 font-medium">
                  Track your progress across 450+ problems with real-time analytics.
                </p>
              </div>
            </motion.div>

            {/* Card 4: One Platform, One Goal */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="glass rounded-2xl p-6 glass-hover"
            >
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center mb-4">
                <Layers className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                🏆 One Platform, One Goal
              </h3>
              <p className="text-slate-300 leading-relaxed">
                No switching between tools. No scattered resources. HireReady brings practice, planning, analytics, and guidance into one focused platform.
              </p>
            </motion.div>

            {/* Card 5: The HireReady Promise */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="glass rounded-2xl p-6 glass-hover bg-gradient-to-br from-violet-500/10 to-cyan-500/10 border-2 border-violet-500/30"
            >
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center mb-4">
                <Rocket className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                🚀 The HireReady Promise
              </h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                We don't just help you practice. We help you get hired.
              </p>
              <button
                onClick={() => router.push('/practice')}
                className="mt-4 w-full px-6 py-3 bg-gradient-to-r from-violet-500 to-cyan-500 text-white rounded-lg font-semibold hover:from-violet-600 hover:to-cyan-600 transition-all"
              >
                Start Practicing
              </button>
            </motion.div>
          </div>
        </motion.div>

        {/* Feedback Button - Floating */}
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 }}
          onClick={() => setIsFeedbackModalOpen(true)}
          className="fixed bottom-8 right-8 z-40 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-cyan-500 text-white rounded-full shadow-lg hover:from-violet-600 hover:to-cyan-600 transition-all hover:scale-105"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="font-semibold">Feedback</span>
        </motion.button>

        {/* Feedback Modal */}
        <FeedbackModal
          isOpen={isFeedbackModalOpen}
          onClose={() => setIsFeedbackModalOpen(false)}
          pageSource="home"
        />
        </div>
      </div>
    </>
  )
}





