"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Phone, MapPin, Send, CheckCircle, Mail, MessageSquare, Loader2, ChevronDown } from "lucide-react"
import { WhatsAppIcon } from "@/components/icons/whatsapp"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useSeo } from "@/hooks/use-seo"
import { useSettings } from "@/context/settings-context"
import { leadService, type LeadPayload } from "@/services/leadService"

const inquiryOptions = [
  { value: "order",         label: "Place an Order" },
  { value: "bulk",          label: "Wholesale & Spas" },
  { value: "custom_design", label: "Spa & Corporate Gifting" },
  { value: "support",       label: "Formulation Questions" },
  { value: "other",         label: "Other" },
]

const contactMethods = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "call",     label: "Phone Call" },
  { value: "email",    label: "Email" },
]

export default function ContactPage() {
  useSeo({ pageType: "page", pageSlug: "contact", fallbackTitle: "Contact Our Wellness Team — Aarvia" })
  const { settings } = useSettings()
  const [formData, setFormData] = useState({
    name: "", phone: "", email: "",
    inquiry_type: "other" as LeadPayload["inquiry_type"],
    message: "",
    preferred_contact: "whatsapp" as LeadPayload["preferred_contact"],
    website: "", // honeypot
  })
  const [errors, setErrors]     = useState<Record<string, string>>({})
  const [loading, setLoading]   = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [apiErr, setApiErr]     = useState("")

  const validate = () => {
    const e: Record<string, string> = {}
    if (!formData.name.trim())    e.name    = "Name is required"
    if (!formData.phone.trim())   e.phone   = "Phone is required"
    else if (!/^\+?[\d\s\-]{8,20}$/.test(formData.phone)) e.phone = "Enter a valid phone number"
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) e.email = "Enter a valid email"
    if (!formData.message.trim()) e.message = "Message is required"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setApiErr("")
    try {
      await leadService.submit({
        name:              formData.name,
        phone:             formData.phone,
        email:             formData.email || undefined,
        inquiry_type:      formData.inquiry_type,
        message:           formData.message,
        preferred_contact: formData.preferred_contact,
        website:           formData.website,
      })
      setIsSubmitted(true)
      setFormData({ name: "", phone: "", email: "", inquiry_type: "other", message: "", preferred_contact: "whatsapp", website: "" })
    } catch (err: any) {
      setApiErr(err?.response?.data?.error || "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const setField = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(f => ({ ...f, [k]: e.target.value }))
    if (errors[k]) setErrors(er => ({ ...er, [k]: "" }))
  }

  const contactCards = [
    {
      icon: WhatsAppIcon,
      label: "WhatsApp Chat",
      value: settings?.whatsapp || settings?.phone || "+91 8639424039",
      href: settings?.whatsapp ? `https://wa.me/${String(settings.whatsapp).replace(/\D/g, "")}` : "https://wa.me/918639424039",
      external: true,
      color: "#1F4D3A",
      bg: "rgba(31,77,58,0.02)",
      border: "rgba(200,169,107,0.15)",
    },
    {
      icon: Phone,
      label: "Wellness Phone",
      value: settings?.phone || "+91 8639424039",
      href: settings?.phone ? `tel:${settings.phone}` : "tel:+918639424039",
      external: false,
      color: "#1F4D3A",
      bg: "rgba(31,77,58,0.02)",
      border: "rgba(200,169,107,0.15)",
    },
    {
      icon: MapPin,
      label: "Headquarters",
      value: settings?.address || "Hyderabad, Telangana, India",
      href: null,
      external: false,
      color: "#1F4D3A",
      bg: "rgba(31,77,58,0.02)",
      border: "rgba(200,169,107,0.15)",
    },
    {
      icon: Mail,
      label: "Wellness Email",
      value: settings?.email || "care@aarvia.co",
      href: `mailto:${settings?.email || "care@aarvia.co"}`,
      external: false,
      color: "#1F4D3A",
      bg: "rgba(31,77,58,0.02)",
      border: "rgba(200,169,107,0.15)",
    },
  ]

  const inputCls = (k: string) => {
    const base = "w-full px-0 py-3 bg-transparent text-sm font-sans outline-none transition-all duration-300 border-b"
    const err  = errors[k]
    return `${base} ${err
      ? "border-red-500 text-red-900 placeholder-red-300 focus:border-red-600"
      : "border-[#1F4D3A]/20 text-[#1F4D3A] placeholder-[#1F4D3A]/40 focus:border-[#C8A96B]"
    }`
  }

  const waRaw    = settings?.whatsapp || settings?.phone || "918639424039"
  const waNumber = String(waRaw).replace(/\D/g, "")

  return (
    <main className="min-h-screen" style={{ background: "#FDFBF7" }}>
      <Navbar />

      {/* Custom Premium Hero */}
      <section className="relative h-[55vh] min-h-[450px] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1600&auto=format&fit=crop" 
            alt="Aarvia Wellness Consultation" 
            className="w-full h-full object-cover"
            style={{ objectPosition: 'center 40%' }}
          />
          <div className="absolute inset-0 bg-[#1F4D3A]/60 mix-blend-multiply" />
          <div className="absolute inset-0 bg-black/30" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center mt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#C8A96B] block mb-4 drop-shadow-md">
              Connect With Us
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light text-[#FDFBF7] leading-[1.1] mb-6 drop-shadow-lg">
              Let's Begin Your<br />
              <span className="italic text-[#C8A96B]">Wellness Consultation</span>
            </h1>
            <p className="text-sm md:text-base font-light text-white/90 max-w-2xl mx-auto leading-relaxed drop-shadow-md" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Every ritual is unique, and so is our approach. Speak directly with our botanical experts for personalized advice, corporate gifting, or wholesale inquiries. We are here to listen.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Separated Content Section */}
      <section className="py-20 lg:py-32 bg-[#FDFBF7] px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">

            {/* ── Left: Info & Visual ── */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="space-y-12 lg:pr-8"
            >
              {/* Text Area */}
              <div>
                <h2 className="font-serif text-3xl md:text-4xl text-[#1F4D3A] font-light mb-6">
                  We are here for you.
                </h2>
                <p className="text-base leading-relaxed text-[#6B6B60] font-sans font-light">
                  Have a question about our active botanical formulations, order statuses, or custom corporate/spa gifting? Reach out to our wellness team, and we will guide you.
                </p>
                
                {/* Contact Cards */}
                <div className="mt-12 space-y-2">
                  {contactCards.map((card) => {
                    const inner = (
                      <div className="flex items-center gap-6 py-4 border-b border-[#1F4D3A]/10 transition-all duration-300 hover:border-[#C8A96B] group cursor-pointer">
                        <div className="w-12 h-12 flex items-center justify-center">
                          <card.icon className="w-5 h-5 text-[#C8A96B] group-hover:scale-110 transition-transform duration-500" strokeWidth={1.5} />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-widest font-bold text-[#C8A96B] mb-1">{card.label}</p>
                          <p className="text-sm font-medium text-[#1F4D3A]">{card.value}</p>
                        </div>
                      </div>
                    )

                    if (card.href) {
                      return (
                        <a key={card.label} href={card.href} target={card.external ? "_blank" : undefined} rel={card.external ? "noopener noreferrer" : undefined} className="block">
                          {inner}
                        </a>
                      )
                    }

                    return <div key={card.label}>{inner}</div>
                  })}
                </div>

                {/* WhatsApp CTA */}
                <a
                  href={`https://wa.me/${waNumber}?text=${encodeURIComponent("Hi! I have a question about Aarvia premium botanical wellness products.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-12 flex items-center justify-center gap-3 w-full py-4 border border-[#1F4D3A] text-[#1F4D3A] font-bold text-[10px] tracking-[0.2em] uppercase hover:bg-[#1F4D3A] hover:text-[#FDFBF7] transition-colors duration-500"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                  Chat on WhatsApp
                </a>
              </div>
            </motion.div>

            {/* ── Right: Form ── */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="bg-white p-8 md:p-12 lg:p-16 border border-[#1F4D3A]/10 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#C8A96B]/5 blur-[80px] rounded-full pointer-events-none" />
              
              <div className="flex items-center gap-4 mb-10 relative z-10">
                <MessageSquare className="w-6 h-6 text-[#C8A96B]" strokeWidth={1.5} />
                <h2 className="text-3xl font-serif text-[#1F4D3A] font-light">Send a Message</h2>
              </div>

              <AnimatePresence mode="wait">
                {isSubmitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col items-center justify-center py-20 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 12 }}
                      className="w-20 h-20 rounded-full flex items-center justify-center mb-6 bg-[#F9F6F0]"
                    >
                      <CheckCircle className="w-10 h-10 text-[#C8A96B]" strokeWidth={1} />
                    </motion.div>
                    <p className="text-2xl font-serif font-light mb-3 text-[#1F4D3A]">Inquiry Sent Successfully</p>
                    <p className="text-sm font-light text-[#6A6A60] max-w-sm mx-auto" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>We will review your message and reach out within 24 hours via your preferred contact channel.</p>
                    <button
                      className="mt-8 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C8A96B] hover:text-[#1F4D3A] transition-colors"
                      onClick={() => setIsSubmitted(false)}
                    >
                      Send another message
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit}
                    className="space-y-8 relative z-10"
                    noValidate
                  >
                    {/* Honeypot */}
                    <input type="text" name="website" value={formData.website} onChange={setField("website")} className="hidden" tabIndex={-1} autoComplete="off" />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#C8A96B] mb-2">Your Name *</label>
                        <input type="text" placeholder="John Doe" value={formData.name} onChange={setField("name")} className={inputCls("name")} />
                        {errors.name && <p className="text-red-500 text-xs mt-2">{errors.name}</p>}
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#C8A96B] mb-2">Phone *</label>
                        <input type="tel" placeholder="+1 (555) 000-0000" value={formData.phone} onChange={setField("phone")} className={inputCls("phone")} />
                        {errors.phone && <p className="text-red-500 text-xs mt-2">{errors.phone}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#C8A96B] mb-2">Email (Optional)</label>
                        <input type="email" placeholder="john@example.com" value={formData.email} onChange={setField("email")} className={inputCls("email")} />
                        {errors.email && <p className="text-red-500 text-xs mt-2">{errors.email}</p>}
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#C8A96B] mb-2">Inquiry Type</label>
                        <div className="relative">
                          <select value={formData.inquiry_type} onChange={setField("inquiry_type")} className={`${inputCls("inquiry_type")} appearance-none pr-10 cursor-pointer`}>
                            {inquiryOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1F4D3A]/40 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#C8A96B] mb-2">Message *</label>
                      <textarea rows={3} placeholder="How can we help you?" value={formData.message} onChange={setField("message")} className={`${inputCls("message")} resize-none py-2`} />
                      {errors.message && <p className="text-red-500 text-xs mt-2">{errors.message}</p>}
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#C8A96B] mb-4">Preferred Contact Channel</label>
                      <div className="flex flex-wrap sm:flex-nowrap gap-3">
                        {contactMethods.map(m => (
                          <button
                            key={m.value}
                            type="button"
                            onClick={() => setFormData(f => ({ ...f, preferred_contact: m.value as LeadPayload["preferred_contact"] }))}
                            className={`flex-1 py-3 px-4 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 border ${
                              formData.preferred_contact === m.value
                                ? "border-[#C8A96B] bg-[#F9F6F0] text-[#1F4D3A]"
                                : "border-transparent bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-[#1F4D3A]"
                            }`}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {apiErr && (
                      <div className="px-4 py-3 border border-red-200 bg-red-50 text-red-600 text-sm font-sans rounded-xl">
                        {apiErr}
                      </div>
                    )}

                    <div className="pt-4">
                      <button
                        className="w-full py-4 md:py-5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-500 hover:opacity-90 disabled:opacity-60 flex items-center justify-center group"
                        type="submit"
                        disabled={loading}
                        style={{ background: "#1F4D3A", color: "#FDFBF7" }}
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin text-[#FDFBF7]" /> : <Send className="w-4 h-4 text-[#FDFBF7] group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform duration-300" />}
                        <span className="ml-3 text-[#FDFBF7]">{loading ? "Sending..." : "Send Message"}</span>
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
