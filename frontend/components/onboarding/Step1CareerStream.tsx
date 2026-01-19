'use client'

import { motion } from 'framer-motion'
import { Code, Database, Brain, Briefcase, DollarSign } from 'lucide-react'

const CAREER_STREAMS = [
  { id: 'Software Development', label: 'Software Development', icon: Code, color: 'from-violet-500 to-purple-600' },
  { id: 'Data Science', label: 'Data Science', icon: Database, color: 'from-cyan-500 to-blue-600' },
  { id: 'AI/ML', label: 'AI/ML', icon: Brain, color: 'from-pink-500 to-rose-600' },
  { id: 'Product', label: 'Product', icon: Briefcase, color: 'from-emerald-500 to-teal-600' },
  { id: 'Finance', label: 'Finance', icon: DollarSign, color: 'from-amber-500 to-orange-600' },
]

interface Step1CareerStreamProps {
  value: string
  onChange: (value: string) => void
  onNext: () => void
}

export default function Step1CareerStream({ value, onChange, onNext }: Step1CareerStreamProps) {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
        Choose Your Career Stream
      </h2>
      <p className="text-slate-400 mb-8">Select the field you're most interested in pursuing</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {CAREER_STREAMS.map((stream) => {
          const Icon = stream.icon
          const isSelected = value === stream.id
          
          return (
            <motion.button
              key={stream.id}
              onClick={() => onChange(stream.id)}
              className={`relative p-6 rounded-xl border-2 transition-all ${
                isSelected
                  ? 'border-violet-500 bg-violet-500/10'
                  : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${stream.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-lg font-semibold">{stream.label}</span>
              </div>
              {isSelected && (
                <motion.div
                  className="absolute top-2 right-2 w-6 h-6 bg-violet-500 rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          )
        })}
      </div>

      <motion.button
        onClick={onNext}
        disabled={!value}
        className="w-full py-3 px-6 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        whileHover={{ scale: value ? 1.02 : 1 }}
        whileTap={{ scale: value ? 0.98 : 1 }}
      >
        Continue
      </motion.button>
    </div>
  )
}





