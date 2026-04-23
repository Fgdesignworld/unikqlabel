import { useState } from "react"
import { Link } from 'react-router-dom';
import { motion } from "framer-motion"
import { Phone, MapPin, Instagram, Facebook, Youtube, Crown, Mail, Send } from "lucide-react"
import { Image } from "@/components/ui/image"
import { useSettings } from '@/context/settings-context'

const quickLinks = [
  { name: "Home",        href: "/" },
  { name: "Collections", href: "/products" },
  { name: "Follow Our Style", href: "/#gallery" },
  { name: "About Us",    href: "/about" },
  { name: "Contact",     href: "/contact" },
]

const collections = [
  { name: "King Collection", href: "/snacks" },
  { name: "Queen Collection", href: "/pickles" },
  { name: "UniKQ Essentials", href: "/spices" },
]

const socialLinks = [
  { icon: Instagram, href: "https://www.instagram.com/", label: "Instagram" },
  { icon: Facebook,  href: "",                           label: "Facebook" },
  { icon: Youtube,   href: "",                           label: "Youtube" },
]

export function Footer() {
  const { settings } = useSettings()
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const siteName = settings.site_name    || 'UNIKQ LABEL'
  const logoSrc  = settings.logo_url
    ? (settings.logo_url.startsWith('/') ? `/api${settings.logo_url}` : settings.logo_url)
    : '/logo.png'
  const phone    = settings.phone    || '+91 8639424039'
  const waNum    = (settings.whatsapp || settings.phone || '918639424039').replace(/[^0-9]/g, '')
  const waLink   = `https://wa.me/${waNum}`
  const address  = settings.address  || 'India'
  const settingsEmail = settings.email

  const dynamicSocials = [
    { icon: Instagram, href: settings.social_instagram || '', label: 'Instagram' },
    { icon: Facebook,  href: settings.social_facebook  || '', label: 'Facebook'  },
    { icon: Youtube,   href: settings.social_youtube   || '', label: 'Youtube'   },
  ].filter(s => s.href)

  const footerSocials = dynamicSocials.length ? dynamicSocials : socialLinks.filter(s => s.href)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setSubscribed(true)
      setEmail('')
    }
  }

  return (
    <footer className="pt-16 pb-24 md:pb-8 px-4" style={{
      background: 'var(--surface-card)',
      borderTop: '1px solid rgba(212,175,55,0.08)',
    }}>
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">

          {/* ── Brand Column ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/" className="flex items-center gap-3 mb-5 group">
              <div className="w-40 h-16 overflow-hidden flex-shrink-0" style={{ borderRadius: 0 }}>
                <Image src={logoSrc} alt={siteName} width={240} height={96} className="w-full h-full object-contain" style={{ borderRadius: 0 }} />
              </div>
            </Link>

            {/* <p className="font-body text-sm leading-relaxed mb-6" style={{ color: 'var(--text-subtle)' }}>
              Premium unisex streetwear where kings and queens dress with royal attitude.
            </p> */}

            {/* Social Icons */}
            <div className="flex items-center gap-2.5">
              {footerSocials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:-translate-y-0.5"
                  style={{
                    background: 'rgba(212,175,55,0.06)',
                    border: '1px solid rgba(212,175,55,0.15)',
                    color: 'var(--theme-color)',
                  }}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* ── Quick Links ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h4 className="font-cinzel text-xs font-bold tracking-[0.25em] uppercase mb-5 text-amber-500">Navigate</h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="font-body text-sm transition-colors hover:text-amber-500 flex items-center gap-1.5 group"
                    style={{ color: 'var(--text-dim)' }}>
                    <span className="w-1 h-1 rounded-full bg-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* ── Collections ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h4 className="font-cinzel text-xs font-bold tracking-[0.25em] uppercase mb-5 text-amber-500">Collections</h4>
            <ul className="space-y-2.5">
              {collections.map((col) => (
                <li key={col.name}>
                  <Link to={col.href} className="font-body text-sm transition-colors hover:text-amber-500 flex items-center gap-1.5 group"
                    style={{ color: 'var(--text-dim)' }}>
                    <Crown className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-amber-500" />
                    {col.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* ── Newsletter + Contact ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h4 className="font-cinzel text-xs font-bold tracking-[0.25em] uppercase mb-5 text-amber-500">Stay Royal</h4>

            {/* Newsletter */}
            {!subscribed ? (
              <form onSubmit={handleSubscribe} className="mb-5">
                <p className="font-body text-xs mb-3" style={{ color: 'var(--text-faint)' }}>Get exclusive drops & offers</p>
                <div className="flex rounded-full overflow-hidden border" style={{ borderColor: 'rgba(212,175,55,0.2)', background: 'rgba(212,175,55,0.04)' }}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email"
                    className="flex-1 bg-transparent px-4 py-2.5 text-xs outline-none"
                    style={{ color: 'var(--text-primary)' }}
                    required
                  />
                  <button type="submit" className="px-3 flex items-center justify-center text-amber-500">
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            ) : (
              <div className="mb-5 py-2.5 px-4 rounded-full text-xs font-semibold text-center"
                style={{ background: 'color-mix(in srgb, var(--theme-color) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--theme-color) 20%, transparent)', color: 'var(--theme-color)' }}>
                ✓ You're in the Kingdom!
              </div>
            )}

            {/* Contact info */}
            <div className="space-y-2.5">
              <a href={`tel:${phone.replace(/\s/g, '')}`}
                className="flex items-center gap-2.5 text-xs transition-colors hover:text-amber-500"
                style={{ color: 'var(--text-subtle)' }}>
                <Phone className="w-3.5 h-3.5 flex-shrink-0 text-amber-500" />
                {phone}
              </a>
              {settingsEmail && (
                <a href={`mailto:${settingsEmail}`}
                  className="flex items-center gap-2.5 text-xs transition-colors hover:text-amber-500 break-all"
                  style={{ color: 'var(--text-subtle)' }}>
                  <Mail className="w-3.5 h-3.5 flex-shrink-0 text-amber-500" />
                  {settingsEmail}
                </a>
              )}
              <div className="flex items-start gap-2.5 text-xs" style={{ color: 'var(--text-subtle)' }}>
                <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-500" />
                <span>{address}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Gold divider ── */}
        <div className="h-px mb-6" style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.25), transparent)' }} />

        {/* ── Copyright ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-body text-xs" style={{ color: 'var(--text-trace)' }}>
            © 2026 UNIKQ LABEL. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5">
            <Crown className="w-3 h-3" style={{ color: 'rgba(212,175,55,0.4)' }} />
            <p className="font-body text-xs" style={{ color: 'var(--text-trace)' }}>
              Wear the Crown. Rule Your Style.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
