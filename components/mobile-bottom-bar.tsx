import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { Home, UtensilsCrossed, ShoppingBag, MessageCircle } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { motion } from "framer-motion"

const navItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Menu", href: "/products", icon: UtensilsCrossed },
  { name: "Cart", href: "#cart", icon: ShoppingBag },
  { name: "WhatsApp", href: "https://wa.me/918639424039", icon: MessageCircle, external: true },
]

export function MobileBottomBar() {
  const pathname = useLocation().pathname
  const { totalItems, setIsCartOpen } = useCart()

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-xs z-40 md:hidden"
    >
      <div className="flex items-center justify-between px-2 py-3 bg-[#0f0f0f]/90 backdrop-blur-xl border border-white/10 rounded-2xl h-16 shadow-2xl">
        {navItems.map((item, index) => {
          const isActive = item.href === pathname
          const isCart = item.href === "#cart"
          const isWhatsApp = item.external

          if (isCart) {
            return (
              <motion.button
                key={item.name}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsCartOpen(true)}
                className="flex flex-col items-center justify-center relative flex-1 h-full rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className="relative">
                  <item.icon size={20} className="text-[#fef3e2]" />
                  {totalItems > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 w-4 h-4 bg-[#d97706] text-[#0f0f0f] text-[10px] font-bold rounded-full flex items-center justify-center"
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
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center flex-1 h-full rounded-lg hover:bg-[#25D366]/10 transition-colors"
              >
                <item.icon size={20} className="text-[#25D366]" />
              </motion.a>
            )
          }

          return (
            <motion.div
              key={item.name}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center justify-center flex-1 h-full"
            >
              <Link
                to={item.href}
                className={`w-full h-full flex items-center justify-center rounded-lg transition-colors ${
                  isActive ? "bg-white/10 text-[#d97706]" : "text-[#fef3e2]/60 hover:bg-white/5"
                }`}
              >
                <item.icon size={20} />
              </Link>
            </motion.div>
          )
        })}
      </div>
    </motion.nav>
  )
}
