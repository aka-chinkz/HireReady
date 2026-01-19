'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { companyApi, Company } from '@/lib/api'
import { ExternalLink, Sparkles, Rocket, Building2 } from 'lucide-react'

interface CompanyCardsProps {
  userId: string
  matchedCompanies: string[]
}

const TIER_ICONS = {
  1: Sparkles,
  2: Rocket,
  3: Building2,
}

const TIER_COLORS = {
  1: 'from-violet-500 to-purple-600',
  2: 'from-cyan-500 to-blue-600',
  3: 'from-emerald-500 to-teal-600',
}

export default function CompanyCards({ userId, matchedCompanies }: CompanyCardsProps) {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTier, setSelectedTier] = useState<number | null>(null)

  useEffect(() => {
    loadCompanies()
  }, [])

  const loadCompanies = async () => {
    try {
      const allCompanies = await companyApi.getAll()
      // Filter to show matched companies first, then others
      const matched = allCompanies.filter((c) => matchedCompanies.includes(c.name))
      const others = allCompanies.filter((c) => !matchedCompanies.includes(c.name))
      setCompanies([...matched, ...others])
    } catch (error) {
      console.error('Error loading companies:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCompanies = selectedTier
    ? companies.filter((c) => c.tier === selectedTier)
    : companies

  if (loading) {
    return (
      <div className="glass rounded-2xl p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-700 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-slate-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="glass rounded-2xl p-8 glass-hover">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Target Companies</h2>
          <p className="text-slate-400">
            {filteredCompanies.length} companies in your target tiers
          </p>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map((tier) => {
            const Icon = TIER_ICONS[tier as keyof typeof TIER_ICONS]
            const isActive = selectedTier === tier
            return (
              <button
                key={tier}
                onClick={() => setSelectedTier(isActive ? null : tier)}
                className={`px-4 py-2 rounded-lg border transition-all ${
                  isActive
                    ? 'border-violet-500 bg-violet-500/20'
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                }`}
              >
                <Icon className="w-5 h-5" />
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto">
        {filteredCompanies.map((company, index) => {
          const Icon = TIER_ICONS[company.tier as keyof typeof TIER_ICONS]
          const color = TIER_COLORS[company.tier as keyof typeof TIER_COLORS]
          const isMatched = matchedCompanies.includes(company.name)

          return (
            <motion.div
              key={company.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-6 rounded-xl border-2 ${
                isMatched
                  ? 'border-violet-500/50 bg-violet-500/5'
                  : 'border-slate-700 bg-slate-800/50'
              } hover:border-slate-600 transition-all`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${color}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{company.name}</h3>
                    <p className="text-sm text-slate-400">Tier {company.tier}</p>
                  </div>
                </div>
                {isMatched && (
                  <span className="px-2 py-1 text-xs bg-violet-500/20 text-violet-400 rounded">
                    Matched
                  </span>
                )}
              </div>
              {company.description && (
                <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                  {company.description}
                </p>
              )}
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>
                  Internships: {company.internship_open_month || 'N/A'}
                </span>
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-violet-400 hover:text-violet-300"
                  >
                    Website <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}





