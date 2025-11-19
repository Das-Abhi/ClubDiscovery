/**
 * CSV Import Modal Component
 * Handles bulk club import via CSV file upload
 */
'use client'

import { useState, useRef } from 'react'
import { X, Upload, FileText, Check, AlertCircle, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface ImportResult {
  success: boolean
  summary: {
    total_rows: number
    created: number
    skipped: number
    errors: number
  }
  created_clubs: Array<{ row: number; name: string; slug: string }>
  skipped_clubs: Array<{ row: number; name: string; reason: string }>
  errors: Array<{ row: number; name: string; error: string }>
}

interface CSVImportModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CSVImportModal({ isOpen, onClose, onSuccess }: CSVImportModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.name.endsWith('.csv')) {
      setFile(droppedFile)
      setError(null)
    } else {
      setError('Please upload a CSV file')
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.name.endsWith('.csv')) {
      setFile(selectedFile)
      setError(null)
    } else {
      setError('Please upload a CSV file')
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file')
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/clubs/bulk-import`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Upload failed')
      }

      const data: ImportResult = await response.json()
      setResult(data)

      if (data.success && data.summary.created > 0) {
        onSuccess()
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload CSV')
    } finally {
      setIsUploading(false)
    }
  }

  const downloadTemplate = () => {
    const template = `name,category,tagline,description,overview,logo_url,instagram,faculty_name,faculty_email,faculty_phone
ACM Student Chapter,cocurricular,Computing & AI club,Full description here,Overview text,https://example.com/logo.jpg,@bmsce_acm,Dr. John Doe,john.doe@bmsce.ac.in,9999999999
Dance Club,extracurricular,Express through dance,Dance club description,Dance club overview,https://example.com/dance.jpg,@bmsce_dance,Prof. Jane Smith,jane.smith@bmsce.ac.in,8888888888`

    const blob = new Blob([template], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'clubs_import_template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const handleClose = () => {
    setFile(null)
    setResult(null)
    setError(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <Card className="glass-card w-full max-w-3xl max-h-[90vh] overflow-y-auto m-4">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Upload className="w-6 h-6 text-red-500" />
                Import Clubs from CSV
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                Upload a CSV file to bulk import clubs
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Download Template */}
          <div className="mb-6">
            <Button
              onClick={downloadTemplate}
              variant="outline"
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Download CSV Template
            </Button>
          </div>

          {/* File Upload Area */}
          {!result && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging
                  ? 'border-red-500 bg-red-500/10'
                  : 'border-gray-600 hover:border-gray-500'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />

              {file ? (
                <div className="space-y-4">
                  <FileText className="w-16 h-16 text-green-500 mx-auto" />
                  <div>
                    <p className="text-white font-medium">{file.name}</p>
                    <p className="text-gray-400 text-sm">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                  >
                    Choose Different File
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="w-16 h-16 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-white font-medium mb-2">
                      Drag and drop your CSV file here
                    </p>
                    <p className="text-gray-400 text-sm mb-4">or</p>
                    <Button onClick={() => fileInputRef.current?.click()}>
                      Choose File
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-500/20 border border-red-500 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-400 font-medium">Error</p>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-500/20 border border-blue-500 rounded-lg">
                  <p className="text-blue-400 text-sm">Total Rows</p>
                  <p className="text-white text-2xl font-bold">{result.summary.total_rows}</p>
                </div>
                <div className="p-4 bg-green-500/20 border border-green-500 rounded-lg">
                  <p className="text-green-400 text-sm">Created</p>
                  <p className="text-white text-2xl font-bold">{result.summary.created}</p>
                </div>
                <div className="p-4 bg-yellow-500/20 border border-yellow-500 rounded-lg">
                  <p className="text-yellow-400 text-sm">Skipped</p>
                  <p className="text-white text-2xl font-bold">{result.summary.skipped}</p>
                </div>
                <div className="p-4 bg-red-500/20 border border-red-500 rounded-lg">
                  <p className="text-red-400 text-sm">Errors</p>
                  <p className="text-white text-2xl font-bold">{result.summary.errors}</p>
                </div>
              </div>

              {/* Created Clubs */}
              {result.created_clubs.length > 0 && (
                <div>
                  <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Successfully Created ({result.created_clubs.length})
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {result.created_clubs.map((club, index) => (
                      <div key={index} className="p-2 bg-green-500/10 border border-green-500/30 rounded text-sm">
                        <p className="text-white">Row {club.row}: {club.name}</p>
                        <p className="text-gray-400">Slug: {club.slug}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skipped Clubs */}
              {result.skipped_clubs.length > 0 && (
                <div>
                  <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                    Skipped ({result.skipped_clubs.length})
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {result.skipped_clubs.map((club, index) => (
                      <div key={index} className="p-2 bg-yellow-500/10 border border-yellow-500/30 rounded text-sm">
                        <p className="text-white">Row {club.row}: {club.name}</p>
                        <p className="text-gray-400">{club.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Errors */}
              {result.errors.length > 0 && (
                <div>
                  <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    Errors ({result.errors.length})
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {result.errors.map((error, index) => (
                      <div key={index} className="p-2 bg-red-500/10 border border-red-500/30 rounded text-sm">
                        <p className="text-white">Row {error.row}: {error.name}</p>
                        <p className="text-gray-400">{error.error}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 mt-6">
            {!result ? (
              <>
                <Button
                  onClick={handleUpload}
                  disabled={!file || isUploading}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload and Import
                    </>
                  )}
                </Button>
                <Button onClick={handleClose} variant="outline">
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={handleClose} className="flex-1">
                Close
              </Button>
            )}
          </div>

          {/* CSV Format Instructions */}
          {!result && (
            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <h3 className="text-white font-semibold mb-2">CSV Format Requirements</h3>
              <div className="text-sm text-gray-300 space-y-1">
                <p><strong>Required columns:</strong> name, category</p>
                <p><strong>Category values:</strong> cocurricular, extracurricular, department</p>
                <p><strong>Optional columns:</strong> tagline, description, overview, logo_url, instagram, linkedin, twitter, website, faculty_name, faculty_email, faculty_phone, subcategory</p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
