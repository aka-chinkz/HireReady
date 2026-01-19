'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    const checkLoginStatus = () => {
      const userId = localStorage.getItem('userId')
      setIsLoggedIn(!!userId)
    }
    
    // Check on mount and when pathname changes (after login redirect)
    checkLoginStatus()
    
    // Listen for storage changes (when user logs in/out in another tab)
    window.addEventListener('storage', checkLoginStatus)
    
    // Also listen for custom events (when user logs in/out in same tab)
    const handleLogin = () => checkLoginStatus()
    window.addEventListener('userLoggedIn', handleLogin)
    window.addEventListener('userLoggedOut', handleLogin)
    
    return () => {
      window.removeEventListener('storage', checkLoginStatus)
      window.removeEventListener('userLoggedIn', handleLogin)
      window.removeEventListener('userLoggedOut', handleLogin)
    }
  }, [pathname]) // Re-check when pathname changes (after login)

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/practice', label: 'Practice' },
    { path: '/progress', label: 'Progress' },
    { path: '/ranking', label: 'Ranking' },
    { path: '/profile', label: 'Profile' },
  ]

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/'
    }
    return pathname?.startsWith(path)
  }

  const handleNavClick = (path: string) => {
    router.push(path)
    setMobileMenuOpen(false)
  }

  // Don't show navbar if user is not logged in
  if (!isLoggedIn) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 mb-4 md:mb-8"
    >
      <nav className="flex items-center justify-between py-3 md:py-4 px-4 md:px-6 border-b border-slate-700 bg-slate-900 backdrop-blur-md">
        {/* Left: HireReady */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity"
        >
          <h1 className="text-xl md:text-2xl font-bold text-white">
            HireReady
          </h1>
        </button>
        
        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          {navLinks.map((link) => {
            const active = isActive(link.path)
            return (
              <button
                key={link.path}
                onClick={() => router.push(link.path)}
                className={`font-medium transition-colors text-sm lg:text-base ${
                  active
                    ? 'text-cyan-400 hover:text-cyan-300'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {link.label}
              </button>
            )
          })}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-300 hover:text-white transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-slate-900 border-b border-slate-700 overflow-hidden"
          >
            <div className="flex flex-col py-2">
              {navLinks.map((link) => {
                const active = isActive(link.path)
                return (
                  <button
                    key={link.path}
                    onClick={() => handleNavClick(link.path)}
                    className={`px-6 py-3 text-left font-medium transition-colors ${
                      active
                        ? 'text-cyan-400 bg-cyan-400/10 border-l-4 border-cyan-400'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {link.label}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}