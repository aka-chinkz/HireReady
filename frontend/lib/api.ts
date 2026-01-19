import axios from 'axios'
import { API_URL } from './utils'
import * as mockApi from './mockApi'

// Helper to check if we should use mock API
const shouldUseMockApi = (): boolean => {
  if (typeof window === 'undefined') return false
  if (process.env.NEXT_PUBLIC_USE_MOCK_API === 'true') return true
  if (localStorage.getItem('useMockApi') === 'true') return true
  return false
}

// Default to mock API if backend check hasn't passed
// This prevents timeout errors on first load
// Set to false when backend is ready and running
const USE_MOCK_BY_DEFAULT = true

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
})

// Add error interceptor for better error messages
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If backend is not available, automatically switch to mock API
    if ((error.code === 'ECONNREFUSED' || error.message?.includes('Network Error') || error.code === 'ERR_NETWORK') && !USE_MOCK_API) {
      console.warn('Backend not available, switching to mock API')
      if (typeof window !== 'undefined') {
        localStorage.setItem('useMockApi', 'true')
      }
      // Retry with mock API will happen in the API functions below
    }
    return Promise.reject(error)
  }
)

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
  career_stream: string | null
  skills: string[]
  university_year: number | null
  graduation_year: number | null
  country: string | null
  target_tiers: number[]
  readiness_score: number | null
  profile_picture: string | null
  email: string | null
  username: string | null
  last_active_at: string | null
  created_at: string
  updated_at: string
}

