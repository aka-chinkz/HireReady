'use client'

/**
 * PROGRESS TRACKER PAGE
 * 
 * Tracks coding progress with:
 * - Total solved questions with difficulty breakdown
 * - Difficulty distribution pie chart
 * - Solved questions list with filtering/searching
 */

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { TrendingUp, PieChart, List, Search, Filter, ExternalLink, CheckCircle2 } from 'lucide-react'
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { practiceApi, ProblemProgress } from '@/lib/api'
import { problems, Problem } from '@/lib/problems'
import { format, parseISO, isValid } from 'date-fns'

interface SolvedQuestion {
  id: number
  title: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  topic: string
  solved: boolean
  solvedAt: string
  platform: string
  link: string
}


export default function ProgressPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [progress, setProgress] = useState<ProblemProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All')

  // Load user progress
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId')
    if (storedUserId) {
      setUserId(storedUserId)
      loadProgress(storedUserId)
    } else {
      setLoading(false)
    }
  }, [])

  // Reload progress when route becomes active (for Next.js navigation)
  useEffect(() => {
    if (userId && !document.hidden) {
      // Small delay to ensure page is fully mounted
      const timer = setTimeout(() => {
        loadProgress(userId)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [userId])

  // Reload progress when component becomes visible (e.g., user navigates back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && userId) {
        loadProgress(userId)
      }
    }

    const handleFocus = () => {
      if (userId) {
        loadProgress(userId)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [userId])

  const loadProgress = async (userId: string) => {
    try {
      setLoading(true)
      const progressData = await practiceApi.getProgress(userId)

      // Check if we have solved problems without solved_at dates
      const solvedWithoutDate = progressData.filter(p => p.is_solved && !p.solved_at)
      if (solvedWithoutDate.length > 0) {
        // Try to backfill dates for solved problems missing solved_at
        try {
          await practiceApi.backfillSolvedDates(userId)
          // Reload after backfill
          const updatedProgress = await practiceApi.getProgress(userId)
          setProgress(updatedProgress)
        } catch (backfillError) {
          console.warn('Could not backfill solved dates:', backfillError)
          // Continue with existing data
          setProgress(progressData)
        }
      } else {
        setProgress(progressData)
      }
    } catch (error) {
      console.error('Error loading progress:', error)
    } finally {
      setLoading(false)
    }
  }

  // Transform progress data to solved questions
  const solvedQuestions = useMemo<SolvedQuestion[]>(() => {
    // Include all solved problems, prioritize solved_at, then updated_at, then created_at
    const solvedProgress = progress.filter(p => p.is_solved)

    const questions: SolvedQuestion[] = []

    for (const p of solvedProgress) {
      const problem = problems.find(prob => prob.id === p.problem_id)
      if (!problem) continue

      // Use solved_at first - this is the most accurate date
      // For problems without solved_at (marked before timestamp logic was added),
      // use updated_at as fallback, but only if it's recent (within heatmap range)
      // Otherwise use created_at as last resort
      let solvedAtDate = p.solved_at

      if (!solvedAtDate) {
        // Fallback to updated_at or created_at for legacy data
        const fallbackDate = p.updated_at || p.created_at
        if (fallbackDate) {
          // Use fallback date if it exists
          solvedAtDate = fallbackDate
        } else {
          // Last resort: use today (shouldn't happen, but handle it)
          solvedAtDate = new Date().toISOString()
        }
      }

      questions.push({
        id: problem.id,
        title: problem.title,
        difficulty: problem.difficulty,
        topic: problem.topics[0] || 'Other',
        solved: true,
        solvedAt: solvedAtDate,
        platform: problem.platform,
        link: problem.url,
      })
    }

    return questions.sort((a, b) => new Date(b.solvedAt).getTime() - new Date(a.solvedAt).getTime())
  }, [progress])

  // Log solvedQuestions array for debugging
  useEffect(() => {
    if (solvedQuestions.length > 0) {
      console.log('📋 SOLVED QUESTIONS ARRAY:', solvedQuestions.length, 'items')

      // Show recent items with normalized date keys
      const recentWithDates = solvedQuestions.slice(0, 10).map(q => {
        const parsedDate = parseISO(q.solvedAt) || new Date(q.solvedAt)
        const localYear = parsedDate.getFullYear()
        const localMonth = parsedDate.getMonth()
        const localDay = parsedDate.getDate()
        const dateKey = format(new Date(localYear, localMonth, localDay), 'yyyy-MM-dd')
        return {
          id: q.id,
          title: q.title.substring(0, 25),
          difficulty: q.difficulty,
          solvedAt: q.solvedAt,
          dateKey: dateKey,
          parsedISO: parsedDate.toISOString(),
          localDate: `${localYear}-${localMonth + 1}-${localDay}`
        }
      })
      console.table(recentWithDates)

      // Check which dates have solves
      const dateCounts = new Map<string, number>()
      solvedQuestions.forEach(q => {
        try {
          const parsedDate = parseISO(q.solvedAt) || new Date(q.solvedAt)
          const year = parsedDate.getFullYear()
          const month = parsedDate.getMonth()
          const day = parsedDate.getDate()
          const dateKey = format(new Date(year, month, day), 'yyyy-MM-dd')
          dateCounts.set(dateKey, (dateCounts.get(dateKey) || 0) + 1)
        } catch (e) { }
      })
      console.log('📋 DATE COUNTS (from solvedQuestions):', Array.from(dateCounts.entries()).sort().slice(-10))

      if (solvedQuestions.length > 10) {
        console.log(`... and ${solvedQuestions.length - 10} more items`)
      }
    }
  }, [solvedQuestions])

  // Calculate statistics
  const stats = useMemo(() => {
    const total = solvedQuestions.length
    const easy = solvedQuestions.filter(q => q.difficulty === 'Easy').length
    const medium = solvedQuestions.filter(q => q.difficulty === 'Medium').length
    const hard = solvedQuestions.filter(q => q.difficulty === 'Hard').length

    return { total, easy, medium, hard }
  }, [solvedQuestions])


  // Pie chart data
  const pieChartData = useMemo(() => {
    return [
      { name: 'Easy', value: stats.easy, color: '#22c55e' },
      { name: 'Medium', value: stats.medium, color: '#eab308' },
      { name: 'Hard', value: stats.hard, color: '#ef4444' },
    ].filter(item => item.value > 0)
  }, [stats])

  // Filtered solved questions
  const filteredQuestions = useMemo(() => {
    return solvedQuestions.filter(q => {
      const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesDifficulty = difficultyFilter === 'All' || q.difficulty === difficultyFilter
      return matchesSearch && matchesDifficulty
    })
  }, [solvedQuestions, searchQuery, difficultyFilter])


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
          <div className="flex items-center gap-3 sm:gap-4 mb-4 md:mb-6">
            <div className="w-12 h-12 sm:w-14 md:w-16 sm:h-14 md:h-16 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/50 flex-shrink-0">
              <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-1 sm:mb-2">
                <span className="bg-gradient-to-r from-violet-400 via-violet-300 to-cyan-400 bg-clip-text text-transparent drop-shadow-lg">
                  Progress Tracker
                </span>
              </h1>
              <p className="text-slate-300 text-sm sm:text-base md:text-lg mt-1">
                Track your coding progress and consistency
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 mb-6"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="text-sm text-slate-300 mb-2 font-medium">Total Solved</div>
              <div className="text-5xl md:text-6xl font-bold text-white">
                <span className="bg-gradient-to-r from-violet-400 via-violet-300 to-cyan-400 bg-clip-text text-transparent drop-shadow-lg">
                  {stats.total}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-6 md:gap-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-green-400 drop-shadow-lg">{stats.easy}</div>
                <div className="text-sm text-slate-300 font-medium mt-1">Easy</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-yellow-400 drop-shadow-lg">{stats.medium}</div>
                <div className="text-sm text-slate-300 font-medium mt-1">Medium</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-red-400 drop-shadow-lg">{stats.hard}</div>
                <div className="text-sm text-slate-300 font-medium mt-1">Hard</div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-6">
          {/* Difficulty Distribution Pie Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <PieChart className="w-6 h-6 text-violet-400" />
              <h2 className="text-2xl font-bold text-white">Difficulty Distribution</h2>
            </div>

            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`${value} problems`, 'Solved']}
                    contentStyle={{
                      backgroundColor: 'rgba(30, 41, 59, 0.9)',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      borderRadius: '8px',
                      color: '#f1f5f9',
                    }}
                  />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-400">
                No solved problems yet. Start solving to see your progress!
              </div>
            )}
          </motion.div>
        </div>

        {/* Solved Questions List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <List className="w-6 h-6 text-violet-400" />
            <h2 className="text-2xl font-bold text-white">Solved Questions</h2>
            <span className="text-slate-400">({filteredQuestions.length})</span>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-400" />
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value as any)}
                className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-violet-500"
              >
                <option value="All">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Questions List */}
          {filteredQuestions.length > 0 ? (
            <div className="space-y-3">
              {filteredQuestions.map((question, index) => (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 hover:border-violet-500/50 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <h3 className="text-lg font-semibold text-white">{question.title}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-semibold border ${question.difficulty === 'Easy' ? 'bg-green-500/20 border-green-500/50 text-green-400' :
                            question.difficulty === 'Medium' ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400' :
                              'bg-red-500/20 border-red-500/50 text-red-400'
                          }`}>
                          {question.difficulty}
                        </span>
                        <span className="px-2 py-1 bg-violet-500/20 border border-violet-500/30 rounded text-xs text-violet-300">
                          {question.topic}
                        </span>
                      </div>
                      <div className="text-sm text-slate-400 ml-8">
                        Solved on {format(parseISO(question.solvedAt), 'MMM d, yyyy')} • {question.platform}
                      </div>
                    </div>
                    <a
                      href={question.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-violet-500/20 border border-violet-500/30 rounded-lg text-violet-300 hover:bg-violet-500/30 transition-colors"
                    >
                      <span className="text-sm">View</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              {searchQuery || difficultyFilter !== 'All'
                ? 'No questions match your filters'
                : 'No solved questions yet. Start solving problems to track your progress!'}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
