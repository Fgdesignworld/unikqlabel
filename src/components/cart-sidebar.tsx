

import { motion, AnimatePresence } from "framer-motion"
import { Link } from 'react-router-dom';
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#1a1410] border-l border-[#d97706]/20 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#d97706]/20">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-6 h-6 text-[#d97706]" />
                <h2 className="font-serif text-xl font-bold text-[#fef3e2]">Your Cart</h2>
                <span className="px-2 py-0.5 bg-[#d97706] text-[#0f0f0f] text-sm font-bold rounded-full">
                  {items.length}
                </span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-[#d97706]/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-[#fef3e2]" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag className="w-16 h-16 text-[#d97706]/30 mb-4" />
                  <p className="text-[#fef3e2]/60 text-lg">Your cart is empty</p>
                  <p className="text-[#fef3e2]/40 text-sm mt-2">Add some delicious items to get started!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="flex gap-4 p-3 bg-[#0f0f0f]/50 rounded-xl border border-[#d97706]/10"
                    >
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-[#fef3e2] truncate">{item.name}</h3>
                        <p className="text-[#fef3e2]/60 text-sm">{item.weight}</p>
                        <p className="text-[#d97706] font-bold mt-1">{settings?.currency_symbol || '₹'}{item.price * item.quantity}</p>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1 hover:bg-red-500/10 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                        <div className="flex items-center gap-2 bg-[#d97706]/10 rounded-full">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-[#d97706]/20 rounded-full transition-colors"
                          >
                            <Minus className="w-4 h-4 text-[#d97706]" />
                          </button>
                          <span className="text-[#fef3e2] font-medium w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-[#d97706]/20 rounded-full transition-colors"
                          >
                            <Plus className="w-4 h-4 text-[#d97706]" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-4 border-t border-[#d97706]/20 space-y-4 bg-[#0f0f0f]/30">
                {/* Order Summary */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#fef3e2]/60">Subtotal</span>
                    <span className="text-[#fef3e2]">{settings?.currency_symbol || '₹'}{totalPrice}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#fef3e2]/60">Delivery</span>
                    {deliveryRule.free_delivery_above > 0 && totalPrice < deliveryRule.free_delivery_above ? (
                      <span className="text-amber-400 text-xs font-medium flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        {settings?.currency_symbol || '₹'}{deliveryRule.delivery_fee} charge
                      </span>
                    ) : (
                      <span className="text-[#25D366] text-xs font-medium flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Free!
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-[#d97706]/10">
                    <span className="text-[#fef3e2] font-medium">Total</span>
                    <span className="text-2xl font-bold text-[#d97706]">{settings?.currency_symbol || '₹'}{totalPrice}</span>
                  </div>
                </div>

                {deliveryRule.free_delivery_above > 0 && totalPrice < deliveryRule.free_delivery_above && (
                  <div className="px-3 py-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <p className="text-xs text-amber-200">
                      Add <strong>{settings?.currency_symbol || '₹'}{Math.ceil(amountNeededForFree)}</strong> more for free delivery
                    </p>
                  </div>
                )}
                
                <Link
                  to="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[#d97706] to-[#b45309] text-[#0f0f0f] font-bold rounded-xl hover:shadow-lg hover:shadow-[#d97706]/30 transition-all"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <button
                  onClick={clearCart}
                  className="w-full text-center text-[#fef3e2]/50 hover:text-red-500 text-sm transition-colors"
                >
                  Clear Cart
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
