import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Quote, Star, ChevronLeft, ChevronRight } from "lucide-react"

const reviews = [
  {
    name: "Sai Kiran Reddy",
    handle: "@sai.kiran",
    location: "Hyderabad",
    text: "UNIKQ LABEL changed how I dress. The quality is absolutely fire — premium stitching, perfect fit. Feels like I'm wearing luxury without the crazy price tag.",
    rating: 5,
    avatar: "SK",
  },
  // {
  //   name: "Sravani Lakshmi",
  //   handle: "@sravani.style",
  //   location: "Vijayawada",
  //   text: "Finally a brand that gets unisex fashion RIGHT. The Queen Collection is stunning — I get compliments every single time I wear it.",
  //   rating: 5,
  //   avatar: "SL",
  // },
  // {
  //   name: "Rahul Chowdary",
  //   handle: "@rahul.royal",
  //   location: "Guntur",
  //   text: "The King Collection hoodie is my go-to. Fabric quality is insane, the gold embroidery adds that royal touch. 100% buying again.",
  //   rating: 5,
  //   avatar: "RC",
  // },
  {
    name: "Anusha Reddy",
    handle: "@anusha.trends",
    location: "Warangal",
    text: "Ordered 3 pieces in one go. Super fast delivery, packaging was premium, and the clothes feel like they're worth 3x the price. Love UNIKQ!",
    rating: 5,
    avatar: "AR",
  },
];

export function ReviewsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1)
      setCurrentIndex((prev) => (prev + 1) % reviews.length)
    }, 5500)
    return () => clearInterval(timer)
  }, [])

  const goToPrevious = () => {
    setDirection(-1)
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length)
  }

  const goToNext = () => {
    setDirection(1)
    setCurrentIndex((prev) => (prev + 1) % reviews.length)
  }

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir < 0 ? 80 : -80, opacity: 0 }),
  }

  const review = reviews[currentIndex]

  return (
    <section className="py-10 px-4" style={{ background: 'var(--surface-page)' }}>
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <span className="section-badge mb-4 inline-block">Community</span>
          <h2 className="font-heading text-4xl md:text-5xl font-black mt-3" style={{ color: 'var(--text-primary)' }}>
            What{" "}
            <span style={{
              background: 'linear-gradient(135deg, color-mix(in srgb, var(--theme-color) 90%, white) 0%, var(--theme-color) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>They Say</span>
          </h2>
          <div className="w-20 h-0.5 mx-auto mt-5" style={{ background: 'linear-gradient(90deg, transparent, var(--theme-color), transparent)' }} />
        </motion.div>

        {/* Carousel */}
        <div className="relative">
          <div className="rounded-3xl p-8 md:p-14 min-h-[280px] flex items-center justify-center overflow-hidden relative"
            style={{
              background: 'var(--surface-card)',
              border: '1px solid rgba(212,175,55,0.12)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 30px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(212,175,55,0.08)',
            }}>

            {/* Background quote glow */}
            <Quote
              className="absolute top-6 left-8 opacity-[0.06]"
              style={{ color: 'var(--theme-color)', width: 80, height: 80 }}
            />

            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="text-center w-full"
              >
                {/* Stars - animated */}
                <div className="flex items-center justify-center gap-1 mb-5">
                  {[...Array(review.rating)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.06 }}
                    >
                      <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                    </motion.div>
                  ))}
                </div>

                <p className="font-heading text-lg md:text-2xl italic mb-7 leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                  &ldquo;{review.text}&rdquo;
                </p>

                {/* Avatar + Info */}
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, var(--theme-color), color-mix(in srgb, var(--theme-color) 80%, black))', color: '#0D0D0D' }}>
                    {review.avatar}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{review.name}</p>
                    <p className="text-xs" style={{ color: 'rgba(212,175,55,0.7)' }}>{review.handle} · {review.location}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <button onClick={goToPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-6 w-11 h-11 rounded-full flex items-center justify-center transition-all hover:-translate-x-5 md:hover:-translate-x-7"
            style={{ background: 'rgba(212,175,55,0.10)', border: '1px solid rgba(212,175,55,0.20)' }}>
            <ChevronLeft className="w-5 h-5 text-amber-500" />
          </button>
          <button onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-6 w-11 h-11 rounded-full flex items-center justify-center transition-all hover:translate-x-5 md:hover:translate-x-7"
            style={{ background: 'rgba(212,175,55,0.10)', border: '1px solid rgba(212,175,55,0.20)' }}>
            <ChevronRight className="w-5 h-5 text-amber-500" />
          </button>

          {/* Dots */}
          <div className="flex items-center justify-center gap-2 mt-7">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => { setDirection(index > currentIndex ? 1 : -1); setCurrentIndex(index); }}
                className="h-1.5 rounded-full transition-all duration-400"
                style={{
                  width: index === currentIndex ? 28 : 6,
                  background: index === currentIndex ? 'var(--theme-color)' : 'rgba(212,175,55,0.25)',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
