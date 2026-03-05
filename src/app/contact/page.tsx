

import { useState } from "react"
import { motion } from "framer-motion"
import { Phone, MapPin, Send, CheckCircle } from "lucide-react"
import { WhatsAppIcon } from '@/components/icons/whatsapp'
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageHeader } from "@/components/page-header"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    message: "",
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Generate WhatsApp message
    const message = `Hello! My name is ${formData.name}.\n\nPhone: ${formData.phone}\n\nMessage: ${formData.message}`
    const encodedMessage = encodeURIComponent(message)
    
    // Open WhatsApp
    window.open(`https://wa.me/918639424039?text=${encodedMessage}`, "_blank")
    
    setIsSubmitted(true)
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({ name: "", phone: "", message: "" })
    }, 3000)
  }

  return (
    <main className="min-h-screen bg-[#0f0f0f]">
      <Navbar />
      <PageHeader
        title="Contact Us"
        subtitle="We would love to hear from you. Get in touch with us!"
        backgroundImage="/images/our-ingredients.jpg"
      />

      <section className="px-4 pb-20">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#fef3e2] mb-6">
                Get in Touch
              </h2>
              <p className="text-[#fef3e2]/70 mb-8 leading-relaxed">
                Have questions about our products? Want to place a bulk order? 
                Or just want to say hello? We are here to help!
              </p>

              <div className="space-y-6 mb-10">
                <a
                  href="https://wa.me/918639424039"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-[#25D366]/10 rounded-xl border border-[#25D366]/20 hover:border-[#25D366]/40 transition-colors group"
                >
                    <div className="w-12 h-12 bg-[#25D366] rounded-full flex items-center justify-center flex-shrink-0">
                    <WhatsAppIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-[#fef3e2] font-medium group-hover:text-[#25D366] transition-colors">
                      WhatsApp
                    </p>
                    <p className="text-[#fef3e2]/60 text-sm">+91 8639424039</p>
                  </div>
                </a>

                <a
                  href="tel:+918639424039"
                  className="flex items-center gap-4 p-4 bg-[#d97706]/10 rounded-xl border border-[#d97706]/20 hover:border-[#d97706]/40 transition-colors group"
                >
                  <div className="w-12 h-12 bg-[#d97706] rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-[#0f0f0f]" />
                  </div>
                  <div>
                    <p className="text-[#fef3e2] font-medium group-hover:text-[#d97706] transition-colors">
                      Phone
                    </p>
                    <p className="text-[#fef3e2]/60 text-sm">+91 8639424039</p>
                  </div>
                </a>

                <div className="flex items-center gap-4 p-4 bg-[#d97706]/10 rounded-xl border border-[#d97706]/20">
                  <div className="w-12 h-12 bg-[#d97706] rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-[#0f0f0f]" />
                  </div>
                  <div>
                    <p className="text-[#fef3e2] font-medium">Location</p>
                    <p className="text-[#fef3e2]/60 text-sm">Andhra Pradesh, India</p>
                  </div>
                </div>
              </div>

              {/* WhatsApp CTA */}
              <a
                href="https://wa.me/918639424039"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#25D366] text-white font-bold rounded-full hover:bg-[#128C7E] transition-colors w-full sm:w-auto justify-center"
              >
                <WhatsAppIcon className="w-5 h-5" />
                Order on WhatsApp
              </a>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="p-8 bg-gradient-to-br from-[#1a1410] to-[#0f0f0f] rounded-3xl border border-[#d97706]/10">
                <h2 className="font-serif text-2xl font-bold text-[#fef3e2] mb-6">
                  Send us a Message
                </h2>

                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <div className="w-16 h-16 bg-[#25D366]/20 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle className="w-8 h-8 text-[#25D366]" />
                    </div>
                    <p className="text-[#fef3e2] font-medium text-lg">Message Sent!</p>
                    <p className="text-[#fef3e2]/60 text-sm mt-2">
                      Redirecting to WhatsApp...
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-[#fef3e2]/80 text-sm font-medium mb-2">
                        Your Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 bg-[#0f0f0f]/50 border border-[#d97706]/20 rounded-xl text-[#fef3e2] placeholder-[#fef3e2]/30 focus:border-[#d97706]/50 focus:outline-none transition-colors"
                        placeholder="Enter your name"
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-[#fef3e2]/80 text-sm font-medium mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 bg-[#0f0f0f]/50 border border-[#d97706]/20 rounded-xl text-[#fef3e2] placeholder-[#fef3e2]/30 focus:border-[#d97706]/50 focus:outline-none transition-colors"
                        placeholder="Enter your phone number"
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-[#fef3e2]/80 text-sm font-medium mb-2">
                        Message
                      </label>
                      <textarea
                        id="message"
                        required
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full px-4 py-3 bg-[#0f0f0f]/50 border border-[#d97706]/20 rounded-xl text-[#fef3e2] placeholder-[#fef3e2]/30 focus:border-[#d97706]/50 focus:outline-none transition-colors resize-none"
                        placeholder="Type your message here..."
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#d97706] text-[#0f0f0f] font-bold rounded-xl hover:bg-[#f59e0b] transition-colors"
                    >
                      <Send className="w-5 h-5" />
                      Send Message
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