export interface InternshipPosting {
  id: string
  role_name: string
  location: string | null
  term: string | null
  application_status: string
  application_start: string | null
  application_end: string | null
  deadline: string | null
  source_url: string | null
  last_verified_date: string | null
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
  verified_postings?: InternshipPosting[]
  has_verified_data?: boolean
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

// User API
export const userApi = {
  create: async (data: UserCreate): Promise<User> => {
    // Always use mock API by default (backend not required)
    if (shouldUseMockApi() || USE_MOCK_BY_DEFAULT) {
      console.log('🎭 Using mock API for user creation')
      try {
        return await mockApi.mockUserApi.create(data)
      } catch (error: any) {
        console.error('Mock API error:', error)
        throw error // Re-throw to show in UI
      }
    }
    
    // Try real API if mock is disabled
    try {
      const response = await api.post('/api/users/', data)
      return response.data
    } catch (error: any) {
      // Fallback to mock on any error
      console.warn('Backend unavailable, falling back to mock API')
      localStorage.setItem('useMockApi', 'true')
      return mockApi.mockUserApi.create(data)
    }
  },
  get: async (id: string): Promise<User> => {
    if (shouldUseMockApi() || USE_MOCK_BY_DEFAULT) {
      return mockApi.mockUserApi.get(id)
    }
    try {
      const response = await api.get(`/api/users/${id}`)
      return response.data
    } catch (error: any) {
      localStorage.setItem('useMockApi', 'true')
      return mockApi.mockUserApi.get(id)
    }
  },

  updateProfile: async (id: string, data: { profile_picture?: string; email?: string }): Promise<User> => {
    try {
      const response = await api.patch(`/api/users/${id}/profile`, data)
      return response.data
    } catch (error: any) {
      localStorage.setItem('useMockApi', 'true')
      return mockApi.mockUserApi.get(id)
    }
  },
  update: async (id: string, data: UserCreate): Promise<User> => {
    if (shouldUseMockApi() || USE_MOCK_BY_DEFAULT) {
      return mockApi.mockUserApi.update(id, data)
    }
    try {
      const response = await api.put(`/api/users/${id}`, data)
      return response.data
    } catch (error: any) {
      localStorage.setItem('useMockApi', 'true')
      return mockApi.mockUserApi.update(id, data)
    }
  },

  updateProfile: async (id: string, data: { profile_picture?: string; username?: string }): Promise<User> => {
    try {
      const response = await api.patch(`/api/users/${id}/profile`, data)
      return response.data
    } catch (error: any) {
      console.error('Error updating profile:', error)
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to update profile'
      throw new Error(errorMessage)
    }
  },
}

// Company API
export const companyApi = {
  getAll: async (tier?: number): Promise<Company[]> => {
    if (shouldUseMockApi() || USE_MOCK_BY_DEFAULT) {
      return mockApi.mockCompanyApi.getAll(tier)
    }
    try {
      // Try to get companies with windows first (more accurate)
      const response = await api.get('/api/companies/with-windows/', { params: { tier } })
      return response.data
    } catch (error: any) {
      // Fallback to regular endpoint
      try {
        const response = await api.get('/api/companies/', { params: { tier } })
        return response.data
      } catch (fallbackError: any) {
        localStorage.setItem('useMockApi', 'true')
        return mockApi.mockCompanyApi.getAll(tier)
      }
    }
  },
  get: async (id: string): Promise<Company> => {
    if (shouldUseMockApi() || USE_MOCK_BY_DEFAULT) {
      return mockApi.mockCompanyApi.get(id)
    }
    try {
      const response = await api.get(`/api/companies/${id}`)
      return response.data
    } catch (error: any) {
      localStorage.setItem('useMockApi', 'true')
      return mockApi.mockCompanyApi.get(id)
    }
  },
}

// Intelligence API
export const intelligenceApi = {
  getReadiness: async (userId: string): Promise<ReadinessAnalysis> => {
    if (shouldUseMockApi() || USE_MOCK_BY_DEFAULT) {
      return mockApi.mockIntelligenceApi.getReadiness(userId)
    }
    try {
      const response = await api.get(`/api/intelligence/user/${userId}/readiness`)
      return response.data
    } catch (error: any) {
      localStorage.setItem('useMockApi', 'true')
      return mockApi.mockIntelligenceApi.getReadiness(userId)
    }
  },
  generateApplications: async (userId: string) => {
    if (shouldUseMockApi() || USE_MOCK_BY_DEFAULT) {
      return mockApi.mockIntelligenceApi.generateApplications(userId)
    }
    try {
      const response = await api.post(`/api/intelligence/generate-applications/${userId}`)
      return response.data
    } catch (error: any) {
      localStorage.setItem('useMockApi', 'true')
      return mockApi.mockIntelligenceApi.generateApplications(userId)
    }
  },
}

// Calendar API
export const calendarApi = {
  getUserCalendar: async (userId: string, month?: number, year?: number) => {
    if (shouldUseMockApi() || USE_MOCK_BY_DEFAULT) {
      return mockApi.mockCalendarApi.getUserCalendar(userId, month, year)
    }
    try {
      const response = await api.get(`/api/calendar/user/${userId}`, {
        params: { month, year },
      })
      return response.data
    } catch (error: any) {
      localStorage.setItem('useMockApi', 'true')
      return mockApi.mockCalendarApi.getUserCalendar(userId, month, year)
    }
  },
  exportICS: async (userId: string): Promise<Blob> => {
    if (shouldUseMockApi() || USE_MOCK_BY_DEFAULT) {
      return mockApi.mockCalendarApi.exportICS(userId)
    }
    try {
      const response = await api.get(`/api/calendar/user/${userId}/export/ics`, {
        responseType: 'blob',
      })
      return response.data
    } catch (error: any) {
      localStorage.setItem('useMockApi', 'true')
      return mockApi.mockCalendarApi.exportICS(userId)
    }
  },
}

// Feedback API
export interface FeedbackCreate {
  message: string
  rating?: number
  user_email?: string
  page_source?: string
}

export interface FeedbackResponse {
  id: string
  message: string
  rating?: number
  user_email?: string | null
  page_source?: string | null
  created_at: string
}

export const feedbackApi = {
  create: async (data: FeedbackCreate): Promise<FeedbackResponse> => {
    // For feedback, we'll always try the real API first since it's simpler
    try {
      const response = await api.post('/api/feedback/', data)
      return response.data
    } catch (error: any) {
      // If backend is not available, show error to user
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to submit feedback'
      throw new Error(errorMessage)
    }
  },
}

// Practice API
export interface ProblemProgress {
  id: string
  user_id: string
  problem_id: number
  is_bookmarked: boolean
  is_solved: boolean
  attempts: number
  last_attempted: string | null
  solved_at: string | null
  created_at: string
  updated_at: string
}

export interface ProblemProgressCreate {
  problem_id: number
  is_bookmarked?: boolean
  is_solved?: boolean
  attempts?: number
}

export interface ProblemProgressUpdate {
  is_bookmarked?: boolean
  is_solved?: boolean
  attempts?: number
}

export const practiceApi = {
  getProgress: async (userId: string): Promise<ProblemProgress[]> => {
    try {
      const response = await api.get(`/api/practice/user/${userId}/progress`)
      return response.data
    } catch (error: any) {
      console.error('Error fetching practice progress:', error)
      // Return empty array if backend is not available
      return []
    }
  },
  
  updateProgress: async (userId: string, problemId: number, data: ProblemProgressUpdate): Promise<ProblemProgress> => {
    try {
      const response = await api.patch(`/api/practice/user/${userId}/progress/${problemId}`, data)
      return response.data
    } catch (error: any) {
      console.error('Error updating practice progress:', error)
      throw error
    }
  },
  
  createOrUpdateProgress: async (userId: string, data: ProblemProgressCreate): Promise<ProblemProgress> => {
    try {
      const response = await api.post(`/api/practice/user/${userId}/progress`, data)
      return response.data
    } catch (error: any) {
      console.error('Error creating/updating practice progress:', error)
      throw error
    }
  },
  
  deleteProgress: async (userId: string, problemId: number): Promise<void> => {
    try {
      await api.delete(`/api/practice/user/${userId}/progress/${problemId}`)
    } catch (error: any) {
      console.error('Error deleting practice progress:', error)
      throw error
    }
  },
  
  backfillSolvedDates: async (userId: string): Promise<{ message: string; updated_count: number }> => {
    try {
      const response = await api.post(`/api/practice/user/${userId}/backfill-solved-dates`)
      return response.data
    } catch (error: any) {
      console.error('Error backfilling solved dates:', error)
      throw error
    }
  },
}

// ATS API
export interface ATSBreakdown {
  keywordMatch: {
    score: number
    max_score: number
    required_matches: string[]
    preferred_matches: string[]
    missing_required: string[]
    skills_without_context: string[]
  }
  experience: {
    score: number
    max_score: number
    years_estimated?: number
    skills_in_experience: string[]
  }
  formatting: {
    score: number
    max_score: number
    issues: string[]
  }
  education: {
    score: number
    max_score: number
    certifications_found: number
  }
  softSkills: {
    score: number
    max_score: number
    action_verbs_found: string[]
    buzzwords_found: string[]
  }
}

export interface ATSAnalysis {
  atsScore: number
  breakdown: ATSBreakdown
  feedback: string[]
  resume_data: {
    name: string
    skills: string[]
    experience_count: number
    education_count: number
  }
}

export const atsApi = {
  analyze: async (formData: FormData): Promise<ATSAnalysis> => {
    try {
      const response = await api.post('/api/ats/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 second timeout for file processing
      })
      return response.data
    } catch (error: any) {
      console.error('Error analyzing resume:', error)
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        throw new Error('Resume analysis took too long. Please try again with a smaller file or ensure the backend is running properly.')
      }
      throw error
    }
  },
}

