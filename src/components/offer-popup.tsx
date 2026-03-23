/**
 * OfferPopup — Shows an active promotional popup with configurable delay.
 * Respects sessionStorage so it's shown only once per session.
 */
import { useState, useEffect } from 'react'
import { popupService, type PopupData } from '@/services/popupService'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

const SESSION_KEY = 'lhf_popup_shown'

export function OfferPopup() {
    const [popup, setPopup]   = useState<PopupData | null>(null)
    const [visible, setVisible] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        // Don't show on admin pages
        if (window.location.pathname.startsWith('/admin')) return

        // Once per session
        if (sessionStorage.getItem(SESSION_KEY)) return

        popupService.getActive().then(data => {
            if (!data) return
            setPopup(data)
            const delay = (data.delay_seconds ?? 2) * 1000
            const timer = setTimeout(() => {
                setMounted(true)
                requestAnimationFrame(() => setVisible(true))
            }, delay)
            return () => clearTimeout(timer)
        }).catch(() => {})
    }, [])

    const close = () => {
        setVisible(false)
        sessionStorage.setItem(SESSION_KEY, '1')
        setTimeout(() => setMounted(false), 350)
    }

    if (!popup || !mounted) return null

    const imageUrl = popup.image
        ? popup.image.startsWith('/') ? `/api${popup.image}` : popup.image
        : null

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={close}
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
                    onClick={close}
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

                    <div className="flex gap-3 mt-5">
                        {popup.button_text && popup.button_link && (
                            <a
                                href={popup.button_link}
                                onClick={close}
                                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-black text-sm font-black rounded-xl text-center transition-colors"
                            >
                                {popup.button_text}
                            </a>
                        )}
                        <button
                            onClick={close}
                            className={cn(
                                'py-2.5 border border-gray-700 text-gray-400 text-sm font-bold rounded-xl hover:border-gray-600 hover:text-white transition-all',
                                popup.button_text && popup.button_link ? 'px-4' : 'flex-1'
                            )}
                        >
                            {popup.button_text && popup.button_link ? 'No thanks' : 'Close'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}
