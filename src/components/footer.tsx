import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Phone, MapPin, Mail, Leaf, ArrowRight } from "lucide-react"
import { useSettings } from "@/context/settings-context"

const LINKS_EXPLORE = [
  { name: "Shop All", href: "/shop" },
  { name: "Hair Care", href: "/hair-care" },
  { name: "Body Care", href: "/body-care" },
  { name: "Best Sellers", href: "/best-sellers" },
]

const LINKS_JOURNAL = [
  { name: "Botanical Journal", href: "/our-story" },
  { name: "Press & Media", href: "/our-story" },
  { name: "Scientific Research", href: "/our-story" },
  { name: "Wellness Articles", href: "/our-story" },
]

const LINKS_COMPANY = [
  { name: "Our Story", href: "/our-story" },
  { name: "Sustainability", href: "/sustainability" },
  { name: "Contact Us", href: "/contact" },
  { name: "Track Order", href: "/track" },
]

export function Footer() {
  const { settings } = useSettings()
  const [logoError, setLogoError] = useState(false)

  useEffect(() => { setLogoError(false) }, [settings.logo_url])

  const siteName = settings.site_name || 'Aarvia'
  const logoSrc = settings.logo_url
    ? (settings.logo_url.startsWith('/') && !settings.logo_url.startsWith('/api') ? `/api${settings.logo_url}` : settings.logo_url)
    : '/logo.png'
  const phone = settings.phone || ''
  const address = settings.address || ''
  const email = settings.email || ''

  // Elegant fallback social SVG links to ensure premium look is always active
  const socialLinks = [
    { 
      name: 'Instagram', 
      href: settings.social_instagram || 'https://instagram.com/aarvia', 
      svg: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
        </svg>
      )
    },
    { 
      name: 'Pinterest', 
      href: 'https://pinterest.com/aarvia', 
      svg: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.172.266-.398.161-1.488-.693-2.418-2.871-2.418-4.62 0-3.762 2.735-7.218 7.884-7.218 4.14 0 7.354 2.95 7.354 6.89 0 4.112-2.593 7.42-6.19 7.42-1.208 0-2.345-.628-2.733-1.366l-.747 2.846c-.27 1.029-.997 2.32-1.486 3.12 1.12.345 2.308.53 3.543.53 6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
        </svg>
      )
    },
    { 
      name: 'Facebook', 
      href: settings.social_facebook || 'https://facebook.com/aarvia', 
      svg: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M22.675 0h-21.35C.597 0 0 .597 0 1.336v21.328C0 23.403.597 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.325-.597 1.325-1.336V1.336C24 .597 23.403 0 22.675 0z"/>
        </svg>
      )
    },
    { 
      name: 'YouTube', 
      href: settings.social_youtube || 'https://youtube.com/aarvia', 
      svg: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      )
    },
    { 
      name: 'TikTok', 
      href: 'https://tiktok.com/@aarvia', 
      svg: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.74-3.98-1.72-.08-.07-.15-.14-.23-.21v6.79c.04 2.25-.7 4.54-2.24 6.22-1.72 1.94-4.39 2.97-6.99 2.68-2.83-.28-5.4-2.13-6.52-4.78-1.33-3.05-.67-6.93 1.64-9.25 1.72-1.77 4.31-2.58 6.74-2.16v4.13c-1.24-.18-2.55.15-3.47.98-.98.88-1.32 2.33-.94 3.57.37 1.25 1.57 2.19 2.87 2.22 1.34.07 2.69-.8 3.12-2.07.16-.49.22-1 .21-1.52V.02z"/>
        </svg>
      )
    }
  ]

  return (
    <footer 
      className="mx-4 lg:mx-8 mb-6 mt-16 rounded-[32px] md:rounded-[48px] overflow-hidden border border-[#C8A96B]/15 relative shadow-[0_20px_50px_rgba(0,0,0,0.18)]"
      style={{ background: '#0F241B' }}
    >
      {/* ── Background Patterns ── */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(200,169,107,0.9) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
      <div className="absolute bottom-0 right-0 w-[450px] h-[450px] rounded-full blur-[150px] opacity-[0.05] pointer-events-none" style={{ background: '#C8A96B' }} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-20 pb-14 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">

          {/* Brand & Social Column */}
          <div className="md:col-span-2 lg:col-span-1 space-y-6 lg:pr-4">
            <Link to="/" className="flex items-center gap-2.5 group">
              {settings.logo_url && !logoError ? (
                <img src={logoSrc} alt={siteName} onError={() => setLogoError(true)}
                  className="h-10 w-auto object-contain transition-opacity duration-300 group-hover:opacity-85" style={{ filter: 'brightness(0) invert(1)' }} />
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-8.5 h-8.5 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(200,169,107,0.12)', border: '1px solid rgba(200,169,107,0.25)' }}>
                    <Leaf className="w-4 h-4" style={{ color: '#C8A96B' }} />
                  </div>
                  <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.35rem', fontWeight: 600, letterSpacing: '0.07em', color: '#F7F4ED' }}>
                    {siteName}
                  </span>
                </div>
              )}
            </Link>
            
            <p className="text-xs leading-relaxed" style={{ color: 'rgba(247,244,237,0.55)', fontFamily: "'Plus Jakarta Sans',sans-serif", lineHeight: 1.8 }}>
              Premium natural wellness, inspired by nature's wisdom. Crafted for those who choose transparency, sustainability, and quality.
            </p>

            {/* Custom minimalist Social Links */}
            <div className="flex items-center gap-2.5 pt-2">
              {socialLinks.map(({ name, href, svg }) => (
                <a 
                  key={name} 
                  href={href} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label={name}
                  className="w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-300 hover:scale-110 active:scale-95 group"
                  style={{ 
                    background: 'rgba(200,169,107,0.06)', 
                    borderColor: 'rgba(200,169,107,0.15)',
                    color: 'rgba(247,244,237,0.6)' 
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#C8A96B';
                    e.currentTarget.style.color = '#C8A96B';
                    e.currentTarget.style.background = 'rgba(200,169,107,0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(200,169,107,0.15)';
                    e.currentTarget.style.color = 'rgba(247,244,237,0.6)';
                    e.currentTarget.style.background = 'rgba(200,169,107,0.06)';
                  }}
                >
                  {svg}
                </a>
              ))}
            </div>
          </div>

          {/* Explore Column */}
          <div className="space-y-5">
            <p className="text-[10px] font-bold tracking-[0.25em] uppercase" style={{ color: '#C8A96B' }}>Explore</p>
            <ul className="space-y-3">
              {LINKS_EXPLORE.map(l => (
                <li key={l.name}>
                  <Link to={l.href} className="text-xs transition-all duration-300 hover:text-[#C8A96B] hover:translate-x-1 inline-block"
                    style={{ color: 'rgba(247,244,237,0.6)', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Journal & Editorial Column */}
          <div className="space-y-5">
            <p className="text-[10px] font-bold tracking-[0.25em] uppercase" style={{ color: '#C8A96B' }}>Journal</p>
            <ul className="space-y-3">
              {LINKS_JOURNAL.map(l => (
                <li key={l.name}>
                  <Link to={l.href} className="text-xs transition-all duration-300 hover:text-[#C8A96B] hover:translate-x-1 inline-block"
                    style={{ color: 'rgba(247,244,237,0.6)', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div className="space-y-5">
            <p className="text-[10px] font-bold tracking-[0.25em] uppercase" style={{ color: '#C8A96B' }}>Company</p>
            <ul className="space-y-3">
              {LINKS_COMPANY.map(l => (
                <li key={l.name}>
                  <Link to={l.href} className="text-xs transition-all duration-300 hover:text-[#C8A96B] hover:translate-x-1 inline-block"
                    style={{ color: 'rgba(247,244,237,0.6)', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div className="space-y-5">
            <p className="text-[10px] font-bold tracking-[0.25em] uppercase" style={{ color: '#C8A96B' }}>Contact</p>
            <ul className="space-y-4">
              {phone && (
                <li className="flex items-start gap-3">
                  <Phone className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: 'rgba(200,169,107,0.6)' }} />
                  <a href={`tel:${phone}`} className="text-xs transition-colors duration-300 hover:text-[#C8A96B]"
                    style={{ color: 'rgba(247,244,237,0.6)', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{phone}</a>
                </li>
              )}
              {email && (
                <li className="flex items-start gap-3">
                  <Mail className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: 'rgba(200,169,107,0.6)' }} />
                  <a href={`mailto:${email}`} className="text-xs transition-colors duration-300 hover:text-[#C8A96B]"
                    style={{ color: 'rgba(247,244,237,0.6)', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{email}</a>
                </li>
              )}
              {address && (
                <li className="flex items-start gap-3">
                  <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: 'rgba(200,169,107,0.6)' }} />
                  <span className="text-xs leading-relaxed" style={{ color: 'rgba(247,244,237,0.48)', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{address}</span>
                </li>
              )}
            </ul>
            <div className="pt-2">
              <Link to="/contact"
                className="inline-flex items-center gap-2.5 text-[10px] font-bold tracking-widest uppercase transition-all duration-300 hover:gap-4 hover:text-[#e5c27f]"
                style={{ color: '#C8A96B' }}>
                Get in Touch <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar Divider */}
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#C8A96B]/15 to-transparent my-10" />

        {/* Bottom Credits */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px]" style={{ color: 'rgba(247,244,237,0.3)', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            &copy; {new Date().getFullYear()} {siteName}. All rights reserved.
          </p>
          <p className="text-[10px] italic font-serif" style={{ color: 'rgba(247,244,237,0.22)' }}>
            Inspired by Nature. Crafted with Integrity.
          </p>
        </div>
      </div>
    </footer>
  )
}