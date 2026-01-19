'use client'

import { motion } from 'framer-motion'

const YEARS = [1, 2, 3, 4]
const COUNTRIES = ['United States', 'Canada', 'United Kingdom', 'India', 'Australia', 'Germany', 'France', 'Other']

interface Step3YearProps {
  universityYear: number
  graduationYear: number
  country: string
  onChange: (data: { university_year?: number; graduation_year?: number; country?: string }) => void
  onNext: () => void
  onBack: () => void
}

export default function Step3Year({ universityYear, graduationYear, country, onChange, onNext, onBack }: Step3YearProps) {
  const currentYear = new Date().getFullYear()
  const graduationYears = Array.from({ length: 5 }, (_, i) => currentYear + i)

  return (
    <div>
      <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
        University Information
      </h2>
      <p className="text-slate-400 mb-8">Tell us about your academic timeline</p>

      {/* University Year */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-300 mb-3">University Year</label>
        <div className="grid grid-cols-4 gap-3">
          {YEARS.map((year) => (
            <motion.button
              key={year}
              onClick={() => onChange({ university_year: year })}
              className={`py-4 px-4 rounded-lg border-2 font-semibold transition-all ${
                universityYear === year
                  ? 'border-violet-500 bg-violet-500/10 text-violet-400'
                  : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {year === 1 ? '1st' : year === 2 ? '2nd' : year === 3 ? '3rd' : 'Final'}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Graduation Year */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-300 mb-3">Graduation Year</label>
        <select
          value={graduationYear}
          onChange={(e) => onChange({ graduation_year: parseInt(e.target.value) })}
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-white"
        >
          {graduationYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* Country */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-slate-300 mb-3">Country</label>
        <select
          value={country}
          onChange={(e) => onChange({ country: e.target.value })}
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-white"
        >
          {COUNTRIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
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
          disabled={universityYear === 0}
          className="flex-1 py-3 px-6 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  )
}





