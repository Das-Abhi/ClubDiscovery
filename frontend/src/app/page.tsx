'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ClubCarousel } from '@/components/clubs/ClubCarousel'
import { ClubGrid } from '@/components/clubs/ClubGrid'
import { Button } from '@/components/ui/button'
import { clubsApi, type Club } from '@/lib/api/clubs'
import { Sparkles, TrendingUp, Award } from 'lucide-react'
import { TypewriterEffect } from '@/components/ui/typewriter-effect'
import { Particles } from '@/components/ui/particles'

export default function HomePage() {
  const [featuredClubs, setFeaturedClubs] = useState<Club[]>([])
  const [popularClubs, setPopularClubs] = useState<Club[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [categoryCounts, setCategoryCounts] = useState({
    cocurricular: 0,
    extracurricular: 0,
    department: 0,
  })

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        setIsLoading(true)
        const [featured, popular, cocurricularData, extracurricularData, departmentData] = await Promise.all([
          clubsApi.getFeaturedClubs(4),
          clubsApi.getPopularClubs(5),
          clubsApi.getClubs({ category: 'cocurricular', per_page: 1 }),
          clubsApi.getClubs({ category: 'extracurricular', per_page: 1 }),
          clubsApi.getClubs({ category: 'department', per_page: 1 }),
        ])
        setFeaturedClubs(featured)
        setPopularClubs(popular)
        setCategoryCounts({
          cocurricular: cocurricularData.total,
          extracurricular: extracurricularData.total,
          department: departmentData.total,
        })
      } catch (error) {
        console.error('Failed to load clubs:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchClubs()
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative container mx-auto px-4 py-12 md:py-20 overflow-hidden">
        {/* Particles Background */}
        <div className="absolute inset-0 -z-10">
          <Particles quantity={80} />
        </div>

        <div className="text-center max-w-4xl mx-auto space-y-8 animate-fade-in relative z-10">
          {/* Logo/Title */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 glass-card rounded-full mb-4">
              <Sparkles className="h-4 w-4 text-red-500" />
              <span className="text-sm text-gray-300">Welcome to BMSCE</span>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold gradient-text">
              <TypewriterEffect words="ClubCompass" className="inline-block" />
            </h1>
            <p className="text-xl md:text-2xl text-gray-300">
              Navigate Your Club Journey at BMSCE
            </p>
          </div>

          {/* Description */}
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Discover the perfect club that matches your interests from over 60+ clubs
            at BMS College of Engineering. Take our smart assessment or browse by category.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link href="/assessment">
              <Button
                size="lg"
                className="px-8 py-6 bg-gradient-to-r from-red-900 to-red-700 hover:from-red-800 hover:to-red-600 text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-xl text-base w-full sm:w-auto"
              >
                <Award className="mr-2 h-5 w-5" />
                Take Assessment
              </Button>
            </Link>
            <Link href="/search">
              <Button
                size="lg"
                variant="glass"
                className="px-8 py-6 text-white font-semibold text-base w-full sm:w-auto"
              >
                Browse All Clubs
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trending Clubs Carousel */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="h-6 w-6 text-red-500" />
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Trending Clubs
          </h2>
        </div>
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading trending clubs...</p>
          </div>
        ) : (
          <ClubCarousel clubs={popularClubs} />
        )}
      </section>

      {/* Featured Clubs */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">
          Featured Clubs
        </h2>
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading featured clubs...</p>
          </div>
        ) : (
          <>
            <ClubGrid clubs={featuredClubs} onClubClick={(club) => {
              window.location.href = `/clubs/${club.slug}`
            }} />
            <div className="text-center mt-12">
              <Link href="/clubs/cocurricular">
                <Button variant="outline" size="lg">
                  View All Clubs
                </Button>
              </Link>
            </div>
          </>
        )}
      </section>

      {/* Category Section */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">
          Explore by Category
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Link
            href="/clubs/cocurricular"
            className="glass-card p-8 text-center group transition-transform duration-300"
          >
            <div className="text-4xl mb-4">💻</div>
            <h3 className="text-xl font-semibold mb-2 gradient-text">
              Co-Curricular
            </h3>
            <p className="text-gray-400 text-sm">
              Technical clubs and chapters for tech enthusiasts
            </p>
            <p className="text-red-500 text-sm mt-4 font-medium">
              {categoryCounts.cocurricular}+ clubs →
            </p>
          </Link>

          <Link
            href="/clubs/extracurricular"
            className="glass-card p-8 text-center group transition-transform duration-300"
          >
            <div className="text-4xl mb-4">🎭</div>
            <h3 className="text-xl font-semibold mb-2 gradient-text">
              Extra-Curricular
            </h3>
            <p className="text-gray-400 text-sm">
              Social and cultural clubs for creative minds
            </p>
            <p className="text-red-500 text-sm mt-4 font-medium">
              {categoryCounts.extracurricular}+ clubs →
            </p>
          </Link>

          <Link
            href="/clubs/department"
            className="glass-card p-8 text-center group transition-transform duration-300"
          >
            <div className="text-4xl mb-4">🏛️</div>
            <h3 className="text-xl font-semibold mb-2 gradient-text">
              Department
            </h3>
            <p className="text-gray-400 text-sm">
              Department-specific clubs and associations
            </p>
            <p className="text-red-500 text-sm mt-4 font-medium">
              {categoryCounts.department}+ clubs →
            </p>
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="glass-card p-12 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Not sure where to start?
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Take our personalized assessment to find clubs that match your interests and goals
          </p>
          <Link href="/assessment">
            <Button
              size="lg"
              className="bg-gradient-to-r from-red-900 to-red-700 hover:from-red-800 hover:to-red-600 text-white font-semibold px-12 py-6 text-lg"
            >
              Start Assessment Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
