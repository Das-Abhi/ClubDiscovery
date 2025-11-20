'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Menu, X, Compass, User, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/hooks/useAuth'
import { SearchAutocomplete } from './SearchAutocomplete'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const router = useRouter()
  const { user, isAuthenticated, logout, loadUser } = useAuth()

  // Load user on mount
  useEffect(() => {
    if (!user && !isAuthenticated) {
      loadUser()
    }
  }, [user, isAuthenticated, loadUser])

  const navigationLinks = [
    { href: '/', label: 'Home' },
    { href: '/clubs/cocurricular', label: 'Co-Curricular' },
    { href: '/clubs/extracurricular', label: 'Extra-Curricular' },
    { href: '/clubs/department', label: 'Departments' },
    { href: '/assessment', label: 'Take Assessment' },
  ]

  const handleLogout = () => {
    logout()
    setIsProfileOpen(false)
    router.push('/')
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-red-900/20 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Compass className="h-8 w-8 text-red-500 group-hover:rotate-180 transition-transform duration-500" />
            <span className="text-xl font-bold gradient-text hidden sm:inline">
              ClubCompass
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Search Bar */}
          <SearchAutocomplete className="hidden md:block min-w-[200px] lg:min-w-[300px]" />

          {/* Auth Section (Desktop) */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 glass-card px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-sm font-bold text-white">
                    {user.full_name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <span className="text-sm font-medium text-white">
                    {user.full_name.split(' ')[0]}
                  </span>
                </button>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsProfileOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 glass-card rounded-lg shadow-lg py-2 z-50">
                      <div className="px-4 py-3 border-b border-white/10">
                        <p className="text-sm font-medium text-white">
                          {user.full_name}
                        </p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        My Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link href="/auth">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-red-900 to-red-700 hover:from-red-800 hover:to-red-600"
                  >
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            "lg:hidden overflow-hidden transition-all duration-300",
            isMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="py-4 space-y-4">
            {/* Mobile Search */}
            <SearchAutocomplete onSelect={() => setIsMenuOpen(false)} />

            {/* Mobile Navigation */}
            <nav className="flex flex-col gap-2">
              {navigationLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-gray-300 hover:text-white transition-colors duration-200 py-2 px-3 rounded-lg hover:bg-white/5"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Mobile Auth Section */}
            <div className="pt-2 border-t border-red-900/20">
              {isAuthenticated && user ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 px-3 py-2 glass-card rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-sm font-bold text-white">
                      {user.full_name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">
                        {user.full_name}
                      </p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <User className="w-4 h-4" />
                    My Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout()
                      setIsMenuOpen(false)
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Link href="/auth" className="flex-1">
                    <Button variant="ghost" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link href="/auth" className="flex-1">
                    <Button className="w-full bg-gradient-to-r from-red-900 to-red-700 hover:from-red-800 hover:to-red-600">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
