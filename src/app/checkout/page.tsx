

import { useState, useEffect } from "react"
import { ImgHTMLAttributes } from 'react';
const Image = (props: ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean, fill?: boolean, quality?: number }) => <img {...props} />;
import { Link } from 'react-router-dom';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { motion } from "framer-motion"
import api from '@/lib/axios'
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
import { useSettings } from "@/context/settings-context"
import { InvoiceTemplate } from "@/components/invoice/InvoiceTemplate"
import { generateInvoice } from "@/components/invoice/generateInvoice"

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { settings } = useSettings()
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
  const [confirmedOrder, setConfirmedOrder] = useState<{
    items: typeof items,
    subtotal: number,
    delivery: number | 'FREE',
    total: number,
    customer: typeof customerDetails
  } | null>(null)

  // Paging state for the hidden generator template
  const [pagingState, setPagingState] = useState({
    items: [] as typeof items,
    startIndex: 0,
    showBillingInfo: true,
    showTotals: true,
    showFooter: true
  })

  // Bridge for the generator utility to update this component's template state
  useEffect(() => {
    (window as any).updateInvoiceData = async (data: any) => {
      setPagingState(prev => ({ ...prev, ...data }))
    }
  }, [])

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

    // ─── STEP 1: Save order to database ───
    let newInvoiceNo = `LHF-${Date.now().toString().slice(-6)}` // fallback
    try {
      const orderPayload = {
        customer_name: customerDetails.name,
        phone: customerDetails.phone,
        address: customerDetails.address,
        city: customerDetails.city,
        pincode: customerDetails.pincode,
        notes: customerDetails.notes || '',
        cart_items: items.map(item => ({
          product_id: null,
          name: item.name,
          weight: item.weight,
          quantity: item.quantity,
          price: item.price,
        })),
      }
      const response = await api.post('/checkout', orderPayload)
      if (response.data?.success && response.data?.invoice_number) {
        newInvoiceNo = response.data.invoice_number
      }
    } catch (e) {
      console.error('Order storage error (continuing with invoice):', e)
      // Graceful degradation: continue with client-generated invoice number
    }

    setInvoiceNumber(newInvoiceNo)

    // Wait for the InvoiceTemplate to render with the new invoice number
    await new Promise(resolve => setTimeout(resolve, 100))

    // ─── STEP 2: Generate and download PDF (existing logic) ───
    try {
      const invoiceProps = {
        items: [...items],
        customerDetails: { ...customerDetails },
        subtotal: totalPrice,
        delivery: deliveryCharge === 0 ? 'FREE' : deliveryCharge,
        total: finalTotal,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      }
      await generateInvoice("invoice-template-pdf", newInvoiceNo, true, invoiceProps)
    } catch (e) {
      console.error("PDF generation error:", e)
    }

    // Save order snapshot for "Download Again" feature
    setConfirmedOrder({
      items: [...items],
      subtotal: totalPrice,
      delivery: deliveryCharge === 0 ? 'FREE' : deliveryCharge,
      total: finalTotal,
      customer: { ...customerDetails }
    })

    // ─── STEP 3: Send WhatsApp message (existing logic) ───
    const currency = settings?.currency_symbol || '₹'
    const itemsList = items
      .map((item) => ` • ${item.name} (${item.weight}) x ${item.quantity} = ${currency}${item.price * item.quantity}`)
      .join("\n")

    const message = `*New Order from Lakshmi Home Foods*

*Invoice:* ${newInvoiceNo}

*Customer Details:*
Name: ${customerDetails.name}
Phone: ${customerDetails.phone}
Address: ${customerDetails.address}
City: ${customerDetails.city}
Pincode: ${customerDetails.pincode}
${customerDetails.notes ? `Notes: ${customerDetails.notes}` : ""}

*Order Details:*
${itemsList}

Subtotal: ${currency}${totalPrice}
Delivery: ${deliveryCharge === 0 ? "FREE" : `${currency}${deliveryCharge}`}
*Total: ${currency}${finalTotal}*`.trim()

    const whatsappURL = `https://wa.me/918639424039?text=${encodeURIComponent(message)}`

    // Open WhatsApp directly
    window.open(whatsappURL, "_blank")

    // ─── STEP 4: Show success (existing logic) ───
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
              <p className="text-[#fef3e2]/70 text-lg max-w-md mx-auto mb-10">
                Your order details have been sent to our WhatsApp. We will process your order shortly.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
                <button
                  onClick={() => {
                    if (confirmedOrder) {
                      generateInvoice("invoice-template-pdf", invoiceNumber, true, {
                        ...confirmedOrder,
                        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                      })
                    }
                  }}
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
                              <p className="text-[#d97706] font-bold mt-1">{settings?.currency_symbol || '₹'}{item.price * item.quantity}</p>
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
                              <span className="text-xs font-bold text-[#d97706]">{settings?.currency_symbol || '₹'}{item.price * item.quantity}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-[#d97706]/20 pt-4 space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#fef3e2]/60">Subtotal</span>
                        <span className="text-[#fef3e2]">{settings?.currency_symbol || '₹'}{totalPrice}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#fef3e2]/60">Delivery</span>
                        {deliveryCharge === 0 ? (
                          <span className="text-green-500 font-medium">FREE</span>
                        ) : (
                          <span className="text-[#fef3e2]">{settings?.currency_symbol || '₹'}{deliveryCharge}</span>
                        )}
                      </div>
                      {totalPrice < 500 && (
                        <p className="text-xs text-[#fef3e2]/50">
                          Add {settings?.currency_symbol || '₹'}{500 - totalPrice} more for free delivery
                        </p>
                      )}
                      <div className="flex items-center justify-between pt-3 border-t border-[#d97706]/20">
                        <span className="text-[#fef3e2] font-medium">Total</span>
                        <span className="text-2xl font-bold text-[#d97706]">{settings?.currency_symbol || '₹'}{finalTotal}</span>
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
                      <span className="text-sm">Free delivery on orders above {settings?.currency_symbol || '₹'}500</span>
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

      {/* Hidden Invoice Template Generator - Stays in DOM for download features */}
      <div style={{ position: 'fixed', top: '-9999px', left: '-9999px', opacity: 0, pointerEvents: 'none', zIndex: -100, overflow: 'hidden' }}>
        <InvoiceTemplate
          id="invoice-template-pdf"
          invoiceNumber={invoiceNumber}
          date={new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
          customerDetails={confirmedOrder?.customer || customerDetails}
          items={pagingState.items} // Use paging segment
          subtotal={confirmedOrder?.subtotal || totalPrice}
          delivery={confirmedOrder?.delivery ?? (deliveryCharge === 0 ? 'FREE' : deliveryCharge)}
          total={confirmedOrder?.total || finalTotal}
          startIndex={pagingState.startIndex} // For sequential numbering
          showTotals={pagingState.showTotals} // Only on final page
          showBillingInfo={pagingState.showBillingInfo} // Only on first page
          showFooter={pagingState.showFooter} // Only on final page
        />
      </div>
    </main>
  )
}

