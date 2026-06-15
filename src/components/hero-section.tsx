import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Link } from "react-router-dom"
import { ChevronLeft, ChevronRight, ArrowRight, Leaf } from "lucide-react"
import { heroSlideService, type HeroSlide } from "@/services/heroSlideService"

export function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null)
  const [slides, setSlides] = useState<HeroSlide[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [direction, setDirection] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    heroSlideService.getPublic()
      .then(data => { if (active) { setSlides(data); setLoading(false) } })
      .catch(() => { if (active) setLoading(false) })
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

  const textVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.12 + 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] } }),
  }

  return (
    <section ref={heroRef} className="relative min-h-screen h-screen w-full flex items-center overflow-hidden">

      {/* ── Background Layer ── */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <AnimatePresence initial={false} custom={direction}>
          {slideHasImage ? (
            <motion.div key={currentSlide!.id ?? currentIdx} custom={direction} variants={slideVariants}
              initial="enter" animate="center" exit="exit" className="absolute inset-0 w-full h-full">
              <picture className="w-full h-full block">
                {currentSlide!.mobile_image && (
                  <source srcSet={imgUrl(currentSlide!.mobile_image)!} media="(max-width: 640px)" />
                )}
                <img src={imgUrl(currentSlide!.image)!} alt={currentSlide!.title || 'Aarvia'}
                  className="w-full h-full object-cover object-center" />
              </picture>
            </motion.div>
          ) : (
            <motion.div key="default-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #1A3D2E 0%, #0D2018 40%, #1F4D3A 70%, #162B22 100%)' }}>
              <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(ellipse at 25% 35%, rgba(200,169,107,0.12) 0%, transparent 55%), radial-gradient(ellipse at 75% 70%, rgba(31,77,58,0.4) 0%, transparent 50%)' }} />
              <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(247,244,237,0.6) 1px, transparent 0)', backgroundSize: '28px 28px' }} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Gradient overlay — always present */}
        <div className="absolute inset-0 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(105deg, rgba(10,28,20,0.75) 0%, rgba(10,28,20,0.45) 50%, rgba(10,28,20,0.2) 100%)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-40 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(0deg, rgba(247,244,237,0.08) 0%, transparent 100%)' }} />
      </div>

      {/* ── Hero Content ── */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 lg:px-16 pt-24">
        <div className="max-w-2xl">

          {/* Eyebrow label */}
          {(loading || currentSlide?.subtitle) && (
            <motion.div
              custom={0} variants={textVariants} initial="hidden" animate="visible"
              className="flex items-center gap-3 mb-8">
              <Leaf className="w-4 h-4 opacity-70" style={{ color: '#C8A96B' }} />
              <span className="text-[11px] font-semibold tracking-[0.28em] uppercase"
                style={{ color: 'rgba(200,169,107,0.85)' }}>
                {loading ? 'Premium Natural Wellness' : currentSlide?.subtitle}
              </span>
              <span className="block h-px w-10 opacity-40" style={{ background: '#C8A96B' }} />
            </motion.div>
          )}

          {/* Headline */}
          <motion.h1
            custom={1} variants={textVariants} initial="hidden" animate="visible"
            className="mb-6 leading-[1.05]"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>
            <AnimatePresence mode="wait">
              <motion.span key={`title-${currentIdx}`}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.6 }}
                className="block">
                <span className="block text-5xl md:text-7xl lg:text-8xl" style={{ color: '#F7F4ED' }}>
                  {loading ? 'Nature Refined.' : (currentSlide?.title || 'Nature Refined.')}
                </span>
                {!currentSlide?.title && (
                  <span className="block text-5xl md:text-7xl lg:text-8xl italic mt-1"
                    style={{ color: 'rgba(200,169,107,0.9)' }}>
                    Luxury Reimagined.
                  </span>
                )}
              </motion.span>
            </AnimatePresence>
          </motion.h1>

          {/* CTAs */}
          <motion.div custom={2} variants={textVariants} initial="hidden" animate="visible"
            className="flex flex-wrap items-center gap-4">
            <Link to={currentSlide?.cta_primary_link || '/products'}
              className="group flex items-center gap-2.5 px-8 py-4 rounded-none font-semibold tracking-wider transition-all duration-400 hover:gap-4"
              style={{ background: '#C8A96B', color: '#1A2E1F', fontSize: '0.75rem', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              {currentSlide?.cta_primary_text || 'Shop Collection'}
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link to="/about"
              className="group flex items-center gap-2 px-8 py-4 rounded-none font-semibold tracking-wider transition-all duration-400"
              style={{ background: 'transparent', color: '#F7F4ED', fontSize: '0.75rem', letterSpacing: '0.14em', textTransform: 'uppercase', border: '1px solid rgba(247,244,237,0.3)' }}>
              Our Story
              <span className="block w-4 h-px" style={{ background: 'rgba(247,244,237,0.5)' }} />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* ── Slide Counter & Navigation ── */}
      {slides.length > 1 && (
        <>
          {/* Dot indicators — bottom center */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3">
            {slides.map((_, i) => (
              <button key={i} onClick={() => handleDot(i)}
                className="relative flex items-center justify-center cursor-pointer transition-all"
                aria-label={`Slide ${i + 1}`}>
                <motion.span
                  animate={{ width: i === currentIdx ? '28px' : '6px', background: i === currentIdx ? '#C8A96B' : 'rgba(247,244,237,0.35)' }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="block h-0.5 rounded-full"
                  style={{ width: i === currentIdx ? '28px' : '6px', background: i === currentIdx ? '#C8A96B' : 'rgba(247,244,237,0.35)' }}
                />
              </button>
            ))}
          </div>

          {/* Prev/Next arrows */}
          <div className="absolute bottom-8 right-8 z-30 flex items-center gap-2">
            <button onClick={handlePrev} aria-label="Previous"
              className="w-10 h-10 rounded-full flex items-center justify-center border transition-all hover:scale-105 active:scale-95"
              style={{ background: 'rgba(247,244,237,0.08)', border: '1px solid rgba(247,244,237,0.2)', color: '#F7F4ED', backdropFilter: 'blur(8px)' }}>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={handleNext} aria-label="Next"
              className="w-10 h-10 rounded-full flex items-center justify-center border transition-all hover:scale-105 active:scale-95"
              style={{ background: 'rgba(247,244,237,0.08)', border: '1px solid rgba(247,244,237,0.2)', color: '#F7F4ED', backdropFilter: 'blur(8px)' }}>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Slide count */}
          <div className="absolute right-8 bottom-18 z-30 hidden md:flex items-center gap-2"
            style={{ color: 'rgba(247,244,237,0.4)', fontSize: '0.6875rem', fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '0.12em' }}>
            <span style={{ color: '#C8A96B', fontWeight: 600 }}>{(currentIdx + 1).toString().padStart(2, '0')}</span>
            <span>/</span>
            <span>{slides.length.toString().padStart(2, '0')}</span>
          </div>
        </>
      )}

      {/* ── Scroll indicator ── */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4, duration: 0.8 }}
        className="absolute bottom-10 left-8 z-30 hidden md:flex flex-col items-center gap-2">
        <span className="text-[10px] font-semibold tracking-[0.2em] uppercase" style={{ color: 'rgba(247,244,237,0.35)', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
          Scroll
        </span>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="w-px h-10" style={{ background: 'linear-gradient(180deg, rgba(200,169,107,0.6), transparent)' }} />
      </motion.div>
    </section>
  )
}