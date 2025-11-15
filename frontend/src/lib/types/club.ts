export type ClubCategory = 'cocurricular' | 'extracurricular' | 'department'

export interface Contact {
  name: string
  phone?: string
  email?: string
}

export interface Club {
  id: string
  name: string
  slug: string
  category: ClubCategory
  tagline?: string
  description?: string
  overview?: string
  logo_url?: string
  instagram?: string
  faculty_contact?: Contact
  student_contacts?: Contact[]
  created_at: string
  updated_at: string
  is_active: boolean
  member_count?: number
}

export interface ClubsResponse {
  data: Club[]
  meta: {
    total: number
    page: number
    limit: number
    total_pages: number
  }
}

export interface ClubFilters {
  category?: ClubCategory
  search?: string
  page?: number
  limit?: number
}