// Ranking API
// Toast types (should be imported in components, but keeping for consistency)
export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  message: string
  type: ToastType
}

export interface RankingUser {
  id: string
  username: string
  avatar_url: string | null
  total_solved: number
  easy_solved: number
  medium_solved: number
  hard_solved: number
  last_solved_at: string | null
  rank: number
  email: string | null
}

export interface RankingData {
  users: RankingUser[]
  total_count: number
  page: number
  page_size: number
  current_user_rank: number | null
}

export const rankingApi = {
  getGlobal: async (page: number = 1, pageSize: number = 50, currentUserId?: string): Promise<RankingData> => {
    try {
      const params: any = { page, page_size: pageSize }
      if (currentUserId) {
        params.current_user_id = currentUserId
      }
      const response = await api.get('/api/ranking/global', { params })
      return response.data
    } catch (error: any) {
      console.error('Error fetching global rankings:', error)
      throw error
    }
  },

  getFriends: async (userId: string, page: number = 1, pageSize: number = 50): Promise<RankingData> => {
    try {
      const response = await api.get(`/api/ranking/friends/${userId}`, {
        params: { page, page_size: pageSize }
      })
      return response.data
    } catch (error: any) {
      console.error('Error fetching friends rankings:', error)
      throw error
    }
  },
}

