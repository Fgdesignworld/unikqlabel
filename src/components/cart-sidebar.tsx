

import { motion, AnimatePresence } from "framer-motion"
import { useEffect } from "react"
import { Link } from 'react-router-dom';
import { lockScroll, unlockScroll } from "@/lib/scroll-lock"
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, TrendingUp, Zap } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { useSettings } from "@/context/settings-context"
import { useDelivery } from "@/hooks/use-delivery"
import { Image } from "@/components/ui/image"

export function CartSidebar() {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeItem,
    updateQuantity,
    totalPrice,
    clearCart
  } = useCart()
  const { settings } = useSettings()
  const { rule: deliveryRule, calculate: calcDelivery } = useDelivery()

  const deliveryInfo = calcDelivery(totalPrice)
  const amountNeededForFree = deliveryRule.free_delivery_above - totalPrice

  // Lock body scroll when cart is open
  useEffect(() => {
    if (isCartOpen) {
      lockScroll('cart')
    } else {
      unlockScroll('cart')
    }
    return () => { unlockScroll('cart') }
  }, [isCartOpen])

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/70 z-40"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#1a1410] border-l border-white/8 z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/8">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5.5 h-5.5 text-amber-500" />
                <h2 className="font-serif text-xl font-bold text-[#fef3e2]">Your Cart</h2>
                <span className="px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/35 text-amber-500 text-xs font-black rounded-full">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-amber-500/15 rounded-full transition-all duration-300 hover:rotate-90 group cursor-pointer"
                aria-label="Close cart"
              >
                <X className="w-5 h-5 text-[#fef3e2] group-hover:text-amber-400" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <div className="w-20 h-20 bg-amber-500/5 rounded-full flex items-center justify-center mb-5 border border-amber-500/10">
                    <ShoppingBag className="w-10 h-10 text-amber-500/40" />
                  </div>
                  <p className="text-[#fef3e2]/70 text-lg font-bold">Your cart is empty</p>
                  <p className="text-[#fef3e2]/40 text-sm mt-2 max-w-[240px]">Explore our fresh Ashwagandha cookies and add them here!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex gap-4 p-4 bg-[#0f0f0f]/30 dark:bg-white/2 rounded-2xl border border-white/8 dark:border-white/5 shadow-[0_4px_16px_rgba(0,0,0,0.01)] transition-all hover:border-amber-500/20 group relative"
                      >
                        <div className="relative w-20 h-20 bg-neutral-100 dark:bg-[#1a1613] rounded-xl overflow-hidden shrink-0 flex items-center justify-center p-1.5 border border-white/5 shadow-inner">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="w-[90%] h-[90%] object-contain select-none transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                        <div className="flex-1 min-w-0 pr-2">
                          <h3 className="font-bold text-sm text-[#fef3e2] truncate leading-tight mb-0.5">{item.name}</h3>
                          <p className="text-[#fef3e2]/40 text-[11px] uppercase font-black tracking-wider leading-none mb-1.5">
                            {[item.size, item.color].filter(Boolean).join(' / ')}
                          </p>
                          <div className="flex items-baseline gap-2">
                            <p className="text-amber-500 text-sm font-extrabold font-mono">{settings?.currency_symbol || '₹'}{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                            {item.originalPrice && (
                              <p className="text-[#fef3e2]/30 text-xs line-through font-mono">{settings?.currency_symbol || '₹'}{(item.originalPrice * item.quantity).toLocaleString('en-IN')}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end justify-between shrink-0">
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="flex items-center p-0.5 border border-white/8 dark:border-white/5 bg-black/15 dark:bg-white/4 rounded-xl shadow-sm">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 dark:hover:bg-white/5 transition-all text-[#fef3e2] hover:text-amber-400 cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-[#fef3e2] font-mono text-xs font-bold w-6 text-center">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.maxStock !== undefined && item.quantity >= item.maxStock}
                              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 dark:hover:bg-white/5 transition-all text-[#fef3e2] hover:text-amber-400 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-white/8 space-y-5 bg-[#0f0f0f]/30 shadow-[0_-8px_24px_rgba(0,0,0,0.05)]">
                
                {/* Progress Bar towards Free Delivery */}
                {deliveryRule.free_delivery_above > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs leading-none">
                      <span className="text-[#fef3e2]/70">
                        {totalPrice >= deliveryRule.free_delivery_above ? (
                          <span className="text-emerald-500 dark:text-emerald-400 font-extrabold flex items-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5 animate-pulse" /> Free delivery unlocked!
                          </span>
                        ) : (
                          <span>
                            Add <strong className="text-amber-500 font-black">{settings?.currency_symbol || '₹'}{Math.ceil(amountNeededForFree)}</strong> more for free delivery
                          </span>
                        )}
                      </span>
                      <span className="text-[#fef3e2]/40 font-mono text-[10px] font-bold">{Math.round(Math.min((totalPrice / deliveryRule.free_delivery_above) * 100, 100))}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-black/20 dark:bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-500 rounded-full"
                        style={{ width: `${Math.min((totalPrice / deliveryRule.free_delivery_above) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Order Summary */}
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#fef3e2]/60">Subtotal</span>
                    <span className="text-[#fef3e2] font-semibold font-mono">{settings?.currency_symbol || '₹'}{totalPrice.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#fef3e2]/60">Delivery</span>
                    {deliveryRule.free_delivery_above > 0 && totalPrice < deliveryRule.free_delivery_above ? (
                      <span className="text-amber-400 font-extrabold flex items-center gap-1 font-mono">
                        <Zap className="w-3 h-3" />
                        {settings?.currency_symbol || '₹'}{deliveryRule.delivery_fee}
                      </span>
                    ) : (
                      <span className="text-emerald-500 dark:text-emerald-400 font-extrabold flex items-center gap-1 uppercase tracking-wider text-[10px]">
                        <TrendingUp className="w-3.5 h-3.5" />
                        Free
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-white/8">
                    <span className="text-[#fef3e2] font-black text-sm uppercase tracking-wider">Total</span>
                    <span className="text-2xl font-black font-mono" style={{ color: 'var(--theme-color)' }}>
                      {settings?.currency_symbol || '₹'}{(Number(totalPrice) + (deliveryRule.free_delivery_above > 0 && Number(totalPrice) < deliveryRule.free_delivery_above ? Number(deliveryRule.delivery_fee) : 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Action CTA Buttons */}
                <div className="flex gap-3">
                  <Link
                    to="/checkout"
                    onClick={() => setIsCartOpen(false)}
                    className="group flex-1 flex items-center justify-center gap-2 px-5 py-3.5 font-black rounded-xl hover:shadow-lg hover:shadow-amber-500/25 transition-all text-sm tracking-wide cursor-pointer hover:scale-[1.01] duration-300"
                    style={{ background: 'linear-gradient(135deg, var(--theme-color), color-mix(in srgb, var(--theme-color) 70%, black))', color: '#0D0D0D' }}
                  >
                    Proceed to Checkout
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => { clearCart(); setIsCartOpen(false) }}
                    className="px-4 py-3.5 border border-red-500/15 hover:border-red-500/40 text-red-400 hover:bg-red-500/10 rounded-xl text-sm font-medium transition-all shrink-0 cursor-pointer hover:scale-105 duration-300"
                    title="Clear cart"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

