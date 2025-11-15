import Link from 'next/link'
import { Compass, Instagram, Mail, MapPin } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  const quickLinks = [
    { href: '/clubs/cocurricular', label: 'Co-Curricular Clubs' },
    { href: '/clubs/extracurricular', label: 'Extra-Curricular Clubs' },
    { href: '/clubs/department', label: 'Department Clubs' },
    { href: '/assessment', label: 'Take Assessment' },
  ]

  const resourceLinks = [
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact' },
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
  ]

  return (
    <footer className="glass-card border-t border-red-900/20 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 group">
              <Compass className="h-8 w-8 text-red-500 group-hover:rotate-180 transition-transform duration-500" />
              <span className="text-xl font-bold gradient-text">
                ClubCompass
              </span>
            </Link>
            <p className="text-gray-400 text-sm">
              Navigate your club journey at BMS College of Engineering. Discover
              the perfect club that matches your interests from over 60+ clubs.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com/bmsce"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 glass-card rounded-lg hover:text-red-500 transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="mailto:clubs@bmsce.ac.in"
                className="p-2 glass-card rounded-lg hover:text-red-500 transition-colors"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              {resourceLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p>
                  BMS College of Engineering<br />
                  Bull Temple Road, Bengaluru<br />
                  Karnataka 560019, India
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-red-500 flex-shrink-0" />
                <a
                  href="mailto:clubs@bmsce.ac.in"
                  className="hover:text-white transition-colors"
                >
                  clubs@bmsce.ac.in
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-red-900/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm text-center md:text-left">
              © {currentYear} ClubCompass. All rights reserved. Built with ❤️ for BMSCE students.
            </p>
            <div className="flex items-center gap-6 text-xs text-gray-500">
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms
              </Link>
              <Link href="/sitemap" className="hover:text-white transition-colors">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
