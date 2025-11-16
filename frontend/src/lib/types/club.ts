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
  cover_image_url?: string
  instagram?: string
  linkedin?: string
  twitter?: string
  website?: string
  faculty_name?: string
  faculty_email?: string
  faculty_phone?: string
  faculty_contact?: Contact
  student_contacts?: Contact[]
  member_count: number
  view_count: number
  created_at: string
  updated_at: string
  is_active: boolean
  is_featured: boolean
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
