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
  subcategory?: string
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

export interface Announcement {
  id: string
  club_id: string
  created_by?: string
  title: string
  content: string
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface AnnouncementCreate {
  club_id: string
  title: string
  content: string
  is_published?: boolean
}

export interface AnnouncementUpdate {
  title?: string
  content?: string
  is_published?: boolean
}

export interface InstagramPost {
  id: string
  caption?: string
  media_url: string
  permalink: string
  timestamp: string
  media_type: string
}

export interface GallerySettings {
  id: string
  club_id: string
  instagram_username?: string
  display_gallery: boolean
  max_posts: number
  cached_posts?: InstagramPost[]
  cache_updated_at?: string
  created_at: string
  updated_at: string
}

export interface GallerySettingsUpdate {
  instagram_username?: string
  display_gallery?: boolean
  max_posts?: number
}
