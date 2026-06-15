import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Phone, Mail, MapPin, CheckCircle, Loader2, Send } from "lucide-react"
import { leadService, type LeadPayload } from "@/services/leadService"

export function CTASection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    inquiry_type: "order" as LeadPayload["inquiry_type"],
    message: "",
    preferred_contact: "whatsapp" as LeadPayload["preferred_contact"],
    website: "" // honeypot
  })

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Honeypot spam check
    if (formData.website) {
      setLoading(false)
      setSuccess(true) // pretend success
      return
    }

    try {
      const response = await leadService.submit({
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone,
        inquiry_type: formData.inquiry_type,
        message: formData.message,
        preferred_contact: formData.preferred_contact
      })

      if (response.success) {
        setSuccess(true)
        setFormData({
          name: "",
          email: "",
          phone: "",
          inquiry_type: "order",
          message: "",
          preferred_contact: "whatsapp",
          website: ""
        })
      } else {
        setError(response.message || "Failed to submit. Please try again.")
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "An error occurred. Please check your network and try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="contact" className="py-24 px-4 relative overflow-hidden" style={{ background: "var(--surface-alt)" }}>
      {/* Glow elements */}
      <div className="absolute bottom-0 right-0 w-[450px] h-[450px] rounded-full blur-[140px] opacity-[0.05] pointer-events-none" style={{ background: "radial-gradient(circle, var(--theme-color) 0%, transparent 70%)" }} />

      <div className="container mx-auto max-w-6xl relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* LEFT COLUMN: Brand Info */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <span className="section-badge mb-4">Connect With Us</span>
              <h2 className="font-serif text-4xl md:text-5xl font-normal text-foreground mt-4 tracking-tight">
                Let's Start a <br />
                <span className="text-gradient-gold italic">Conversation.</span>
              </h2>
              <p className="text-muted-foreground font-sans text-sm mt-6 leading-relaxed">
                Have questions about bulk gifting, ingredients customization, or orders? Drop us a line. Our team is ready to serve you.
              </p>
            </div>

            {/* Info Cards */}
            <div className="space-y-4 font-sans text-sm">
              <a 
                href="tel:+919601874404" 
                className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/40 transition-all duration-300 group"
                style={{ background: "var(--surface-card)" }}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center border border-primary/20 text-primary bg-primary/5">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-muted-foreground/60 text-xs block">CALL US</span>
                  <span className="text-foreground font-medium">+91 96018 74404</span>
                </div>
              </a>

              <a 
                href="mailto:hello@koffeekup.in" 
                className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/40 transition-all duration-300 group"
                style={{ background: "var(--surface-card)" }}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center border border-primary/20 text-primary bg-primary/5">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-muted-foreground/60 text-xs block">EMAIL SUPPORT</span>
                  <span className="text-foreground font-medium">hello@koffeekup.in</span>
                </div>
              </a>

              <div 
                className="flex items-center gap-4 p-4 rounded-xl border border-border"
                style={{ background: "var(--surface-card)" }}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center border border-primary/20 text-primary bg-primary/5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-muted-foreground/60 text-xs block">HEADQUARTERS</span>
                  <span className="text-foreground font-medium">Hyderabad, Telangana, India</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Luxury Contact Form */}
          <div className="lg:col-span-7">
            <div className="p-8 rounded-2xl border border-border relative overflow-hidden" 
              style={{ background: "var(--surface-card)", backdropFilter: "blur(20px)", boxShadow: "var(--card-shadow, 0 20px 40px rgba(0,0,0,0.06))" }}
            >
              
              <AnimatePresence mode="wait">
                {!success ? (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-6"
                  >
                    {/* Honeypot hidden input */}
                    <input 
                      type="text" 
                      name="website" 
                      value={formData.website} 
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })} 
                      className="hidden" 
                      tabIndex={-1} 
                      autoComplete="off" 
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Name */}
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-sans font-bold">Your Name *</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          style={{ background: "var(--surface-alt)" }}
                          className="w-full px-4 py-3 rounded-xl border border-border text-foreground font-sans text-sm focus:border-primary/50 focus:outline-none transition-colors"
                          placeholder="John Doe"
                        />
                      </div>
                      
                      {/* Phone */}
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-sans font-bold">Phone Number *</label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          style={{ background: "var(--surface-alt)" }}
                          className="w-full px-4 py-3 rounded-xl border border-border text-foreground font-sans text-sm focus:border-primary/50 focus:outline-none transition-colors"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Email */}
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-sans font-bold">Email Address</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          style={{ background: "var(--surface-alt)" }}
                          className="w-full px-4 py-3 rounded-xl border border-border text-foreground font-sans text-sm focus:border-primary/50 focus:outline-none transition-colors"
                          placeholder="john@example.com"
                        />
                      </div>

                      {/* Inquiry Type */}
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-sans font-bold">Inquiry Type *</label>
                        <select
                          value={formData.inquiry_type}
                          onChange={(e) => setFormData({ ...formData, inquiry_type: e.target.value as LeadPayload["inquiry_type"] })}
                          style={{ background: "var(--surface-alt)" }}
                          className="w-full px-4 py-3 rounded-xl border border-border text-foreground font-sans text-sm focus:border-primary/50 focus:outline-none transition-colors cursor-pointer"
                        >
                          <option value="order" style={{ background: "var(--surface-alt)", color: "var(--text-primary)" }}>Order Query</option>
                          <option value="bulk" style={{ background: "var(--surface-alt)", color: "var(--text-primary)" }}>Bulk / Corporate Orders</option>
                          <option value="support" style={{ background: "var(--surface-alt)", color: "var(--text-primary)" }}>Customer Support</option>
                          <option value="other" style={{ background: "var(--surface-alt)", color: "var(--text-primary)" }}>General Question</option>
                        </select>
                      </div>
                    </div>

                    {/* Preferred Contact Method */}
                    <div className="space-y-3">
                      <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-sans font-bold block">Preferred Contact Method</label>
                      <div className="flex flex-wrap gap-4">
                        {(["whatsapp", "call", "email"] as const).map((method) => (
                          <label key={method} className="flex items-center gap-2 cursor-pointer font-sans text-xs text-muted-foreground hover:text-foreground transition-colors">
                            <input
                              type="radio"
                              name="preferred_contact"
                              value={method}
                              checked={formData.preferred_contact === method}
                              onChange={() => setFormData({ ...formData, preferred_contact: method })}
                              className="accent-primary"
                            />
                            <span className="capitalize">{method}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-sans font-bold">Your Message *</label>
                      <textarea
                        required
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        style={{ background: "var(--surface-alt)" }}
                        className="w-full px-4 py-3 rounded-xl border border-border text-foreground font-sans text-sm focus:border-primary/50 focus:outline-none transition-colors resize-none"
                        placeholder="Write your query or message here..."
                      />
                    </div>

                    {error && (
                      <p className="text-xs text-red-500 font-semibold font-sans">{error}</p>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 btn-primary py-4 font-bold text-xs tracking-widest uppercase transition-all duration-300"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-current" />
                          <span>SENDING INQUIRY...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 text-current" />
                          <span>SUBMIT MESSAGE</span>
                        </>
                      )}
                    </button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12 space-y-6"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                      className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto"
                    >
                      <CheckCircle className="w-8 h-8 text-emerald-500" />
                    </motion.div>

                    <div className="space-y-2">
                      <h3 className="font-serif text-2xl text-foreground font-medium">Inquiry Submitted Successfully</h3>
                      <p className="text-muted-foreground font-sans text-sm max-w-sm mx-auto">
                        Thank you for reaching out. We have logged your details and a wellness consultant will reach back shortly via your preferred channel.
                      </p>
                    </div>

                    <button
                      onClick={() => setSuccess(false)}
                      className="btn-outline-gold px-8 py-3 text-[10px] font-bold font-sans tracking-widest uppercase"
                    >
                      SEND ANOTHER MESSAGE
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
