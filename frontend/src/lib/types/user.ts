export interface User {
  id: string
  email: string
  full_name: string
  usn?: string  // University Student Number (e.g., 1BM22CS001)
  created_at: string
  updated_at: string
  email_verified: boolean
  is_active: boolean
  is_admin: boolean
}

export interface Membership {
  id: string
  club_id: string
  user_id: string
  role: 'member' | 'coordinator' | 'faculty'
  joined_at: string
  status: 'active' | 'inactive' | 'pending'
  club?: {
    id: string
    name: string
    slug: string
  }
}

export interface UserProfile extends User {
  memberships: Membership[]
}
