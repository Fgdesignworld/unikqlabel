import { useRef } from "react"
import { useScroll, useTransform, useSpring, motion } from "framer-motion"

export interface StoryCardItem {
  badge: string
  title: string
  body: string
  image: string
}

interface StoryStackCardsProps {
  cards: StoryCardItem[]
}

// Single Chapter Card Wrapper using native CSS Sticky stacking + Framer Motion Spring transitions
function ChapterCard({ 
  card, 
  idx, 
  total 
}: { 
  card: StoryCardItem; 
  idx: number; 
  total: number 
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Track scroll position relative to this card's wrapper container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })

  // Smooth Spring config for organic, Apple-like fluid motion
  const springConfig = { stiffness: 90, damping: 22, mass: 0.5 }

  // Wrapper is h-[180vh]. Next card starts sliding up at 100vh.
  // 100vh / 180vh = 0.55 progress.
  // Previous card recedes in scale, opacity, and y translation in the range [0.55, 1.0] of scroll progress.
  const isLastCard = idx === total - 1

  const rawScale = useTransform(scrollYProgress, [0.55, 1.0], [1.0, 0.95], { clamp: true })
  const rawY = useTransform(scrollYProgress, [0.55, 1.0], [0, -48], { clamp: true })
  const rawOpacity = useTransform(scrollYProgress, [0.55, 0.95], [1.0, 0.45], { clamp: true })

  // Apply spring physics to transformations for ultra-smooth rendering
  const scale = useSpring(isLastCard ? 1.0 : rawScale, springConfig)
  const y = useSpring(isLastCard ? 0 : rawY, springConfig)
  const opacity = useSpring(isLastCard ? 1.0 : rawOpacity, springConfig)

  // Card horizontal progress bar fills up until the recede starts (0 to 0.55)
  const rawFillProgress = useTransform(scrollYProgress, [0, 0.55], [0, 1], { clamp: true })
  const fillProgress = useSpring(rawFillProgress, springConfig)

  // Image zoom/shift parallax mapping across wrapper viewport crossing
  const { scrollYProgress: imgProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })
  const rawImageY = useTransform(imgProgress, [0, 1], [-60, 60], { clamp: true })
  const yImage = useSpring(rawImageY, springConfig)

  return (
    <div 
      ref={containerRef}
      className="relative w-full"
      style={{ 
        height: isLastCard ? "100vh" : "180vh",
        marginTop: idx === 0 ? "0" : "-80vh",
        zIndex: idx + 10 
      }}
    >
      {/* Sticky card viewport container - clears fixed header at top-16 */}
      <motion.div 
        style={{ scale, opacity, y }}
        className="sticky top-16 h-[calc(100vh-64px)] w-full flex items-center justify-center p-4 md:p-8 lg:p-12 overflow-hidden"
      >
        {/* Card Content container - responsive grid */}
        <div 
          className="w-full max-w-6xl md:h-[62vh] lg:h-[68vh] max-h-[560px] rounded-[32px] overflow-hidden flex flex-col md:grid md:grid-cols-2 shadow-[0_30px_80px_rgba(31,77,58,0.12)] border items-stretch"
          style={{ 
            background: idx % 2 === 0 ? '#FFFFFF' : '#F9F6F0',
            borderColor: 'rgba(200,169,107,0.15)',
            color: '#1F4D3A'
          }}
        >
          {/* Narrative Block */}
          <div className={`p-8 md:p-10 lg:p-12 flex flex-col justify-between order-2 flex-1 ${idx % 2 === 0 ? 'md:order-1' : 'md:order-2'}`}>
            {/* Top Chapter and Progress Count */}
            <div className="flex items-center justify-between mb-4 md:mb-0">
              <span className="text-[10px] font-bold tracking-[0.26em] uppercase" style={{ color: '#C8A96B' }}>
                Chapter {idx + 1}
              </span>
              <span className="text-xs font-serif italic" style={{ color: 'rgba(31,77,58,0.5)' }}>
                {String(idx + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
              </span>
            </div>

            {/* Title & Body */}
            <div className="my-auto space-y-4 md:space-y-5">
              <div className="space-y-2">
                <span className="text-[11px] font-bold tracking-[0.3em] uppercase block" style={{ color: '#C8A96B' }}>
                  {card.badge}
                </span>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-light leading-tight">
                  {card.title}
                </h2>
              </div>
              
              <div className="w-14 h-[1.5px]" style={{ background: '#C8A96B' }} />
              
              <p className="text-sm md:text-base leading-relaxed" style={{ color: '#6A6A60', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {card.body}
              </p>
            </div>

            {/* Card Progress Line */}
            <div className="w-full h-[1px] bg-[#C8A96B]/20 relative overflow-hidden mt-6 md:mt-0">
              <motion.div 
                style={{ scaleX: isLastCard ? scrollYProgress : fillProgress, transformOrigin: "left", background: '#C8A96B' }}
                className="absolute inset-0"
              />
            </div>
          </div>

          {/* Image Block */}
          <div 
            className={`relative overflow-hidden w-full h-[200px] md:h-auto order-1 border-b md:border-b-0 ${idx % 2 === 0 ? 'md:order-2 md:border-l' : 'md:order-1 md:border-r'}`} 
            style={{ borderColor: idx % 2 === 0 ? 'rgba(200,169,107,0.15)' : 'rgba(200,169,107,0.25)' }}
          >
            <motion.div 
              style={{ y: yImage }}
              className="absolute inset-0 -top-16 -bottom-16 w-full h-[calc(100%+128px)]"
            >
              <img 
                src={card.image} 
                alt={card.title} 
                className="w-full h-full object-cover brightness-[0.85] saturate-[0.85]" 
              />
            </motion.div>
            
            {/* Soft overlay */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/20 via-transparent to-transparent z-10" />
            
            {/* Chapter watermark */}
            <div className="absolute right-6 bottom-6 opacity-20 select-none z-10 pointer-events-none">
              <span 
                style={{ 
                  fontFamily: "'Cormorant Garamond', serif", 
                  fontSize: '6.5rem', 
                  fontWeight: 700, 
                  color: idx % 2 === 0 ? '#1F4D3A' : '#C8A96B', 
                  lineHeight: 1 
                }}
              >
                {String(idx + 1).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export function StoryStackCards({ cards }: StoryStackCardsProps) {
  return (
    <div className="w-full">
      {cards.map((card, idx) => (
        <ChapterCard 
          key={card.badge} 
          card={card} 
          idx={idx} 
          total={cards.length} 
        />
      ))}
    </div>
  )
}
