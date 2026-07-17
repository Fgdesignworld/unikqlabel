'use client'

import { useState, useEffect } from 'react'
import { Leaf } from 'lucide-react'
import { useSettings } from '@/context/settings-context'

interface SharedLogoProps {
  variant?: 'admin' | 'frontend' | 'login'
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
  href?: string
}

export function SharedLogo({ 
  variant = 'admin', 
  size = 'md', 
  showLabel = true,
  className = '',
  href = '/admin/dashboard'
}: SharedLogoProps) {
  const { settings } = useSettings()
  const [logoError, setLogoError] = useState(false)

  const siteName = settings?.site_name || 'Deepthi Living & Wellness'
  const logoSrc = settings?.logo_url
    ? (settings.logo_url.startsWith('/') && !settings.logo_url.startsWith('/api') 
        ? `/api${settings.logo_url}` 
        : settings.logo_url)
    : '/logo.png'

  useEffect(() => {
    setLogoError(false)
  }, [settings?.logo_url])

  const sizeMap = {
    sm: { img: 'h-[32px]', icon: 'w-6 h-6', text: 'text-base' },
    md: { img: 'h-[48px]', icon: 'w-8 h-8', text: 'text-lg' },
    lg: { img: 'h-[56px]', icon: 'w-10 h-10', text: 'text-2xl' }
  }

  const sizes = sizeMap[size]

  if (settings?.logo_url && !logoError) {
    return (
      <div className={className}>
        <img 
          src={logoSrc} 
          alt={siteName}
          onError={() => setLogoError(true)}
          className={`${sizes.img} w-auto object-contain transition-opacity duration-300 hover:opacity-80`}
        />
      </div>
    )
  }

  // Fallback with icon and text
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div 
        className={`${sizes.icon} rounded-full flex items-center justify-center shadow-sm`}
        style={{ 
          background: 'rgba(31,77,58,0.06)', 
          border: '1px solid rgba(200,169,107,0.3)' 
        }}
      >
        <Leaf className={`${sizes.icon} text-[#1F4D3A]`} />
      </div>
      {showLabel && (
        <span 
          className={`${sizes.text} font-bold tracking-wide text-[#1F4D3A]`}
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          {siteName}
        </span>
      )}
    </div>
  )
}
