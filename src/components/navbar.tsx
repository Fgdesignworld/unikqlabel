

import { useState, useEffect } from "react"
import { ImgHTMLAttributes } from 'react';
const Image = (props: ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean, fill?: boolean, quality?: number }) => <img {...props} />;
import { Link } from 'react-router-dom';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, ShoppingBag, Phone, ChevronDown } from "lucide-react"
import { WhatsAppIcon } from "@/components/icons/whatsapp"
import { useCart } from "@/context/cart-context"

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Products", href: "/products" },
  { name: "Snacks", href: "/snacks" },
  { name: "Pickles", href: "/pickles" },
  { name: "Spices", href: "/spices" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
]

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = useLocation().pathname
  const { totalItems, setIsCartOpen } = useCart()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  return (
    <>

      {/* Main Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.45 }}
        className={`fixed top-0 left-0 w-full z-40 transition-all duration-400 ${isScrolled
          ? "py-2 bg-[#0f0f0f]/80 backdrop-blur-xl border-b border-[#d97706]/10 shadow-2xl"
          : "py-2 bg-transparent"
          }`}
      >
        <div className="w-full max-w-7xl mx-auto px-3 flex items-center justify-between">
          <nav className="flex items-center justify-between w-full">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className={`relative transition-all duration-300 ${isScrolled ? "w-10 h-10" : "w-12 h-12"} rounded-full overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-br from-[#d97706]/20 to-[#f59e0b]/20 rounded-full blur-md group-hover:blur-lg transition-all" />
                <Image
                  src="/logo.png"
                  alt="Lakshmi Home Foods"
                  width={56}
                  height={56}
                  className="relative w-full h-full object-cover rounded-full"
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="font-serif text-xl font-bold text-[#fef3e2] group-hover:text-[#f59e0b] transition-colors">
                  Lakshmi Home Foods
                </h1>
                <div className="flex items-center gap-2">
                  <p className="text-[#d97706] text-xs tracking-widest uppercase">Pure Taste of Tradition</p>
                </div>
              </div>
            </Link>

            {/* Desktop Navigation - Centered Pill */}
            <div className="hidden lg:flex items-center bg-white/5 backdrop-blur-md rounded-full px-6 py-2.5 border border-white/10 gap-4 absolute left-1/2 transform -translate-x-1/2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    className={`text-[16px] px-1 py-0 tracking-[0.12em] font-medium transition-all hover:text-[#f59e0b] relative group ${isActive ? "text-[#d97706]" : "text-[#fef3e2]/70"
                      }`}
                  >
                    {link.name}
                    <span className={`absolute -bottom-1 left-0 h-[1.5px] bg-[#d97706] transition-all duration-300 ${isActive ? "w-full" : "w-0 group-hover:w-full"
                      }`} />
                  </Link>
                )
              })}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 lg:gap-3">
              {/* WhatsApp - Desktop */}
              <a
                href="https://wa.me/918639424039"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:flex items-center justify-center w-9 h-9 bg-[#25D366] hover:bg-[#20BA60] rounded-md border border-[#25D366]/50 transition-all relative hover:shadow-md hover:shadow-[#25D366]/20"
              >
                <WhatsAppIcon className="w-5 h-5 text-white" />
              </a>

              {/* Cart - Desktop (open sidebar) */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="hidden md:flex items-center justify-center w-9 h-9 bg-white/5 hover:bg-white/10 rounded-md border border-white/10 transition-all relative"
                aria-label="Open cart"
              >
                <ShoppingBag size={16} className="text-[#fef3e2]" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#d97706] text-[#0f0f0f] text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden flex items-center justify-center w-9 h-9 bg-white/5 hover:bg-white/10 rounded-md border border-white/10 transition-all"
              >
                {isMobileMenuOpen ? (
                  <X size={18} className="text-[#fef3e2]" />
                ) : (
                  <Menu size={18} className="text-[#fef3e2]" />
                )}
              </button>
            </div>
          </nav>
        </div>

        {/* Traditional Border Accent */}
        <div className={`h-px bg-gradient-to-r from-transparent  to-transparent transition-opacity duration-300 ${isScrolled ? "opacity-70" : "opacity-0"
          }`} />
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-[#0f0f0f] border-l border-[#d97706]/20 z-40 lg:hidden overflow-y-auto"
            >
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-3">
                  <Image src="/logo.png" alt="Logo" width={40} height={40} />
                  <div>
                    <p className="font-serif font-bold text-[#fef3e2]">Lakshmi Home Foods</p>
                    <p className="text-xs text-[#d97706]">Menu</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10"
                >
                  <X className="w-5 h-5 text-[#fef3e2]" />
                </button>
              </div>

              {/* Mobile Nav Links */}
              <nav className="p-6">
                <div className="space-y-2">
                  {navLinks.map((link, index) => {
                    const isActive = pathname === link.href
                    return (
                      <motion.div
                        key={link.name}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link
                          to={link.href}
                          className={`flex items-center justify-between py-4 px-4 rounded-xl transition-all ${isActive
                            ? "bg-gradient-to-r from-[#d97706] to-[#f59e0b] text-[#0f0f0f] font-semibold"
                            : "text-[#fef3e2] hover:bg-[#d97706]/10"
                            }`}
                        >
                          <span>{link.name}</span>
                          {isActive && (
                            <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
                          )}
                        </Link>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Mobile CTA */}
                <div className="mt-8 space-y-3">
                  <a
                    href="https://wa.me/918639424039"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-white font-semibold rounded-xl"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Order on WhatsApp
                  </a>
                  <a
                    href="tel:+919876543210"
                    className="flex items-center justify-center gap-2 w-full py-4 bg-[#d97706]/10 text-[#d97706] font-semibold rounded-xl border border-[#d97706]/30"
                  >
                    <Phone className="w-5 h-5" />
                    Call Us
                  </a>
                </div>

                {/* Trust Badges */}
                <div className="mt-8 pt-6 border-t border-[#d97706]/10">
                  <p className="text-xs text-[#fef3e2]/50 text-center mb-4">Why Choose Us</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 rounded-lg bg-[#d97706]/5">
                      <p className="text-[#d97706] font-bold text-lg">100%</p>
                      <p className="text-xs text-[#fef3e2]/70">Homemade</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-[#d97706]/5">
                      <p className="text-[#d97706] font-bold text-lg">500+</p>
                      <p className="text-xs text-[#fef3e2]/70">Happy Customers</p>
                    </div>
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
