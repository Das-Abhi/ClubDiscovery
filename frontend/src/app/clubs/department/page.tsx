'use client'

import { ClubsPageTemplate } from '@/components/clubs/ClubsPageTemplate'
import { sampleClubs } from '@/lib/data/sampleClubs'

export default function DepartmentPage() {
  return (
    <ClubsPageTemplate
      clubs={sampleClubs}
      category="department"
      title="Department Clubs"
      description="Join your department's club to connect with peers, work on projects, and enhance your domain expertise"
      icon="🏛️"
    />
  )
}
