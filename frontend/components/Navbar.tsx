'use client'

import { useRouter, usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Code2 } from 'lucide-react'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()

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

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 mb-8"
    >
      <nav className="flex items-center justify-between py-4 px-6 border-b border-slate-700 bg-slate-900 backdrop-blur-md">
        {/* Left: Logo + HireReady */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
            <Code2 className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">
            HireReady
          </h1>
        </button>
        
        {/* Right: Navigation Links */}
        <div className="flex items-center gap-8">
          {navLinks.map((link) => {
            const active = isActive(link.path)
            return (
              <button
                key={link.path}
                onClick={() => router.push(link.path)}
                className={`font-medium transition-colors ${
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
      </nav>
    </motion.div>
  )
}