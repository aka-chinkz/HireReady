'use client'

import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle, Lightbulb } from 'lucide-react'

interface SkillGap {
  skill: string
  required: boolean
  priority: string
}

interface SkillGapsProps {
  gaps: SkillGap[]
  recommendations: string[]
}

export default function SkillGaps({ gaps, recommendations }: SkillGapsProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-400 bg-red-500/10 border-red-500/30'
      case 'medium':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30'
      case 'low':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30'
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/30'
    }
  }

  return (
    <div className="space-y-6">
      {/* Skill Gaps */}
      <div className="glass rounded-2xl p-6 glass-hover">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="w-5 h-5 text-amber-400" />
          <h2 className="text-xl font-bold">Skill Gaps</h2>
        </div>
        {gaps.length === 0 ? (
          <p className="text-slate-400 text-sm">No skill gaps identified! You're well-prepared.</p>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {gaps.slice(0, 5).map((gap, index) => (
              <motion.div
                key={gap.skill}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-3 rounded-lg border ${getPriorityColor(gap.priority)}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{gap.skill}</span>
                  <span className="text-xs capitalize">{gap.priority} priority</span>
                </div>
              </motion.div>
            ))}
            {gaps.length > 5 && (
              <p className="text-xs text-slate-500 text-center pt-2">
                +{gaps.length - 5} more skills
              </p>
            )}
          </div>
        )}
      </div>

      {/* Recommendations */}
      <div className="glass rounded-2xl p-6 glass-hover">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-cyan-400" />
          <h2 className="text-xl font-bold">Recommendations</h2>
        </div>
        {recommendations.length === 0 ? (
          <p className="text-slate-400 text-sm">No recommendations at this time.</p>
        ) : (
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50"
              >
                <CheckCircle className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-slate-300">{rec}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}





