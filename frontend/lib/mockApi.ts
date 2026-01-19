/**
 * Mock API for testing frontend without backend
 * Replace this with real API calls when backend is ready
 */

export interface UserCreate {
  career_stream: string
  skills: string[]
  university_year: number
  graduation_year: number
  country: string
  target_tiers: number[]
}

export interface User {
  id: string
  career_stream: string
  skills: string[]
  university_year: number
  graduation_year: number
  country: string
  target_tiers: number[]
  readiness_score: number | null
  created_at: string
  updated_at: string
}

export interface Company {
  id: string
  name: string
  tier: number
  description: string | null
  website: string | null
  logo_url: string | null
  internship_open_month: string | null
  fulltime_open_month: string | null
  internship_application_start?: string | null
  internship_application_end?: string | null
  internship_deadline?: string | null
}

export interface CalendarEvent {
  id: string
  title: string
  company: string
  tier: number
  start: string
  end: string
  phase: string
  status: string
}

export interface ReadinessAnalysis {
  score: number
  skill_gaps: Array<{
    skill: string
    required: boolean
    priority: string
  }>
  recommendations: string[]
  matched_companies: string[]
}

// Mock data
const mockCompanies: Company[] = [
  // Tier 1 Companies
  {
    id: '1',
    name: 'Google',
    tier: 1,
    description: 'Tech giant focusing on search, cloud, and AI',
    website: 'https://careers.google.com',
    internship_open_month: 'August',
    fulltime_open_month: 'September',
    logo_url: null,
  },
  {
    id: '2',
    name: 'Meta (Facebook)',
    tier: 1,
    description: 'Social media and VR/AR technology',
    website: 'https://www.metacareers.com',
    internship_open_month: 'August',
    fulltime_open_month: 'September',
    logo_url: null,
  },
  {
    id: '3',
    name: 'Amazon',
    tier: 1,
    description: 'E-commerce and cloud computing leader',
    website: 'https://www.amazon.jobs',
    internship_open_month: 'September',
    fulltime_open_month: 'October',
    logo_url: null,
  },
  {
    id: '4',
    name: 'Apple',
    tier: 1,
    description: 'Consumer electronics and software',
    website: 'https://www.apple.com/careers',
    internship_open_month: 'August',
    fulltime_open_month: 'September',
    logo_url: null,
  },
  {
    id: '5',
    name: 'Microsoft',
    tier: 1,
    description: 'Software, cloud, and enterprise solutions',
    website: 'https://careers.microsoft.com',
    internship_open_month: 'September',
    fulltime_open_month: 'October',
    logo_url: null,
  },
  {
    id: '6',
    name: 'Netflix',
    tier: 1,
    description: 'Streaming entertainment platform',
    website: 'https://jobs.netflix.com',
    internship_open_month: 'August',
    fulltime_open_month: 'September',
    logo_url: null,
  },
  // Tier 2 Companies
  {
    id: '7',
    name: 'Stripe',
    tier: 2,
    description: 'Payment processing platform',
    website: 'https://stripe.com/jobs',
    internship_open_month: 'September',
    fulltime_open_month: 'October',
    logo_url: null,
  },
  {
    id: '8',
    name: 'Airbnb',
    tier: 2,
    description: 'Hospitality and travel platform',
    website: 'https://careers.airbnb.com',
    internship_open_month: 'September',
    fulltime_open_month: 'October',
    logo_url: null,
  },
  {
    id: '9',
    name: 'Uber',
    tier: 2,
    description: 'Ridesharing and mobility platform',
    website: 'https://www.uber.com/careers',
    internship_open_month: 'September',
    fulltime_open_month: 'October',
    logo_url: null,
  },
  {
    id: '10',
    name: 'Databricks',
    tier: 2,
    description: 'Data and AI platform',
    website: 'https://www.databricks.com/company/careers',
    internship_open_month: 'September',
    fulltime_open_month: 'October',
    logo_url: null,
  },
  {
    id: '11',
    name: 'Snowflake',
    tier: 2,
    description: 'Cloud data platform',
    website: 'https://careers.snowflake.com',
    internship_open_month: 'September',
    fulltime_open_month: 'October',
    logo_url: null,
  },
  // Tier 3 Companies
  {
    id: '12',
    name: 'Shopify',
    tier: 3,
    description: 'E-commerce platform',
    website: 'https://www.shopify.com/careers',
    internship_open_month: 'October',
    fulltime_open_month: 'November',
    logo_url: null,
  },
  {
    id: '13',
    name: 'Twilio',
    tier: 3,
    description: 'Cloud communications platform',
    website: 'https://www.twilio.com/company/jobs',
    internship_open_month: 'October',
    fulltime_open_month: 'November',
    logo_url: null,
  },
  {
    id: '14',
    name: 'MongoDB',
    tier: 3,
    description: 'Database and developer data platform',
    website: 'https://www.mongodb.com/careers',
    internship_open_month: 'October',
    fulltime_open_month: 'November',
    logo_url: null,
  },
  {
    id: '15',
    name: 'Atlassian',
    tier: 3,
    description: 'Team collaboration software',
    website: 'https://www.atlassian.com/company/careers',
    internship_open_month: 'October',
    fulltime_open_month: 'November',
    logo_url: null,
  },
]

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const mockUserApi = {
  create: async (data: UserCreate): Promise<User> => {
    await delay(800) // Simulate API delay
    
    // Validate required fields
    if (!data.career_stream || data.skills.length === 0 || data.university_year === 0 || data.target_tiers.length === 0) {
      throw new Error('Please fill in all required fields')
    }
    
    const user: User = {
      id: `user-${Date.now()}`,
      career_stream: data.career_stream,
      skills: data.skills,
      university_year: data.university_year,
      graduation_year: data.graduation_year,
      country: data.country,
      target_tiers: data.target_tiers,
      readiness_score: 65.5,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    
    // Store in localStorage
    localStorage.setItem('mockUser', JSON.stringify(user))
    console.log('✅ Profile created successfully with mock API:', user)
    return user
  },
  get: async (id: string): Promise<User> => {
    await delay(500)
    const stored = localStorage.getItem('mockUser')
    if (stored) {
      return JSON.parse(stored)
    }
    throw new Error('User not found')
  },
  update: async (id: string, data: UserCreate): Promise<User> => {
    await delay(500)
    const user: User = {
      id,
      ...data,
      readiness_score: 65.5,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    localStorage.setItem('mockUser', JSON.stringify(user))
    return user
  },
}

// Calculate application window (matching backend logic)
function calculateApplicationWindowForMock(
  internshipOpenMonth: string | null,
  currentYear: number = new Date().getFullYear()
): { start: string; end: string; deadline: string } | null {
  if (!internshipOpenMonth) return null
  
  const MONTH_MAP: { [key: string]: number } = {
    'january': 1, 'february': 2, 'march': 3, 'april': 4,
    'may': 5, 'june': 6, 'july': 7, 'august': 8,
    'september': 9, 'october': 10, 'november': 11, 'december': 12
  }
  
  const monthName = internshipOpenMonth.toLowerCase()
  const monthNum = MONTH_MAP[monthName] || 8
  
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
  const appEnd = new Date(appStartYear, appStartMonth, 0) // Last day of month
  const deadline = new Date(appEnd)
  
  return {
    start: appStart.toISOString(),
    end: appEnd.toISOString(),
    deadline: deadline.toISOString(),
  }
}

export const mockCompanyApi = {
  getAll: async (tier?: number): Promise<Company[]> => {
    await delay(500)
    let companies = tier ? mockCompanies.filter((c) => c.tier === tier) : mockCompanies
    
    // Add calculated application windows to each company
    const currentYear = new Date().getFullYear()
    return companies.map((company) => {
      const window = calculateApplicationWindowForMock(company.internship_open_month, currentYear)
      return {
        ...company,
        internship_application_start: window?.start || null,
        internship_application_end: window?.end || null,
        internship_deadline: window?.deadline || null,
      }
    })
  },
  get: async (id: string): Promise<Company> => {
    await delay(500)
    const company = mockCompanies.find((c) => c.id === id)
    if (!company) throw new Error('Company not found')
    
    // Add calculated application window
    const currentYear = new Date().getFullYear()
    const window = calculateApplicationWindowForMock(company.internship_open_month, currentYear)
    return {
      ...company,
      internship_application_start: window?.start || null,
      internship_application_end: window?.end || null,
      internship_deadline: window?.deadline || null,
    }
  },
}

// Calculate readiness score (matching backend logic)
function calculateReadinessScore(
  userSkills: string[],
  requiredSkills: string[],
  userYear: number,
  minYear: number
): number {
  if (!requiredSkills || requiredSkills.length === 0) {
    return 0.0
  }
  
  // Normalize skills to lowercase
  const userSkillsLower = userSkills.map(s => s.toLowerCase().trim()).filter(s => s)
  const requiredSkillsLower = requiredSkills.map(s => s.toLowerCase().trim()).filter(s => s)
  
  if (requiredSkillsLower.length === 0) {
    return 0.0
  }
  
  // Convert to sets for exact matching
  const userSet = new Set(userSkillsLower)
  const requiredSet = new Set(requiredSkillsLower)
  
  // Count exact matches
  let exactMatches = 0
  for (const skill of requiredSet) {
    if (userSet.has(skill)) {
      exactMatches++
    }
  }
  
  // Count partial matches (only for unmatched required skills)
  const unmatchedRequired = Array.from(requiredSet).filter(s => !userSet.has(s))
  let partialMatches = 0
  
  for (const reqSkill of unmatchedRequired) {
    for (const userSkill of userSet) {
      // Check for partial matches
      if ((reqSkill.includes(userSkill) || userSkill.includes(reqSkill)) && reqSkill !== userSkill) {
        partialMatches += 0.5
        break
      }
    }
  }
  
  // Calculate skill score
  const totalMatches = exactMatches + partialMatches
  const skillScore = Math.min(100, (totalMatches / requiredSet.size) * 100)
  
  // Year appropriateness
  const yearDiff = userYear - minYear
  let yearScore = 100
  if (yearDiff < 0) {
    if (yearDiff === -1) {
      yearScore = 70
    } else if (yearDiff === -2) {
      yearScore = 40
    } else {
      yearScore = 10
    }
  }
  
  // Weighted combination
  const readiness = (skillScore * 0.7) + (yearScore * 0.3)
  return Math.round(readiness * 100) / 100
}

export const mockIntelligenceApi = {
  getReadiness: async (userId: string): Promise<ReadinessAnalysis> => {
    await delay(800)
    
    // Get user data
    const stored = localStorage.getItem('mockUser')
    if (!stored) {
      throw new Error('User not found')
    }
    const user: User = JSON.parse(stored)
    
    // Get all roles from target companies
    const targetTiers = user.target_tiers || []
    const relevantCompanies = mockCompanies.filter(c => targetTiers.includes(c.tier))
    
    // Collect all roles from relevant companies
    const allRoles: Array<{
      required_skills: string[]
      min_year: number
      is_internship: boolean
      company_name: string
    }> = []
    
    // Mock role data based on company tier
    relevantCompanies.forEach(company => {
      if (company.tier === 1) {
        allRoles.push(
          {
            required_skills: ['DSA', 'OOP', 'System Design', 'Python', 'Java', 'JavaScript'],
            min_year: 3,
            is_internship: true,
            company_name: company.name
          },
          {
            required_skills: ['Python', 'Machine Learning', 'Statistics', 'SQL', 'Pandas'],
            min_year: 3,
            is_internship: true,
            company_name: company.name
          }
        )
      } else if (company.tier === 2) {
        allRoles.push(
          {
            required_skills: ['DSA', 'OOP', 'Python', 'JavaScript', 'React'],
            min_year: 2,
            is_internship: true,
            company_name: company.name
          },
          {
            required_skills: ['Python', 'SQL', 'ETL', 'AWS', 'Docker'],
            min_year: 2,
            is_internship: true,
            company_name: company.name
          }
        )
      } else {
        allRoles.push(
          {
            required_skills: ['DSA', 'OOP', 'Python', 'JavaScript'],
            min_year: 1,
            is_internship: true,
            company_name: company.name
          },
          {
            required_skills: ['JavaScript', 'React', 'TypeScript', 'CSS'],
            min_year: 1,
            is_internship: true,
            company_name: company.name
          }
        )
      }
    })
    
    // Filter roles by year
    const filteredRoles = allRoles.filter(role => {
      if (user.university_year >= role.min_year) return true
      if (role.is_internship && user.university_year >= role.min_year - 1) return true
      return false
    })
    
    // Calculate scores for each role
    const scores: number[] = []
    for (const role of filteredRoles) {
      const score = calculateReadinessScore(
        user.skills,
        role.required_skills,
        user.university_year,
        role.min_year
      )
      scores.push(score)
    }
    
    // Calculate average score
    const avgScore = scores.length > 0 
      ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100
      : 0
    
    // Identify skill gaps
    const allRequiredSkills = new Set<string>()
    filteredRoles.forEach(role => {
      role.required_skills.forEach(skill => allRequiredSkills.add(skill.toLowerCase()))
    })
    
    const userSkillsSet = new Set(user.skills.map(s => s.toLowerCase()))
    const missingSkills = Array.from(allRequiredSkills).filter(s => !userSkillsSet.has(s))
    
    const skillGaps = missingSkills.slice(0, 10).map(skill => {
      const priority = skill.includes('design') || skill.includes('dsa') || skill.includes('oop')
        ? 'high'
        : skill.includes('python') || skill.includes('javascript') || skill.includes('react')
        ? 'medium'
        : 'low'
      return {
        skill: skill.charAt(0).toUpperCase() + skill.slice(1),
        required: true,
        priority
      }
    })
    
    // Generate recommendations
    const recommendations: string[] = []
    if (user.university_year === 1) {
      recommendations.push('Focus on building core programming skills and DSA fundamentals')
      recommendations.push('Look for micro-internships and open-source contributions')
    } else if (user.university_year === 2) {
      recommendations.push('Start applying for summer internships at Tier 2 and Tier 3 companies')
      recommendations.push('Build projects showcasing your skills')
    } else if (user.university_year === 3) {
      recommendations.push('Target Tier 1 internships (FAANG) for next summer')
      recommendations.push('Prepare for technical interviews with mock coding sessions')
    } else {
      recommendations.push('Focus on full-time roles at your target companies')
      recommendations.push('Network with alumni and attend career fairs')
    }
    
    if (avgScore < 50) {
      recommendations.push('Consider taking online courses to fill skill gaps')
      recommendations.push('Build portfolio projects to demonstrate your abilities')
    } else if (avgScore < 70) {
      recommendations.push('Continue building skills, especially in high-priority areas')
      recommendations.push('Start preparing for technical interviews')
    } else {
      recommendations.push("You're well-prepared! Focus on interview practice and networking")
    }
    
    const matchedCompanies = Array.from(new Set(filteredRoles.map(r => r.company_name))).slice(0, 20)
    
    return {
      score: avgScore,
      skill_gaps: skillGaps,
      recommendations: recommendations,
      matched_companies: matchedCompanies,
    }
  },
  generateApplications: async (userId: string) => {
    await delay(1500)
    return {
      message: 'Generated 8 applications',
      application_ids: ['1', '2', '3', '4', '5', '6', '7', '8'],
    }
  },
}

export const mockCalendarApi = {
  getUserCalendar: async (userId: string, month?: number, year?: number) => {
    await delay(500)
    const now = new Date()
    const currentMonth = month || now.getMonth() + 1
    const currentYear = year || now.getFullYear()

    // Generate mock calendar events
    const events: CalendarEvent[] = [
      {
        id: '1',
        title: 'Prepare: Google - Software Engineer',
        company: 'Google',
        tier: 1,
        start: new Date(currentYear, currentMonth - 1, 5).toISOString(),
        end: new Date(currentYear, currentMonth - 1, 15).toISOString(),
        phase: 'preparation',
        status: 'planned',
      },
      {
        id: '2',
        title: 'Apply: Google - Software Engineer',
        company: 'Google',
        tier: 1,
        start: new Date(currentYear, currentMonth - 1, 16).toISOString(),
        end: new Date(currentYear, currentMonth - 1, 30).toISOString(),
        phase: 'application',
        status: 'planned',
      },
      {
        id: '3',
        title: 'Interview: Google - Software Engineer',
        company: 'Google',
        tier: 1,
        start: new Date(currentYear, currentMonth, 5).toISOString(),
        end: new Date(currentYear, currentMonth, 20).toISOString(),
        phase: 'interview',
        status: 'planned',
      },
      {
        id: '4',
        title: 'Apply: Stripe - Software Engineer',
        company: 'Stripe',
        tier: 2,
        start: new Date(currentYear, currentMonth - 1, 20).toISOString(),
        end: new Date(currentYear, currentMonth, 5).toISOString(),
        phase: 'application',
        status: 'planned',
      },
    ]

    return {
      events,
      month: currentMonth,
      year: currentYear,
    }
  },
  exportICS: async (userId: string): Promise<Blob> => {
    await delay(500)
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//HireReady//EN
BEGIN:VEVENT
DTSTART:20241216T000000
DTEND:20241230T000000
SUMMARY:Apply: Google - Software Engineer
DESCRIPTION:Application phase for Google
END:VEVENT
END:VCALENDAR`
    return new Blob([icsContent], { type: 'text/calendar' })
  },
}

