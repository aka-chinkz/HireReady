'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, Filter, Code2, ExternalLink, Bookmark, BookmarkCheck, CheckCircle2, Circle } from 'lucide-react'
import { problems, Problem } from '@/lib/problems'
import { practiceApi, ProblemProgress } from '@/lib/api'

export default function PracticePage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('Easy')
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(new Set())
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false)
  const [solvedIds, setSolvedIds] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)

  // Load userId and progress from backend on mount
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId')
    if (storedUserId) {
      console.log('Loading progress for user:', storedUserId)
      setUserId(storedUserId)
      loadProgress(storedUserId)
    } else {
      setLoading(false)
    }
  }, [])
  
  // Reload progress when userId changes (e.g., after login)
  // Using a ref to track if we've already loaded for this userId
  const loadedUserIdRef = useRef<string | null>(null)
  
  useEffect(() => {
    if (userId && userId !== loadedUserIdRef.current) {
      console.log('User ID changed, loading progress:', userId)
      loadedUserIdRef.current = userId
      loadProgress(userId)
    }
  }, [userId])

  // Reload progress when page becomes visible (user navigates back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && userId) {
        console.log('Page visible, reloading progress')
        loadProgress(userId)
      }
    }
    
    const handleFocus = () => {
      if (userId) {
        console.log('Window focused, reloading progress')
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
      console.log('Loading progress from backend for user:', userId)
      const progress = await practiceApi.getProgress(userId)
      console.log('Loaded progress from backend:', progress)
      
      const bookmarks = new Set(progress.filter(p => p.is_bookmarked).map(p => p.problem_id))
      const solved = new Set(progress.filter(p => p.is_solved).map(p => p.problem_id))
      
      console.log('Loaded bookmarks:', Array.from(bookmarks))
      console.log('Loaded solved:', Array.from(solved))
      
      setBookmarkedIds(bookmarks)
      setSolvedIds(solved)
      
      // Also sync to localStorage as backup
      localStorage.setItem('practiceBookmarks', JSON.stringify(Array.from(bookmarks)))
      localStorage.setItem('practiceSolved', JSON.stringify(Array.from(solved)))
    } catch (error) {
      console.error('Error loading progress from backend, using localStorage:', error)
      // Fallback to localStorage only if backend fails
      const savedBookmarks = localStorage.getItem('practiceBookmarks')
      const savedSolved = localStorage.getItem('practiceSolved')
      if (savedBookmarks) {
        try {
          const bookmarksArray = JSON.parse(savedBookmarks) as number[]
          const bookmarks = new Set<number>(bookmarksArray)
          setBookmarkedIds(bookmarks)
          console.log('Loaded bookmarks from localStorage:', Array.from(bookmarks))
        } catch (e) {
          console.error('Error parsing bookmarks from localStorage:', e)
        }
      }
      if (savedSolved) {
        try {
          const solvedArray = JSON.parse(savedSolved) as number[]
          const solved = new Set<number>(solvedArray)
          setSolvedIds(solved)
          console.log('Loaded solved from localStorage:', Array.from(solved))
        } catch (e) {
          console.error('Error parsing solved from localStorage:', e)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  // Save progress to backend when it changes
  const saveProgress = async (problemId: number, updates: { is_bookmarked?: boolean; is_solved?: boolean }) => {
    // Update local state immediately (optimistic update)
    if (updates.is_bookmarked !== undefined) {
      const newBookmarks = new Set(bookmarkedIds)
      if (updates.is_bookmarked) {
        newBookmarks.add(problemId)
      } else {
        newBookmarks.delete(problemId)
      }
      setBookmarkedIds(newBookmarks)
      localStorage.setItem('practiceBookmarks', JSON.stringify(Array.from(newBookmarks)))
    }
    if (updates.is_solved !== undefined) {
      const newSolved = new Set(solvedIds)
      if (updates.is_solved) {
        newSolved.add(problemId)
      } else {
        newSolved.delete(problemId)
      }
      setSolvedIds(newSolved)
      localStorage.setItem('practiceSolved', JSON.stringify(Array.from(newSolved)))
    }

    // Save to backend if user is logged in
    if (!userId) {
      return
    }

    try {
      await practiceApi.createOrUpdateProgress(userId, {
        problem_id: problemId,
        is_bookmarked: updates.is_bookmarked ?? bookmarkedIds.has(problemId),
        is_solved: updates.is_solved ?? solvedIds.has(problemId),
      })
    } catch (error) {
      console.error('Error saving progress to backend:', error)
      // Reload from backend on error to sync state
      loadProgress(userId)
    }
  }

  // Get all unique topics - MUST be called before any early returns
  const allTopics = useMemo(() => {
    if (!problems || problems.length === 0) {
      return []
    }
    const topicSet = new Set<string>()
    problems.forEach(problem => {
      if (problem.topics && Array.isArray(problem.topics)) {
        problem.topics.forEach(topic => topicSet.add(topic))
      }
    })
    return Array.from(topicSet).sort()
  }, [])

  // Filter problems based on search, difficulty, topics, and bookmarks
  const filteredProblems = useMemo(() => {
    if (!problems || problems.length === 0) {
      return []
    }

    return problems.filter(problem => {
      // Filter by bookmarked only
      if (showBookmarkedOnly && !bookmarkedIds.has(problem.id)) {
        return false
      }

      // Filter by difficulty
      if (selectedDifficulty !== 'All' && problem.difficulty !== selectedDifficulty) {
        return false
      }

      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()
        const matchesTitle = problem.title.toLowerCase().includes(query)
        const matchesDescription = problem.description.toLowerCase().includes(query)
        const matchesTopics = problem.topics.some(topic => topic.toLowerCase().includes(query))
        if (!matchesTitle && !matchesDescription && !matchesTopics) {
          return false
        }
      }

      // Filter by selected topics
      if (selectedTopics.length > 0) {
        const hasSelectedTopic = problem.topics.some(topic => selectedTopics.includes(topic))
        if (!hasSelectedTopic) {
          return false
        }
      }

      return true
    })
  }, [searchQuery, selectedDifficulty, selectedTopics, showBookmarkedOnly, bookmarkedIds])

  const toggleBookmark = async (problemId: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const isBookmarked = bookmarkedIds.has(problemId)
    const newBookmarked = !isBookmarked
    const newSet = new Set(bookmarkedIds)
    if (isBookmarked) {
      newSet.delete(problemId)
    } else {
      newSet.add(problemId)
    }
    setBookmarkedIds(newSet)
    
    // Always save to localStorage first (immediate feedback)
    localStorage.setItem('practiceBookmarks', JSON.stringify(Array.from(newSet)))
    
    // Save to backend with the new value explicitly
    if (userId) {
      try {
        await practiceApi.createOrUpdateProgress(userId, {
          problem_id: problemId,
          is_bookmarked: newBookmarked,
          is_solved: solvedIds.has(problemId), // Keep current solved status
        })
        console.log(`Bookmark ${newBookmarked ? 'added' : 'removed'} for problem ${problemId}`)
      } catch (error) {
        console.error('Error saving bookmark to backend:', error)
        // Reload from backend to sync state on error
        await loadProgress(userId)
      }
    }
  }

  const toggleSolved = async (problemId: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const isSolved = solvedIds.has(problemId)
    const newSolved = !isSolved
    const newSet = new Set(solvedIds)
    if (isSolved) {
      newSet.delete(problemId)
    } else {
      newSet.add(problemId)
    }
    setSolvedIds(newSet)
    
    // Always save to localStorage first (immediate feedback)
    localStorage.setItem('practiceSolved', JSON.stringify(Array.from(newSet)))
    
    // Save to backend with the new value explicitly
    if (userId) {
      try {
        const result = await practiceApi.createOrUpdateProgress(userId, {
          problem_id: problemId,
          is_bookmarked: bookmarkedIds.has(problemId), // Keep current bookmark status
          is_solved: newSolved,
        })
        console.log(`Problem ${problemId} marked as ${newSolved ? 'solved' : 'unsolved'}`, result)
        
        // Reload progress to get updated solved_at timestamp from backend
        await loadProgress(userId)
      } catch (error: any) {
        console.error('Error saving solved status to backend:', error)
        const errorMessage = error?.response?.data?.detail || error?.message || 'Unknown error'
        console.error('Full error:', errorMessage)
        // Reload from backend to sync state on error
        if (userId) {
          await loadProgress(userId)
        }
      }
    } else {
      console.warn('No userId available, saved to localStorage only')
    }
  }

  // Calculate completion percentage
  const completionPercentage = useMemo(() => {
    if (!problems || problems.length === 0) return 0
    return Math.round((solvedIds.size / problems.length) * 100)
  }, [solvedIds])

  // Group problems by difficulty
  const groupedProblems = useMemo(() => {
    const groups: { [key: string]: Problem[] } = {}
    filteredProblems.forEach(problem => {
      if (!groups[problem.difficulty]) {
        groups[problem.difficulty] = []
      }
      groups[problem.difficulty].push(problem)
    })
    return groups
  }, [filteredProblems])

  const toggleTopic = (topic: string) => {
    setSelectedTopics(prev => 
      prev.includes(topic) 
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    )
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'Medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'Hard':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  // Early returns AFTER all hooks have been called
  if (!problems || problems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <Code2 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-400 mb-2">Loading problems...</h3>
        </div>
      </div>
    )
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
          <div className="flex items-center gap-3 sm:gap-4 mb-4 md:mb-6">
            <div className="w-12 h-12 sm:w-14 md:w-16 sm:h-14 md:h-16 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
              <Code2 className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                Practice Problems
              </h1>
              <p className="text-slate-400 mt-1 text-sm sm:text-base">
                Master DSA and Competitive Programming with curated problems
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="glass rounded-2xl p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search problems by title, description, or topic..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                />
              </div>

              {/* Difficulty Filter */}
              <div className="flex gap-2 flex-wrap">
                {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff as any)}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg transition-colors ${
                      selectedDifficulty === diff
                        ? 'bg-violet-500 text-white'
                        : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
                {/* Bookmark Filter */}
                <button
                  onClick={() => setShowBookmarkedOnly(!showBookmarkedOnly)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg transition-colors flex items-center gap-1.5 sm:gap-2 ${
                    showBookmarkedOnly
                      ? 'bg-yellow-500 text-white'
                      : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                  title={showBookmarkedOnly ? 'Show all problems' : 'Show bookmarked only'}
                >
                  {showBookmarkedOnly ? (
                    <BookmarkCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                  ) : (
                    <Bookmark className="w-3 h-3 sm:w-4 sm:h-4" />
                  )}
                  <span className="hidden sm:inline">Bookmarks</span>
                  <span className="sm:hidden">Bk</span>
                  {bookmarkedIds.size > 0 && ` (${bookmarkedIds.size})`}
                </button>
              </div>
            </div>

            {/* Topic Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-400">Topics:</span>
              {allTopics.map((topic) => (
                <button
                  key={topic}
                  onClick={() => toggleTopic(topic)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    selectedTopics.includes(topic)
                      ? 'bg-violet-500 text-white'
                      : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {topic}
                </button>
              ))}
              {selectedTopics.length > 0 && (
                <button
                  onClick={() => setSelectedTopics([])}
                  className="px-3 py-1 rounded-lg text-sm bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Completion Progress Bar */}
          <div className="glass rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Progress Tracker</h3>
                <p className="text-sm text-slate-400">
                  {solvedIds.size} of {problems.length} problems solved
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                  {completionPercentage}%
                </div>
                <p className="text-xs text-slate-400">Complete</p>
              </div>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-4 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={`h-full rounded-full ${
                  completionPercentage === 100
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                    : 'bg-gradient-to-r from-violet-500 to-cyan-500'
                }`}
              />
            </div>
            {completionPercentage === 100 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 flex items-center gap-2 text-green-400 text-sm font-medium"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Congratulations! You&apos;ve completed all problems! 🎉</span>
              </motion.div>
            )}
          </div>

          {/* Motivational Text */}
          <div className="mb-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-xl p-6 border border-violet-500/20 bg-gradient-to-r from-violet-500/10 to-cyan-500/10"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                  <Code2 className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2 bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                    Ready to level up your coding skills?
                  </h3>
                  <p className="text-slate-300 leading-relaxed">
                    Every problem you solve makes you a better programmer. Start with fundamentals, build your confidence, and tackle increasingly complex challenges. Remember: consistent practice beats perfection. You&apos;ve got this! 💪
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Problems List */}
        <div className="space-y-6">
          {Object.entries(groupedProblems).map(([difficulty, probs]) => (
            <motion.div
              key={difficulty}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-6"
            >
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-2">
                  <span className={`px-3 py-1 rounded-lg text-sm font-semibold border ${getDifficultyColor(difficulty)}`}>
                    {difficulty}
                  </span>
                  <span className="text-slate-400 text-lg">
                    ({probs.length} problem{probs.length !== 1 ? 's' : ''})
                  </span>
                </h2>
                {difficulty === 'Easy' && (
                  <p className="text-sm text-slate-400 italic">
                    Easy problems focus on fundamentals and basic logic.
                  </p>
                )}
                {difficulty === 'Medium' && (
                  <p className="text-sm text-slate-400 italic">
                    Medium problems involve optimization and multiple concepts.
                  </p>
                )}
                {difficulty === 'Hard' && (
                  <p className="text-sm text-slate-400 italic">
                    Hard problems involve advanced algorithms, tricky edge cases, or complex optimizations.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {probs.map((problem) => {
                  const isBookmarked = bookmarkedIds.has(problem.id)
                  const isSolved = solvedIds.has(problem.id)
                  return (
                    <div
                      key={problem.id}
                      className="relative group"
                    >
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.02 }}
                        className={`bg-slate-800/50 border rounded-xl p-4 hover:border-violet-500/50 transition-all glass-hover group-hover relative ${
                          isSolved
                            ? 'border-green-500/30 bg-green-500/5'
                            : 'border-slate-700'
                        }`}
                      >
                        {/* Bookmark Button - positioned at top right */}
                        <button
                          onClick={(e) => toggleBookmark(problem.id, e)}
                          className={`absolute top-3 right-3 p-1.5 rounded-lg transition-all z-20 ${
                            isBookmarked
                              ? 'bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/30'
                              : 'bg-slate-700/80 border border-slate-600 text-slate-400 hover:bg-slate-600/90 hover:text-yellow-400 hover:border-yellow-500/50'
                          }`}
                          title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
                        >
                          {isBookmarked ? (
                            <BookmarkCheck className="w-4 h-4" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </button>

                        {/* Solved Button - positioned at top left */}
                        <button
                          onClick={(e) => toggleSolved(problem.id, e)}
                          className={`absolute top-3 left-3 p-1.5 rounded-lg transition-all z-20 ${
                            isSolved
                              ? 'bg-green-500/20 border border-green-500/50 text-green-400 hover:bg-green-500/30'
                              : 'bg-slate-700/80 border border-slate-600 text-slate-400 hover:bg-slate-600/90 hover:text-green-400 hover:border-green-500/50'
                          }`}
                          title={isSolved ? 'Mark as unsolved' : 'Mark as solved'}
                        >
                          {isSolved ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <Circle className="w-4 h-4" />
                          )}
                        </button>
                        
                        <a
                          href={problem.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <div className="flex items-start justify-between mb-2 pr-10 pl-10">
                            <h3 className={`text-lg font-semibold flex-1 group-hover:text-violet-400 transition-colors ${
                              isSolved ? 'text-green-400 line-through' : 'text-white'
                            }`}>
                              {problem.id}. {problem.title}
                              {isSolved && (
                                <span className="ml-2 text-xs text-green-400">✓ Solved</span>
                              )}
                            </h3>
                            <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                              <span className="px-2 py-1 bg-slate-700/50 border border-slate-600 rounded text-xs text-slate-300">
                                {problem.platform}
                              </span>
                              <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-violet-400 transition-colors" />
                            </div>
                          </div>
                          <p className="text-sm text-slate-400 mb-3 line-clamp-2">
                            {problem.description}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {problem.topics.map((topic) => (
                              <span
                                key={topic}
                                className="px-2 py-1 bg-violet-500/20 border border-violet-500/30 rounded text-xs text-violet-300"
                              >
                                {topic}
                              </span>
                            ))}
                          </div>
                        </a>
                      </motion.div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          ))}

          {filteredProblems.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass rounded-2xl p-12 text-center"
            >
              <Code2 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-400 mb-2">No problems found</h3>
              <p className="text-slate-500">Try adjusting your filters or search query</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
