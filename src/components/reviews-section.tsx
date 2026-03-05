

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Quote, Star, ChevronLeft, ChevronRight } from "lucide-react"

const reviews = [
  {
    name: "Priya Reddy",
    location: "Hyderabad",
    text: "Best homemade pickles I tasted in years! The authentic Andhra flavors remind me of my grandmother's cooking. Absolutely delicious!",
    rating: 5,
  },
  {
    name: "Ravi Kumar",
    location: "Bangalore",
    text: "Authentic Andhra snacks that are crispy and flavorful. The Palli Pakodi is simply amazing. Will definitely order again!",
    rating: 5,
  },
  {
    name: "Lakshmi Devi",
    location: "Chennai",
    text: "Perfect spice balance in every product. The Kobbari Karam with hot rice is heavenly. True traditional taste!",
    rating: 5,
  },
  {
    name: "Srinivas Rao",
    location: "Vijayawada",
    text: "Finally found authentic homemade sweets online. The Nethi Sunnunda melts in your mouth. Outstanding quality!",
    rating: 5,
  },
]

export function ReviewsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1)
      setCurrentIndex((prev) => (prev + 1) % reviews.length)
    }, 5000)
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
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
    }),
  }

  return (
    <section className="py-20 px-4 bg-[#0f0f0f]">
      <div className="container mx-auto max-w-4xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-[#d97706] text-sm font-medium tracking-wider uppercase">Testimonials</span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#fef3e2] mt-2">
            Customer Reviews
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#d97706] to-transparent mx-auto mt-4" />
        </motion.div>

        {/* Reviews Carousel */}
        <div className="relative">
          <div className="glass rounded-2xl p-8 md:p-12 min-h-[300px] flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4 }}
                className="text-center"
              >
                <Quote className="w-12 h-12 text-[#d97706]/30 mx-auto mb-6" />
                
                {/* Rating */}
                <div className="flex items-center justify-center gap-1 mb-4">
                  {[...Array(reviews[currentIndex].rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[#f59e0b] text-[#f59e0b]" />
                  ))}
                </div>

                <p className="font-serif text-xl md:text-2xl text-[#fef3e2] italic mb-6 leading-relaxed">
                  &ldquo;{reviews[currentIndex].text}&rdquo;
                </p>

                <div>
                  <p className="text-[#f59e0b] font-semibold">{reviews[currentIndex].name}</p>
                  <p className="text-[#fef3e2]/60 text-sm">{reviews[currentIndex].location}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-6 w-12 h-12 rounded-full bg-[#d97706]/20 hover:bg-[#d97706]/40 flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-[#fef3e2]" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-6 w-12 h-12 rounded-full bg-[#d97706]/20 hover:bg-[#d97706]/40 flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-6 h-6 text-[#fef3e2]" />
          </button>

          {/* Dots */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1)
                  setCurrentIndex(index)
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex ? "w-8 bg-[#d97706]" : "bg-[#d97706]/30"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
