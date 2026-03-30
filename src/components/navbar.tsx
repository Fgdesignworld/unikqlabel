import { useState, useEffect } from "react"
import { Link } from 'react-router-dom';
import { lockScroll, unlockScroll } from "@/lib/scroll-lock"
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, ShoppingBag, Crown, ChevronDown } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { Image } from "@/components/ui/image"
import { useSettings } from "@/context/settings-context"

const navLinks = [
  { name: "Home",        href: "/" },
  { name: "Collections", href: "/products" },
  { name: "Men",         href: "/men" },
  { name: "Women",       href: "/women" },
  { name: "About",       href: "/about" },
  { name: "Contact",     href: "/contact" },
  { name: "Track Order", href: "/track" },
]

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = useLocation().pathname
  const { totalItems, setIsCartOpen } = useCart()
  const { settings } = useSettings()

  const siteName  = settings.site_name    || 'UNIKQ LABEL'
  const logoSrc   = settings.logo_url
    ? (settings.logo_url.startsWith('/') ? `/api${settings.logo_url}` : settings.logo_url)
    : '/logo.png'
  const waNumber  = (settings.whatsapp || settings.phone || '918639424039').replace(/[^0-9]/g, '')
  const waLink    = `https://wa.me/${waNumber}`

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => { setIsMobileMenuOpen(false) }, [pathname])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      lockScroll('mobile-menu')
    } else {
      unlockScroll('mobile-menu')
    }
    return () => { unlockScroll('mobile-menu') }
  }, [isMobileMenuOpen])

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 w-full z-40 transition-all duration-400 ${isScrolled
          ? "py-3 backdrop-blur-xl"
          : "py-0 bg-transparent"
        }`}
        style={isScrolled ? {
          borderBottom: '1px solid rgba(212,175,55,0.12)',
          background: 'rgba(13,13,13,0.88)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
        } : {}}
      >
        <div className="w-full max-w-7xl mx-auto px-4 flex items-center justify-between">
          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className={`relative transition-all duration-300 ${isScrolled ? "w-auto h-12" : "w-auto h-14"} overflow-hidden`} style={{ borderRadius: 0, minHeight: isScrolled ? 40 : 50, marginTop: isScrolled ? 0 : 20 }}>
              <div className="absolute inset-0" style={{
                background: 'radial-gradient(circle, rgba(212,175,55,0.18) 0%, transparent 70%)',
                filter: 'blur(8px)',
              }} />
              <Image src={logoSrc} alt={siteName} className="relative h-full w-auto object-contain" style={{ borderRadius: 0, height: isScrolled ? 40 : 50, width: 'auto' }} />
            </div>

          </Link>

          {/* ── Desktop Nav ── */}
          <div className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2"
            style={{
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(212,175,55,0.10)',
              borderRadius: '9999px',
              padding: '8px 24px',
            }}>
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`text-[13px] px-3 py-1 tracking-[0.10em] font-medium uppercase transition-all relative group ${
                    isActive ? "" : "hover:opacity-100"
                  }`}
                  style={{ color: isActive ? 'var(--theme-color)' : 'rgba(245,240,232,0.65)' }}
                >
                  {link.name}
                  <span className="absolute -bottom-0.5 left-0 h-[1.5px] rounded-full transition-all duration-300"
                    style={{
                      width: isActive ? '100%' : '0',
                      background: 'linear-gradient(90deg, var(--theme-color), color-mix(in srgb, var(--theme-color) 90%, white))',
                    }}
                  />
                  {!isActive && (
                    <span className="absolute -bottom-0.5 left-0 h-[1.5px] rounded-full transition-all duration-300 w-0 group-hover:w-full"
                      style={{ background: 'linear-gradient(90deg, var(--theme-color), color-mix(in srgb, var(--theme-color) 90%, white))' }} />
                  )}
                </Link>
              )
            })}
          </div>

          {/* ── Right Actions ── */}
          <div className="flex items-center gap-2">
            {/* Cart button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="hidden md:flex items-center justify-center w-9 h-9 rounded-full border transition-all relative group"
              aria-label="Open cart"
              style={{
                background: 'rgba(212,175,55,0.06)',
                borderColor: 'rgba(212,175,55,0.2)',
              }}
            >
              <ShoppingBag size={15} className="text-amber-500" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center bg-amber-500 text-[#0D0D0D]">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Shop CTA */}
            <Link
              to="/products"
              className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all"
              style={{
                background: 'linear-gradient(135deg, var(--theme-color), color-mix(in srgb, var(--theme-color) 70%, black))',
                color: '#0D0D0D',
              }}
            >
              <Crown size={12} />
              Shop
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden flex items-center justify-center w-9 h-9 rounded-full border transition-all"
              style={{ background: 'rgba(212,175,55,0.06)', borderColor: 'rgba(212,175,55,0.2)' }}
            >
              {isMobileMenuOpen
                ? <X size={16} className="text-amber-500" />
                : <Menu size={16} className="text-amber-500" />
              }
            </button>
          </div>
        </div>

        {/* Gold accent line */}

      </motion.header>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-30 lg:hidden"
              style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
            />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] z-40 lg:hidden overflow-y-auto"
              style={{ background: '#0D0D0D', borderLeft: '1px solid rgba(212,175,55,0.15)' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-3 border-b"
                style={{ borderColor: 'rgba(212,175,55,0.10)', background: 'rgba(212,175,55,0.03)' }}>
                <Link to="/" className="flex items-center gap-3">
                  <div className="overflow-hidden" style={{ borderRadius: 0, minHeight: 60, marginTop: isScrolled ? 0 : 20 }}>
                    <Image src={logoSrc} alt={siteName} className="h-14 w-auto object-contain" style={{ borderRadius: 0, height: 50, width: 'auto' }} />
                  </div>
                </Link>
                <button onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-full border border-amber-500/20 text-amber-500">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Links */}
              <nav className="p-5">
                <div className="space-y-1">
                  {navLinks.map((link, index) => {
                    const isActive = pathname === link.href
                    return (
                      <motion.div key={link.name} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}>
                        <Link
                          to={link.href}
                          className="flex items-center justify-between py-3.5 px-4 rounded-xl transition-all font-medium text-sm uppercase tracking-wider"
                          style={isActive
                            ? { background: 'linear-gradient(135deg, color-mix(in srgb, var(--theme-color) 15%, transparent), color-mix(in srgb, var(--theme-color) 5%, transparent))', color: 'var(--theme-color)', borderLeft: '2px solid var(--theme-color)' }
                            : { color: 'rgba(245,240,232,0.7)' }
                          }
                        >
                          <span>{link.name}</span>
                          {isActive && <ChevronDown className="w-3 h-3 -rotate-90" />}
                        </Link>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Mobile CTAs */}
                <div className="mt-6 space-y-3">
                  <button
                    onClick={() => { setIsCartOpen(true); setIsMobileMenuOpen(false); }}
                    className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider"
                    style={{ background: 'linear-gradient(135deg, var(--theme-color), color-mix(in srgb, var(--theme-color) 70%, black))', color: '#0D0D0D' }}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Cart {totalItems > 0 && `(${totalItems})`}
                  </button>
                </div>

                {/* Stats */}
                <div className="mt-6 pt-5 border-t" style={{ borderColor: 'rgba(212,175,55,0.08)' }}>
                  <p className="text-[10px] tracking-widest uppercase mb-3 text-center" style={{ color: 'rgba(245,240,232,0.35)' }}>Why UNIKQ</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[{ v: 'Premium', l: 'Quality' }, { v: 'Limited', l: 'Drops' }, { v: 'Unisex', l: 'Fashion' }, { v: 'Royal', l: 'Style' }].map(({ v, l }) => (
                      <div key={l} className="text-center p-3 rounded-lg" style={{ background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.08)' }}>
                        <p className="font-bold text-sm text-amber-500">{v}</p>
                        <p className="text-[10px] mt-0.5" style={{ color: 'rgba(245,240,232,0.5)' }}>{l}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
