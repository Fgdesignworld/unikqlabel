import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Quote, Star, ChevronLeft, ChevronRight } from "lucide-react"

const reviews = [
  {
    name: "Dr. Aditya Reddy",
    handle: "@aditya.wellness",
    location: "Mumbai",
    text: "I replaced my 4 PM espresso with a Shilajit Cookie, and the change is night and day. The focus is incredibly sharp, and there are absolutely no sugar crashes. A absolute game-changer for my clinic hours.",
    rating: 5,
    avatar: "AR",
  },
  {
    name: "Sanjana Sen",
    handle: "@sanjana.yoga",
    location: "Bangalore",
    text: "The Ashwagandha Cookies have become my post-yoga wind-down ritual. They taste like a gourmet bakery treat, but leave me feeling grounded and completely relaxed. It's rare to find something that tastes this good and is actually functional.",
    rating: 5,
    avatar: "SS",
  },
  {
    name: "Vikram Malhotra",
    handle: "@vikram.trains",
    location: "New Delhi",
    text: "As a professional athlete, I'm picky about my macros. The Whey Protein Cookies give me 10g of clean protein with ragi and almonds, without the artificial chemical taste of protein bars. It's clean wellness done right.",
    rating: 5,
    avatar: "VM",
  },
  {
    name: "Meera Nair",
    handle: "@meera.healthy",
    location: "Kochi",
    text: "My children and I absolutely love the Ragi and Almond base. Knowing there is zero refined sugar and actual adaptogenic support makes this the only cookie brand in our pantry. Highly recommend!",
    rating: 5,
    avatar: "MN",
  }
]

export function ReviewsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1)
      setCurrentIndex((prev) => (prev + 1) % reviews.length)
    }, 6000)
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
    enter: (dir: number) => ({ x: dir > 0 ? 50 : -50, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir < 0 ? 50 : -50, opacity: 0 }),
  }

  const review = reviews[currentIndex]

  return (
    <section className="py-24 px-4 relative overflow-hidden" style={{ background: 'var(--surface-page)' }}>
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-5 pointer-events-none" style={{ background: "radial-gradient(circle, var(--theme-color) 0%, transparent 70%)" }} />

      <div className="container mx-auto max-w-4xl relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16">
          <span className="section-badge mb-4">Customer Trust</span>
          <h2 className="font-serif text-4xl md:text-5xl font-normal text-foreground mt-4 tracking-tight">
            Word On The <span className="text-gradient-gold italic">Street.</span>
          </h2>
        </div>

        {/* Carousel Card */}
        <div className="relative max-w-3xl mx-auto">
          <div className="rounded-3xl p-8 md:p-14 min-h-[300px] flex items-center justify-center overflow-hidden relative border border-border"
            style={{
              background: 'var(--surface-card)',
              backdropFilter: 'blur(20px)',
              boxShadow: 'var(--card-shadow, 0 20px 40px rgba(0,0,0,0.08))',
            }}>

            {/* Background quote glow */}
            <Quote
              className="absolute top-6 left-8 opacity-[0.05]"
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
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="text-center w-full"
              >
                {/* Stars */}
                <div className="flex items-center justify-center gap-1 mb-6">
                  {[...Array(review.rating)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                    </motion.div>
                  ))}
                </div>

                {/* Review Text */}
                <p className="font-serif text-xl md:text-2xl italic mb-8 leading-relaxed text-foreground">
                  &ldquo;{review.text}&rdquo;
                </p>

                {/* Author Info */}
                <div className="flex items-center justify-center gap-3">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center font-sans font-bold text-sm flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, var(--theme-color), #A57E37)', color: '#151515' }}>
                    {review.avatar}
                  </div>
                  <div className="text-left font-sans">
                    <p className="font-semibold text-sm text-foreground">{review.name}</p>
                    <p className="text-xs text-muted-foreground">{review.handle} · {review.location}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Controls */}
          <button 
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-6 w-11 h-11 rounded-full flex items-center justify-center border border-border text-muted-foreground hover:text-primary transition-all cursor-pointer"
            style={{ background: 'var(--surface-alt)', backdropFilter: 'blur(10px)' }}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button 
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-6 w-11 h-11 rounded-full flex items-center justify-center border border-border text-muted-foreground hover:text-primary transition-all cursor-pointer"
            style={{ background: 'var(--surface-alt)', backdropFilter: 'blur(10px)' }}
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dot Indicators */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => { setDirection(index > currentIndex ? 1 : -1); setCurrentIndex(index); }}
                className="h-1.5 rounded-full transition-all duration-400 cursor-pointer"
                style={{
                  width: index === currentIndex ? 24 : 6,
                  background: index === currentIndex ? 'var(--theme-color)' : 'var(--border)',
                }}
              />
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
