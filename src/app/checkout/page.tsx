

import { useState, useEffect } from "react"
import { ImgHTMLAttributes } from 'react';
const Image = ({ priority, fill, quality, ...rest }: ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean, fill?: boolean, quality?: number }) => <img {...rest} />;
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
import { useDelivery } from "@/hooks/use-delivery"
import { InvoiceTemplate } from "@/components/invoice/InvoiceTemplate"
import { generateInvoice } from "@/components/invoice/generateInvoice"

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { settings } = useSettings()
  const { rule: deliveryRule, calculate: calcDelivery } = useDelivery()
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
    delivery: number | string,
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

  const deliveryInfo = calcDelivery(totalPrice)
  const deliveryCharge = Number(deliveryInfo.fee) || 0
  const finalTotal = Number(totalPrice) + Number(deliveryCharge)

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
    let newInvoiceNo = `UNI-${Date.now().toString().slice(-6)}` // fallback
    try {
      const orderPayload = {
        customer_name: customerDetails.name,
        phone: customerDetails.phone,
        address: customerDetails.address,
        city: customerDetails.city,
        pincode: customerDetails.pincode,
        notes: customerDetails.notes || '',
        delivery: deliveryCharge,
        cart_items: items.map(item => ({
          product_id: null,
          name: item.name,
          weight: item.weight,
          size: item.size ?? null,
          color: item.color ?? null,
          image: item.image ?? null,
          quantity: item.quantity,
          price: item.price,
          originalPrice: item.originalPrice,
          discountPercent: item.discountPercent,
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
      const deliveryLabel = deliveryCharge === 0 && deliveryRule.free_delivery_above > 0 
        ? `Free (Order above ${settings?.currency_symbol || '₹'}${deliveryRule.free_delivery_above})`
        : deliveryCharge
      
      const invoiceProps = {
        items: items.map(item => ({
          name: item.name,
          weight: item.weight,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          price: item.price,
          originalPrice: item.originalPrice,
          discountPercent: item.discountPercent,
          image: item.image,
        })),
        customerDetails: { ...customerDetails },
        subtotal: totalPrice,
        delivery: deliveryLabel,
        total: finalTotal,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      }
      await generateInvoice("invoice-template-pdf", newInvoiceNo, true, invoiceProps)
    } catch (e) {
      console.error("PDF generation error:", e)
    }

    // Save order snapshot for "Download Again" feature
    const deliveryLabel = deliveryCharge === 0 && deliveryRule.free_delivery_above > 0 
      ? `Free (Order above ${settings?.currency_symbol || '₹'}${deliveryRule.free_delivery_above})`
      : deliveryCharge
    
    setConfirmedOrder({
      items: [...items],
      subtotal: totalPrice,
      delivery: deliveryLabel,
      total: finalTotal,
      customer: { ...customerDetails }
    })

    // ─── STEP 3: Send WhatsApp message (existing logic) ───
    const currency = settings?.currency_symbol || '₹'
    const itemsList = items
      .map((item) => {
        const savedAmount = item.discountPercent && item.originalPrice 
          ? Math.round((item.originalPrice - item.price) * item.quantity)
          : 0
        const discountStr = item.discountPercent ? ` (${item.discountPercent}% off, save ${currency}${savedAmount})` : ''
        const variantStr = [item.size, item.color].filter(Boolean).join(' / ')
        const variantDisplay = variantStr ? ` [${variantStr}]` : ''
        return ` • ${item.name}${variantDisplay} (${item.weight}) x ${item.quantity} = ${currency}${item.price * item.quantity}${discountStr}`
      })
      .join("\n")

    const totalSaved = items.reduce((sum, item) => {
      if (item.discountPercent && item.originalPrice) {
        return sum + Math.round((item.originalPrice - item.price) * item.quantity)
      }
      return sum
    }, 0)

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
${totalSaved > 0 ? `Discount Saved: -${currency}${totalSaved}` : ''}
Delivery: ${deliveryCharge === 0 ? "FREE" : `${currency}${deliveryCharge}`}
*Total: ${currency}${finalTotal}*`.trim()

    const waNum = (settings?.whatsapp || settings?.phone || '918639424039').replace(/[^0-9]/g, '')
    const whatsappURL = `https://wa.me/${waNum}?text=${encodeURIComponent(message)}`

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
      <main className="min-h-screen flex items-center justify-center" style={{ background: '#0D0D0D' }}>
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-amber-500" />
          <p className="font-body" style={{ color: 'rgba(245,240,232,0.55)' }}>Loading checkout...</p>
        </div>
      </main>
    )
  }

  if (items.length === 0 && step !== "success") {
    return null
  }

  return (
    <main className="min-h-screen" style={{ background: '#0D0D0D' }}>
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
                className="flex items-center gap-2 transition-colors font-body text-sm hover:text-amber-500"
                style={{ color: 'rgba(245,240,232,0.55)' }}
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
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm font-heading transition-all"
                      style={isActive
                        ? { background: 'linear-gradient(135deg, var(--theme-color), color-mix(in srgb, var(--theme-color) 80%, black))', color: '#0D0D0D', boxShadow: isCurrent ? '0 0 0 2px var(--theme-color), 0 0 0 4px #0D0D0D' : 'none' }
                        : { background: 'rgba(212,175,55,0.06)', color: 'rgba(245,240,232,0.4)', border: '1px solid rgba(212,175,55,0.12)' }
                      }
                    >
                      {stepIndex}
                    </div>
                    <span className="hidden sm:block font-body text-sm" style={{ color: isActive ? '#F5F0E8' : 'rgba(245,240,232,0.4)' }}>
                      {label}
                    </span>
                    {index < 2 && (
                      <div className="w-12 h-0.5 rounded-full" style={{ background: isActive && stepIndex < (step === 'review' ? 2 : 1) ? 'var(--theme-color)' : 'rgba(212,175,55,0.08)' }} />
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
                className="w-24 h-24 mx-auto mb-8 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)' }}
              >
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              </motion.div>
              <h1 className="font-heading text-3xl md:text-4xl font-black mb-4" style={{ color: '#F5F0E8' }}>
                Order Placed Successfully!
              </h1>
              <p className="font-body text-base max-w-md mx-auto mb-10" style={{ color: 'rgba(245,240,232,0.6)' }}>
                Your order details have been sent to our WhatsApp. We will process your order shortly.
              </p>

              <div className="flex flex-row items-center justify-center gap-3 mx-auto">
                <button
                  onClick={() => {
                    if (confirmedOrder) {
                      generateInvoice("invoice-template-pdf", invoiceNumber, true, {
                        ...confirmedOrder,
                        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                      })
                    }
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm rounded-xl font-bold font-heading transition-all hover:opacity-80"
                  style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)', color: 'var(--theme-color)' }}
                >
                  <FileText className="w-4 h-4" />
                  Download Invoice
                </button>
                <Link
                  to="/products"
                  className="flex items-center gap-2 px-5 py-2.5 text-sm rounded-xl font-bold font-heading transition-all"
                  style={{ background: 'var(--theme-color)', color: '#0D0D0D' }}
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
                    className="rounded-3xl p-6 md:p-8"
                    style={{ background: 'rgba(20,18,14,0.85)', border: '1px solid rgba(212,175,55,0.12)', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}
                  >
                    <h1 className="font-heading text-2xl md:text-3xl font-black mb-2" style={{ color: '#F5F0E8' }}>
                      Delivery Details
                    </h1>
                    <p className="font-body text-sm mb-8" style={{ color: 'rgba(245,240,232,0.5)' }}>
                      Please fill in your delivery information to complete the order.
                    </p>

                    <div className="space-y-6">
                      {/* Full Name */}
                      <div>
                        <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest mb-2 font-body" style={{ color: 'rgba(212,175,55,0.7)' }}>
                          <User className="w-3.5 h-3.5 text-amber-500" />
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={customerDetails.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          placeholder="Enter your full name"
                          className="w-full px-4 py-3 rounded-xl font-body text-sm outline-none transition-all"
                          style={{ background: 'rgba(13,13,13,0.7)', border: `1px solid ${errors.name ? '#ef4444' : 'rgba(212,175,55,0.15)'}`, color: '#F5F0E8' }}
                        />
                        {errors.name && (
                          <p className="text-red-400 text-xs mt-1 font-body">{errors.name}</p>
                        )}
                      </div>

                      {/* Phone Number */}
                      <div>
                        <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest mb-2 font-body" style={{ color: 'rgba(212,175,55,0.7)' }}>
                          <Phone className="w-3.5 h-3.5 text-amber-500" />
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          value={customerDetails.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                          placeholder="Enter 10-digit phone number"
                          className="w-full px-4 py-3 rounded-xl font-body text-sm outline-none transition-all"
                          style={{ background: 'rgba(13,13,13,0.7)', border: `1px solid ${errors.phone ? '#ef4444' : 'rgba(212,175,55,0.15)'}`, color: '#F5F0E8' }}
                        />
                        {errors.phone && (
                          <p className="text-red-400 text-xs mt-1 font-body">{errors.phone}</p>
                        )}
                      </div>

                      {/* Delivery Address */}
                      <div>
                        <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest mb-2 font-body" style={{ color: 'rgba(212,175,55,0.7)' }}>
                          <MapPin className="w-3.5 h-3.5 text-amber-500" />
                          Delivery Address *
                        </label>
                        <textarea
                          value={customerDetails.address}
                          onChange={(e) => handleInputChange("address", e.target.value)}
                          placeholder="House/Flat No., Street, Landmark"
                          rows={3}
                          className="w-full px-4 py-3 rounded-xl font-body text-sm outline-none resize-none transition-all"
                          style={{ background: 'rgba(13,13,13,0.7)', border: `1px solid ${errors.address ? '#ef4444' : 'rgba(212,175,55,0.15)'}`, color: '#F5F0E8' }}
                        />
                        {errors.address && (
                          <p className="text-red-400 text-xs mt-1 font-body">{errors.address}</p>
                        )}
                      </div>

                      {/* City & Pincode */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest mb-2 font-body" style={{ color: 'rgba(212,175,55,0.7)' }}>
                            <Building2 className="w-3.5 h-3.5 text-amber-500" />
                            City *
                          </label>
                          <input
                            type="text"
                            value={customerDetails.city}
                            onChange={(e) => handleInputChange("city", e.target.value)}
                            placeholder="City"
                            className="w-full px-4 py-3 rounded-xl font-body text-sm outline-none transition-all"
                            style={{ background: 'rgba(13,13,13,0.7)', border: `1px solid ${errors.city ? '#ef4444' : 'rgba(212,175,55,0.15)'}`, color: '#F5F0E8' }}
                          />
                          {errors.city && <p className="text-red-400 text-xs mt-1 font-body">{errors.city}</p>}
                        </div>
                        <div>
                          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest mb-2 font-body" style={{ color: 'rgba(212,175,55,0.7)' }}>
                            <MapPinned className="w-3.5 h-3.5 text-amber-500" />
                            Pincode *
                          </label>
                          <input
                            type="text"
                            value={customerDetails.pincode}
                            onChange={(e) => handleInputChange("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
                            placeholder="6-digit"
                            className="w-full px-4 py-3 rounded-xl font-body text-sm outline-none transition-all"
                            style={{ background: 'rgba(13,13,13,0.7)', border: `1px solid ${errors.pincode ? '#ef4444' : 'rgba(212,175,55,0.15)'}`, color: '#F5F0E8' }}
                          />
                          {errors.pincode && <p className="text-red-400 text-xs mt-1 font-body">{errors.pincode}</p>}
                        </div>
                      </div>

                      {/* Order Notes */}
                      <div>
                        <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest mb-2 font-body" style={{ color: 'rgba(212,175,55,0.7)' }}>
                          <FileText className="w-3.5 h-3.5 text-amber-500" />
                          Order Notes (Optional)
                        </label>
                        <textarea
                          value={customerDetails.notes}
                          onChange={(e) => handleInputChange("notes", e.target.value)}
                          placeholder="Any special instructions for your order..."
                          rows={2}
                          className="w-full px-4 py-3 rounded-xl font-body text-sm outline-none resize-none transition-all"
                          style={{ background: 'rgba(13,13,13,0.7)', border: '1px solid rgba(212,175,55,0.15)', color: '#F5F0E8' }}
                        />
                      </div>

                      <button
                        onClick={handleProceedToReview}
                        className="btn-primary w-full justify-center py-4 text-base"
                      >
                        <span>Continue to Review</span>
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === "review" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-5"
                  >
                    {/* Delivery Info */}
                    <div className="rounded-3xl p-6" style={{ background: 'rgba(20,18,14,0.85)', border: '1px solid rgba(212,175,55,0.12)' }}>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="font-heading text-xl font-bold" style={{ color: '#F5F0E8' }}>
                          Delivery Information
                        </h2>
                        <button
                          onClick={() => setStep("details")}
                          className="font-body text-sm transition-colors text-amber-500"
                        >
                          Edit
                        </button>
                      </div>
                      <div className="space-y-2 font-body text-sm" style={{ color: 'rgba(245,240,232,0.65)' }}>
                        <p><span style={{ color: 'rgba(245,240,232,0.4)' }}>Name:</span> {customerDetails.name}</p>
                        <p><span style={{ color: 'rgba(245,240,232,0.4)' }}>Phone:</span> {customerDetails.phone}</p>
                        <p><span style={{ color: 'rgba(245,240,232,0.4)' }}>Address:</span> {customerDetails.address}</p>
                        <p><span style={{ color: 'rgba(245,240,232,0.4)' }}>City:</span> {customerDetails.city} - {customerDetails.pincode}</p>
                        {customerDetails.notes && (
                          <p><span style={{ color: 'rgba(245,240,232,0.4)' }}>Notes:</span> {customerDetails.notes}</p>
                        )}
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="rounded-3xl p-6" style={{ background: 'rgba(20,18,14,0.85)', border: '1px solid rgba(212,175,55,0.12)' }}>
                      <h2 className="font-heading text-xl font-bold mb-4" style={{ color: '#F5F0E8' }}>
                        Order Items ({items.length})
                      </h2>
                      <div className="space-y-3">
                        {items.map((item) => (
                          <div key={item.id} className="flex gap-3 p-3 rounded-xl" style={{ background: 'rgba(13,13,13,0.5)', border: '1px solid rgba(212,175,55,0.07)' }}>
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-heading font-semibold text-sm truncate" style={{ color: '#F5F0E8' }}>{item.name}</h3>
                              <p className="font-body text-xs" style={{ color: 'rgba(245,240,232,0.45)' }}>{item.weight}</p>
                              {(item.size || item.color) && (
                                <div className="flex flex-wrap gap-1 mt-0.5">
                                  {item.size && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(217,119,6,0.15)', color: '#fbbf24' }}>Size: {item.size}</span>
                                  )}
                                  {item.color && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(148,163,184,0.1)', color: '#94a3b8' }}>Color: {item.color}</span>
                                  )}
                                </div>
                              )}
                              <div className="flex items-center gap-2 mt-0.5">
                                <p className="font-heading font-bold text-sm text-amber-500">{settings?.currency_symbol || '₹'}{item.price * item.quantity}</p>
                                {item.originalPrice && (
                                  <p className="font-body text-xs line-through" style={{ color: 'rgba(245,240,232,0.3)' }}>{settings?.currency_symbol || '₹'}{item.originalPrice * item.quantity}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end justify-between">
                              <button onClick={() => removeItem(item.id)} className="p-1 rounded transition-colors hover:bg-red-500/10">
                                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                              </button>
                              <div className="flex items-center gap-1 rounded-full px-1" style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.15)' }}>
                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 rounded-full transition-colors">
                                  <Minus className="w-3 h-3 text-amber-500" />
                                </button>
                                <span className="font-heading font-bold text-xs w-5 text-center" style={{ color: '#F5F0E8' }}>{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 rounded-full transition-colors">
                                  <Plus className="w-3 h-3 text-amber-500" />
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
                    className="rounded-3xl p-6"
                    style={{ background: 'rgba(20,18,14,0.85)', border: '1px solid rgba(212,175,55,0.12)', boxShadow: '0 20px 50px rgba(0,0,0,0.4)' }}
                  >
                    <h2 className="font-heading text-xl font-bold mb-4 flex items-center gap-2" style={{ color: '#F5F0E8' }}>
                      <ShoppingBag className="w-5 h-5 text-amber-500" />
                      Order Summary
                    </h2>

                    <div className="space-y-2 mb-5 max-h-[360px] overflow-y-auto pr-1 scrollbar-hide">
                      {items.map((item) => {
                        const savedAmount = item.discountPercent && item.originalPrice 
                          ? Math.round((item.originalPrice - item.price) * item.quantity)
                          : 0
                        return (
                          <div key={item.id} className="flex gap-3 items-center p-2 rounded-xl" style={{ background: 'rgba(13,13,13,0.4)', border: '1px solid rgba(212,175,55,0.06)' }}>
                            <div className="relative w-11 h-11 rounded-lg overflow-hidden flex-shrink-0">
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-heading text-xs font-semibold truncate" style={{ color: '#F5F0E8' }}>{item.name}</h3>
                              <div className="flex items-center justify-between mt-0.5">
                                <span className="font-body text-[10px]" style={{ color: 'rgba(245,240,232,0.4)' }}>{item.weight} x {item.quantity}</span>
                                <div className="flex flex-col items-end gap-0.5">
                                  <div className="flex items-center gap-1">
                                    <span className="font-heading text-xs font-bold text-amber-500">{settings?.currency_symbol || '₹'}{item.price * item.quantity}</span>
                                    {item.discountPercent && (
                                      <span className="text-[8px] bg-red-600 text-white px-1 py-0 rounded font-bold">-{item.discountPercent}%</span>
                                    )}
                                  </div>
                                  {item.discountPercent && item.originalPrice && (
                                    <span className="font-body text-[9px] line-through" style={{ color: 'rgba(245,240,232,0.3)' }}>{settings?.currency_symbol || '₹'}{item.originalPrice * item.quantity}</span>
                                  )}
                                </div>
                              </div>
                              {savedAmount > 0 && (
                                <p className="font-body text-[10px] text-green-400 mt-0.5">Saved: {settings?.currency_symbol || '₹'}{savedAmount}</p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <div className="pt-4 space-y-3" style={{ borderTop: '1px solid rgba(212,175,55,0.10)' }}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-body" style={{ color: 'rgba(245,240,232,0.5)' }}>Subtotal</span>
                        <span className="font-body" style={{ color: '#F5F0E8' }}>{settings?.currency_symbol || '₹'}{totalPrice}</span>
                      </div>
                      {(() => {
                        const totalSaved = items.reduce((sum, item) => {
                          if (item.discountPercent && item.originalPrice) {
                            return sum + Math.round((item.originalPrice - item.price) * item.quantity)
                          }
                          return sum
                        }, 0)
                        return totalSaved > 0 ? (
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-body" style={{ color: 'rgba(76, 175, 80, 0.8)' }}>Discount Saved</span>
                            <span className="font-body font-semibold text-green-400">-{settings?.currency_symbol || '₹'}{totalSaved}</span>
                          </div>
                        ) : null
                      })()}
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-body" style={{ color: 'rgba(245,240,232,0.5)' }}>Delivery</span>
                        {deliveryCharge === 0 && deliveryRule.free_delivery_above > 0 ? (
                          <span className="font-body text-green-400 font-medium">Free (above {settings?.currency_symbol || '₹'}{deliveryRule.free_delivery_above})</span>
                        ) : (
                          <span className="font-body" style={{ color: '#F5F0E8' }}>{settings?.currency_symbol || '₹'}{deliveryCharge}</span>
                        )}
                      </div>
                      {totalPrice < deliveryRule.free_delivery_above && deliveryRule.free_delivery_above > 0 && (
                        <p className="font-body text-xs" style={{ color: 'rgba(245,240,232,0.4)' }}>
                          Add {settings?.currency_symbol || '₹'}{deliveryRule.free_delivery_above - totalPrice} more for free delivery
                        </p>
                      )}
                      <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid rgba(212,175,55,0.10)' }}>
                        <span className="font-heading font-semibold" style={{ color: '#F5F0E8' }}>Total</span>
                        <span className="font-heading text-2xl font-black" style={{
                          background: 'linear-gradient(135deg, color-mix(in srgb, var(--theme-color) 90%, white), var(--theme-color))',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                        }}>{settings?.currency_symbol || '₹'}{finalTotal}</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Trust Badges */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-5 space-y-3"
                  >
                    {[
                      { icon: Truck,   text: `Free delivery on orders above ${settings?.currency_symbol || '₹'}${deliveryRule.free_delivery_above}` },
                      { icon: Shield,  text: '100% Premium quality guaranteed' },
                      { icon: Clock,   text: 'Delivery within 2-3 business days' },
                    ].map(({ icon: Icon, text }) => (
                      <div key={text} className="flex items-center gap-3 font-body text-sm" style={{ color: 'rgba(245,240,232,0.55)' }}>
                        <Icon className="w-4 h-4 flex-shrink-0 text-amber-500" />
                        <span>{text}</span>
                      </div>
                    ))}
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
          delivery={confirmedOrder?.delivery ?? (deliveryCharge === 0 && deliveryRule.free_delivery_above > 0 
            ? `Free (Order above ${settings?.currency_symbol || '₹'}${deliveryRule.free_delivery_above})`
            : deliveryCharge)}
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

