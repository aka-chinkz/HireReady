'use client'

import { motion } from 'framer-motion'
import { Sparkles, Rocket, Building2 } from 'lucide-react'

const TIERS = [
  {
    id: 1,
    label: 'Tier 1',
    description: 'FAANG & Big Tech',
    icon: Sparkles,
    color: 'from-violet-500 to-purple-600',
    examples: 'Google, Meta, Amazon, Apple, Microsoft',
  },
  {
    id: 2,
    label: 'Tier 2',
    description: 'Unicorns & Strong Startups',
    icon: Rocket,
    color: 'from-cyan-500 to-blue-600',
    examples: 'Stripe, Airbnb, Uber, Databricks',
  },
  {
    id: 3,
    label: 'Tier 3',
    description: 'Mid-size Companies',
    icon: Building2,
    color: 'from-emerald-500 to-teal-600',
    examples: 'Shopify, Twilio, MongoDB, Atlassian',
  },
]

interface Step4TargetTiersProps {
  value: number[]
  onChange: (value: number[]) => void
  onComplete: () => void
  onBack: () => void
  loading: boolean
}

export default function Step4TargetTiers({ value, onChange, onComplete, onBack, loading }: Step4TargetTiersProps) {
  const toggleTier = (tierId: number) => {
    if (value.includes(tierId)) {
      onChange(value.filter((t) => t !== tierId))
    } else {
      onChange([...value, tierId])
    }
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
        Target Company Tiers
      </h2>
      <p className="text-slate-400 mb-8">Select which company tiers you're interested in</p>

      <div className="space-y-4 mb-8">
        {TIERS.map((tier) => {
          const Icon = tier.icon
          const isSelected = value.includes(tier.id)

          return (
            <motion.button
              key={tier.id}
              onClick={() => toggleTier(tier.id)}
              className={`w-full p-6 rounded-xl border-2 text-left transition-all ${
                isSelected
                  ? 'border-violet-500 bg-violet-500/10'
                  : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
              }`}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${tier.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-xl font-semibold">{tier.label}</h3>
                    {isSelected && (
                      <motion.div
                        className="w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.div>
                    )}
                  </div>
                  <p className="text-slate-300 mb-2">{tier.description}</p>
                  <p className="text-sm text-slate-500">{tier.examples}</p>
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Navigation */}
      <div className="flex gap-4">
        <button
          onClick={onBack}
          disabled={loading}
          className="flex-1 py-3 px-6 bg-slate-800 border border-slate-700 text-white font-semibold rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={onComplete}
          disabled={value.length === 0 || loading}
          className="flex-1 py-3 px-6 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              <span>Creating your profile...</span>
            </>
          ) : (
            'Complete Setup'
          )}
        </button>
      </div>
    </div>
  )
}





