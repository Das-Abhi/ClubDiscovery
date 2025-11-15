/**
 * Authentication page with login/signup tabs
 */
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { LoginForm } from '@/components/auth/LoginForm'
import { SignupForm } from '@/components/auth/SignupForm'
import { Card } from '@/components/ui/card'

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login')

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-black to-red-950 -z-10" />

      <Card className="w-full max-w-md glass-card p-8">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-red-500 bg-clip-text text-transparent">
            ClubCompass
          </h1>
          <p className="text-gray-400 mt-2">
            Discover your perfect club at BMSCE
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 mb-6 p-1 rounded-lg bg-white/5">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              activeTab === 'login'
                ? 'bg-red-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setActiveTab('signup')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              activeTab === 'signup'
                ? 'bg-red-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Form Content with Animation */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'login' ? <LoginForm /> : <SignupForm />}
        </motion.div>

        {/* Additional Links */}
        <div className="mt-6 text-center text-sm text-gray-400">
          {activeTab === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                onClick={() => setActiveTab('signup')}
                className="text-red-500 hover:text-red-400 font-medium"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                onClick={() => setActiveTab('login')}
                className="text-red-500 hover:text-red-400 font-medium"
              >
                Login
              </button>
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}
