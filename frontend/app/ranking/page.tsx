'use client'

/**
 * RANKING PAGE
 * 
 * Displays global and friends leaderboards with dense ranking
 * Ranks users by total solved problems with proper tie-breakers
 */

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Trophy, Users, Medal, ChevronLeft, ChevronRight, UserPlus, UserCheck, Loader2, Search, X } from 'lucide-react'
import { rankingApi, friendsApi } from '@/lib/api'
import ToastContainer, { Toast, ToastType } from '@/components/Toast'

interface RankingUser {
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

interface RankingData {
  users: RankingUser[]
  total_count: number
  page: number
  page_size: number
  current_user_rank: number | null
}

export default function RankingPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'global' | 'friends'>('global')
  const [rankingData, setRankingData] = useState<RankingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [friendships, setFriendships] = useState<Set<string>>(new Set())
  const [loadingFriendships, setLoadingFriendships] = useState<Set<string>>(new Set())
  const [toasts, setToasts] = useState<Toast[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const pageSize = 50

  useEffect(() => {
    const userId = localStorage.getItem('userId')
    setCurrentUserId(userId)
  }, [])

  useEffect(() => {
    loadRankings()
  }, [activeTab, currentPage])

  // Load friendship statuses when rankings change
  useEffect(() => {
    if (rankingData && currentUserId) {
      loadFriendshipStatuses()
    }
  }, [rankingData, currentUserId])

  const loadRankings = async () => {
    if (!currentUserId && activeTab === 'friends') {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      if (activeTab === 'global') {
        const data = await rankingApi.getGlobal(currentPage, pageSize, currentUserId || undefined)
        setRankingData(data)
      } else {
        if (currentUserId) {
          const data = await rankingApi.getFriends(currentUserId, currentPage, pageSize)
          setRankingData(data)
        }
      }
    } catch (error) {
      console.error('Error loading rankings:', error)
      setRankingData(null)
    } finally {
      setLoading(false)
    }
  }

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!rankingData) return []
    if (!searchQuery.trim()) return rankingData.users

