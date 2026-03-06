
```
import { useState, useEffect } from "react"
import { ImgHTMLAttributes } from 'react';
const Image = (props: ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean, fill?: boolean, quality?: number }) => <img {...props} />;
import { Link } from 'react-router-dom';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { toast } from "sonner"
import { motion } from "framer-motion"
import { 
  ArrowLeft, 
  User, 
  Phone, 
  MapPin, 
  Building2, 
  MapPinned, 
  FileText,
  ShoppingBag,
  Minus,
  Plus,
  Trash2,
  CheckCircle2,
  Truck,
  Shield,
  Clock,
  Loader2
} from "lucide-react"
import { WhatsAppIcon } from '@/components/icons/whatsapp'
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useCart } from "@/context/cart-context"
import { InvoiceTemplate } from "@/components/invoice/InvoiceTemplate"
import { generateInvoice } from "@/components/invoice/generateInvoice"

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { 
    items, 
    totalPrice, 
    customerDetails, 
    setCustomerDetails, 
    clearCart,
    updateQuantity,
    removeItem
  } = useCart()
  
  const [step, setStep] = useState<"details" | "review" | "success">("details")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const [invoiceNumber, setInvoiceNumber] = useState("")

  // Wait for hydration before checking cart
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Redirect to products if cart is empty (only after hydration)
  useEffect(() => {
    if (isHydrated && items.length === 0 && step !== "success") {
      navigate("/products")
    }
  }, [isHydrated, items.length, step, navigate])

  const deliveryCharge = totalPrice >= 500 ? 0 : 50
  const finalTotal = totalPrice + deliveryCharge

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!customerDetails.name.trim()) {
      newErrors.name = "Full name is required"
    }

    if (!customerDetails.phone.trim()) {
      newErrors.phone = "Phone number is required"
    } else if (!/^[6-9]\d{9}$/.test(customerDetails.phone.trim())) {
      newErrors.phone = "Enter a valid 10-digit phone number"
    }

    if (!customerDetails.address.trim()) {
      newErrors.address = "Delivery address is required"
    }

    if (!customerDetails.city.trim()) {
      newErrors.city = "City is required"
    }

    if (!customerDetails.pincode.trim()) {
      newErrors.pincode = "Pincode is required"
    } else if (!/^\d{6}$/.test(customerDetails.pincode.trim())) {
      newErrors.pincode = "Enter a valid 6-digit pincode"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleProceedToReview = () => {
    if (validateForm()) {
      setStep("review")
      window.scrollTo(0, 0)
    }
  }

  const handlePlaceOrder = async () => {
    setIsSubmitting(true)

    // Generate Invoice Number
    const newInvoiceNo = `LHF-${Date.now().toString().slice(-6)}`
    setInvoiceNumber(newInvoiceNo)

    // Wait for the InvoiceTemplate to render with the new invoice number
    await new Promise(resolve => setTimeout(resolve, 100))

    // Attempt to generate PDF
    let pdfBlob: Blob | null = null
    try {
      pdfBlob = await generateInvoice("invoice-template-pdf", newInvoiceNo)
    } catch (e) {
      console.error("PDF generation error:", e)
    }

    let message = `🚀 *New Order - Lakshmi Home Foods*\n\n━━━━━━━━━━━━━━━━━━━━\n*Customer:* ${customerDetails.name}\n*Phone:* ${customerDetails.phone}\n*Invoice:* ${newInvoiceNo}\n━━━━━━━━━━━━━━━━━━━━\n\n✅ *Total Amount: Rs.${finalTotal}*\n\nThank you for the order!`

    const whatsappURL = `https://wa.me/918639424039?text=${encodeURIComponent(message)}`

    // Expert Share Logic
    let sharedSuccessfully = false
    if (pdfBlob && navigator.share && navigator.canShare) {
      try {
        const file = new File([pdfBlob], `Invoice_LHF_${newInvoiceNo}.pdf`, { type: 'application/pdf' })
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `Laxmi Home Foods Invoice - ${newInvoiceNo}`,
            text: message
          })
          sharedSuccessfully = true
        }
      } catch (shareError) {
        console.warn("Web Share failed, falling back to URL redirect:", shareError)
      }
    }

    // Fallback or secondary action
    if (!sharedSuccessfully) {
      window.open(whatsappURL, "_blank")
    }

    // Show success
    setTimeout(() => {
      setIsSubmitting(false)
      setStep("success")
      clearCart()
      window.scrollTo(0, 0)
    }, 1000)
  }

  const handleInputChange = (field: keyof typeof customerDetails, value: string) => {
    setCustomerDetails({ ...customerDetails, [field]: value })
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" })
    }
  }

  // Show loading while hydrating
  if (!isHydrated) {
    return (
      <main className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#d97706] animate-spin mx-auto mb-4" />
          <p className="text-[#fef3e2]/70">Loading checkout...</p>
        </div>
      </main>
    )
  }

  if (items.length === 0 && step !== "success") {
    return null
  }

  return (
    <main className="min-h-screen bg-[#0f0f0f]">
      <Navbar />

      <div className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Back Button */}
          {step !== "success" && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-8"
            >
                <button
                onClick={() => step === "review" ? setStep("details") : navigate(-1)}
                className="flex items-center gap-2 text-[#fef3e2]/70 hover:text-[#d97706] transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                {step === "review" ? "Back to Details" : "Continue Shopping"}
              </button>
            </motion.div>
          )}

          {/* Progress Steps */}
          {step !== "success" && (
            <div className="flex items-center justify-center gap-4 mb-12">
              {['Details', 'Review', 'Complete'].map((label, index) => {
                const stepIndex = index + 1
                let isActive = false
                let isCurrent = false

                if (step === 'details') {
                  isActive = stepIndex === 1
                  isCurrent = stepIndex === 1
                } else if (step === 'review') {
                  isActive = stepIndex <= 2
                  isCurrent = stepIndex === 2
                } else if (step === 'success') {
                  isActive = stepIndex <= 3
                  isCurrent = false
                }

                return (
                  <div key={label} className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                      isActive 
                        ? "bg-[#d97706] text-[#0f0f0f]" 
                        : "bg-[#1a1410] text-[#fef3e2]/50"
                    } ${isCurrent ? "ring-2 ring-[#d97706] ring-offset-2 ring-offset-[#0f0f0f]" : ""}`}>
                      {stepIndex}
                    </div>
                    <span className={`hidden sm:block text-sm ${isActive ? "text-[#fef3e2]" : "text-[#fef3e2]/50"}`}>
                      {label}
                    </span>
                    {index < 2 && (
                      <div className={`w-12 h-0.5 ${isActive && stepIndex < (step === "review" ? 2 : 1) ? "bg-[#d97706]" : "bg-[#1a1410]"}`} />
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Success State */}
          {step === "success" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-24 h-24 mx-auto mb-8 bg-green-500/20 rounded-full flex items-center justify-center"
              >
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              </motion.div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#fef3e2] mb-4">
                Order Placed Successfully!
              </h1>
              <p className="text-[#fef3e2]/70 text-lg max-w-md mx-auto mb-6">
                Your order order summary has been sent via WhatsApp.
              </p>
              
              {/* PDF Instruction Alert */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="max-w-md mx-auto mb-10 p-5 bg-[#d97706]/10 rounded-3xl border border-[#d97706]/30 text-left relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <FileText className="w-20 h-20" />
                </div>
                <div className="relative z-10 flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#d97706] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#d97706]/20">
                    <FileText className="w-6 h-6 text-[#0f0f0f]" />
                  </div>
                  <div>
                    <h4 className="text-[#fef3e2] font-extrabold text-base mb-2">Send PDF to Lakshmi Home Foods</h4>
                    <p className="text-sm text-[#fef3e2]/80 leading-relaxed mb-4">
                      Browsers prevent auto-sending files to a specific number. To complete your order, please:
                    </p>
                    <ul className="space-y-3 text-sm text-[#fef3e2]/90">
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#d97706]/20 text-[#d97706] flex items-center justify-center text-[10px] font-bold mt-0.5">1</span>
                        <span>Open WhatsApp and select <strong>Lakshmi Home Foods</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#d97706]/20 text-[#d97706] flex items-center justify-center text-[10px] font-bold mt-0.5">2</span>
                        <span>Tap the 📎 (Paperclip) icon</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#d97706]/20 text-[#d97706] flex items-center justify-center text-[10px] font-bold mt-0.5">3</span>
                        <span>Select the <strong>Invoice_LHF...</strong> PDF from your downloads</span>
                      </li>
                    </ul>
                    
                    <div className="mt-6 flex flex-col gap-3">
                      <div className="p-3 bg-black/40 rounded-xl border border-white/10 flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase tracking-wider text-[#d97706] font-bold">Admin Number</span>
                          <span className="text-[#fef3e2] font-mono">+91 8639424039</span>
                        </div>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText("8639424039");
                            toast.success("Number copied to clipboard!");
                          }}
                          className="px-3 py-1.5 bg-[#d97706] text-[#0f0f0f] text-xs font-bold rounded-lg hover:bg-[#b45309] transition-colors"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
                <button
                  onClick={() => generateInvoice("invoice-template-pdf", invoiceNumber)}
                  className="w-full px-8 py-4 bg-[#1a1410] border border-[#d97706]/50 text-[#d97706] font-extrabold rounded-2xl hover:bg-[#d97706]/10 transition-all flex items-center justify-center gap-2 group"
                >
                  <FileText className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Download Invoice Again
                </button>
                <Link
                  to="/products"
                  className="w-full px-8 py-4 bg-[#d97706] text-[#0f0f0f] font-extrabold rounded-2xl hover:bg-[#b45309] transition-all text-center shadow-lg shadow-[#d97706]/20"
                >
                  Continue Shopping
                </Link>
              </div>
            </motion.div>
          )}

          {/* Main Content */}
          {step !== "success" && (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Form or Review */}
              <div className="lg:col-span-2">
                {step === "details" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-[#1a1410] to-[#0f0f0f] rounded-3xl border border-[#d97706]/20 p-6 md:p-8"
                  >
                    <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#fef3e2] mb-2">
                      Delivery Details
                    </h1>
                    <p className="text-[#fef3e2]/60 mb-8">
                      Please fill in your delivery information to complete the order.
                    </p>

                    <div className="space-y-6">
                      {/* Full Name */}
                      <div>
                        <label className="flex items-center gap-2 text-[#fef3e2] text-sm font-medium mb-2">
                          <User className="w-4 h-4 text-[#d97706]" />
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={customerDetails.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          placeholder="Enter your full name"
                          className={`w-full px-4 py-3 bg-[#0f0f0f] border rounded-xl text-[#fef3e2] placeholder-[#fef3e2]/40 focus:outline-none focus:ring-2 focus:ring-[#d97706] transition-all ${
                            errors.name ? "border-red-500" : "border-[#d97706]/20"
                          }`}
                        />
                        {errors.name && (
                          <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                        )}
                      </div>

                      {/* Phone Number */}
                      <div>
                        <label className="flex items-center gap-2 text-[#fef3e2] text-sm font-medium mb-2">
                          <Phone className="w-4 h-4 text-[#d97706]" />
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          value={customerDetails.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                          placeholder="Enter 10-digit phone number"
                          className={`w-full px-4 py-3 bg-[#0f0f0f] border rounded-xl text-[#fef3e2] placeholder-[#fef3e2]/40 focus:outline-none focus:ring-2 focus:ring-[#d97706] transition-all ${
                            errors.phone ? "border-red-500" : "border-[#d97706]/20"
                          }`}
                        />
                        {errors.phone && (
                          <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                        )}
                      </div>

                      {/* Delivery Address */}
                      <div>
                        <label className="flex items-center gap-2 text-[#fef3e2] text-sm font-medium mb-2">
                          <MapPin className="w-4 h-4 text-[#d97706]" />
                          Delivery Address *
                        </label>
                        <textarea
                          value={customerDetails.address}
                          onChange={(e) => handleInputChange("address", e.target.value)}
                          placeholder="House/Flat No., Street, Landmark"
                          rows={3}
                          className={`w-full px-4 py-3 bg-[#0f0f0f] border rounded-xl text-[#fef3e2] placeholder-[#fef3e2]/40 focus:outline-none focus:ring-2 focus:ring-[#d97706] transition-all resize-none ${
                            errors.address ? "border-red-500" : "border-[#d97706]/20"
                          }`}
                        />
                        {errors.address && (
                          <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                        )}
                      </div>

                      {/* City & Pincode */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="flex items-center gap-2 text-[#fef3e2] text-sm font-medium mb-2">
                            <Building2 className="w-4 h-4 text-[#d97706]" />
                            City *
                          </label>
                          <input
                            type="text"
                            value={customerDetails.city}
                            onChange={(e) => handleInputChange("city", e.target.value)}
                            placeholder="City"
                            className={`w-full px-4 py-3 bg-[#0f0f0f] border rounded-xl text-[#fef3e2] placeholder-[#fef3e2]/40 focus:outline-none focus:ring-2 focus:ring-[#d97706] transition-all ${
                              errors.city ? "border-red-500" : "border-[#d97706]/20"
                            }`}
                          />
                          {errors.city && (
                            <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                          )}
                        </div>
                        <div>
                          <label className="flex items-center gap-2 text-[#fef3e2] text-sm font-medium mb-2">
                            <MapPinned className="w-4 h-4 text-[#d97706]" />
                            Pincode *
                          </label>
                          <input
                            type="text"
                            value={customerDetails.pincode}
                            onChange={(e) => handleInputChange("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
                            placeholder="6-digit"
                            className={`w-full px-4 py-3 bg-[#0f0f0f] border rounded-xl text-[#fef3e2] placeholder-[#fef3e2]/40 focus:outline-none focus:ring-2 focus:ring-[#d97706] transition-all ${
                              errors.pincode ? "border-red-500" : "border-[#d97706]/20"
                            }`}
                          />
                          {errors.pincode && (
                            <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>
                          )}
                        </div>
                      </div>

                      {/* Order Notes */}
                      <div>
                        <label className="flex items-center gap-2 text-[#fef3e2] text-sm font-medium mb-2">
                          <FileText className="w-4 h-4 text-[#d97706]" />
                          Order Notes (Optional)
                        </label>
                        <textarea
                          value={customerDetails.notes}
                          onChange={(e) => handleInputChange("notes", e.target.value)}
                          placeholder="Any special instructions for your order..."
                          rows={2}
                          className="w-full px-4 py-3 bg-[#0f0f0f] border border-[#d97706]/20 rounded-xl text-[#fef3e2] placeholder-[#fef3e2]/40 focus:outline-none focus:ring-2 focus:ring-[#d97706] transition-all resize-none"
                        />
                      </div>

                      <button
                        onClick={handleProceedToReview}
                        className="w-full py-4 bg-gradient-to-r from-[#d97706] to-[#b45309] text-[#0f0f0f] font-bold rounded-xl hover:shadow-lg hover:shadow-[#d97706]/30 transition-all"
                      >
                        Continue to Review
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === "review" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {/* Delivery Info */}
                    <div className="bg-gradient-to-br from-[#1a1410] to-[#0f0f0f] rounded-3xl border border-[#d97706]/20 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="font-serif text-xl font-bold text-[#fef3e2]">
                          Delivery Information
                        </h2>
                        <button
                          onClick={() => setStep("details")}
                          className="text-[#d97706] text-sm hover:underline"
                        >
                          Edit
                        </button>
                      </div>
                      <div className="space-y-2 text-[#fef3e2]/80">
                        <p><span className="text-[#fef3e2]/50">Name:</span> {customerDetails.name}</p>
                        <p><span className="text-[#fef3e2]/50">Phone:</span> {customerDetails.phone}</p>
                        <p><span className="text-[#fef3e2]/50">Address:</span> {customerDetails.address}</p>
                        <p><span className="text-[#fef3e2]/50">City:</span> {customerDetails.city} - {customerDetails.pincode}</p>
                        {customerDetails.notes && (
                          <p><span className="text-[#fef3e2]/50">Notes:</span> {customerDetails.notes}</p>
                        )}
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="bg-gradient-to-br from-[#1a1410] to-[#0f0f0f] rounded-3xl border border-[#d97706]/20 p-6">
                      <h2 className="font-serif text-xl font-bold text-[#fef3e2] mb-4">
                        Order Items ({items.length})
                      </h2>
                      <div className="space-y-4">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className="flex gap-4 p-4 bg-[#0f0f0f]/50 rounded-xl border border-[#d97706]/10"
                          >
                            <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-[#fef3e2] truncate">{item.name}</h3>
                              <p className="text-[#fef3e2]/60 text-sm">{item.weight}</p>
                              <p className="text-[#d97706] font-bold mt-1">Rs.{item.price * item.quantity}</p>
                            </div>
                            <div className="flex flex-col items-end justify-between">
                              <button
                                onClick={() => removeItem(item.id)}
                                className="p-1 hover:bg-red-500/10 rounded transition-colors"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                              <div className="flex items-center gap-2 bg-[#d97706]/10 rounded-full">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="p-1 hover:bg-[#d97706]/20 rounded-full transition-colors"
                                >
                                  <Minus className="w-4 h-4 text-[#d97706]" />
                                </button>
                                <span className="text-[#fef3e2] font-medium w-6 text-center">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="p-1 hover:bg-[#d97706]/20 rounded-full transition-colors"
                                >
                                  <Plus className="w-4 h-4 text-[#d97706]" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Place Order Button */}
                    <button
                      onClick={handlePlaceOrder}
                      disabled={isSubmitting}
                      className="w-full py-4 bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white font-bold rounded-xl hover:shadow-lg hover:shadow-[#25D366]/30 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Sending Order...
                        </>
                      ) : (
                        <>
                          <WhatsAppIcon className="w-6 h-6" />
                          Place Order via WhatsApp
                        </>
                      )}
                    </button>
                  </motion.div>
                )}
              </div>

              {/* Right Column - Order Summary */}
              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-[#1a1410] to-[#0f0f0f] rounded-3xl border border-[#d97706]/20 p-6"
                  >
                    <h2 className="font-serif text-xl font-bold text-[#fef3e2] mb-4 flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-[#d97706]" />
                      Order Summary
                    </h2>

                    {/* Items List with Images */}
                    <div className="space-y-2.5 mb-6 max-h-[400px] overflow-y-auto pr-1 scrollbar-hide">
                      {items.map((item) => (
                        <div key={item.id} className="flex gap-3 items-center p-2 bg-[#1a1410]/30 rounded-xl border border-[#d97706]/10 group hover:border-[#d97706]/20 transition-all">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-[#d97706]/5">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-[13px] font-medium text-[#fef3e2] truncate">{item.name}</h3>
                            <div className="flex items-center justify-between mt-0.5">
                              <span className="text-[11px] text-[#fef3e2]/50">{item.weight} x {item.quantity}</span>
                              <span className="text-xs font-bold text-[#d97706]">Rs.{item.price * item.quantity}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-[#d97706]/20 pt-4 space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#fef3e2]/60">Subtotal</span>
                        <span className="text-[#fef3e2]">Rs.{totalPrice}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#fef3e2]/60">Delivery</span>
                        {deliveryCharge === 0 ? (
                          <span className="text-green-500 font-medium">FREE</span>
                        ) : (
                          <span className="text-[#fef3e2]">Rs.{deliveryCharge}</span>
                        )}
                      </div>
                      {totalPrice < 500 && (
                        <p className="text-xs text-[#fef3e2]/50">
                          Add Rs.{500 - totalPrice} more for free delivery
                        </p>
                      )}
                      <div className="flex items-center justify-between pt-3 border-t border-[#d97706]/20">
                        <span className="text-[#fef3e2] font-medium">Total</span>
                        <span className="text-2xl font-bold text-[#d97706]">Rs.{finalTotal}</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Trust Badges */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-6 space-y-4"
                  >
                    <div className="flex items-center gap-3 text-[#fef3e2]/70">
                      <Truck className="w-5 h-5 text-[#d97706]" />
                      <span className="text-sm">Free delivery on orders above Rs.500</span>
                    </div>
                    <div className="flex items-center gap-3 text-[#fef3e2]/70">
                      <Shield className="w-5 h-5 text-[#d97706]" />
                      <span className="text-sm">100% Authentic homemade products</span>
                    </div>
                    <div className="flex items-center gap-3 text-[#fef3e2]/70">
                      <Clock className="w-5 h-5 text-[#d97706]" />
                      <span className="text-sm">Delivery within 2-3 business days</span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />

      {/* Hidden Invoice Template Generator */}
      {step !== "success" && (
        <InvoiceTemplate
          id="invoice-template-pdf"
          invoiceNumber={invoiceNumber}
          date={new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
          customerDetails={customerDetails}
          items={items}
          subtotal={totalPrice}
          delivery={deliveryCharge === 0 ? 'FREE' : deliveryCharge}
          total={finalTotal}
        />
      )}
    </main>
  )
}

