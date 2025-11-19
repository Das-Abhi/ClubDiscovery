/**
 * Club Form Modal - For creating and editing clubs
 */
'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

export interface ClubFormData {
  name: string
  slug: string
  category: 'cocurricular' | 'extracurricular' | 'department'
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
  is_featured?: boolean
}

interface ClubFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ClubFormData) => Promise<void>
  initialData?: Partial<ClubFormData>
  mode: 'create' | 'edit'
}

export function ClubFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
}: ClubFormModalProps) {
  const [formData, setFormData] = useState<ClubFormData>({
    name: '',
    slug: '',
    category: 'cocurricular',
    tagline: '',
    description: '',
    overview: '',
    logo_url: '',
    cover_image_url: '',
    instagram: '',
    linkedin: '',
    twitter: '',
    website: '',
    faculty_name: '',
    faculty_email: '',
    faculty_phone: '',
    is_featured: false,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load initial data when modal opens
  useEffect(() => {
    if (isOpen && initialData) {
      // Explicitly map all fields to prevent null/undefined from backend
      // causing React controlled input issues
      setFormData({
        name: initialData.name || '',
        slug: initialData.slug || '',
        category: initialData.category || 'cocurricular',
        tagline: initialData.tagline || '',
        description: initialData.description || '',
        overview: initialData.overview || '',
        logo_url: initialData.logo_url || '',
        cover_image_url: initialData.cover_image_url || '',
        instagram: initialData.instagram || '',
        linkedin: initialData.linkedin || '',
        twitter: initialData.twitter || '',
        website: initialData.website || '',
        faculty_name: initialData.faculty_name || '',
        faculty_email: initialData.faculty_email || '',
        faculty_phone: initialData.faculty_phone || '',
        is_featured: initialData.is_featured || false,
      })
    } else if (isOpen && !initialData) {
      // Reset form for create mode
      setFormData({
        name: '',
        slug: '',
        category: 'cocurricular',
        tagline: '',
        description: '',
        overview: '',
        logo_url: '',
        cover_image_url: '',
        instagram: '',
        linkedin: '',
        twitter: '',
        website: '',
        faculty_name: '',
        faculty_email: '',
        faculty_phone: '',
        is_featured: false,
      })
    }
    setErrors({})
  }, [isOpen, initialData])

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))

    // Auto-generate slug when name changes (only in create mode)
    if (name === 'name' && mode === 'create') {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(value),
      }))
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Club name is required'
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required'
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug must contain only lowercase letters, numbers, and hyphens'
    }

    if (!formData.category) {
      newErrors.category = 'Category is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      await onSubmit(formData)
      onClose()
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to save club' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80">
      <Card className="glass-card w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              {mode === 'create' ? 'Create New Club' : 'Edit Club'}
            </h2>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-red-500 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Basic Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Club Name <span className="text-red-500">*</span>
                </label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., ACM Student Chapter"
                  className={errors.name ? 'border-red-500' : ''}
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Slug <span className="text-red-500">*</span>
                </label>
                <Input
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  placeholder="e.g., acm"
                  className={errors.slug ? 'border-red-500' : ''}
                  disabled={mode === 'edit' || isSubmitting}
                />
                {errors.slug && (
                  <p className="text-red-500 text-xs mt-1">{errors.slug}</p>
                )}
                {mode === 'edit' && (
                  <p className="text-gray-500 text-xs mt-1">Slug cannot be changed</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full h-10 rounded-md border border-gray-700 bg-gray-900 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  disabled={isSubmitting}
                >
                  <option value="cocurricular">Co-curricular</option>
                  <option value="extracurricular">Extra-curricular</option>
                  <option value="department">Department</option>
                </select>
                {errors.category && (
                  <p className="text-red-500 text-xs mt-1">{errors.category}</p>
                )}
              </div>

              {/* Featured */}
              <div className="flex items-center gap-2 pt-7">
                <input
                  type="checkbox"
                  id="is_featured"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-red-500 focus:ring-red-500"
                  disabled={isSubmitting}
                />
                <label htmlFor="is_featured" className="text-sm text-gray-300">
                  Mark as Featured
                </label>
              </div>
            </div>

            {/* Tagline */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tagline
              </label>
              <Input
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
                placeholder="Short description (max 500 characters)"
                disabled={isSubmitting}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description of the club"
                rows={3}
                className="w-full rounded-md border border-gray-700 bg-gray-900 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                disabled={isSubmitting}
              />
            </div>

            {/* Overview */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Overview
              </label>
              <textarea
                name="overview"
                value={formData.overview}
                onChange={handleChange}
                placeholder="Detailed overview of the club"
                rows={5}
                className="w-full rounded-md border border-gray-700 bg-gray-900 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Images */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Images</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Logo URL */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Logo URL
                </label>
                <Input
                  name="logo_url"
                  value={formData.logo_url}
                  onChange={handleChange}
                  placeholder="https://..."
                  disabled={isSubmitting}
                />
              </div>

              {/* Cover Image URL */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Cover Image URL
                </label>
                <Input
                  name="cover_image_url"
                  value={formData.cover_image_url}
                  onChange={handleChange}
                  placeholder="https://..."
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Social Links</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Instagram */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Instagram
                </label>
                <Input
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleChange}
                  placeholder="@username or full URL"
                  disabled={isSubmitting}
                />
              </div>

              {/* LinkedIn */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  LinkedIn
                </label>
                <Input
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  placeholder="LinkedIn URL"
                  disabled={isSubmitting}
                />
              </div>

              {/* Twitter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Twitter
                </label>
                <Input
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleChange}
                  placeholder="@username or full URL"
                  disabled={isSubmitting}
                />
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Website
                </label>
                <Input
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://..."
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Faculty Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Faculty Contact</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Faculty Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Name
                </label>
                <Input
                  name="faculty_name"
                  value={formData.faculty_name}
                  onChange={handleChange}
                  placeholder="Dr. Faculty Name"
                  disabled={isSubmitting}
                />
              </div>

              {/* Faculty Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <Input
                  name="faculty_email"
                  type="email"
                  value={formData.faculty_email}
                  onChange={handleChange}
                  placeholder="faculty@bmsce.ac.in"
                  disabled={isSubmitting}
                />
              </div>

              {/* Faculty Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone
                </label>
                <Input
                  name="faculty_phone"
                  value={formData.faculty_phone}
                  onChange={handleChange}
                  placeholder="+91 9999999999"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {mode === 'create' ? 'Creating...' : 'Saving...'}
                </>
              ) : (
                <>{mode === 'create' ? 'Create Club' : 'Save Changes'}</>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
