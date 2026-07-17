import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Link } from "react-router-dom"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { heroSlideService, type HeroSlide } from "@/services/heroSlideService"

export function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null)
  
  // Sync state initialization with localStorage cache to prevent initial content flash
  const [slides, setSlides] = useState<HeroSlide[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('aarvia_hero_slides')
        if (cached) {
          const parsed = JSON.parse(cached)
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed
          }
        }
      } catch (e) {
        // ignore
      }
    }
    return []
  })

  const [currentIdx, setCurrentIdx] = useState(0)
  const [direction, setDirection] = useState(0)
  
  const [loading, setLoading] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('aarvia_hero_slides')
        if (cached) {
          const parsed = JSON.parse(cached)
          if (Array.isArray(parsed) && parsed.length > 0) {
            return false // Immediately display cached slides
          }
        }
      } catch (e) {
        // ignore
      }
    }
    return true
  })

  useEffect(() => {
    let active = true
    const fallbackSlide: HeroSlide = {
      id: 1,
      title: "Better Living Begins at Home.",
      tagline: "Deepthi Living & Wellness",
      subtitle: "At Deepthi Living & Wellness, we create thoughtfully crafted brands that help families live healthier, happier, and more consciously—every single day.",
      cta_primary_text: "Explore Our Brands",
      cta_primary_link: "/#brands",
      cta_secondary_text: "Shop Products",
      cta_secondary_link: "/products",
      image: null,
      mobile_image: null,
      category: 'trending',
      sort_order: 0,
      created_at: '',
      updated_at: ''
    }

    heroSlideService.getPublic()
      .then(data => {
        if (active) {
          if (data && data.length > 0) {
            const dataStr = JSON.stringify(data)
            const cachedStr = localStorage.getItem('aarvia_hero_slides')
            if (dataStr !== cachedStr) {
              setSlides(data)
              try {
                localStorage.setItem('aarvia_hero_slides', dataStr)
              } catch (e) {}
            }
          } else {
            setSlides(prev => prev.length > 0 ? prev : [fallbackSlide])
          }
          setLoading(false)
        }
      })
      .catch(() => {
        if (active) {
          setSlides(prev => prev.length > 0 ? prev : [fallbackSlide])
          setLoading(false)
        }
      })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (slides.length <= 1) return
    const t = setInterval(() => { setDirection(1); setCurrentIdx(prev => (prev + 1) % slides.length) }, 6000)
    return () => clearInterval(t)
  }, [slides])

  const imgUrl = (src: string | null | undefined) =>
    src ? (src.startsWith('/') && !src.startsWith('/api') ? `/api${src}` : src) : null

  const handlePrev = () => { if (slides.length <= 1) return; setDirection(-1); setCurrentIdx(prev => (prev - 1 + slides.length) % slides.length) }
  const handleNext = () => { if (slides.length <= 1) return; setDirection(1); setCurrentIdx(prev => (prev + 1) % slides.length) }
  const handleDot = (idx: number) => { if (idx === currentIdx) return; setDirection(idx > currentIdx ? 1 : -1); setCurrentIdx(idx) }

  const currentSlide = slides[currentIdx]
  const slideHasImage = currentSlide && imgUrl(currentSlide.image)

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? '100%' : d < 0 ? '-100%' : 0, opacity: 0, scale: 1.04 }),
    center: { x: 0, opacity: 1, scale: 1, transition: { x: { type: 'spring', stiffness: 200, damping: 30 }, opacity: { duration: 0.7 }, scale: { duration: 1 } } },
    exit: (d: number) => ({ x: d > 0 ? '-60%' : d < 0 ? '60%' : 0, opacity: 0, scale: 0.96, transition: { duration: 0.6 } }),
  }

  if (loading && slides.length === 0) {
    return (
      <section className="relative h-[400px] md:h-[500px] w-full" style={{ background: '#FDFBF7' }} />
    )
  }

  return (
    <section ref={heroRef} className="relative h-[400px] md:h-[500px] w-full flex items-center overflow-hidden" style={{ background: '#FDFBF7' }}>
      {/* ── Background Layer ── */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 z-0 overflow-hidden"
      >
        <AnimatePresence initial={false} custom={direction}>
          {slideHasImage ? (
            <motion.div key={currentSlide!.id ?? currentIdx} custom={direction} variants={slideVariants}
              initial="enter" animate="center" exit="exit" className="absolute inset-0 w-full h-full">
              <Link to={currentSlide!.cta_primary_link || '/shop'} className="block w-full h-full">
                <picture className="w-full h-full block">
                  {currentSlide!.mobile_image && (
                    <source srcSet={imgUrl(currentSlide!.mobile_image)!} media="(max-width: 640px)" />
                  )}
                  <img src={imgUrl(currentSlide!.image)!} alt={currentSlide!.title || 'Aarvia'}
                    className="w-full h-full object-cover object-center" />
                  <div className="absolute inset-0 bg-black/30" />
                </picture>
              </Link>
            </motion.div>
          ) : (
            <motion.div key="default-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 w-full h-full">
              <Link to="/products" className="block w-full h-full">
                <img src="/images/heroes/shop-hero.png" alt="Deepthi Living & Wellness" className="w-full h-full object-cover object-center" />
                <div className="absolute inset-0 bg-black/30" />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Text Overlay ── */}
      <div className="hidden absolute inset-0 z-10 flex flex-col justify-center items-center text-center px-4 md:px-12 pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide?.id ?? currentIdx}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-3xl mx-auto"
          >
            {currentSlide?.tagline && (
              <p className="text-[#FDFBF7]/90 text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase mb-4 drop-shadow-md">
                {currentSlide.tagline}
              </p>
            )}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-[#FDFBF7] mb-6 leading-tight drop-shadow-lg">
              {currentSlide?.title}
            </h1>
            <p className="text-base md:text-xl text-[#FDFBF7]/90 font-sans max-w-2xl mx-auto mb-10 drop-shadow-md font-light leading-relaxed">
              {currentSlide?.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pointer-events-auto">
              {currentSlide?.cta_primary_text && (
                <Link to={currentSlide.cta_primary_link || '/products'} className="px-8 py-4 bg-[#C8A96B] hover:bg-[#b89858] text-[#1A1A1A] text-xs font-bold uppercase tracking-[0.15em] rounded-full transition-all hover:scale-105 active:scale-95 shadow-xl">
                  {currentSlide.cta_primary_text}
                </Link>
              )}
              {currentSlide?.cta_secondary_text && (
                <Link to={currentSlide.cta_secondary_link || '/products'} className="px-8 py-4 bg-transparent border border-[#FDFBF7] hover:bg-[#FDFBF7] text-[#FDFBF7] hover:text-[#1F4D3A] text-xs font-bold uppercase tracking-[0.15em] rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg backdrop-blur-sm">
                  {currentSlide.cta_secondary_text}
                </Link>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Slide Counter & Navigation ── */}
      {slides.length > 1 && (
        <>
          {/* Dot indicators — bottom center */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5">
            {slides.map((_, i) => (
              <button key={i} onClick={() => handleDot(i)}
                className="relative flex items-center justify-center cursor-pointer transition-all"
                aria-label={`Slide ${i + 1}`}>
                <motion.span
                  animate={{ width: i === currentIdx ? '24px' : '8px', background: i === currentIdx ? '#C8A96B' : 'rgba(255,255,255,0.6)' }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="block h-2 rounded-full"
                  style={{ width: i === currentIdx ? '24px' : '8px', background: i === currentIdx ? '#C8A96B' : 'rgba(255,255,255,0.6)' }}
                />
              </button>
            ))}
          </div>

          {/* Prev/Next arrows */}
          <div className="absolute top-1/2 -translate-y-1/2 left-6 lg:left-8 z-30">
            <button onClick={handlePrev} aria-label="Previous"
              className="group w-11 h-11 lg:w-12 lg:h-12 rounded-full flex items-center justify-center transition-all duration-400 hover:scale-105 active:scale-95 bg-white/70 hover:bg-white text-[#1F4D3A] backdrop-blur-md shadow-lg"
              style={{ border: '1px solid rgba(200,169,107,0.3)' }}>
              <ChevronLeft className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
          <div className="absolute top-1/2 -translate-y-1/2 right-6 lg:right-8 z-30">
            <button onClick={handleNext} aria-label="Next"
              className="group w-11 h-11 lg:w-12 lg:h-12 rounded-full flex items-center justify-center transition-all duration-400 hover:scale-105 active:scale-95 bg-white/70 hover:bg-white text-[#1F4D3A] backdrop-blur-md shadow-lg"
              style={{ border: '1px solid rgba(200,169,107,0.3)' }}>
              <ChevronRight className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>

          {/* Slide count */}
          <div className="absolute right-6 bottom-6 z-30 hidden md:flex items-center gap-2 drop-shadow-md"
            style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.6875rem', fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '0.12em' }}>
            <span style={{ color: '#C8A96B', fontWeight: 600 }}>{(currentIdx + 1).toString().padStart(2, '0')}</span>
            <span>/</span>
            <span>{slides.length.toString().padStart(2, '0')}</span>
          </div>
        </>
      )}
    </section>
  )
}