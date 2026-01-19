'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { companyApi, Company } from '@/lib/api'
import { Calendar as CalendarIcon, Building2, Clock, CalendarDays, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'

interface CalendarViewProps {
  userId: string
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const MONTH_MAP: { [key: string]: number } = {
  'january': 1, 'february': 2, 'march': 3, 'april': 4,
  'may': 5, 'june': 6, 'july': 7, 'august': 8,
  'september': 9, 'october': 10, 'november': 11, 'december': 12
}

const TIER_COLORS = {
  1: 'bg-violet-500/20 border-violet-500/50 text-violet-300',
  2: 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300',
  3: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300',
}

interface ApplicationWindow {
  start: Date
  end: Date
  deadline: Date
}

// Calculate application window based on internship_open_month
function calculateApplicationWindow(
  internshipOpenMonth: string,
  currentYear: number = new Date().getFullYear()
): ApplicationWindow {
  const monthName = internshipOpenMonth.toLowerCase()
  const monthNum = MONTH_MAP[monthName] || 8 // Default to August
  
  // For internships, application typically opens 2-3 months before
  // For summer internships (June start), apps open in Aug-Sept of previous year
  let appStartMonth: number
  let appStartYear: number
  
  if (monthNum >= 6) {
    // Summer internship (June or later)
    appStartMonth = monthNum - 3
    appStartYear = currentYear - 1
  } else {
    // Other internships
    appStartMonth = monthNum - 2
    appStartYear = currentYear
  }
  
  // Normalize month
  if (appStartMonth <= 0) {
    appStartMonth += 12
    appStartYear -= 1
  }
  
  // Application window: entire month
  const appStart = new Date(appStartYear, appStartMonth - 1, 1)
  // Get last day of the month
  const appEnd = new Date(appStartYear, appStartMonth, 0)
  const deadline = new Date(appEnd) // Deadline is end of application window
  
  return { start: appStart, end: appEnd, deadline }
}

export default function CalendarView({ userId }: CalendarViewProps) {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCompanies()
  }, [])

  const loadCompanies = async () => {
    try {
      const allCompanies = await companyApi.getAll()
      // Filter only companies with internship_open_month
      const companiesWithInternships = allCompanies.filter(
        (c) => c.internship_open_month !== null && c.internship_open_month !== undefined
      )
      setCompanies(companiesWithInternships)
    } catch (error) {
      console.error('Error loading companies:', error)
    } finally {
      setLoading(false)
    }
  }

  // Group companies by internship month
  const companiesByMonth: { [key: string]: Company[] } = {}
  companies.forEach((company) => {
    if (company.internship_open_month) {
      const month = company.internship_open_month
      if (!companiesByMonth[month]) {
        companiesByMonth[month] = []
      }
      companiesByMonth[month].push(company)
    }
  })

  // Sort months in order
  const sortedMonths = MONTHS.filter((month) => companiesByMonth[month]?.length > 0)

  if (loading) {
    return (
      <div className="glass rounded-2xl p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-700 rounded w-1/3"></div>
          <div className="h-64 bg-slate-700 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="glass rounded-2xl p-8 glass-hover">
      <div className="flex items-center gap-4 mb-6">
        <CalendarIcon className="w-6 h-6 text-violet-400" />
        <h2 className="text-2xl font-bold">Internship Calendar</h2>
      </div>

      {sortedMonths.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No internship periods available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedMonths.map((month, index) => {
            const monthCompanies = companiesByMonth[month]
            return (
              <motion.div
                key={month}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-xl border border-slate-700 bg-slate-800/50 hover:border-slate-600 transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center">
                    <CalendarIcon className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{month}</h3>
                    <p className="text-sm text-slate-400">
                      {monthCompanies.length} {monthCompanies.length === 1 ? 'company' : 'companies'}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  {monthCompanies.map((company) => {
                    // Prioritize verified postings over estimated data
                    const hasVerifiedData = company.has_verified_data && company.verified_postings && company.verified_postings.length > 0
                    
                    return (
                      <div
                        key={company.id}
                        className={`p-4 rounded-lg border ${TIER_COLORS[company.tier as keyof typeof TIER_COLORS]}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            <span className="font-medium">{company.name}</span>
                            {hasVerifiedData && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" title="Verified data" />
                            )}
                            {!hasVerifiedData && company.internship_open_month && (
                              <AlertCircle className="w-3.5 h-3.5 text-yellow-400" title="Estimated data" />
                            )}
                          </div>
                          <span className="text-xs px-2 py-1 rounded bg-slate-800/50">
                            Tier {company.tier}
                          </span>
                        </div>
                        
                        {hasVerifiedData ? (
                          // Display verified postings
                          <div className="space-y-3 mt-3 pt-3 border-t border-slate-700/50">
                            {company.verified_postings!.map((posting, idx) => {
                              const isRolling = posting.deadline === "Rolling — closes when filled"
                              const noDeadline = posting.deadline === "No fixed deadline published"
                              const hasDateDeadline = posting.deadline && !isRolling && !noDeadline
                              
                              let deadlineDate: Date | null = null
                              let isDeadlinePassed = false
                              let isDeadlineSoon = false
                              
                              if (hasDateDeadline) {
                                try {
                                  deadlineDate = new Date(posting.deadline!)
                                  isDeadlinePassed = deadlineDate < new Date()
                                  isDeadlineSoon = deadlineDate >= new Date() &&
                                    deadlineDate <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                                } catch (e) {
                                  // Invalid date
                                }
                              }
                              
                              return (
                                <div key={idx} className="space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-semibold text-white">{posting.role_name}</span>
                                      {posting.location && (
                                        <span className="text-xs px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-300">
                                          {posting.location}
                                        </span>
                                      )}
                                      {posting.term && (
                                        <span className="text-xs px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-300">
                                          {posting.term}
                                        </span>
                                      )}
                                    </div>
                                    {posting.source_url && (
                                      <a
                                        href={posting.source_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-violet-400 hover:text-violet-300"
                                        title="View source"
                                      >
                                        <ExternalLink className="w-3 h-3" />
                                      </a>
                                    )}
                                  </div>
                                  
                                  <div className="text-xs space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-slate-400">Status:</span>
                                      <span className={`font-medium ${
                                        posting.application_status === "Open" ? "text-emerald-400" :
                                        posting.application_status === "Closed" ? "text-red-400" :
                                        posting.application_status === "Rolling" ? "text-cyan-400" :
                                        "text-yellow-400"
                                      }`}>
                                        {posting.application_status}
                                      </span>
                                    </div>
                                    
                                    {posting.application_start && posting.application_end && (
                                      <div className="flex items-center gap-2">
                                        <CalendarDays className="w-3 h-3 text-slate-400" />
                                        <span className="text-slate-400">Window:</span>
                                        <span className="text-white">
                                          {format(new Date(posting.application_start), 'MMM d')} - {format(new Date(posting.application_end), 'MMM d, yyyy')}
                                        </span>
                                      </div>
                                    )}
                                    
                                    <div className="flex items-center gap-2">
                                      <Clock className={`w-3 h-3 ${
                                        isRolling || noDeadline ? "text-slate-400" :
                                        isDeadlinePassed ? "text-red-400" :
                                        isDeadlineSoon ? "text-yellow-400" :
                                        "text-slate-400"
                                      }`} />
                                      <span className="text-slate-400">Deadline:</span>
                                      <span className={`font-medium ${
                                        isRolling ? "text-cyan-400" :
                                        noDeadline ? "text-yellow-400" :
                                        isDeadlinePassed ? "text-red-400" :
                                        isDeadlineSoon ? "text-yellow-400" :
                                        "text-white"
                                      }`}>
                                        {isRolling ? "Rolling — closes when filled" :
                                         noDeadline ? "No fixed deadline published" :
                                         hasDateDeadline ? format(deadlineDate!, 'MMM d, yyyy') :
                                         "Not specified"}
                                      </span>
                                      {hasDateDeadline && isDeadlinePassed && (
                                        <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">
                                          Passed
                                        </span>
                                      )}
                                      {hasDateDeadline && isDeadlineSoon && !isDeadlinePassed && (
                                        <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400">
                                          Soon
                                        </span>
                                      )}
                                    </div>
                                    
                                    {posting.last_verified_date && (
                                      <div className="text-xs text-slate-500 mt-1">
                                        Verified: {format(new Date(posting.last_verified_date), 'MMM d, yyyy')}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          // Fallback to estimated data (only if no verified data exists)
                          (() => {
                            let appWindow: ApplicationWindow | null = null
                            
                            if (company.internship_application_start && company.internship_application_end && company.internship_deadline) {
                              appWindow = {
                                start: new Date(company.internship_application_start),
                                end: new Date(company.internship_application_end),
                                deadline: new Date(company.internship_deadline),
                              }
                            } else if (company.internship_open_month) {
                              appWindow = calculateApplicationWindow(company.internship_open_month)
                            }
                            
                            if (!appWindow) return null
                            
                            const isDeadlinePassed = appWindow.deadline < new Date()
                            const isDeadlineSoon = appWindow.deadline >= new Date() &&
                              appWindow.deadline <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                            
                            return (
                              <div className="space-y-1.5 mt-3 pt-3 border-t border-slate-700/50">
                                <div className="text-xs text-yellow-400 mb-2 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  <span>Estimated data — not verified</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                  <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                                  <span className="text-slate-400">Application Window:</span>
                                  <span className="text-white font-medium">
                                    {format(appWindow.start, 'MMM d')} - {format(appWindow.end, 'MMM d, yyyy')}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                  <Clock className={`w-3.5 h-3.5 ${
                                    isDeadlinePassed ? 'text-red-400' :
                                    isDeadlineSoon ? 'text-yellow-400' :
                                    'text-slate-400'
                                  }`} />
                                  <span className="text-slate-400">Deadline:</span>
                                  <span className={`font-medium ${
                                    isDeadlinePassed ? 'text-red-400' :
                                    isDeadlineSoon ? 'text-yellow-400' :
                                    'text-white'
                                  }`}>
                                    {format(appWindow.deadline, 'MMM d, yyyy')}
                                  </span>
                                  {isDeadlinePassed && (
                                    <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">
                                      Passed
                                    </span>
                                  )}
                                  {isDeadlineSoon && !isDeadlinePassed && (
                                    <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400">
                                      Soon
                                    </span>
                                  )}
                                </div>
                              </div>
                            )
                          })()
                        )}
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}





