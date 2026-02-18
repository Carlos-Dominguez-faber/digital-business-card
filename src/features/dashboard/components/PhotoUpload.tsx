'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import Cropper, { Area } from 'react-easy-crop'

interface PhotoUploadProps {
  currentPhotoUrl: string | null
  fullName: string
  onPhotoUploaded: (url: string) => void
}

// Helper function to create cropped image
async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('No 2d context')
  }

  // Set canvas size to desired crop size
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  // Draw the cropped image
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  )

  // Return as blob
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error('Canvas is empty'))
      }
    }, 'image/jpeg', 0.9)
  })
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new window.Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.crossOrigin = 'anonymous'
    image.src = url
  })
}

export function PhotoUpload({ currentPhotoUrl, fullName, onPhotoUploaded }: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPhotoUrl)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Cropper state
  const [showCropper, setShowCropper] = useState(false)
  const [imageToCrop, setImageToCrop] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Selecciona un archivo de imagen')
      return
    }

    // Validate file size (max 10MB for cropping, will be reduced after)
    if (file.size > 10 * 1024 * 1024) {
      setError('La imagen debe ser menor a 10MB')
      return
    }

    setError(null)

    // Read file and show cropper
    const reader = new FileReader()
    reader.onloadend = () => {
      setImageToCrop(reader.result as string)
      setShowCropper(true)
      setCrop({ x: 0, y: 0 })
      setZoom(1)
    }
    reader.readAsDataURL(file)
  }

  const handleCropConfirm = async () => {
    if (!imageToCrop || !croppedAreaPixels) return

    setUploading(true)
    setShowCropper(false)

    try {
      // Get cropped image blob
      const croppedBlob = await getCroppedImg(imageToCrop, croppedAreaPixels)

      // Create file from blob
      const file = new File([croppedBlob], 'avatar.jpg', { type: 'image/jpeg' })

      // Show preview
      const previewReader = new FileReader()
      previewReader.onloadend = () => {
        setPreviewUrl(previewReader.result as string)
      }
      previewReader.readAsDataURL(croppedBlob)

      // Upload to server
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload/photo', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Upload failed')
      }

      const { url } = await response.json()
      setPreviewUrl(url)
      onPhotoUploaded(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      setPreviewUrl(currentPhotoUrl)
    } finally {
      setUploading(false)
      setImageToCrop(null)
    }
  }

  const handleCropCancel = () => {
    setShowCropper(false)
    setImageToCrop(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemovePhoto = () => {
    setPreviewUrl(null)
    onPhotoUploaded('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getInitials = () => {
    return fullName?.charAt(0)?.toUpperCase() || '?'
  }

  // Cropper Modal
  if (showCropper && imageToCrop) {
    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-sm text-white/70 mb-2">
          Arrastra para posicionar, desplaza para zoom
        </p>

        {/* Cropper Container */}
        <div className="relative w-full h-80 bg-black/50 rounded-2xl overflow-hidden">
          <Cropper
            image={imageToCrop}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
        </div>

        {/* Zoom Slider */}
        <div className="w-full flex items-center gap-3 px-4">
          <svg className="w-4 h-4 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
          </svg>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
          />
          <svg className="w-4 h-4 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
          </svg>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 w-full">
          <button
            type="button"
            onClick={handleCropCancel}
            className="
              flex-1 py-3
              bg-white/5 backdrop-blur-md
              border border-white/10
              text-white/70
              rounded-2xl font-medium
              hover:bg-white/10
              transition-all duration-200
            "
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleCropConfirm}
            disabled={uploading}
            className="
              flex-1 py-3
              bg-white/20 backdrop-blur-md
              border border-white/30
              text-white
              rounded-2xl font-medium
              hover:bg-white/30
              disabled:opacity-50
              transition-all duration-200
              flex items-center justify-center gap-2
            "
          >
            {uploading && (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            {uploading ? 'Subiendo...' : 'Confirmar'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Photo Preview */}
      <div className="relative">
        <div className="w-32 h-32 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center overflow-hidden">
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt={fullName || 'Profile photo'}
              width={128}
              height={128}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-4xl font-bold text-white/60">
              {getInitials()}
            </span>
          )}

          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
              <svg className="w-8 h-8 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          )}
        </div>

        {/* Remove button */}
        {previewUrl && !uploading && (
          <button
            type="button"
            onClick={handleRemovePhoto}
            className="
              absolute -top-1 -right-1
              w-8 h-8
              bg-red-500/80 hover:bg-red-500
              border border-red-400/50
              rounded-full
              flex items-center justify-center
              text-white
              transition-all duration-200
            "
            title="Remove photo"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Upload Button */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          id="photo-upload"
        />
        <label
          htmlFor="photo-upload"
          className={`
            inline-flex items-center gap-2
            px-4 py-2
            bg-white/10 backdrop-blur-md
            border border-white/20
            rounded-2xl
            text-white text-sm font-medium
            hover:bg-white/20
            transition-all duration-200
            cursor-pointer
            ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {uploading ? 'Subiendo...' : previewUrl ? 'Cambiar Foto' : 'Subir Foto'}
        </label>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      {/* Help Text */}
      <p className="text-xs text-white/40 text-center">
        JPG, PNG o GIF. Max 10MB.
      </p>
    </div>
  )
}
