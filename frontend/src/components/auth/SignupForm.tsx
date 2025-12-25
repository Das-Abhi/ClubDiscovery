/**
 * Signup form component with BMSCE email validation
 */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CompassTransition } from '@/components/ui/compass-transition'
import { useAuth } from '@/lib/hooks/useAuth'

// USN format: 1BM22CS001 (Year-BM-YY-Department-Roll)
const USN_PATTERN = /^[1-4]BM[0-9]{2}[A-Z]{2}[0-9]{3}$/

// Validation schema with password strength requirements
const signupSchema = z
  .object({
    full_name: z.string().min(1, 'Full name is required'),
    usn: z
      .string()
      .transform((val) => val.toUpperCase().trim())
      .refine((val) => val === '' || USN_PATTERN.test(val), {
        message: 'USN must be in format: 1BM22CS001',
      })
      .optional()
      .or(z.literal('')),
    email: z
      .string()
      .email('Invalid email address')
      .endsWith('@bmsce.ac.in', 'Email must be a BMSCE email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one digit'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type SignupFormData = z.infer<typeof signupSchema>

// Password strength indicator
const getPasswordStrength = (password: string): number => {
  let strength = 0
  if (password.length >= 8) strength++
  if (password.length >= 12) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/[a-z]/.test(password)) strength++
  if (/[0-9]/.test(password)) strength++
  if (/[^A-Za-z0-9]/.test(password)) strength++
  return Math.min(strength, 5)
}

export function SignupForm() {
  const router = useRouter()
  const { register: registerUser, user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [showTransition, setShowTransition] = useState(false)
  const [localUserName, setLocalUserName] = useState<string | undefined>()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  })

  const password = watch('password', '')

  // Update password strength indicator
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordStrength(getPasswordStrength(e.target.value))
  }

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      await registerUser({
        email: data.email,
        password: data.password,
        full_name: data.full_name,
        usn: data.usn && data.usn !== '' ? data.usn : undefined,
      })
      // Store the form's name as fallback for transition
      setLocalUserName(data.full_name)
      // Show the compass transition
      setShowTransition(true)
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.')
      setIsLoading(false)
    }
  }

  const handleTransitionComplete = () => {
    // Redirect to home page after transition
    router.push('/')
  }

  const strengthColors = [
    'bg-gray-300',
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-green-500',
    'bg-green-600',
  ]

  const strengthLabels = ['', 'Very Weak', 'Weak', 'Fair', 'Good', 'Strong']

  return (
    <>
      {/* Compass Transition Animation */}
      <CompassTransition
        isVisible={showTransition}
        userName={user?.full_name || localUserName}
        onComplete={handleTransitionComplete}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name Field */}
        <div className="space-y-2">
          <Label htmlFor="full_name">Full Name</Label>
          <Input
            id="full_name"
          type="text"
          placeholder="John Doe"
          {...register('full_name')}
          className={errors.full_name ? 'border-red-500' : ''}
          disabled={isLoading}
        />
        {errors.full_name && (
          <p className="text-sm text-red-500">{errors.full_name.message}</p>
        )}
      </div>

      {/* USN Field */}
      <div className="space-y-2">
        <Label htmlFor="usn">
          USN <span className="text-gray-500 text-xs">(Optional)</span>
        </Label>
        <Input
          id="usn"
          type="text"
          placeholder="1BM22CS001"
          {...register('usn')}
          className={errors.usn ? 'border-red-500' : ''}
          disabled={isLoading}
        />
        {errors.usn && (
          <p className="text-sm text-red-500">{errors.usn.message}</p>
        )}
        <p className="text-xs text-gray-500">
          Format: 1BM22CS001 (Year-BM-YY-Department-Roll)
        </p>
      </div>

      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email">BMSCE Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="student@bmsce.ac.in"
          {...register('email')}
          className={errors.email ? 'border-red-500' : ''}
          disabled={isLoading}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Create a strong password"
          {...register('password')}
          onChange={handlePasswordChange}
          className={errors.password ? 'border-red-500' : ''}
          disabled={isLoading}
        />
        {password && (
          <div className="space-y-1">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={`h-1 flex-1 rounded ${
                    level <= passwordStrength
                      ? strengthColors[passwordStrength]
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-gray-400">
              Strength: {strengthLabels[passwordStrength]}
            </p>
          </div>
        )}
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Re-enter your password"
          {...register('confirmPassword')}
          className={errors.confirmPassword ? 'border-red-500' : ''}
          disabled={isLoading}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-red-500">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
        variant="glass"
      >
        {isLoading ? 'Creating account...' : 'Create Account'}
      </Button>

        {/* Password Requirements */}
        <div className="text-xs text-gray-400 space-y-1">
          <p>Password must contain:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>At least 8 characters</li>
            <li>One uppercase letter</li>
            <li>One lowercase letter</li>
            <li>One digit</li>
          </ul>
        </div>
      </form>
    </>
  )
}
