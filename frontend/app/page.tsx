'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import GoogleLogin from '@/components/GoogleLogin'
import Dashboard from '@/components/dashboard/Dashboard'
import { userApi } from '@/lib/api'

export default function Home() {
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user exists in localStorage
    const storedUserId = localStorage.getItem('userId')
    if (storedUserId) {
      // Verify user exists and go straight to dashboard
      userApi.get(storedUserId)
        .then((user) => {
          setUserId(storedUserId)
          setLoading(false)
        })
        .catch((error) => {
          console.error('Error fetching user:', error)
          localStorage.removeItem('userId')
          localStorage.removeItem('userEmail')
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  const handleGoogleLoginSuccess = async (newUserId: string, email: string | null, hasCompletedOnboarding: boolean) => {
    console.log('Google login success:', { newUserId, email })
    setUserId(newUserId)
    // Skip onboarding - go straight to dashboard
  }

  const handleGoogleLoginError = (error: string) => {
    console.error('Google login error:', error)
    // You could show a toast notification here
    alert(error)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    )
  }

  // Show Google login if user is not authenticated
  if (!userId) {
    return (
      <GoogleLogin
        onSuccess={handleGoogleLoginSuccess}
        onError={handleGoogleLoginError}
      />
    )
  }

  // Show dashboard immediately after login - no onboarding required
  return <Dashboard userId={userId} />
}





