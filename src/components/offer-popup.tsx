/**
 * OfferPopup — Shows an active promotional popup with configurable delay.
 * Respects localStorage permanent dismiss, shows every page load.
 * Supports combo items with "Add to Cart" functionality.
 */
import { useState, useEffect, useRef } from 'react'
import { popupService, type PopupData } from '@/services/popupService'
import { useCart } from '@/context/cart-context'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import api from '@/lib/axios'

const PERM_KEY = 'uni_popup_dismiss'

function trackEvent(id: number, event: 'view' | 'click') {
  api.post('/popup/track', { id, event }).catch(() => {})
}

export function OfferPopup() {
    const { addItem } = useCart()
    const [popup, setPopup]     = useState<PopupData | null>(null)
    const [visible, setVisible] = useState(false)
    const [mounted, setMounted] = useState(false)
    const timerRef              = useRef<ReturnType<typeof setTimeout> | null>(null)
    const trackedView           = useRef(false)

    useEffect(() => {
        // Don't show on admin pages
        if (window.location.pathname.startsWith('/admin')) return

        popupService.getActive().then(data => {
            if (!data) return

            // Check permanent dismiss for this popup
            const dismissed = localStorage.getItem(PERM_KEY)
            if (dismissed === String(data.id)) return

            setPopup(data)
            const delay = (data.delay_seconds ?? 2) * 1000
            const timer = setTimeout(() => {
                setMounted(true)
                requestAnimationFrame(() => setVisible(true))
            }, delay)
            return () => clearTimeout(timer)
        }).catch(() => {})
    }, [])

    // Track view once popup becomes visible
    useEffect(() => {
        if (visible && popup?.id && !trackedView.current) {
            trackedView.current = true
            trackEvent(popup.id, 'view')
        }
    }, [visible, popup])

    const close = (permanent = false) => {
        setVisible(false)
        if (permanent && popup?.id) {
            localStorage.setItem(PERM_KEY, String(popup.id))
        }
        setTimeout(() => setMounted(false), 350)
    }

    const handleAddToCart = async () => {
        if (!popup?.items || popup.items.length === 0) return
        
        // Add each combo item to cart
        for (const item of popup.items) {
            try {
                addItem({
                    id: String(item.id),
                    name: item.name,
                    weight: item.weight,
                    price: popup.price ? Math.round(popup.price / popup.items.length) : 0,
                    image: item.image || '',
                    category: 'combo'
                })
            } catch (e) {
                console.error('Error adding item to cart:', e)
            }
        }
        
        if (popup.id) trackEvent(popup.id, 'click')
        close()
    }

    if (!popup || !mounted) return null

    const imageUrl = popup.image
        ? popup.image.startsWith('/') && !popup.image.startsWith('/api') ? `/api${popup.image}` : popup.image
        : null

    const hasItems = popup.items && popup.items.length > 0

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={() => close()}
                className={cn(
                    'fixed inset-0 z-999 bg-black/70 backdrop-blur-sm transition-opacity duration-300',
                    visible ? 'opacity-100' : 'opacity-0'
                )}
            />

            {/* Modal */}
            <div
                className={cn(
                    'fixed z-1000 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
                    'w-[calc(100vw-2rem)] max-w-md',
                    'bg-[#0e0e0e] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl shadow-black/80',
                    'transition-all duration-350',
                    visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                )}
            >
                {/* Close btn */}
                <button
                    onClick={() => close()}
                    className="absolute top-3 right-3 z-10 w-8 h-8 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Image */}
                {imageUrl && (
                    <div className="relative w-full aspect-video overflow-hidden">
                        <img src={imageUrl} alt={popup.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-linear-to-t from-[#0e0e0e] via-transparent to-transparent" />
                    </div>
                )}

                {/* Content */}
                <div className={cn('p-6', imageUrl ? 'pt-4' : 'pt-10')}>
                    <h2 className="text-xl font-black text-white leading-tight">{popup.title}</h2>

                    {popup.description && (
                        <p className="text-gray-400 text-sm mt-2 leading-relaxed">{popup.description}</p>
                    )}

                    {/* Combo Items List */}
                    {hasItems && popup.items && (
                        <div className="mt-4 mb-4 space-y-2 max-h-56 overflow-y-auto">
                            {popup.items.map((item, idx) => {
                                const itemImageUrl = item.image
                                    ? item.image.startsWith('/') && !item.image.startsWith('/api') ? `/api${item.image}` : item.image
                                    : null

                                return (
                                    <div
                                        key={idx}
                                        className="flex items-center gap-2 p-2 bg-white/5 border border-gray-700/30 rounded-lg"
                                    >
                                        {itemImageUrl && (
                                            <img
                                                src={itemImageUrl}
                                                alt={item.name}
                                                loading="lazy"
                                                className="w-10 h-10 rounded object-cover border border-gray-700"
                                            />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-bold text-sm">{item.name}</p>
                                            <p className="text-gray-500 text-xs">{item.weight}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {/* Price display */}
                    {popup.price && (
                        <div className="mb-4 text-center">
                            <p className="text-amber-400 text-lg font-black">₹{popup.price.toLocaleString('en-IN')}</p>
                            <p className="text-gray-500 text-xs">Including Delivery</p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-5">
                        {/* Add to Cart button */}
                        {hasItems && (
                            <button
                                onClick={handleAddToCart}
                                className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-black rounded-xl text-center transition-colors"
                            >
                                Add to Cart
                            </button>
                        )}

                        {/* Primary button */}
                        {popup.button_text && popup.button_link && (
                            <a
                                href={popup.button_link}
                                onClick={() => {
                                    if (popup.id) trackEvent(popup.id, 'click')
                                    close()
                                }}
                                className={cn(
                                    'py-2.5 bg-amber-500 hover:bg-amber-400 text-black text-sm font-black rounded-xl text-center transition-colors',
                                    hasItems ? 'flex-1' : 'flex-1'
                                )}
                            >
                                {popup.button_text}
                            </a>
                        )}

                        {/* Close/No thanks button */}
                        <button
                            onClick={() => close()}
                            className={cn(
                                'py-2.5 border border-gray-700 text-gray-400 text-sm font-bold rounded-xl hover:border-gray-600 hover:text-white transition-all',
                                popup.button_text && popup.button_link ? 'px-4' : 'flex-1'
                            )}
                        >
                            {popup.button_text && popup.button_link ? 'No thanks' : 'Close'}
                        </button>
                    </div>

                    {/* Don't show again */}
                    <button
                        onClick={() => close(true)}
                        className="mt-3 w-full text-center text-gray-600 hover:text-gray-400 text-xs transition-colors"
                    >
                        Don't show again
                    </button>
                </div>
            </div>
        </>
    )
}

