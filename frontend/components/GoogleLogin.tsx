'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'

declare global {
  interface Window {
    google: any
  }
}

interface GoogleLoginProps {
  onSuccess: (userId: string, email: string | null, hasCompletedOnboarding: boolean) => void
  onError: (error: string) => void
}

export default function GoogleLogin({ onSuccess, onError }: GoogleLoginProps) {
  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = initializeGoogleSignIn
    document.head.appendChild(script)

    return () => {
      // Cleanup: remove script if component unmounts
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]')
      if (existingScript) {
        document.head.removeChild(existingScript)
      }
    }
  }, [])

  const initializeGoogleSignIn = () => {
    if (!window.google) {
      console.error('Google Identity Services failed to load')
      onError('Failed to load Google Sign-In. Please refresh the page.')
      return
    }

    // Initialize Google Sign-In
    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
      callback: handleCredentialResponse,
    })

    // Render the button
    window.google.accounts.id.renderButton(
      document.getElementById('google-signin-button'),
      {
        theme: 'filled_blue',
        size: 'large',
        text: 'signin_with',
        width: 300,
      }
    )

    // Optional: Show the One Tap prompt
    window.google.accounts.id.prompt()
  }

  const handleCredentialResponse = async (response: any) => {
    try {
      // Send the credential to the backend
      const backendResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/google`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            credential: response.credential,
          }),
        }
      )

      if (!backendResponse.ok) {
        // Try to parse JSON error, but handle non-JSON responses
        let errorMessage = 'Authentication failed'
        const contentType = backendResponse.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await backendResponse.json()
            errorMessage = errorData.detail || errorData.message || `Server error: ${backendResponse.status}`
          } catch (e) {
            errorMessage = `Server error: ${backendResponse.status} ${backendResponse.statusText}`
          }
        } else {
          // Backend returned HTML or empty response (likely crashed)
          errorMessage = `Backend error: ${backendResponse.status} ${backendResponse.statusText}. Please check Railway logs.`
        }
        throw new Error(errorMessage)
      }

      // Parse response JSON
      let data
      try {
        data = await backendResponse.json()
      } catch (e) {
        throw new Error('Invalid response from server. Backend may be down.')
      }
      
      // Store user ID in localStorage
      localStorage.setItem('userId', data.user_id)
      localStorage.setItem('userEmail', data.email || '')
      
      // Dispatch custom event to notify Navbar and other components
      window.dispatchEvent(new Event('userLoggedIn'))
      
      // Call success callback
      onSuccess(data.user_id, data.email, data.has_completed_onboarding)
    } catch (error: any) {
      console.error('Google login error:', error)
      onError(error.message || 'Failed to authenticate with Google. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass rounded-2xl p-8 shadow-2xl text-center">
          {/* Title */}
          <div className="mb-8">
            <h1 className="text-4xl font-black text-white mb-3">
              <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                HireReady
              </span>
            </h1>
            <p className="text-slate-400 text-lg">
              Built to get you hired.
            </p>
          </div>

          {/* Google Sign-In Button */}
          <div className="mb-6">
            <p className="text-slate-300 mb-6">
              Sign in with your Google account to get started
            </p>
            <div id="google-signin-button" className="flex justify-center" />
          </div>

          {/* Additional Info */}
          <p className="text-sm text-slate-500 mt-6">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </motion.div>
    </div>
  )
}