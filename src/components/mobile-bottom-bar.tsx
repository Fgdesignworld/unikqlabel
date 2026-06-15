import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { Home, LayoutGrid, ShoppingBag, Package } from "lucide-react"
import { WhatsAppIcon } from '@/components/icons/whatsapp'
import { useCart } from "@/context/cart-context"
import { useSettings } from '@/context/settings-context'
import { motion } from "framer-motion"
import { useState, useEffect, useRef } from 'react'

export function MobileBottomBar() {
  const pathname = useLocation().pathname
  const { totalItems, setIsCartOpen } = useCart()
  const { settings } = useSettings()
  
  // Scroll detection for show/hide
  const [isVisible, setIsVisible] = useState(true)
  const lastScrollY = useRef(0)

  // Show on all pages including product detail so mobile bottom bar is available site-wide

  const waNum = (settings?.whatsapp || settings?.phone || '918639424039').replace(/[^0-9]/g, '')

  // Handle scroll event to show/hide footer
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Show footer when scrolling up or near top
      if (currentScrollY < lastScrollY.current || currentScrollY < 50) {
        setIsVisible(true)
      }
      // Hide footer when scrolling down (but not near bottom)
      else if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setIsVisible(false)
      }

      lastScrollY.current = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Collections", href: "/products", icon: LayoutGrid },
    { name: "Track Order", href: "/track", icon: Package, center: true },
    { name: "Cart", href: "#cart", icon: ShoppingBag },
    { name: "WhatsApp", href: `https://wa.me/${waNum}`, icon: WhatsAppIcon, external: true },
  ]

  return (
    <>
      {/* Spacer to prevent content from hiding behind fixed footer when visible */}
      {isVisible && <div className="h-20 md:hidden" />}
      
      <motion.nav
        initial={{ y: 100 }}
        animate={{ y: isVisible ? 0 : 100 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
        style={{ paddingBottom: 'max(0, env(safe-area-inset-bottom))' }}
      >
        <div className="flex items-center justify-between px-1 py-2 bg-[#0f0f0f] border-t border-white/10 h-auto min-h-16 shadow-2xl">
          {navItems.map((item, index) => {
            const isActive = item.href === pathname
            const isCart = item.href === "#cart"
            const isWhatsApp = item.external
            const isCenter = item.center

            if (isCart) {
              return (
                <motion.button
                  key={item.name}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsCartOpen(true)}
                  className="flex flex-col items-center justify-center relative flex-1 py-2 px-1 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <div className="relative">
                    <item.icon size={22} className="text-[#fef3e2]" />
                    {totalItems > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 w-4 h-4 text-[#0f0f0f] text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg"
                        style={{ background: 'var(--theme-color)' }}
                      >
                        {totalItems}
                      </motion.span>
                    )}
                  </div>
                </motion.button>
              )
            }

            if (isWhatsApp) {
              return (
                <motion.a
                  key={item.name}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href={`https://wa.me/${(settings?.whatsapp || settings?.phone || '918639424039').replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-lg hover:bg-[#25D366]/10 transition-colors"
                >
                  <item.icon size={22} className="text-[#25D366]" />
                </motion.a>
              )
            }

            if (isCenter) {
              return (
                <motion.div
                  key={item.name}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center justify-center flex-1"
                >
                  <Link
                    to={item.href}
                    className={`w-full py-2 px-1 flex flex-col items-center justify-center rounded-lg transition-colors ${
                      isActive ? "bg-[#d97706]/20 text-[#d97706]" : "text-[#fef3e2]/60 hover:bg-white/5"
                    }`}
                  >
                    <item.icon size={22} />
                  </Link>
                </motion.div>
              )
            }

            return (
              <motion.div
                key={item.name}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center justify-center flex-1"
              >
                <Link
                  to={item.href}
                  className={`w-full py-2 px-1 flex flex-col items-center justify-center rounded-lg transition-colors ${
                    isActive ? "bg-white/10 text-[#d97706]" : "text-[#fef3e2]/60 hover:bg-white/5"
                  }`}
                >
                  <item.icon size={22} />
                </Link>
              </motion.div>
            )
          })}
        </div>
      </motion.nav>
    </>
  )
}
