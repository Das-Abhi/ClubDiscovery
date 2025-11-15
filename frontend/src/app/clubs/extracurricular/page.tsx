'use client'

import { ClubsPageTemplate } from '@/components/clubs/ClubsPageTemplate'
import { sampleClubs } from '@/lib/data/sampleClubs'

export default function ExtracurricularPage() {
  return (
    <ClubsPageTemplate
      clubs={sampleClubs}
      category="extracurricular"
      title="Extra-Curricular Clubs"
      description="Discover social, cultural, and creative clubs that help you explore your passions beyond academics"
      icon="🎭"
    />
  )
}
