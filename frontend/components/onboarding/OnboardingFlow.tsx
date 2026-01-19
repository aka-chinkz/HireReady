'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Step2Skills from './Step2Skills'
import Step3Year from './Step3Year'
import Step4TargetTiers from './Step4TargetTiers'
import { userApi, intelligenceApi, UserCreate } from '@/lib/api'

interface OnboardingFlowProps {
  userId: string
  onComplete: (userId: string) => void
}

const TOTAL_STEPS = 3 // Removed Step 1 (Career Stream)

export default function OnboardingFlow({ userId, onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(1) // Start at 1, but it will be Step 2 (Skills)
  const [formData, setFormData] = useState<Partial<UserCreate>>({
    career_stream: 'Software Development', // Default career stream
    skills: [],
    university_year: 0,
    graduation_year: new Date().getFullYear() + 1,
    country: 'United States',
    target_tiers: [],
  })
  const [loading, setLoading] = useState(false)

  const updateFormData = (data: Partial<UserCreate>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const nextStep = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    setLoading(true)
    try {
      // Ensure all required fields are present
      const completeFormData: UserCreate = {
        career_stream: formData.career_stream || 'Software Development',
        skills: formData.skills || [],
        university_year: formData.university_year || 0,
        graduation_year: formData.graduation_year || new Date().getFullYear() + 1,
        country: formData.country || 'United States',
        target_tiers: formData.target_tiers || [],
      }
      
      console.log('Updating user with onboarding data:', { userId, formData: completeFormData })
      
      // Update existing user with onboarding data
      const user = await userApi.update(userId, completeFormData)
      
      console.log('User updated successfully:', user)
      
      // Generate applications
      await intelligenceApi.generateApplications(user.id)
      
      onComplete(user.id)
    } catch (error: any) {
      console.error('Error updating user:', error)
      let errorMessage = 'Unknown error occurred'
      
      // More detailed error handling
      if (error?.message) {
        errorMessage = error.message
      } else if (error?.response?.data?.detail) {
        errorMessage = error.response.data.detail
      }
      
      // Show user-friendly error
      alert(`Failed to save profile: ${errorMessage}\n\nIf this persists, please check the browser console (F12) for more details.`)
      
      // Log full error for debugging
      console.error('Full error details:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-slate-400">Step {currentStep} of {TOTAL_STEPS}</span>
            <span className="text-sm text-slate-400">{Math.round((currentStep / TOTAL_STEPS) * 100)}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-violet-500 to-cyan-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="glass rounded-2xl p-8 shadow-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 1 && (
                <Step2Skills
                  value={formData.skills || []}
                  onChange={(value) => updateFormData({ skills: value })}
                  onNext={nextStep}
                  onBack={prevStep}
                />
              )}
              {currentStep === 2 && (
                <Step3Year
                  universityYear={formData.university_year || 0}
                  graduationYear={formData.graduation_year || new Date().getFullYear() + 1}
                  country={formData.country || 'United States'}
                  onChange={(data) => updateFormData(data)}
                  onNext={nextStep}
                  onBack={prevStep}
                />
              )}
              {currentStep === 3 && (
                <Step4TargetTiers
                  value={formData.target_tiers || []}
                  onChange={(value) => updateFormData({ target_tiers: value })}
                  onComplete={handleComplete}
                  onBack={prevStep}
                  loading={loading}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}


