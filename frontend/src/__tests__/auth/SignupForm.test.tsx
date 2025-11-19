/**
 * Unit tests for SignupForm component
 */
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import { SignupForm } from '@/components/auth/SignupForm'
import { useAuth } from '@/lib/hooks/useAuth'

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

jest.mock('@/lib/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}))

describe('SignupForm Component', () => {
  const mockRegister = jest.fn()
  const mockPush = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
    ;(useAuth as jest.Mock).mockReturnValue({
      register: mockRegister,
    })
  })

  it('renders signup form with all fields', () => {
    render(<SignupForm />)

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument()
  })

  it('validates full name is required', async () => {
    const user = userEvent.setup()
    render(<SignupForm />)

    const submitButton = screen.getByRole('button', { name: /sign up/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/full name is required/i)).toBeInTheDocument()
    })

    expect(mockRegister).not.toHaveBeenCalled()
  })

  it('validates email format', async () => {
    const user = userEvent.setup()
    render(<SignupForm />)

    const emailInput = screen.getByLabelText(/email address/i)
    const submitButton = screen.getByRole('button', { name: /sign up/i })

    await user.type(emailInput, 'invalid-email')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument()
    })

    expect(mockRegister).not.toHaveBeenCalled()
  })

  it('validates BMSCE email domain', async () => {
    const user = userEvent.setup()
    render(<SignupForm />)

    const emailInput = screen.getByLabelText(/email address/i)
    const submitButton = screen.getByRole('button', { name: /sign up/i })

    await user.type(emailInput, 'student@gmail.com')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/email must be a bmsce email address/i)).toBeInTheDocument()
    })

    expect(mockRegister).not.toHaveBeenCalled()
  })

  it('validates password minimum length', async () => {
    const user = userEvent.setup()
    render(<SignupForm />)

    const passwordInput = screen.getByLabelText(/^password$/i)
    const submitButton = screen.getByRole('button', { name: /sign up/i })

    await user.type(passwordInput, 'Short1')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument()
    })

    expect(mockRegister).not.toHaveBeenCalled()
  })

  it('validates password contains uppercase letter', async () => {
    const user = userEvent.setup()
    render(<SignupForm />)

    const passwordInput = screen.getByLabelText(/^password$/i)
    const submitButton = screen.getByRole('button', { name: /sign up/i })

    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/password must contain at least one uppercase letter/i)).toBeInTheDocument()
    })

    expect(mockRegister).not.toHaveBeenCalled()
  })

  it('validates password contains lowercase letter', async () => {
    const user = userEvent.setup()
    render(<SignupForm />)

    const passwordInput = screen.getByLabelText(/^password$/i)
    const submitButton = screen.getByRole('button', { name: /sign up/i })

    await user.type(passwordInput, 'PASSWORD123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/password must contain at least one lowercase letter/i)).toBeInTheDocument()
    })

    expect(mockRegister).not.toHaveBeenCalled()
  })

  it('validates password contains digit', async () => {
    const user = userEvent.setup()
    render(<SignupForm />)

    const passwordInput = screen.getByLabelText(/^password$/i)
    const submitButton = screen.getByRole('button', { name: /sign up/i })

    await user.type(passwordInput, 'PasswordOnly')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/password must contain at least one digit/i)).toBeInTheDocument()
    })

    expect(mockRegister).not.toHaveBeenCalled()
  })

  it('validates passwords match', async () => {
    const user = userEvent.setup()
    render(<SignupForm />)

    const passwordInput = screen.getByLabelText(/^password$/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByRole('button', { name: /sign up/i })

    await user.type(passwordInput, 'Password123')
    await user.type(confirmPasswordInput, 'DifferentPassword123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/passwords don't match/i)).toBeInTheDocument()
    })

    expect(mockRegister).not.toHaveBeenCalled()
  })

  it('shows password strength indicator', async () => {
    const user = userEvent.setup()
    render(<SignupForm />)

    const passwordInput = screen.getByLabelText(/^password$/i)

    // Weak password
    await user.type(passwordInput, 'weak')
    expect(screen.getByText(/weak/i)).toBeInTheDocument()

    // Clear and type stronger password
    await user.clear(passwordInput)
    await user.type(passwordInput, 'Password123')
    await waitFor(() => {
      expect(screen.getByText(/strong/i)).toBeInTheDocument()
    })
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    mockRegister.mockResolvedValue(undefined)

    render(<SignupForm />)

    const nameInput = screen.getByLabelText(/full name/i)
    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/^password$/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByRole('button', { name: /sign up/i })

    await user.type(nameInput, 'John Doe')
    await user.type(emailInput, 'student@bmsce.ac.in')
    await user.type(passwordInput, 'Password123')
    await user.type(confirmPasswordInput, 'Password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        full_name: 'John Doe',
        email: 'student@bmsce.ac.in',
        password: 'Password123',
        confirmPassword: 'Password123',
      })
    })
  })

  it('redirects to home page on successful signup', async () => {
    const user = userEvent.setup()
    mockRegister.mockResolvedValue(undefined)

    render(<SignupForm />)

    const nameInput = screen.getByLabelText(/full name/i)
    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/^password$/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByRole('button', { name: /sign up/i })

    await user.type(nameInput, 'John Doe')
    await user.type(emailInput, 'student@bmsce.ac.in')
    await user.type(passwordInput, 'Password123')
    await user.type(confirmPasswordInput, 'Password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  it('shows error message on signup failure', async () => {
    const user = userEvent.setup()
    mockRegister.mockRejectedValue({
      response: {
        data: {
          error: {
            message: 'Email already exists',
          },
        },
      },
    })

    render(<SignupForm />)

    const nameInput = screen.getByLabelText(/full name/i)
    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/^password$/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByRole('button', { name: /sign up/i })

    await user.type(nameInput, 'John Doe')
    await user.type(emailInput, 'existing@bmsce.ac.in')
    await user.type(passwordInput, 'Password123')
    await user.type(confirmPasswordInput, 'Password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/email already exists/i)).toBeInTheDocument()
    })

    expect(mockPush).not.toHaveBeenCalled()
  })

  it('disables submit button while loading', async () => {
    const user = userEvent.setup()
    let resolveRegister: () => void
    mockRegister.mockReturnValue(
      new Promise((resolve) => {
        resolveRegister = resolve
      })
    )

    render(<SignupForm />)

    const nameInput = screen.getByLabelText(/full name/i)
    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/^password$/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByRole('button', { name: /sign up/i })

    await user.type(nameInput, 'John Doe')
    await user.type(emailInput, 'student@bmsce.ac.in')
    await user.type(passwordInput, 'Password123')
    await user.type(confirmPasswordInput, 'Password123')
    await user.click(submitButton)

    // Button should be disabled while loading
    await waitFor(() => {
      expect(submitButton).toBeDisabled()
    })

    // Resolve the promise
    resolveRegister!()

    // Button should be enabled again
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
    })
  })

  it('clears error message on new submission', async () => {
    const user = userEvent.setup()
    mockRegister.mockRejectedValueOnce(new Error('First error'))
    mockRegister.mockResolvedValueOnce(undefined)

    render(<SignupForm />)

    const nameInput = screen.getByLabelText(/full name/i)
    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/^password$/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByRole('button', { name: /sign up/i })

    // First submission - should show error
    await user.type(nameInput, 'John Doe')
    await user.type(emailInput, 'student@bmsce.ac.in')
    await user.type(passwordInput, 'Password123')
    await user.type(confirmPasswordInput, 'Password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/first error/i)).toBeInTheDocument()
    })

    // Second submission - error should be cleared
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.queryByText(/first error/i)).not.toBeInTheDocument()
    })
  })
})
