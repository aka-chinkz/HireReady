'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, X, Info, AlertTriangle } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastProps {
  toast: Toast
  onClose: () => void
}

function ToastComponent({ toast, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 3000) // Auto-dismiss after 3 seconds

    return () => clearTimeout(timer)
  }, [onClose])

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-green-400" />,
    error: <XCircle className="w-5 h-5 text-red-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
  }

  const bgColors = {
    success: 'bg-green-500/10 border-green-500/50',
    error: 'bg-red-500/10 border-red-500/50',
    info: 'bg-blue-500/10 border-blue-500/50',
    warning: 'bg-yellow-500/10 border-yellow-500/50',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className={`glass rounded-lg p-4 border ${bgColors[toast.type]} flex items-center gap-3 min-w-[300px] max-w-[400px] shadow-lg`}
    >
      {icons[toast.type]}
      <p className="flex-1 text-white text-sm font-medium">{toast.message}</p>
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  )
}

interface ToastContainerProps {
  toasts: Toast[]
  removeToast: (id: string) => void
}

export default function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastComponent toast={toast} onClose={() => removeToast(toast.id)} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// Hook for managing toasts
export function useToast() {
  // This will be implemented in the component that uses it
  // For now, we'll use a simple callback pattern
  return {
    show: (message: string, type: ToastType = 'info') => {
      // Implementation will be in the component
      console.log('Toast:', message, type)
    },
  }
}
