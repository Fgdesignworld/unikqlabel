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
      href: settings?.whatsapp ? `https://wa.me/${String(settings.whatsapp).replace(/\D/g, "")}` : "#",
      external: true,
      color: "#1F4D3A",
      bg: "rgba(31,77,58,0.02)",
      border: "rgba(200,169,107,0.15)",
    },
    {
      icon: Phone,
      label: "Wellness Phone",
      value: settings?.phone || "+91 8639424039",
      href: settings?.phone ? `tel:${settings.phone}` : "#",
      external: false,
      color: "#1F4D3A",
      bg: "rgba(31,77,58,0.02)",
      border: "rgba(200,169,107,0.15)",
    },
    {
      icon: MapPin,
      label: "Headquarters",
      value: settings?.address || "Hyderabad, India",
      href: null,
      external: false,
      color: "#1F4D3A",
      bg: "rgba(31,77,58,0.02)",
      border: "rgba(200,169,107,0.15)",
    },
    ...(settings?.email ? [{
      icon: Mail,
      label: "Wellness Email",
      value: settings.email,
      href: `mailto:${settings.email}`,
      external: false,
      color: "#1F4D3A",
      bg: "rgba(31,77,58,0.02)",
      border: "rgba(200,169,107,0.15)",
    }] : []),
  ]

  const inputCls = (k: string) => {
    const base = "w-full px-4 py-3.5 rounded-xl text-sm font-sans outline-none transition-all duration-300"
    const err  = errors[k]
    return `${base} ${err
      ? "border border-red-500 bg-red-50/50 text-red-900 placeholder-red-300"
      : "border border-slate-200/80 bg-white text-[#1F4D3A] placeholder-slate-400 focus:border-[#C8A96B] focus:ring-1 focus:ring-[#C8A96B]"
    }`
  }

  const waRaw    = settings?.whatsapp || settings?.phone || "918639424039"
  const waNumber = String(waRaw).replace(/\D/g, "")

  return (
    <main className="min-h-screen" style={{ background: "#F7F4ED" }}>
      <Navbar />

      {/* Page Hero */}
      <div className="relative pt-20" style={{ background: "#1F4D3A", minHeight: "220px", display: "flex", alignItems: "flex-end" }}>
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(200,169,107,0.9) 1px, transparent 0)", backgroundSize: "24px 24px" }} />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full pb-12 pt-16">
          <p className="text-[11px] font-bold tracking-[0.26em] uppercase mb-3" style={{ color: "#C8A96B" }}>Get in Touch</p>
          <h1 className="text-4xl md:text-5xl font-serif" style={{ color: "#F7F4ED", fontWeight: 500 }}>Contact Us</h1>
        </div>
      </div>

      <section className="px-6 lg:px-8 pb-24 pt-16" style={{ background: "#F7F4ED" }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

            {/* ── Left: Info & Visual ── */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="space-y-10"
            >
              <div>
                <span className="text-[11px] font-bold tracking-[0.26em] uppercase mb-4 block" style={{ color: "#C8A96B" }}>Connect</span>
                <h2 className="font-serif text-3xl md:text-4xl font-normal mb-4 leading-tight text-[#1F4D3A]">
                  Let's Begin Your<br />
                  <span className="italic" style={{ color: "#C8A96B" }}>Wellness Consultation</span>
                </h2>
                <p className="text-sm leading-relaxed text-[#6B6B60] font-sans" style={{ fontWeight: 300 }}>
                  Have a question about our active botanical formulations, order statuses, or custom corporate/spa gifting? Reach out to our wellness team, and we will guide you.
                </p>
              </div>

              {/* Visual Panel */}
              <div className="relative aspect-[16/10] overflow-hidden border border-slate-200" style={{ borderColor: "rgba(200,169,107,0.15)" }}>
                <img
                  src="https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=600&auto=format&fit=crop"
                  alt="Aarvia Spa Consultation"
                  className="w-full h-full object-cover transition-transform duration-750 hover:scale-105"
                />
                <div className="absolute inset-0 bg-[#1F4D3A]/10 pointer-events-none" />
              </div>

              {/* Contact Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {contactCards.map((card) => {
                  const inner = (
                    <div
                      className="flex items-center gap-4 p-4 transition-all duration-300 hover:translate-x-1"
                      style={{ background: card.bg, border: `1px solid ${card.border}` }}
                    >
                      <div
                        className="shrink-0 rounded-full flex items-center justify-center w-10 h-10"
                        style={{ background: "rgba(31,77,58,0.04)", border: `1px solid ${card.border}` }}
                      >
                        <card.icon className="w-4.5 h-4.5" style={{ color: "#1F4D3A" }} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-xs uppercase tracking-wider text-[#1F4D3A]">{card.label}</p>
                        <p className="text-xs mt-0.5 text-ellipsis text-gray-500 truncate">{card.value}</p>
                      </div>
                    </div>
                  )

                  if (card.href) {
                    return (
                      <a
                        key={card.label}
                        href={card.href}
                        target={card.external ? "_blank" : undefined}
                        rel={card.external ? "noopener noreferrer" : undefined}
                        className="block"
                        aria-label={`${card.label} ${card.value}`}
                      >
                        {inner}
                      </a>
                    )
                  }

                  return (
                    <div key={card.label} tabIndex={0} role="button" aria-label={`${card.label} ${card.value}`}>
                      {inner}
                    </div>
                  )
                })}
              </div>

              {/* WhatsApp CTA */}
              <a
                href={`https://wa.me/${waNumber}?text=${encodeURIComponent("Hi! I have a question about Aarvia premium botanical wellness products.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 w-full sm:w-auto font-semibold tracking-wider uppercase transition-all duration-400 hover:opacity-90"
                style={{ background: "#1F4D3A", color: "#F7F4ED", fontSize: "0.75rem", letterSpacing: "0.14em" }}
              >
                <WhatsAppIcon className="w-4 h-4 fill-white" />
                Chat on WhatsApp
              </a>
            </motion.div>

            {/* ── Right: Form ── */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
            >
              <div className="p-8 md:p-10 bg-white border border-slate-200/80 shadow-[0_25px_60px_rgba(31,77,58,0.02)]">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(31,77,58,0.06)", border: "1px solid rgba(200,169,107,0.2)" }}>
                    <MessageSquare className="w-4 h-4" style={{ color: "#1F4D3A" }} />
                  </div>
                  <h2 className="text-2xl font-serif text-[#1F4D3A] font-semibold">Send a Message</h2>
                </div>

                <AnimatePresence mode="wait">
                  {isSubmitted ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex flex-col items-center justify-center py-14 text-center"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 12 }}
                        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                        style={{ background: "rgba(31,77,58,0.08)", border: "1px solid rgba(200,169,107,0.25)" }}
                      >
                        <CheckCircle className="w-8 h-8 text-[#1F4D3A]" />
                      </motion.div>
                      <p className="text-xl font-serif font-bold mb-2 text-[#1F4D3A]">Message Sent!</p>
                      <p className="text-sm text-gray-500 font-sans">We'll reach out within 24 hours via your preferred contact channel.</p>
                      <button
                        className="mt-5 text-xs underline text-[#C8A96B]"
                        onClick={() => setIsSubmitted(false)}
                      >
                        Send another message
                      </button>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      onSubmit={handleSubmit}
                      className="space-y-6"
                      noValidate
                    >
                      {/* Honeypot — hidden from real users */}
                      <input
                        type="text"
                        name="website"
                        value={formData.website}
                        onChange={setField("website")}
                        className="hidden"
                        tabIndex={-1}
                        autoComplete="off"
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-widest text-[#1F4D3A] mb-2">
                            Your Name *
                          </label>
                          <input
                            type="text"
                            placeholder="Enter your name"
                            value={formData.name}
                            onChange={setField("name")}
                            className={inputCls("name")}
                          />
                          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-widest text-[#1F4D3A] mb-2">
                            Phone *
                          </label>
                          <input
                            type="tel"
                            placeholder="Phone number"
                            value={formData.phone}
                            onChange={setField("phone")}
                            className={inputCls("phone")}
                          />
                          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-widest text-[#1F4D3A] mb-2">
                          Email (optional)
                        </label>
                        <input
                          type="email"
                          placeholder="your@email.com"
                          value={formData.email}
                          onChange={setField("email")}
                          className={inputCls("email")}
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-widest text-[#1F4D3A] mb-2">
                          Inquiry Type
                        </label>
                        <div className="relative">
                          <select
                            value={formData.inquiry_type}
                            onChange={setField("inquiry_type")}
                            className={`${inputCls("inquiry_type")} appearance-none pr-10 cursor-pointer`}
                          >
                            {inquiryOptions.map(o => (
                              <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-slate-400" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-widest text-[#1F4D3A] mb-2">
                          Message *
                        </label>
                        <textarea
                          rows={4}
                          placeholder="Tell us what's on your mind…"
                          value={formData.message}
                          onChange={setField("message")}
                          className={`${inputCls("message")} resize-none`}
                        />
                        {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                      </div>

                      {/* Preferred contact method */}
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-widest text-[#1F4D3A] mb-2">
                          Preferred Contact Method
                        </label>
                        <div className="flex gap-2">
                          {contactMethods.map(m => (
                            <button
                              key={m.value}
                              type="button"
                              onClick={() => setFormData(f => ({ ...f, preferred_contact: m.value as LeadPayload["preferred_contact"] }))}
                              className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer"
                              style={formData.preferred_contact === m.value
                                ? { borderColor: "#C8A96B", background: "rgba(31,77,58,0.04)", color: "#1F4D3A" }
                                : { borderColor: "rgba(0,0,0,0.06)", background: "transparent", color: "gray" }
                              }
                            >
                              {m.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {apiErr && (
                        <div className="px-4 py-3 rounded-xl text-sm" style={{ border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)", color: "#ef4444" }}>
                          {apiErr}
                        </div>
                      )}

                      <button
                        className="w-full py-4 text-xs font-bold uppercase tracking-wider text-white transition-all disabled:opacity-60 cursor-pointer flex items-center justify-center"
                        type="submit"
                        disabled={loading}
                        style={{ background: "#1F4D3A" }}
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send size={15} />
                        )}
                        <span className="ml-2">{loading ? "Sending…" : "Send Message"}</span>
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
