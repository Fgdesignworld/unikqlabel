import { useState, useEffect, useMemo } from "react"
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { lockScroll, unlockScroll } from "@/lib/scroll-lock"
import { products as staticProducts, type Product } from "@/data/products"
import { productService } from "@/services/productService"
import { motion, AnimatePresence } from "framer-motion"
import { ShoppingBag, Search, X, Leaf, ChevronRight, ArrowRight } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { useSettings } from "@/context/settings-context"

const navLinks = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Orviv", href: "/orviv" },
  { name: "Aarvia", href: "/aarvia" },
  { name: "Shop", href: "/products" },
  { name: "Journal", href: "/blog" },
  { name: "Sustainability", href: "/sustainability" },
]

const mobileMenuLinks = [
  { name: "Home", href: "/", sub: "Better Living Begins at Home" },
  { name: "About", href: "/about", sub: "Purpose built every day" },
  { name: "Orviv", href: "/orviv", sub: "Inspired by Nature" },
  { name: "Aarvia", href: "/aarvia", sub: "Naturally You" },
  { name: "Shop", href: "/products", sub: "Premium wellness products" },
  { name: "Journal", href: "/blog", sub: "Healthy homes & natural living" },
  { name: "Sustainability", href: "/sustainability", sub: "Responsible choices" },
]

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [logoError, setLogoError] = useState(false)
  const pathname = useLocation().pathname
  const navigate = useNavigate()
  const { totalItems, setIsCartOpen } = useCart()
  const { settings } = useSettings()
  const [allProducts, setAllProducts] = useState<Product[]>(staticProducts)

  // Fetch dynamic products from database
  useEffect(() => {
    productService.getPublicProducts()
      .then(data => {
        if (data && data.length > 0) {
          setAllProducts(data as Product[])
        }
      })
      .catch(() => {})
  }, [])

  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return []
    return allProducts.filter(p => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)).slice(0, 5)
  }, [searchQuery, allProducts])

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`)
      setIsSearchOpen(false)
      setSearchQuery('')
    }
  }

  useEffect(() => {
    if (!isSearchOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false)
        setSearchQuery('')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isSearchOpen])

  const isHeroPage = ['/', '/about', '/products', '/contact'].includes(pathname)

  const siteName = settings.site_name || 'Aarvia'
  const logoSrc = settings.logo_url
    ? (settings.logo_url.startsWith('/') && !settings.logo_url.startsWith('/api') ? `/api${settings.logo_url}` : settings.logo_url)
    : '/logo.png'

  useEffect(() => { setLogoError(false) }, [settings.logo_url])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => { setIsMobileMenuOpen(false) }, [pathname])

  useEffect(() => {
    if (isMobileMenuOpen) lockScroll('mobile-menu')
    else unlockScroll('mobile-menu')
    return () => unlockScroll('mobile-menu')
  }, [isMobileMenuOpen])

  const navTextColor = 'rgba(31,77,58,0.85)'
  const activeNavColor = '#1F4D3A'
  const isLightBg = true

  return (
    <>
      {/* Spacer to push content down below the fixed header */}
      <div className="h-16 lg:h-20 w-full shrink-0" style={{ background: '#FDFBF7' }} />
      
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 w-full z-50 transition-all duration-500"
        style={{
          background: 'rgba(253,251,247,1)',
          borderBottom: '1px solid rgba(200,169,107,0.2)',
          boxShadow: isScrolled ? '0 2px 40px rgba(31,77,58,0.06)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className={`flex items-center justify-between transition-all duration-500 ${isScrolled ? 'h-14 lg:h-16' : 'h-16 lg:h-20'}`}>
            <Link to="/" className="flex items-center gap-2.5 group shrink-0">
              {settings.logo_url && !logoError ? (
                <img src={logoSrc} alt={siteName} onError={() => setLogoError(true)}
                  className={`w-auto object-contain transition-all duration-500 group-hover:opacity-80 ${isScrolled ? 'h-[44px] lg:h-14' : 'h-[52px] lg:h-[68px]'}`}
                  style={{ filter: !isLightBg ? 'brightness(0) invert(1)' : 'none' }} />
              ) : (
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: !isLightBg ? 'rgba(253,251,247,0.12)' : 'rgba(31,77,58,0.07)', border: '1px solid rgba(200,169,107,0.3)' }}>
                    <Leaf className="w-4 h-4" style={{ color: !isLightBg ? '#C8A96B' : '#1F4D3A' }} />
                  </div>
                  <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.25rem', fontWeight: 600, letterSpacing: '0.08em', color: !isLightBg ? '#FDFBF7' : '#1F4D3A' }}>
                    {siteName}
                  </span>
                </div>
              )}
            </Link>

            <nav className="hidden lg:flex items-center gap-0.5">
              {navLinks.map((link) => {
                const isActive = pathname === link.href
                return (
                  <Link key={link.name} to={link.href} className="relative px-4 py-2 group">
                    <span className="text-[14px] font-semibold tracking-wide capitalize transition-all duration-300"
                      style={{ color: isActive ? activeNavColor : navTextColor }}>
                      {link.name}
                    </span>
                    <span className="absolute bottom-0 left-4 right-4 h-px transition-all duration-500"
                      style={{ background: `linear-gradient(90deg,transparent,${activeNavColor},transparent)`, transform: isActive ? 'scaleX(1)' : 'scaleX(0)', transformOrigin: 'center' }} />
                    <span className="absolute bottom-0 left-4 right-4 h-px scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center"
                      style={{ background: `linear-gradient(90deg,transparent,rgba(200,169,107,0.6),transparent)` }} />
                  </Link>
                )
              })}
            </nav>

            <div className="flex items-center gap-1.5 relative">
              {!isSearchOpen && (
                <button onClick={() => setIsSearchOpen(true)}
                  className="hidden md:flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300 hover:scale-105"
                  style={{ background: !isLightBg ? 'rgba(253,251,247,0.1)' : 'rgba(31,77,58,0.05)', border: `1px solid ${!isLightBg ? 'rgba(253,251,247,0.18)' : 'rgba(200,169,107,0.2)'}` }}>
                  <Search className="w-3.5 h-3.5" style={{ color: !isLightBg ? '#FDFBF7' : '#1F4D3A' }} />
                </button>
              )}

              <AnimatePresence>
                {isSearchOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, x: 20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95, x: 20 }}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-50 flex items-center bg-[#FDFBF7] border border-[#C8A96B] px-3.5 py-2 rounded-full w-80 lg:w-[400px]"
                    style={{ transformOrigin: 'right center' }}
                  >
                    <Search className="w-4 h-4 text-[#1F4D3A] opacity-60 mr-2.5 shrink-0" />
                    <input
                      autoFocus
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products, ingredients..."
                      className="bg-transparent text-xs text-[#1F4D3A] outline-none w-full font-sans"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSearchSubmit()
                        }
                      }}
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery('')} className="p-1 text-[#1F4D3A] opacity-60 hover:opacity-100 shrink-0 cursor-pointer">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button onClick={() => { setIsSearchOpen(false); setSearchQuery('') }} className="p-1 ml-1.5 border-l border-[#C8A96B]/30 pl-2 text-[#1F4D3A] opacity-60 hover:opacity-100 shrink-0 cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>

                    {/* Dropdown Results */}
                    {searchQuery.trim().length > 0 && (
                      <div className="absolute top-[calc(100%+12px)] right-0 w-full bg-[#FDFBF7] border border-[#C8A96B] shadow-2xl rounded-2xl overflow-hidden z-50 flex flex-col py-3">
                        {/* Matching Products */}
                        {filteredProducts.length > 0 ? (
                          <>
                            <div className="px-4 py-1.5 text-[10px] font-bold tracking-wider text-[#C8A96B] uppercase border-b border-[#C8A96B]/15 pb-2 mb-2">
                              Products Found ({filteredProducts.length})
                            </div>
                            <div className="max-h-60 overflow-y-auto px-2">
                              {filteredProducts.map(p => (
                                <Link
                                  key={p.id}
                                  to={`/products/${p.id}`}
                                  onClick={() => { setIsSearchOpen(false); setSearchQuery('') }}
                                  className="flex items-center gap-3.5 px-3 py-2.5 hover:bg-[#1F4D3A]/5 transition-colors group rounded-xl"
                                >
                                  <div className="w-10 h-10 rounded-lg bg-[#1F4D3A]/5 overflow-hidden shrink-0 border border-[#C8A96B]/15">
                                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-[#1F4D3A] truncate">{p.name}</p>
                                    <p className="text-[10px] text-[#6A6A60]">{p.weight}</p>
                                  </div>
                                                                  {p.discount_price && p.discount_price > 0 && p.discount_price < p.price ? (
                                    <div className="flex flex-col items-end shrink-0 leading-none gap-0.5">
                                      <span className="text-xs font-bold text-[#1F4D3A]">₹{p.discount_price}</span>
                                      <span className="text-[9px] text-[#9A9A8F] line-through">₹{p.price}</span>
                                    </div>
                                  ) : (
                                    <span className="text-xs font-bold text-[#1F4D3A] shrink-0">₹{p.price}</span>
                                  )}
                                </Link>
                              ))}
                            </div>
                            <div className="border-t border-[#C8A96B]/10 mt-2.5 pt-2.5 px-3.5">
                              <button
                                onClick={handleSearchSubmit}
                                className="w-full text-center py-3 text-[10px] font-bold tracking-widest uppercase bg-[#1F4D3A] text-[#FDFBF7] hover:opacity-90 transition-all rounded-xl cursor-pointer"
                              >
                                View All Results
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="px-4 py-8 text-center text-xs text-[#6A6A60]">
                            No products matching "{searchQuery}"
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <button onClick={() => setIsCartOpen(true)}
                className="flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300 hover:scale-105 relative"
                style={{ background: !isLightBg ? 'rgba(253,251,247,0.1)' : 'rgba(31,77,58,0.05)', border: `1px solid ${!isLightBg ? 'rgba(253,251,247,0.18)' : 'rgba(200,169,107,0.2)'}` }}
                aria-label="Open cart">
                <ShoppingBag className="w-3.5 h-3.5" style={{ color: !isLightBg ? '#FDFBF7' : '#1F4D3A' }} />
                <AnimatePresence>
                  {totalItems > 0 && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center"
                      style={{ background: '#C8A96B', color: '#1A1A1A' }}>
                      {totalItems}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              <Link to="/products"
                className="hidden lg:flex items-center gap-1.5 ml-2 px-5 py-2.5 transition-all duration-400 hover:-translate-y-px"
                style={{
                  background: !isLightBg ? 'rgba(200,169,107,0.15)' : '#1F4D3A',
                  color: !isLightBg ? '#C8A96B' : '#FDFBF7',
                  border: `1px solid ${!isLightBg ? 'rgba(200,169,107,0.4)' : 'transparent'}`,
                  fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
                  backdropFilter: !isLightBg ? 'blur(8px)' : 'none',
                }}>
                Shop Now
                <ArrowRight className="w-3 h-3" />
              </Link>

              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden flex flex-col items-center justify-center w-9 h-9 gap-1.25 rounded-full transition-all duration-300"
                style={{ background: !isLightBg ? 'rgba(253,251,247,0.1)' : 'rgba(31,77,58,0.05)', border: `1px solid ${!isLightBg ? 'rgba(253,251,247,0.18)' : 'rgba(200,169,107,0.2)'}` }}>
                <motion.span animate={{ rotate: isMobileMenuOpen ? 45 : 0, y: isMobileMenuOpen ? 6 : 0 }} className="block w-4 h-px rounded-full"
                  style={{ background: !isLightBg ? '#FDFBF7' : '#1F4D3A' }} />
                <motion.span animate={{ opacity: isMobileMenuOpen ? 0 : 1 }} className="block w-2.5 h-px rounded-full self-start ml-3"
                  style={{ background: '#C8A96B' }} />
                <motion.span animate={{ rotate: isMobileMenuOpen ? -45 : 0, y: isMobileMenuOpen ? -6 : 0 }} className="block w-4 h-px rounded-full"
                  style={{ background: !isLightBg ? '#FDFBF7' : '#1F4D3A' }} />
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Search overlay removed in favor of floating absolute header search */}

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 lg:hidden" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
              onClick={() => setIsMobileMenuOpen(false)} />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-90 z-50 lg:hidden flex flex-col overflow-hidden"
              style={{ background: '#FDFBF7', borderLeft: '1px solid rgba(200,169,107,0.2)' }}>
              <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: 'rgba(200,169,107,0.15)' }}>
                <Link to="/" className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'rgba(31,77,58,0.07)', border: '1px solid rgba(200,169,107,0.25)' }}>
                    <Leaf className="w-3.5 h-3.5" style={{ color: '#1F4D3A' }} />
                  </div>
                  <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.125rem', fontWeight: 600, letterSpacing: '0.06em', color: '#1F4D3A' }}>{siteName}</span>
                </Link>
                <button onClick={() => setIsMobileMenuOpen(false)} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#1F4D3A]/5 transition-all" style={{ border: '1px solid rgba(200,169,107,0.2)' }}>
                  <X className="w-4 h-4" style={{ color: '#1F4D3A' }} />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-5 pt-6 pb-8">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-4 px-1" style={{ color: '#C8A96B' }}>Navigation</p>
                <div className="space-y-0.5">
                  {mobileMenuLinks.map((link, i) => {
                    const isActive = pathname === link.href
                    return (
                      <motion.div key={link.name} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 + i * 0.04 }}>
                        <Link to={link.href}
                          className="flex items-center justify-between py-3.5 px-4 rounded-xl group transition-all duration-300 hover:bg-[#1F4D3A]/4"
                          style={{ borderLeft: isActive ? '2px solid #C8A96B' : '2px solid transparent', background: isActive ? 'rgba(31,77,58,0.05)' : 'transparent' }}>
                          <div>
                            <p className="text-sm font-semibold" style={{ color: isActive ? '#1F4D3A' : '#2C2C2C' }}>{link.name}</p>
                            <p className="text-[11px] mt-0.5" style={{ color: '#9A9A8F' }}>{link.sub}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 opacity-25 group-hover:opacity-50 transition-opacity" style={{ color: '#1F4D3A' }} />
                        </Link>
                      </motion.div>
                    )
                  })}
                </div>
                <div className="mt-8 pt-6 border-t" style={{ borderColor: 'rgba(200,169,107,0.15)' }}>
                  <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-4 px-1" style={{ color: '#C8A96B' }}>Our Promise</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[{ v: '100%', l: 'Natural' }, { v: 'Cruelty', l: 'Free' }, { v: 'Premium', l: 'Quality' }, { v: 'Pure', l: 'Botanicals' }].map(({ v, l }) => (
                      <div key={l} className="flex flex-col items-center p-3.5 rounded-xl" style={{ background: 'rgba(31,77,58,0.04)', border: '1px solid rgba(200,169,107,0.1)' }}>
                        <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1rem', fontWeight: 700, color: '#1F4D3A' }}>{v}</span>
                        <span className="text-[10px] font-medium mt-0.5 tracking-wider uppercase" style={{ color: '#9A9A8F' }}>{l}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </nav>

              <div className="px-5 py-5 border-t" style={{ borderColor: 'rgba(200,169,107,0.15)' }}>
                <button onClick={() => { setIsCartOpen(true); setIsMobileMenuOpen(false) }}
                  className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{ background: '#1F4D3A', color: '#FDFBF7', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  <ShoppingBag className="w-4 h-4" />
                  Bag{totalItems > 0 ? ` (${totalItems})` : ''}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}