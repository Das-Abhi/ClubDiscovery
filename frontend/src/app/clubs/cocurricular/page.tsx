'use client'

import { ClubsPageTemplate } from '@/components/clubs/ClubsPageTemplate'
import { sampleClubs } from '@/lib/data/sampleClubs'

export default function CocurricularPage() {
  return (
    <ClubsPageTemplate
      clubs={sampleClubs}
      category="cocurricular"
      title="Co-Curricular Clubs"
      description="Explore technical clubs and student chapters focused on technology, innovation, and professional development"
      icon="💻"
    />
  )
}