// Friends API
export interface FriendUser {
  id: string
  username: string
  avatar_url: string | null
  email: string | null
  total_solved: number
  rank: number | null
}

export interface FriendsListResponse {
  friends: FriendUser[]
  total_count: number
}

export interface FriendCountResponse {
  friends_count: number
  followers_count: number
}

export interface AddFriendResponse {
  success: boolean
  message: string
  is_friend: boolean
}

export const friendsApi = {
  addFriend: async (userId: string, friendId: string): Promise<AddFriendResponse> => {
    try {
      const response = await api.post(`/api/friends/add/${userId}/${friendId}`)
      return response.data
    } catch (error: any) {
      console.error('Error adding friend:', error)
      throw error
    }
  },

  removeFriend: async (userId: string, friendId: string): Promise<AddFriendResponse> => {
    try {
      const response = await api.delete(`/api/friends/remove/${userId}/${friendId}`)
      return response.data
    } catch (error: any) {
      console.error('Error removing friend:', error)
      throw error
    }
  },

  getFriendsList: async (userId: string, page: number = 1, pageSize: number = 50): Promise<FriendsListResponse> => {
    try {
      const response = await api.get(`/api/friends/list/${userId}`, {
        params: { page, page_size: pageSize }
      })
      return response.data
    } catch (error: any) {
      console.error('Error fetching friends list:', error)
      throw error
    }
  },

  getFriendCounts: async (userId: string): Promise<FriendCountResponse> => {
    try {
      const response = await api.get(`/api/friends/counts/${userId}`)
      return response.data
    } catch (error: any) {
      console.error('Error fetching friend counts:', error)
      throw error
    }
  },

  getFriendshipStatus: async (userId: string, friendId: string): Promise<{ is_friend: boolean }> => {
    try {
      const response = await api.get(`/api/friends/status/${userId}/${friendId}`)
      return response.data
    } catch (error: any) {
      console.error('Error checking friendship status:', error)
      throw error
    }
  },
}

// User Stats API
export interface ProblemStats {
  total_solved: number
  easy_solved: number
  medium_solved: number
  hard_solved: number
  difficulty_distribution: {
    Easy: number
    Medium: number
    Hard: number
  }
}

export interface ActivityStatus {
  is_online: boolean
  last_active_at: string | null
}

export const userStatsApi = {
  getProblemStats: async (userId: string): Promise<ProblemStats> => {
    try {
      const response = await api.get(`/api/users/${userId}/stats/problems`)
      return response.data
    } catch (error: any) {
      console.error('Error fetching problem stats:', error)
      // Return empty stats on error
      return {
        total_solved: 0,
        easy_solved: 0,
        medium_solved: 0,
        hard_solved: 0,
        difficulty_distribution: {
          Easy: 0,
          Medium: 0,
          Hard: 0,
        },
      }
    }
  },

  getActivityStatus: async (userId: string): Promise<ActivityStatus> => {
    try {
      const response = await api.get(`/api/users/${userId}/activity/status`)
      return response.data
    } catch (error: any) {
      console.error('Error fetching activity status:', error)
      // Return offline status on error
      return {
        is_online: false,
        last_active_at: null,
      }
    }
  },

  updateActivity: async (userId: string): Promise<void> => {
    try {
      await api.post(`/api/users/${userId}/activity/heartbeat`)
    } catch (error: any) {
      // Silently fail - activity tracking is not critical
      console.error('Error updating activity:', error)
    }
  },
}


