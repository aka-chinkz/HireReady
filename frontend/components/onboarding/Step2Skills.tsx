'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Plus } from 'lucide-react'

const SUGGESTED_SKILLS = [
  'DSA', 'OOP', 'Python', 'Java', 'JavaScript', 'TypeScript',
  'React', 'Node.js', 'System Design', 'SQL', 'Git', 'Docker',
  'AWS', 'Machine Learning', 'Data Structures', 'Algorithms',
  'C++', 'Go', 'Rust', 'Kubernetes', 'CI/CD', 'MongoDB', 'PostgreSQL'
]

interface Step2SkillsProps {
  value: string[]
  onChange: (value: string[]) => void
  onNext: () => void
  onBack: () => void
}

export default function Step2Skills({ value, onChange, onNext, onBack }: Step2SkillsProps) {
  const [inputValue, setInputValue] = useState('')

  const addSkill = (skill: string) => {
    const trimmed = skill.trim()
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed])
    }
    setInputValue('')
  }

  const removeSkill = (skill: string) => {
    onChange(value.filter((s) => s !== skill))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addSkill(inputValue)
    }
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
        Your Skills
      </h2>
      <p className="text-slate-400 mb-8">Add your technical skills. We&apos;ll match them with job requirements.</p>

      {/* Input */}
      <div className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a skill and press Enter"
            className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-white placeholder-slate-500"
          />
          <button
            onClick={() => addSkill(inputValue)}
            className="px-6 py-3 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Selected Skills */}
      {value.length > 0 && (
        <div className="mb-6">
          <p className="text-sm text-slate-400 mb-3">Selected Skills ({value.length})</p>
          <div className="flex flex-wrap gap-2">
            {value.map((skill) => (
              <motion.div
                key={skill}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2 px-4 py-2 bg-violet-500/20 border border-violet-500/30 rounded-lg"
              >
                <span className="text-sm font-medium">{skill}</span>
                <button
                  onClick={() => removeSkill(skill)}
                  className="text-violet-300 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Skills */}
      <div className="mb-8">
        <p className="text-sm text-slate-400 mb-3">Suggested Skills</p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_SKILLS.filter((skill) => !value.includes(skill)).map((skill) => (
            <button
              key={skill}
              onClick={() => addSkill(skill)}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg hover:border-violet-500 hover:bg-slate-700 transition-colors text-sm"
            >
              {skill}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 py-3 px-6 bg-slate-800 border border-slate-700 text-white font-semibold rounded-lg hover:bg-slate-700 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={value.length === 0}
          className="flex-1 py-3 px-6 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  )
}





