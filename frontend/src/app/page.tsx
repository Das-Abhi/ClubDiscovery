import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      {/* Hero Section */}
      <div className="text-center max-w-4xl mx-auto space-y-8 animate-fade-in">
        {/* Logo/Title */}
        <div className="space-y-4">
          <h1 className="text-6xl md:text-8xl font-bold gradient-text">
            ClubCompass
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
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
          <Link
            href="/assessment"
            className="px-8 py-4 bg-gradient-to-r from-red-900 to-red-700 hover:from-red-800 hover:to-red-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl w-full sm:w-auto"
          >
            Take Assessment
          </Link>
          <Link
            href="/clubs/cocurricular"
            className="px-8 py-4 glass-card text-white font-semibold rounded-lg w-full sm:w-auto"
          >
            Browse Clubs
          </Link>
        </div>

        {/* Category Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16">
          <Link
            href="/clubs/cocurricular"
            className="glass-card p-6 text-center group"
          >
            <h3 className="text-xl font-semibold mb-2 gradient-text">
              Co-Curricular
            </h3>
            <p className="text-gray-400 text-sm">
              Technical clubs and chapters
            </p>
          </Link>

          <Link
            href="/clubs/extracurricular"
            className="glass-card p-6 text-center group"
          >
            <h3 className="text-xl font-semibold mb-2 gradient-text">
              Extra-Curricular
            </h3>
            <p className="text-gray-400 text-sm">
              Social and cultural clubs
            </p>
          </Link>

          <Link
            href="/clubs/department"
            className="glass-card p-6 text-center group"
          >
            <h3 className="text-xl font-semibold mb-2 gradient-text">
              Department
            </h3>
            <p className="text-gray-400 text-sm">
              Department-specific clubs
            </p>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-20 text-center text-gray-500 text-sm">
        <p>BMS College of Engineering</p>
        <p className="mt-2">© 2024 ClubCompass. All rights reserved.</p>
      </footer>
    </main>
  )
}
