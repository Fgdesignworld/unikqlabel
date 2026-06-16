import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Phone, MapPin, Mail, Leaf, ArrowRight } from "lucide-react"
import { useSettings } from "@/context/settings-context"

const LINKS_EXPLORE = [
  { name: "Home Wellness", href: "/shop" },
  { name: "Our Story", href: "/our-story" },
  { name: "Blog", href: "/blog" },
  { name: "Contact Us", href: "/contact" },
]

const LINKS_JOURNAL = [
  { name: "Wellness Begins at Home", href: "/blog" },
  { name: "Simple Home Care Habits", href: "/blog" },
  { name: "Creating Fresher Spaces", href: "/blog" },
  { name: "Choosing Clean Products", href: "/blog" },
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
  const address = settings.address || 'Hyderabad, Telangana, India'
  const email = settings.email || 'care@aarvia.co'

  // Connect settings API for social media links — only show them if link exists
  const socialLinks = []
  if (settings.social_instagram) {
    socialLinks.push({
      name: 'Instagram',
      href: settings.social_instagram,
      svg: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
        </svg>
      )
    })
  }
  if (settings.social_facebook) {
    socialLinks.push({
      name: 'Facebook',
      href: settings.social_facebook,
      svg: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M22.675 0h-21.35C.597 0 0 .597 0 1.336v21.328C0 23.403.597 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.325-.597 1.325-1.336V1.336C24 .597 23.403 0 22.675 0z"/>
        </svg>
      )
    })
  }
  if (settings.social_youtube) {
    socialLinks.push({
      name: 'YouTube',
      href: settings.social_youtube,
      svg: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      )
    })
  }
  if (settings.social_twitter) {
    socialLinks.push({
      name: 'Twitter',
      href: settings.social_twitter,
      svg: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      )
    })
  }

  return (
    <footer 
      className="mx-4 lg:mx-8 mb-6 mt-16 rounded-[32px] md:rounded-[48px] overflow-hidden border border-[#C8A96B]/15 relative shadow-[0_20px_50px_rgba(0,0,0,0.18)]"
      style={{ background: '#0F241B' }}
    >
      {/* Inset elegant gold border framing patterns */}
      <div className="absolute inset-3.5 md:inset-5 rounded-[22px] md:rounded-[38px] border border-[#C8A96B]/5 pointer-events-none z-0" />
      <div className="absolute inset-4.5 md:inset-6 rounded-[20px] md:rounded-[36px] border border-[#C8A96B]/10 pointer-events-none z-0" />

      {/* ── Background Patterns ── */}
      <div className="absolute inset-0 opacity-[0.035] pointer-events-none" 
        style={{ 
          backgroundImage: 'linear-gradient(rgba(200,169,107,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(200,169,107,0.12) 1px, transparent 1px), radial-gradient(circle at 1px 1px, rgba(200,169,107,0.8) 1px, transparent 0)', 
          backgroundSize: '40px 40px, 40px 40px, 24px 24px' 
        }} 
      />
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
            {socialLinks.length > 0 && (
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
            )}
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