    const query = searchQuery.toLowerCase().trim()
    return rankingData.users.filter(user =>
      user.username.toLowerCase().includes(query) ||
      (user.email && user.email.toLowerCase().includes(query))
    )
  }, [rankingData, searchQuery])

  const totalPages = useMemo(() => {
    if (!rankingData) return 1
    // If searching, show pages based on filtered results
    if (searchQuery.trim()) {
      return Math.ceil(filteredUsers.length / pageSize)
    }
    return Math.ceil(rankingData.total_count / pageSize)
  }, [rankingData, searchQuery, filteredUsers])

  // Paginate filtered users
  const paginatedUsers = useMemo(() => {
    if (!searchQuery.trim()) return filteredUsers
    const startIdx = (currentPage - 1) * pageSize
    const endIdx = startIdx + pageSize
    return filteredUsers.slice(startIdx, endIdx)
  }, [filteredUsers, currentPage, searchQuery])

  // Custom medal SVG components
  const GoldMedal = () => (
    <svg fill="#FFD700" height="24px" width="24px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 512.559 512.559" xmlSpace="preserve" stroke="#FFD700" className="w-6 h-6">
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
      <g id="SVGRepo_iconCarrier">
        <g>
          <g>
            <path d="M332.373,243.053l-21.333-36.693l20.48-40.107c1.707-2.56,0.853-5.973,0-8.533s-4.267-4.267-6.827-4.267h-38.4 l-23.04-30.72c-1.707-1.707-4.267-3.413-6.827-3.413s-5.12,1.707-6.827,3.413l-23.04,30.72h-38.4c-2.56,0-5.973,1.707-7.68,4.267 s-1.707,5.973,0,8.533l20.48,40.107l-20.48,36.693c-1.707,2.56-1.707,5.973,0,8.533s4.267,4.267,7.68,4.267h38.4l23.04,30.72 c1.707,2.56,4.267,3.413,6.827,3.413s5.12-0.853,6.827-3.413l23.04-30.72h38.4c3.413,0,5.973-1.707,7.68-4.267 S334.08,245.613,332.373,243.053z"></path>
          </g>
        </g>
        <g>
          <g>
            <path d="M511.573,124.439c-1.707-3.413-4.267-5.12-7.68-5.12H351.147c-23.04-25.6-57.173-42.667-94.72-42.667 c-37.547,0-71.68,17.067-94.72,42.667H8.96c-3.413,0-5.973,1.707-7.68,5.12c-1.707,2.56-1.707,5.973,0,8.533l25.6,37.547h105.813 c-1.707,5.973-2.56,11.093-3.413,17.067H38.827l23.04,34.133h68.267c0.853,5.973,1.707,11.093,3.413,17.067H72.96 c13.653,18.773,32.427,33.28,54.613,42.667l-30.72,105.813c-1.707,6.827,0.853,14.507,6.827,18.773s13.653,4.267,20.48,0 l39.253-28.16c2.56-1.707,5.12-2.56,8.533-1.707c2.56,0.853,5.12,2.56,5.973,5.973l16.213,41.813 c2.56,6.827,9.387,11.947,17.067,11.947h0.853c7.68,0,14.507-5.973,17.067-13.653l25.6-89.6c0.853,0,0.853,0,1.707,0 s0.853,0,1.707,0l26.453,89.6c2.56,7.68,8.533,12.8,17.067,13.653h0.853c7.68,0,14.507-4.267,17.067-11.947l16.213-41.813 c0.853-2.56,3.413-5.12,5.973-5.973c2.56-0.853,5.973,0,8.533,1.707l39.253,28.16c5.973,4.267,13.653,4.267,20.48,0 c5.973-4.267,8.533-11.947,6.827-18.773L385.28,281.453c22.187-8.533,40.96-23.04,54.613-42.667h-60.587 c1.707-5.973,2.56-11.093,3.413-17.067h68.267l23.04-34.133h-90.453c-0.853-5.973-1.707-11.093-3.413-17.067h105.813l25.6-37.547 C512.427,130.413,513.28,126.999,511.573,124.439z M212.053,417.133c0,0,0,0.853-1.707,0.853c-0.853,0-1.707-0.853-1.707-0.853 l-16.213-41.813c-3.413-7.68-9.387-13.653-17.067-16.213c-2.56-0.853-5.12-0.853-7.68-0.853c-5.12,0-11.093,1.707-15.36,5.12 l-39.253,29.013l34.987-119.467l0.853,0.853c1.707,3.413,4.267,5.973,6.827,9.387l0.853,0.853 c19.627,24.747,47.787,42.667,81.067,46.933L212.053,417.133z M254.72,315.586c-2.56,0-5.12,0-7.68,0 c-29.013-1.707-55.467-15.36-74.24-35.84c0-0.853-0.853-0.853-0.853-1.707c-1.707-1.707-2.56-3.413-4.267-5.12 c-0.853-0.853-0.853-1.707-1.707-1.707c-1.707-2.56-3.413-5.12-5.973-7.68c-0.853-1.707-1.707-2.56-2.56-4.267 c-0.853-1.707-1.707-2.56-2.56-4.267c-0.853-1.707-1.707-2.56-2.56-4.267c-0.853-1.707-1.707-2.56-1.707-4.267l0.853-7.68h-0.853 c-1.707-5.12-3.413-11.093-4.267-17.067c-0.853-2.56-0.853-5.973-0.853-8.533s-0.853-5.973-0.853-8.533s0-5.973,0.853-8.533 c0-2.56,0.853-5.973,0.853-8.533c0.853-5.973,2.56-11.947,4.267-17.067c3.413-10.24,7.68-19.627,13.653-28.16 c0.853-0.853,0.853-0.853,1.707-1.707c1.707-2.56,3.413-4.267,5.12-6.827c20.48-23.893,51.2-40.107,85.333-40.107 c34.133,0,64.853,15.36,85.333,40.107c1.707,1.707,3.413,4.267,5.12,5.973c0.853,0.853,0.853,0.853,1.707,1.707 c5.973,8.533,10.24,18.773,13.653,28.16c1.707,6.827,2.56,11.947,3.413,17.92c0,2.56,0.853,5.973,0.853,8.533 s0.853,5.973,0.853,8.533c0,3.413,0,5.973-0.853,8.533c0,2.56-0.853,5.12-0.853,8.533c-0.853,5.973-2.56,11.947-4.267,17.067 h-0.853l-1.707,7.68c-0.853,1.707-0.853,2.56-1.707,4.267s-1.707,3.413-2.56,4.267c-0.853,1.707-1.707,2.56-2.56,4.267 s-1.707,2.56-2.56,4.267c-1.707,2.56-3.413,5.12-5.973,7.68c-0.853,0.853-0.853,1.707-1.707,1.707 c-1.707,1.707-2.56,3.413-4.267,5.12c0,0.853-0.853,0.853-0.853,1.707c-18.773,20.48-45.227,33.28-74.24,35.84 C259.84,315.586,257.28,315.586,254.72,315.586z M399.787,392.386l-39.253-28.16c-6.827-5.12-15.36-5.973-23.04-4.267 c-7.68,2.56-14.507,7.68-17.067,16.213l-17.067,41.813c0,0,0,0.853-1.707,0.853c-0.853,0-0.853-0.853-1.707-0.853l-25.6-86.187 c32.427-5.12,61.44-22.187,81.067-46.933l0.853-0.853c2.56-3.413,4.267-5.973,6.827-9.387l0.853-0.853L399.787,392.386z"></path>
          </g>
        </g>
      </g>
    </svg>
  )

  const SilverMedal = () => (
    <svg fill="#C0C0C0" height="24px" width="24px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 512.559 512.559" xmlSpace="preserve" stroke="#C0C0C0" className="w-6 h-6">
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
      <g id="SVGRepo_iconCarrier">
        <g>
          <g>
            <path d="M332.373,243.053l-21.333-36.693l20.48-40.107c1.707-2.56,0.853-5.973,0-8.533s-4.267-4.267-6.827-4.267h-38.4 l-23.04-30.72c-1.707-1.707-4.267-3.413-6.827-3.413s-5.12,1.707-6.827,3.413l-23.04,30.72h-38.4c-2.56,0-5.973,1.707-7.68,4.267 s-1.707,5.973,0,8.533l20.48,40.107l-20.48,36.693c-1.707,2.56-1.707,5.973,0,8.533s4.267,4.267,7.68,4.267h38.4l23.04,30.72 c1.707,2.56,4.267,3.413,6.827,3.413s5.12-0.853,6.827-3.413l23.04-30.72h38.4c3.413,0,5.973-1.707,7.68-4.267 S334.08,245.613,332.373,243.053z"></path>
          </g>
        </g>
        <g>
          <g>
            <path d="M511.573,124.439c-1.707-3.413-4.267-5.12-7.68-5.12H351.147c-23.04-25.6-57.173-42.667-94.72-42.667 c-37.547,0-71.68,17.067-94.72,42.667H8.96c-3.413,0-5.973,1.707-7.68,5.12c-1.707,2.56-1.707,5.973,0,8.533l25.6,37.547h105.813 c-1.707,5.973-2.56,11.093-3.413,17.067H38.827l23.04,34.133h68.267c0.853,5.973,1.707,11.093,3.413,17.067H72.96 c13.653,18.773,32.427,33.28,54.613,42.667l-30.72,105.813c-1.707,6.827,0.853,14.507,6.827,18.773s13.653,4.267,20.48,0 l39.253-28.16c2.56-1.707,5.12-2.56,8.533-1.707c2.56,0.853,5.12,2.56,5.973,5.973l16.213,41.813 c2.56,6.827,9.387,11.947,17.067,11.947h0.853c7.68,0,14.507-5.973,17.067-13.653l25.6-89.6c0.853,0,0.853,0,1.707,0 s0.853,0,1.707,0l26.453,89.6c2.56,7.68,8.533,12.8,17.067,13.653h0.853c7.68,0,14.507-4.267,17.067-11.947l16.213-41.813 c0.853-2.56,3.413-5.12,5.973-5.973c2.56-0.853,5.973,0,8.533,1.707l39.253,28.16c5.973,4.267,13.653,4.267,20.48,0 c5.973-4.267,8.533-11.947,6.827-18.773L385.28,281.453c22.187-8.533,40.96-23.04,54.613-42.667h-60.587 c1.707-5.973,2.56-11.093,3.413-17.067h68.267l23.04-34.133h-90.453c-0.853-5.973-1.707-11.093-3.413-17.067h105.813l25.6-37.547 C512.427,130.413,513.28,126.999,511.573,124.439z M212.053,417.133c0,0,0,0.853-1.707,0.853c-0.853,0-1.707-0.853-1.707-0.853 l-16.213-41.813c-3.413-7.68-9.387-13.653-17.067-16.213c-2.56-0.853-5.12-0.853-7.68-0.853c-5.12,0-11.093,1.707-15.36,5.12 l-39.253,29.013l34.987-119.467l0.853,0.853c1.707,3.413,4.267,5.973,6.827,9.387l0.853,0.853 c19.627,24.747,47.787,42.667,81.067,46.933L212.053,417.133z M254.72,315.586c-2.56,0-5.12,0-7.68,0 c-29.013-1.707-55.467-15.36-74.24-35.84c0-0.853-0.853-0.853-0.853-1.707c-1.707-1.707-2.56-3.413-4.267-5.12 c-0.853-0.853-0.853-1.707-1.707-1.707c-1.707-2.56-3.413-5.12-5.973-7.68c-0.853-1.707-1.707-2.56-2.56-4.267 c-0.853-1.707-1.707-2.56-2.56-4.267c-0.853-1.707-1.707-2.56-2.56-4.267c-0.853-1.707-1.707-2.56-1.707-4.267l0.853-7.68h-0.853 c-1.707-5.12-3.413-11.093-4.267-17.067c-0.853-2.56-0.853-5.973-0.853-8.533s-0.853-5.973-0.853-8.533s0-5.973,0.853-8.533 c0-2.56,0.853-5.973,0.853-8.533c0.853-5.973,2.56-11.947,4.267-17.067c3.413-10.24,7.68-19.627,13.653-28.16 c0.853-0.853,0.853-0.853,1.707-1.707c1.707-2.56,3.413-4.267,5.12-6.827c20.48-23.893,51.2-40.107,85.333-40.107 c34.133,0,64.853,15.36,85.333,40.107c1.707,1.707,3.413,4.267,5.12,5.973c0.853,0.853,0.853,0.853,1.707,1.707 c5.973,8.533,10.24,18.773,13.653,28.16c1.707,6.827,2.56,11.947,3.413,17.92c0,2.56,0.853,5.973,0.853,8.533 s0.853,5.973,0.853,8.533c0,3.413,0,5.973-0.853,8.533c0,2.56-0.853,5.12-0.853,8.533c-0.853,5.973-2.56,11.947-4.267,17.067 h-0.853l-1.707,7.68c-0.853,1.707-0.853,2.56-1.707,4.267s-1.707,3.413-2.56,4.267c-0.853,1.707-1.707,2.56-2.56,4.267 s-1.707,2.56-2.56,4.267c-1.707,2.56-3.413,5.12-5.973,7.68c-0.853,0.853-0.853,1.707-1.707,1.707 c-1.707,1.707-2.56,3.413-4.267,5.12c0,0.853-0.853,0.853-0.853,1.707c-18.773,20.48-45.227,33.28-74.24,35.84 C259.84,315.586,257.28,315.586,254.72,315.586z M399.787,392.386l-39.253-28.16c-6.827-5.12-15.36-5.973-23.04-4.267 c-7.68,2.56-14.507,7.68-17.067,16.213l-17.067,41.813c0,0,0,0.853-1.707,0.853c-0.853,0-0.853-0.853-1.707-0.853l-25.6-86.187 c32.427-5.12,61.44-22.187,81.067-46.933l0.853-0.853c2.56-3.413,4.267-5.973,6.827-9.387l0.853-0.853L399.787,392.386z"></path>
          </g>
        </g>
      </g>
    </svg>
  )

  const BronzeMedal = () => (
    <svg fill="#CD7F32" height="24px" width="24px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 512.559 512.559" xmlSpace="preserve" stroke="#CD7F32" className="w-6 h-6">
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
      <g id="SVGRepo_iconCarrier">
        <g>
          <g>
            <path d="M332.373,243.053l-21.333-36.693l20.48-40.107c1.707-2.56,0.853-5.973,0-8.533s-4.267-4.267-6.827-4.267h-38.4 l-23.04-30.72c-1.707-1.707-4.267-3.413-6.827-3.413s-5.12,1.707-6.827,3.413l-23.04,30.72h-38.4c-2.56,0-5.973,1.707-7.68,4.267 s-1.707,5.973,0,8.533l20.48,40.107l-20.48,36.693c-1.707,2.56-1.707,5.973,0,8.533s4.267,4.267,7.68,4.267h38.4l23.04,30.72 c1.707,2.56,4.267,3.413,6.827,3.413s5.12-0.853,6.827-3.413l23.04-30.72h38.4c3.413,0,5.973-1.707,7.68-4.267 S334.08,245.613,332.373,243.053z"></path>
          </g>
        </g>
        <g>
          <g>
            <path d="M511.573,124.439c-1.707-3.413-4.267-5.12-7.68-5.12H351.147c-23.04-25.6-57.173-42.667-94.72-42.667 c-37.547,0-71.68,17.067-94.72,42.667H8.96c-3.413,0-5.973,1.707-7.68,5.12c-1.707,2.56-1.707,5.973,0,8.533l25.6,37.547h105.813 c-1.707,5.973-2.56,11.093-3.413,17.067H38.827l23.04,34.133h68.267c0.853,5.973,1.707,11.093,3.413,17.067H72.96 c13.653,18.773,32.427,33.28,54.613,42.667l-30.72,105.813c-1.707,6.827,0.853,14.507,6.827,18.773s13.653,4.267,20.48,0 l39.253-28.16c2.56-1.707,5.12-2.56,8.533-1.707c2.56,0.853,5.12,2.56,5.973,5.973l16.213,41.813 c2.56,6.827,9.387,11.947,17.067,11.947h0.853c7.68,0,14.507-5.973,17.067-13.653l25.6-89.6c0.853,0,0.853,0,1.707,0 s0.853,0,1.707,0l26.453,89.6c2.56,7.68,8.533,12.8,17.067,13.653h0.853c7.68,0,14.507-4.267,17.067-11.947l16.213-41.813 c0.853-2.56,3.413-5.12,5.973-5.973c2.56-0.853,5.973,0,8.533,1.707l39.253,28.16c5.973,4.267,13.653,4.267,20.48,0 c5.973-4.267,8.533-11.947,6.827-18.773L385.28,281.453c22.187-8.533,40.96-23.04,54.613-42.667h-60.587 c1.707-5.973,2.56-11.093,3.413-17.067h68.267l23.04-34.133h-90.453c-0.853-5.973-1.707-11.093-3.413-17.067h105.813l25.6-37.547 C512.427,130.413,513.28,126.999,511.573,124.439z M212.053,417.133c0,0,0,0.853-1.707,0.853c-0.853,0-1.707-0.853-1.707-0.853 l-16.213-41.813c-3.413-7.68-9.387-13.653-17.067-16.213c-2.56-0.853-5.12-0.853-7.68-0.853c-5.12,0-11.093,1.707-15.36,5.12 l-39.253,29.013l34.987-119.467l0.853,0.853c1.707,3.413,4.267,5.973,6.827,9.387l0.853,0.853 c19.627,24.747,47.787,42.667,81.067,46.933L212.053,417.133z M254.72,315.586c-2.56,0-5.12,0-7.68,0 c-29.013-1.707-55.467-15.36-74.24-35.84c0-0.853-0.853-0.853-0.853-1.707c-1.707-1.707-2.56-3.413-4.267-5.12 c-0.853-0.853-0.853-1.707-1.707-1.707c-1.707-2.56-3.413-5.12-5.973-7.68c-0.853-1.707-1.707-2.56-2.56-4.267 c-0.853-1.707-1.707-2.56-2.56-4.267c-0.853-1.707-1.707-2.56-2.56-4.267c-0.853-1.707-1.707-2.56-1.707-4.267l0.853-7.68h-0.853 c-1.707-5.12-3.413-11.093-4.267-17.067c-0.853-2.56-0.853-5.973-0.853-8.533s-0.853-5.973-0.853-8.533s0-5.973,0.853-8.533 c0-2.56,0.853-5.973,0.853-8.533c0.853-5.973,2.56-11.947,4.267-17.067c3.413-10.24,7.68-19.627,13.653-28.16 c0.853-0.853,0.853-0.853,1.707-1.707c1.707-2.56,3.413-4.267,5.12-6.827c20.48-23.893,51.2-40.107,85.333-40.107 c34.133,0,64.853,15.36,85.333,40.107c1.707,1.707,3.413,4.267,5.12,5.973c0.853,0.853,0.853,0.853,1.707,1.707 c5.973,8.533,10.24,18.773,13.653,28.16c1.707,6.827,2.56,11.947,3.413,17.92c0,2.56,0.853,5.973,0.853,8.533 s0.853,5.973,0.853,8.533c0,3.413,0,5.973-0.853,8.533c0,2.56-0.853,5.12-0.853,8.533c-0.853,5.973-2.56,11.947-4.267,17.067 h-0.853l-1.707,7.68c-0.853,1.707-0.853,2.56-1.707,4.267s-1.707,3.413-2.56,4.267c-0.853,1.707-1.707,2.56-2.56,4.267 s-1.707,2.56-2.56,4.267c-1.707,2.56-3.413,5.12-5.973,7.68c-0.853,0.853-0.853,1.707-1.707,1.707 c-1.707,1.707-2.56,3.413-4.267,5.12c0,0.853-0.853,0.853-0.853,1.707c-18.773,20.48-45.227,33.28-74.24,35.84 C259.84,315.586,257.28,315.586,254.72,315.586z M399.787,392.386l-39.253-28.16c-6.827-5.12-15.36-5.973-23.04-4.267 c-7.68,2.56-14.507,7.68-17.067,16.213l-17.067,41.813c0,0,0,0.853-1.707,0.853c-0.853,0-0.853-0.853-1.707-0.853l-25.6-86.187 c32.427-5.12,61.44-22.187,81.067-46.933l0.853-0.853c2.56-3.413,4.267-5.973,6.827-9.387l0.853-0.853L399.787,392.386z"></path>
          </g>
        </g>
      </g>
    </svg>
  )

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <GoldMedal />
    if (rank === 2) return <SilverMedal />
    if (rank === 3) return <BronzeMedal />
    return null // Rank 4+ shows number instead
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    } catch {
      return 'Never'
    }
  }

  const loadFriendshipStatuses = async () => {
    if (!currentUserId || !rankingData) return

    const friendIds = rankingData.users
      .filter(user => user.id !== currentUserId)
      .map(user => user.id)

    for (const friendId of friendIds) {
      try {
        const status = await friendsApi.getFriendshipStatus(currentUserId, friendId)
        if (status.is_friend) {
          setFriendships(prev => new Set(prev).add(friendId))
        }
      } catch (error) {
        console.error(`Error loading friendship status for ${friendId}:`, error)
      }
    }
  }

  const showToast = (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(7)
    setToasts(prev => [...prev, { id, message, type }])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const handleAddFriend = async (friendId: string) => {
    if (!currentUserId) {
      showToast('Please log in to add friends', 'error')
      return
    }

    if (currentUserId === friendId) {
      showToast('Cannot add yourself as a friend', 'error')
      return
    }

    setLoadingFriendships(prev => new Set(prev).add(friendId))

    try {
      const result = await friendsApi.addFriend(currentUserId, friendId)
      if (result.success) {
        setFriendships(prev => new Set(prev).add(friendId))
        showToast(result.message || 'Friend added successfully!', 'success')
      } else {
        showToast(result.message || 'Failed to add friend', 'error')
      }
    } catch (error: any) {
      const message = error.response?.data?.detail || error.message || 'Failed to add friend'
      showToast(message, 'error')
    } finally {
      setLoadingFriendships(prev => {
        const next = new Set(prev)
        next.delete(friendId)
        return next
      })
    }
  }

  const handleRemoveFriend = async (friendId: string) => {
    if (!currentUserId) return

    setLoadingFriendships(prev => new Set(prev).add(friendId))

    try {
      const result = await friendsApi.removeFriend(currentUserId, friendId)
      if (result.success) {
        setFriendships(prev => {
          const next = new Set(prev)
          next.delete(friendId)
          return next
        })
        showToast(result.message || 'Friend removed successfully', 'success')
        // Reload rankings if we're on friends tab
        if (activeTab === 'friends') {
          loadRankings()
        }
      } else {
        showToast(result.message || 'Failed to remove friend', 'error')
      }
    } catch (error: any) {
      const message = error.response?.data?.detail || error.message || 'Failed to remove friend'
      showToast(message, 'error')
    } finally {
      setLoadingFriendships(prev => {
        const next = new Set(prev)
        next.delete(friendId)
        return next
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                <span className="bg-gradient-to-r from-violet-400 via-violet-300 to-cyan-400 bg-clip-text text-transparent drop-shadow-lg">
                  Leaderboard
                </span>
              </h1>
              <p className="text-slate-300 text-lg mt-1">
                Compete with coders worldwide
              </p>
            </div>
          </div>
        </motion.div>

        {/* Current User Rank Badge */}
        {rankingData?.current_user_rank && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-4 mb-6 border-2 border-violet-500/50"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Your Rank</p>
                  <p className="text-2xl font-bold text-white">#{rankingData.current_user_rank}</p>
                </div>
              </div>
              {rankingData.current_user_rank <= 3 && (
                <div className="text-4xl">
                  {getRankIcon(rankingData.current_user_rank)}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-1.5 md:p-2 mb-6 flex gap-1.5 md:gap-2"
        >
          <button
            onClick={() => {
              setActiveTab('global')
              setCurrentPage(1)
              setSearchQuery('') // Clear search when switching tabs
            }}
            className={`flex-1 py-2 md:py-3 px-3 md:px-6 rounded-xl font-semibold transition-all text-sm md:text-base ${activeTab === 'global'
                ? 'bg-gradient-to-r from-violet-500 to-cyan-500 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
          >
            <div className="flex items-center justify-center gap-1.5 md:gap-2">
              <Users className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">Global Ranking</span>
              <span className="sm:hidden">Global</span>
            </div>
          </button>
          <button
            onClick={() => {
              setActiveTab('friends')
              setCurrentPage(1)
              setSearchQuery('') // Clear search when switching tabs
            }}
            className={`flex-1 py-2 md:py-3 px-3 md:px-6 rounded-xl font-semibold transition-all text-sm md:text-base ${activeTab === 'friends'
                ? 'bg-gradient-to-r from-violet-500 to-cyan-500 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
          >
            <div className="flex items-center justify-center gap-1.5 md:gap-2">
              <Users className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">Friends Ranking</span>
              <span className="sm:hidden">Friends</span>
            </div>
          </button>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-3 md:p-4 mb-6"
        >
          <div className="relative">
            <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by username or email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1) // Reset to first page when searching
              }}
              className="w-full pl-10 md:pl-12 pr-8 md:pr-10 py-2 md:py-3 text-sm md:text-base bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setCurrentPage(1)
                }}
                className="absolute right-3 md:right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="mt-2 text-xs md:text-sm text-slate-400">
              Found {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'} matching &quot;{searchQuery}&quot;
            </p>
          )}
        </motion.div>

        {/* Leaderboard Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl overflow-hidden"
        >
          {rankingData && (searchQuery.trim() ? filteredUsers.length > 0 : rankingData.users.length > 0) ? (
            <>
              {/* Desktop Table Header */}
              <div className="hidden md:block bg-slate-800/50 border-b border-slate-700 sticky top-0 z-10">
                <div className="grid grid-cols-12 gap-4 px-4 lg:px-6 py-4 text-sm font-semibold text-slate-400">
                  <div className="col-span-1 text-center">Rank</div>
                  <div className="col-span-4">User</div>
                  <div className="col-span-2 text-right">Total</div>
                  <div className="col-span-4 grid grid-cols-3 gap-2 text-center">
                    <span className="text-green-400">Easy</span>
                    <span className="text-yellow-400">Medium</span>
                    <span className="text-red-400">Hard</span>
                  </div>
                  {currentUserId && activeTab === 'global' && (
                    <div className="col-span-1 text-center">Action</div>
                  )}
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-slate-700">
                {(searchQuery.trim() ? paginatedUsers : rankingData.users).map((user, index) => {
                  const isCurrentUser = user.id === currentUserId
                  return (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 hover:bg-slate-800/30 transition-colors ${isCurrentUser ? 'bg-violet-500/10 border-l-4 border-violet-500' : ''
                        }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="flex items-center justify-center w-8">
                            {getRankIcon(user.rank) || (
                              <span className="text-base font-bold text-slate-300">#{user.rank}</span>
                            )}
                          </div>
                          <div
                            className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => router.push(`/profile/${user.id}`)}
                          >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center overflow-hidden flex-shrink-0">
                              {user.avatar_url ? (
                                <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-white font-semibold text-sm">
                                  {user.username.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-semibold truncate text-sm">
                                {user.username}
                                {isCurrentUser && (
                                  <span className="ml-2 text-xs px-1.5 py-0.5 bg-violet-500/20 text-violet-300 rounded">
                                    You
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                        {currentUserId && activeTab === 'global' && !isCurrentUser && (
                          <div onClick={(e) => e.stopPropagation()}>
                            {loadingFriendships.has(user.id) ? (
                              <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                            ) : friendships.has(user.id) ? (
                              <button
                                onClick={() => handleRemoveFriend(user.id)}
                                className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                                title="Remove Friend"
                              >
                                <UserCheck className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleAddFriend(user.id)}
                                className="p-2 bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600 text-white rounded-lg transition-colors"
                                title="Add Friend"
                              >
                                <UserPlus className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <div>
                            <span className="text-slate-400">Total: </span>
                            <span className="text-white font-bold">{user.total_solved}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-green-400">{user.easy_solved}E</span>
                            <span className="text-yellow-400">{user.medium_solved}M</span>
                            <span className="text-red-400">{user.hard_solved}H</span>
                          </div>
                        </div>
                        {user.last_solved_at && (
                          <p className="text-xs text-slate-500">
                            {formatDate(user.last_solved_at)}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              {/* Desktop Table Body */}
              <div className="hidden md:block divide-y divide-slate-700">
                {(searchQuery.trim() ? paginatedUsers : rankingData.users).map((user, index) => {
                  const isCurrentUser = user.id === currentUserId
                  return (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`grid grid-cols-12 gap-4 px-4 lg:px-6 py-4 items-center hover:bg-slate-800/30 transition-colors ${isCurrentUser ? 'bg-violet-500/10 border-l-4 border-violet-500' : ''
                        }`}
                    >
                      {/* Rank */}
                      <div className="col-span-1 flex items-center justify-center gap-2">
                        {getRankIcon(user.rank) || (
                          <span className="text-lg font-bold text-slate-300">#{user.rank}</span>
                        )}
                      </div>

                      {/* User Info */}
                      <div
                        className="col-span-4 flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => router.push(`/profile/${user.id}`)}
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-white font-semibold text-sm">
                              {user.username.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold truncate">
                            {user.username}
                            {isCurrentUser && (
                              <span className="ml-2 text-xs px-2 py-0.5 bg-violet-500/20 text-violet-300 rounded">
                                You
                              </span>
                            )}
                          </p>
                          {user.last_solved_at && (
                            <p className="text-xs text-slate-400">
                              Last solved: {formatDate(user.last_solved_at)}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Total Solved */}
                      <div className="col-span-2 text-right">
                        <span className="text-xl font-bold text-white">{user.total_solved}</span>
                      </div>

                      {/* Difficulty Breakdown */}
                      <div className="col-span-4 grid grid-cols-3 gap-2 text-center">
                        <span className="text-green-400 font-semibold">{user.easy_solved}</span>
                        <span className="text-yellow-400 font-semibold">{user.medium_solved}</span>
                        <span className="text-red-400 font-semibold">{user.hard_solved}</span>
                      </div>

                      {/* Add Friend Button */}
                      {currentUserId && activeTab === 'global' && !isCurrentUser && (
                        <div className="col-span-1 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                          {loadingFriendships.has(user.id) ? (
                            <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
                          ) : friendships.has(user.id) ? (
                            <button
                              onClick={() => handleRemoveFriend(user.id)}
                              className="px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-1.5"
                              title="Remove Friend"
                            >
                              <UserCheck className="w-4 h-4" />
                              <span className="hidden lg:inline">Friends</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAddFriend(user.id)}
                              className="px-3 py-1.5 text-sm bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600 text-white rounded-lg transition-colors flex items-center gap-1.5"
                              title="Add Friend"
                            >
                              <UserPlus className="w-4 h-4" />
                              <span className="hidden lg:inline">Add</span>
                            </button>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-slate-800/50 border-t border-slate-700 px-4 md:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs sm:text-sm text-slate-400 text-center sm:text-left">
                    {searchQuery.trim() ? (
                      <>
                        Showing {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, filteredUsers.length)} of {filteredUsers.length} results
                      </>
                    ) : (
                      <>
                        Showing {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, rankingData.total_count)} of {rankingData.total_count}
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <span className="px-3 sm:px-4 py-2 text-sm sm:text-base text-white font-semibold">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
                    >
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-12 text-center text-slate-400">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-slate-600" />
              <p className="text-lg">
                {searchQuery.trim()
                  ? `No users found matching "${searchQuery}"`
                  : activeTab === 'friends'
                    ? 'No friends rankings available yet'
                    : 'No rankings available yet'}
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}
