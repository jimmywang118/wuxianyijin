'use client'

import { useState, useCallback } from 'react'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  accept?: string
  title: string
  description: string
  icon?: React.ReactNode
}

export default function FileUpload({
  onFileSelect,
  accept = '.xlsx',
  title,
  description,
  icon
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      onFileSelect(files[0])
    }
  }, [onFileSelect])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      onFileSelect(files[0])
    }
  }, [onFileSelect])

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center transition-colors">
      <input
        type="file"
        className="hidden"
        id="file-upload"
        accept={accept}
        onChange={handleFileInput}
      />
      <label
        htmlFor="file-upload"
        className={`cursor-pointer ${isDragging ? 'border-blue-500 bg-blue-50' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {icon || (
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        )}
        <p className="mt-2 text-sm text-gray-600">{title}</p>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </label>
    </div>
  )
}