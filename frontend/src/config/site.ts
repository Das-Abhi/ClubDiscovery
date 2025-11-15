export const siteConfig = {
  name: 'ClubCompass',
  description: 'Discover Your Perfect Club at BMSCE',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  college: {
    name: 'BMS College of Engineering',
    emailDomain: 'bmsce.ac.in',
  },
  social: {
    instagram: '@clubcompass_bmsce',
  },
  features: {
    assessment: true,
    authentication: true,
    search: true,
    recommendations: true,
  },
}

export type SiteConfig = typeof siteConfig
