'use client'

import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'

interface ReadinessScoreProps {
  score: number
}

export default function ReadinessScore({ score }: ReadinessScoreProps) {
  const circumference = 2 * Math.PI * 90
  const offset = circumference - (score / 100) * circumference

  const getScoreColor = () => {
    if (score >= 70) return 'text-emerald-400' // Green for good scores
    if (score >= 50) return 'text-yellow-400' // Yellow for medium scores
    return 'text-red-400' // Red for low scores
  }

  const getScoreLabel = () => {
    if (score >= 70) return 'Well Prepared'
    if (score >= 50) return 'Getting There'
    return 'Needs Work'
  }

  return (
    <div className="glass rounded-2xl p-8 glass-hover">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-2">Readiness Score</h2>
          <p className="text-slate-400 mb-4">
            Your overall readiness based on skills and experience
          </p>
          <div className="flex items-center gap-4">
            <div className={`text-5xl font-bold ${getScoreColor()}`}>
              {Math.round(score)}
            </div>
            <div>
              <div className={`text-lg font-semibold ${getScoreColor()}`}>
                {getScoreLabel()}
              </div>
              <div className="text-sm text-slate-400">out of 100</div>
            </div>
          </div>
        </div>

        {/* Circular Progress */}
        <div className="relative w-48 h-48">
          <svg className="transform -rotate-90 w-48 h-48">
            <circle
              cx="96"
              cy="96"
              r="90"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-slate-700"
            />
            <motion.circle
              cx="96"
              cy="96"
              r="90"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className={getScoreColor()}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <TrendingUp className={`w-12 h-12 ${getScoreColor()}`} />
          </div>
        </div>
      </div>
    </div>
  )
}





