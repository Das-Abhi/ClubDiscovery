'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Instagram, Mail, Phone, Users } from 'lucide-react'
import Image from 'next/image'
import { Club } from '@/lib/types/club'
import { getInitials } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface ClubModalProps {
  club: Club | null
  isOpen: boolean
  onClose: () => void
}

export function ClubModal({ club, isOpen, onClose }: ClubModalProps) {
  if (!club) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-4xl my-8"
            >
              <Card className="glass-card border-red-900/30 overflow-hidden">
                {/* Header with Image */}
                <div className="relative h-64 bg-gradient-to-br from-red-900/20 to-black">
                  {club.logo_url ? (
                    <Image
                      src={club.logo_url}
                      alt={club.name}
                      fill
                      className="object-cover opacity-40"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-8xl font-bold text-red-500 opacity-30">
                        {getInitials(club.name)}
                      </span>
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                  {/* Close Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white hover:bg-white/10"
                  >
                    <X className="h-6 w-6" />
                  </Button>

                  {/* Title Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <span className="inline-block px-3 py-1 text-xs font-semibold bg-red-900/50 backdrop-blur-sm rounded-full border border-red-500/30 uppercase tracking-wider mb-3">
                          {club.category}
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                          {club.name}
                        </h2>
                        {club.tagline && (
                          <p className="text-lg text-gray-300">{club.tagline}</p>
                        )}
                      </div>
                      {club.member_count && (
                        <div className="flex items-center gap-2 px-4 py-2 glass-card rounded-lg">
                          <Users className="h-5 w-5 text-red-500" />
                          <div className="text-sm">
                            <div className="font-semibold text-white">{club.member_count}</div>
                            <div className="text-gray-400 text-xs">members</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <CardContent className="p-6 md:p-8 space-y-8">
                  {/* Description */}
                  {club.description && (
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-3">About</h3>
                      <p className="text-gray-300 leading-relaxed">{club.description}</p>
                    </div>
                  )}

                  {/* Overview */}
                  {club.overview && (
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-3">What We Do</h3>
                      <p className="text-gray-300 leading-relaxed">{club.overview}</p>
                    </div>
                  )}

                  {/* Contact Information */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Faculty Contact */}
                    {club.faculty_contact && (
                      <div className="glass p-6 rounded-lg">
                        <h3 className="text-lg font-semibold text-white mb-4">Faculty Coordinator</h3>
                        <div className="space-y-3">
                          <div className="text-gray-300">
                            <div className="font-medium">{club.faculty_contact.name}</div>
                          </div>
                          {club.faculty_contact.email && (
                            <a
                              href={`mailto:${club.faculty_contact.email}`}
                              className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 transition-colors"
                            >
                              <Mail className="h-4 w-4" />
                              {club.faculty_contact.email}
                            </a>
                          )}
                          {club.faculty_contact.phone && (
                            <a
                              href={`tel:${club.faculty_contact.phone}`}
                              className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 transition-colors"
                            >
                              <Phone className="h-4 w-4" />
                              {club.faculty_contact.phone}
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Student Contacts */}
                    {club.student_contacts && club.student_contacts.length > 0 && (
                      <div className="glass p-6 rounded-lg">
                        <h3 className="text-lg font-semibold text-white mb-4">Student Coordinators</h3>
                        <div className="space-y-4">
                          {club.student_contacts.map((contact, index) => (
                            <div key={index} className="space-y-2">
                              <div className="text-gray-300 font-medium">{contact.name}</div>
                              {contact.phone && (
                                <a
                                  href={`tel:${contact.phone}`}
                                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 transition-colors"
                                >
                                  <Phone className="h-4 w-4" />
                                  {contact.phone}
                                </a>
                              )}
                              {contact.email && (
                                <a
                                  href={`mailto:${contact.email}`}
                                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 transition-colors"
                                >
                                  <Mail className="h-4 w-4" />
                                  {contact.email}
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Social Media */}
                  {club.instagram && (
                    <div className="flex items-center justify-center gap-4 pt-4 border-t border-red-900/20">
                      <a
                        href={`https://instagram.com/${club.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-6 py-3 glass-card hover:scale-105 transition-transform"
                      >
                        <Instagram className="h-5 w-5 text-red-500" />
                        <span className="text-gray-300">Follow on Instagram</span>
                      </a>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button
                      size="lg"
                      className="flex-1 bg-gradient-to-r from-red-900 to-red-700 hover:from-red-800 hover:to-red-600"
                    >
                      Join Club
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="flex-1"
                      onClick={onClose}
                    >
                      Close
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
