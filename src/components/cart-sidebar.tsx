

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
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#FDFBF7] dark:bg-[#121212] border-l border-[#C8A96B]/20 dark:border-white/10 z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#C8A96B]/15 dark:border-white/10">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-6 h-6 text-[#1F4D3A] dark:text-[#C8A96B]" />
                <h2 className="font-serif text-3xl font-light text-[#1F4D3A] dark:text-[#FDFBF7]">Your Cart</h2>
                <span className="px-3 py-1 bg-[#1F4D3A]/5 border border-[#1F4D3A]/20 dark:bg-[#C8A96B]/10 dark:border-[#C8A96B]/25 text-[#1F4D3A] dark:text-[#C8A96B] text-xs font-bold uppercase tracking-widest rounded-full">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {items.length > 0 && (
                  <button
                    type="button"
                    onClick={() => clearCart()}
                    className="p-2 hover:bg-red-50 text-[#1F4D3A]/40 dark:text-[#FDFBF7]/40 hover:text-red-500 rounded-full transition-all duration-300 group cursor-pointer"
                    title="Empty Cart"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 hover:bg-[#1F4D3A]/5 dark:hover:bg-white/5 rounded-full transition-all duration-300 hover:rotate-90 group cursor-pointer"
                  aria-label="Close cart"
                >
                  <X className="w-5 h-5 text-[#1F4D3A] dark:text-[#FDFBF7] group-hover:text-[#C8A96B]" />
                </button>
              </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-5 py-2">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <div className="w-20 h-20 bg-[#1F4D3A]/5 dark:bg-[#C8A96B]/5 rounded-full flex items-center justify-center mb-5 border border-[#1F4D3A]/10 dark:border-[#C8A96B]/10">
                    <ShoppingBag className="w-10 h-10 text-[#1F4D3A]/30 dark:text-[#C8A96B]/30" />
                  </div>
                  <p className="text-[#1F4D3A]/80 dark:text-[#FDFBF7]/80 text-lg font-bold">Your cart is empty</p>
                  <p className="text-[#1F4D3A]/50 dark:text-[#FDFBF7]/50 text-sm mt-2 max-w-[240px]">Explore our nature-inspired collections and add items to your cart.</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex gap-3 py-4 bg-transparent border-b border-[#C8A96B]/15 dark:border-white/5 transition-all group relative last:border-b-0"
                      >
                        <div className="relative w-16 h-16 md:w-[72px] md:h-[72px] bg-[#FDFBF7] dark:bg-[#121212] rounded-lg overflow-hidden shrink-0 flex items-center justify-center p-1 border border-[#C8A96B]/15 dark:border-white/5">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="w-[90%] h-[90%] object-contain select-none transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                        <div className="flex-1 min-w-0 pr-2 flex flex-col justify-between py-1">
                          <div>
                            <div className="flex justify-between items-start gap-2 mb-0.5">
                              <h3 className="font-serif text-lg font-medium text-[#1F4D3A] dark:text-[#FDFBF7] leading-tight truncate">{item.name}</h3>
                              <button
                                type="button"
                                onClick={() => removeItem(item.id)}
                                className="p-1 text-[#1F4D3A]/30 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all cursor-pointer"
                                aria-label="Remove item"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <p className="text-[#1F4D3A]/50 dark:text-[#FDFBF7]/50 text-[10px] uppercase font-bold tracking-[0.2em] leading-none mb-2">
                              {[item.size, item.color].filter(Boolean).join(' / ')}
                            </p>
                            <div className="flex items-baseline gap-2">
                              <p className="text-[#C8A96B] text-base font-bold">{settings?.currency_symbol || '₹'}{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                              {item.originalPrice && (
                                <p className="text-[#1F4D3A]/40 dark:text-[#FDFBF7]/40 text-xs line-through">{settings?.currency_symbol || '₹'}{(item.originalPrice * item.quantity).toLocaleString('en-IN')}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1 p-0.5 mt-2.5 bg-[#1F4D3A]/5 dark:bg-white/5 rounded-full self-start">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white dark:hover:bg-black transition-all text-[#1F4D3A] dark:text-[#FDFBF7] shadow-sm cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-[#1F4D3A] dark:text-[#FDFBF7] text-xs font-bold w-5 text-center">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.maxStock !== undefined && item.quantity >= item.maxStock}
                              className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white dark:hover:bg-black transition-all text-[#1F4D3A] dark:text-[#FDFBF7] shadow-sm disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
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
              <div className="p-5 border-t border-[#C8A96B]/20 dark:border-white/10 space-y-4 bg-[#FDFBF7]/95 dark:bg-[#1A1A1A]/95 shadow-[0_-8px_24px_rgba(0,0,0,0.02)]">
                
                {/* Progress Bar towards Free Delivery */}
                {deliveryRule.free_delivery_above > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs leading-none">
                      <span className="text-[#1F4D3A] dark:text-[#FDFBF7] font-medium">
                        {totalPrice >= deliveryRule.free_delivery_above ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5 animate-pulse" /> Free delivery unlocked!
                          </span>
                        ) : (
                          <span>
                            Add <strong className="text-[#1F4D3A] dark:text-[#C8A96B] font-bold">{settings?.currency_symbol || '₹'}{Math.ceil(amountNeededForFree)}</strong> more for free delivery
                          </span>
                        )}
                      </span>
                      <span className="text-[#1F4D3A]/80 dark:text-[#FDFBF7]/80 font-mono text-[10px] font-bold">{Math.round(Math.min((totalPrice / deliveryRule.free_delivery_above) * 100, 100))}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#1F4D3A]/10 dark:bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#1F4D3A] to-[#C8A96B] dark:from-[#C8A96B] dark:to-[#E2C98A] transition-all duration-500 rounded-full"
                        style={{ width: `${Math.min((totalPrice / deliveryRule.free_delivery_above) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Order Summary */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#1F4D3A] dark:text-[#FDFBF7] font-medium">Subtotal</span>
                    <span className="text-[#1F4D3A] dark:text-[#FDFBF7] font-semibold font-mono">{settings?.currency_symbol || '₹'}{totalPrice.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#1F4D3A] dark:text-[#FDFBF7] font-medium">Delivery</span>
                    {deliveryRule.free_delivery_above > 0 && totalPrice < deliveryRule.free_delivery_above ? (
                      <span className="text-[#C8A96B] font-bold flex items-center gap-1 font-mono">
                        <Zap className="w-3 h-3" />
                        {settings?.currency_symbol || '₹'}{deliveryRule.delivery_fee}
                      </span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 uppercase tracking-wider text-[10px]">
                        <TrendingUp className="w-3.5 h-3.5" />
                        Free
                      </span>
                    )}
                  </div>
                </div>

                {/* Action CTA Buttons */}
                <div className="pt-2">
                  <Link
                    to="/checkout"
                    onClick={() => setIsCartOpen(false)}
                    className="group w-full flex items-center justify-between px-6 py-3 font-bold rounded-full transition-all text-[13px] uppercase tracking-[0.15em] cursor-pointer hover:scale-[1.02] duration-300 bg-[#1F4D3A] !text-white hover:bg-[#C8A96B] shadow-lg shadow-[#1F4D3A]/10"
                  >
                    <span className="flex items-center gap-2">
                      Checkout
                    </span>
                    <span className="flex items-center gap-3">
                      <span>{settings?.currency_symbol || '₹'}{(Number(totalPrice) + (deliveryRule.free_delivery_above > 0 && Number(totalPrice) < deliveryRule.free_delivery_above ? Number(deliveryRule.delivery_fee) : 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

