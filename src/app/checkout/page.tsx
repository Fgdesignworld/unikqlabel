"use client"



import { useState, useEffect } from "react"
import { ImgHTMLAttributes } from 'react';
const Image = ({ priority, fill, quality, ...rest }: ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean, fill?: boolean, quality?: number }) => <img {...rest} />;
import { Link } from 'react-router-dom';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion"
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
  Loader2,
  Tag,
  X,
  Check,
} from "lucide-react"
import { WhatsAppIcon } from '@/components/icons/whatsapp'
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { cn } from '@/lib/utils'
import { useCart } from "@/context/cart-context"
import { useSettings } from "@/context/settings-context"
import { useDelivery } from "@/hooks/use-delivery"
import { InvoiceTemplate } from "@/components/invoice/InvoiceTemplate"
import { generateInvoice } from "@/components/invoice/generateInvoice"
import { orderService } from "@/services/orderService"

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
  const [orderError, setOrderError] = useState<string | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)
  const [invoiceNumber, setInvoiceNumber] = useState("")
  const [confirmedOrder, setConfirmedOrder] = useState<{
    items: typeof items,
    subtotal: number,
    delivery: number | string,
    discount: number,
    couponCode: string | null,
    total: number,
    customer: typeof customerDetails
  } | null>(null)

  // ── Payment method ─────────────────────────────────────────────
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'razorpay'>('razorpay')

  // ── Coupon state ───────────────────────────────────────────────
  const [couponInput, setCouponInput]       = useState('')
  const [appliedCoupon, setAppliedCoupon]   = useState<{ code: string; discount: number } | null>(null)
  const [couponLoading, setCouponLoading]   = useState(false)
  const [couponError, setCouponError]       = useState<string | null>(null)
  const [couponSuccess, setCouponSuccess]   = useState<string | null>(null)

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
    (window as any).__invoiceUpdater = async (data: any) => {
      setPagingState(prev => ({ ...prev, ...data }))
    }
    // Cleanup on unmount to prevent stale references
    return () => {
      delete (window as any).__invoiceUpdater
    }
  }, [])

  // Wait for hydration before checking cart
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  const isCodEnabled = settings?.cod_enabled !== '0'

  // Force online payment if COD is disabled in global settings
  useEffect(() => {
    if (!isCodEnabled && paymentMethod === 'cod') {
      setPaymentMethod('razorpay')
    }
  }, [isCodEnabled, paymentMethod])

  // Redirect to products if cart is empty (only after hydration)
  useEffect(() => {
    if (isHydrated && items.length === 0 && step !== "success") {
      navigate("/products")
    }
  }, [isHydrated, items.length, step, navigate])

  const deliveryInfo = calcDelivery(totalPrice)
  const deliveryCharge = Number(deliveryInfo.fee) || 0
  const couponDiscount = appliedCoupon?.discount ?? 0
  const finalTotal = Math.max(0, Number(totalPrice) + Number(deliveryCharge) - couponDiscount)

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
    setOrderError(null)

    // ─── STEP 1: Save order to database ───
    let newInvoiceNo: string
    try {
      const orderPayload = {
        customer_name: customerDetails.name,
        phone: customerDetails.phone,
        address: customerDetails.address,
        city: customerDetails.city,
        pincode: customerDetails.pincode,
        notes: customerDetails.notes || '',
        delivery: deliveryCharge,
        coupon_code: appliedCoupon?.code ?? null,
        discount_amount: couponDiscount,
        cart_items: items.map(item => ({
          product_id: item.productId ?? null,
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
      } else {
        throw new Error('Order failed. Please try again.')
      }
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || 'Failed to place order. Please try again.'
      setOrderError(msg)
      setIsSubmitting(false)
      return
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
        discount: couponDiscount,
        couponCode: appliedCoupon?.code ?? null,
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
      discount: couponDiscount,
      couponCode: appliedCoupon?.code ?? null,
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
        return ` • ${item.name}${variantDisplay} x ${item.quantity} = ${currency}${item.price * item.quantity}${discountStr}`
      })
      .join("\n")

    const totalSaved = items.reduce((sum, item) => {
      if (item.discountPercent && item.originalPrice) {
        return sum + Math.round((item.originalPrice - item.price) * item.quantity)
      }
      return sum
    }, 0)

    const message = `*New Order from ${settings?.site_name || 'Koffee Kup'}*

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
${totalSaved > 0 ? `Product Discount Saved: -${currency}${totalSaved}` : ''}
${couponDiscount > 0 ? `Coupon Discount (${appliedCoupon?.code}): -${currency}${couponDiscount}` : ''}
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

  // ── Load Razorpay checkout script dynamically ───────────────────
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise(resolve => {
      if (document.getElementById('razorpay-checkout-js')) {
        resolve(true)
        return
      }
      const script = document.createElement('script')
      script.id = 'razorpay-checkout-js'
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload  = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  // ── Razorpay payment handler ─────────────────────────────────────
  const handleRazorpayPayment = async () => {
    setIsSubmitting(true)
    setOrderError(null)

    // ─── STEP 1: Create pending order + Razorpay order via API ───
    let createOrderRes: Awaited<ReturnType<typeof orderService.createRazorpayOrder>>
    try {
      const orderPayload = {
        customer_name: customerDetails.name,
        phone:         customerDetails.phone,
        address:       customerDetails.address,
        city:          customerDetails.city,
        pincode:       customerDetails.pincode,
        notes:         customerDetails.notes || '',
        delivery:      deliveryCharge,
        coupon_code:   appliedCoupon?.code ?? null,
        discount_amount: couponDiscount,
        cart_items: items.map(item => ({
          product_id:     item.productId ?? null,
          name:           item.name,
          weight:         item.weight,
          size:           item.size ?? null,
          color:          item.color ?? null,
          image:          item.image ?? null,
          quantity:       item.quantity,
          price:          item.price,
          originalPrice:  item.originalPrice,
          discountPercent: item.discountPercent,
        })),
      }
      createOrderRes = await orderService.createRazorpayOrder(orderPayload)
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || 'Failed to initiate payment. Please try again.'
      setOrderError(msg)
      setIsSubmitting(false)
      return
    }

    // ─── STEP 2: Load Razorpay checkout.js ───
    const scriptLoaded = await loadRazorpayScript()
    if (!scriptLoaded) {
      setOrderError('Failed to load payment gateway. Please check your connection and try again.')
      setIsSubmitting(false)
      return
    }

    setIsSubmitting(false) // Allow user interaction with Razorpay popup

    // ─── STEP 3: Open Razorpay popup ───
    const currency = settings?.currency_symbol || '₹'
    const options = {
      key:         createOrderRes.rzp_key,
      amount:      createOrderRes.rzp_amount,
      currency:    createOrderRes.rzp_currency || 'INR',
      name:        settings?.site_name || 'Store',
      description: `Order ${createOrderRes.invoice_number}`,
      order_id:    createOrderRes.rzp_order_id,
      prefill: {
        name:    customerDetails.name,
        contact: customerDetails.phone,
      },
      theme: { color: '#D4AF37' },

      handler: async (rzpResponse: any) => {
        setIsSubmitting(true)
        setOrderError(null)

        // ─── STEP 4: Verify payment signature server-side ───
        try {
          await orderService.verifyRazorpayPayment({
            razorpay_order_id:   rzpResponse.razorpay_order_id,
            razorpay_payment_id: rzpResponse.razorpay_payment_id,
            razorpay_signature:  rzpResponse.razorpay_signature,
            order_id:            createOrderRes.order_id,
          })
        } catch (e: any) {
          const msg = e?.response?.data?.error || 'Payment verification failed. Please contact support.'
          setOrderError(msg)
          setIsSubmitting(false)
          return
        }

        const newInvoiceNo = createOrderRes.invoice_number
        setInvoiceNumber(newInvoiceNo)
        await new Promise(resolve => setTimeout(resolve, 100))

        // ─── STEP 5: Generate PDF invoice ───
        try {
          const deliveryLabel = deliveryCharge === 0 && deliveryRule.free_delivery_above > 0
            ? `Free (Order above ${currency}${deliveryRule.free_delivery_above})`
            : deliveryCharge
          const invoiceProps = {
            items: items.map(item => ({
              name: item.name, weight: item.weight, size: item.size,
              color: item.color, quantity: item.quantity, price: item.price,
              originalPrice: item.originalPrice, discountPercent: item.discountPercent,
              image: item.image,
            })),
            customerDetails: { ...customerDetails },
            subtotal: totalPrice,
            delivery: deliveryLabel,
            discount: couponDiscount,
            couponCode: appliedCoupon?.code ?? null,
            total: finalTotal,
            date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
          }
          await generateInvoice('invoice-template-pdf', newInvoiceNo, true, invoiceProps)
        } catch (e) {
          console.error('PDF generation error:', e)
        }

        // ─── STEP 6: Save snapshot for "Download Again" ───
        const deliveryLabel = deliveryCharge === 0 && deliveryRule.free_delivery_above > 0
          ? `Free (Order above ${currency}${deliveryRule.free_delivery_above})`
          : deliveryCharge
        setConfirmedOrder({
          items: [...items],
          subtotal: totalPrice,
          delivery: deliveryLabel,
          discount: couponDiscount,
          couponCode: appliedCoupon?.code ?? null,
          total: finalTotal,
          customer: { ...customerDetails }
        })

        // ─── STEP 7: Send WhatsApp notification ───
        const itemsList = items.map(item => {
          const savedAmount = item.discountPercent && item.originalPrice
            ? Math.round((item.originalPrice - item.price) * item.quantity) : 0
          const discountStr = item.discountPercent ? ` (${item.discountPercent}% off, save ${currency}${savedAmount})` : ''
          const variantStr = [item.size, item.color].filter(Boolean).join(' / ')
          return ` • ${item.name}${variantStr ? ` [${variantStr}]` : ''} x ${item.quantity} = ${currency}${item.price * item.quantity}${discountStr}`
        }).join('\n')

        const totalSaved = items.reduce((sum, item) =>
          item.discountPercent && item.originalPrice
            ? sum + Math.round((item.originalPrice - item.price) * item.quantity) : sum, 0)

        const waMessage = `*New PAID Order*

*Invoice:* ${newInvoiceNo}
*Payment:* Razorpay Online ✅

*Customer Details:*
Name: ${customerDetails.name}
Phone: ${customerDetails.phone}
Address: ${customerDetails.address}
City: ${customerDetails.city}
Pincode: ${customerDetails.pincode}${customerDetails.notes ? `\nNotes: ${customerDetails.notes}` : ''}

*Order Details:*
${itemsList}

Subtotal: ${currency}${totalPrice}
${totalSaved > 0 ? `Product Discount Saved: -${currency}${totalSaved}` : ''}
${couponDiscount > 0 ? `Coupon Discount (${appliedCoupon?.code}): -${currency}${couponDiscount}` : ''}
Delivery: ${deliveryCharge === 0 ? 'FREE' : `${currency}${deliveryCharge}`}
*Total: ${currency}${finalTotal}*`.trim()

        const waNum = (settings?.whatsapp || settings?.phone || '918639424039').replace(/[^0-9]/g, '')
        window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(waMessage)}`, '_blank')

        // ─── STEP 8: Show success ───
        setTimeout(() => {
          setIsSubmitting(false)
          setStep('success')
          clearCart()
          window.scrollTo(0, 0)
        }, 800)
      },

      modal: {
        ondismiss: () => {
          // Mark pending order as failed silently
          orderService.cancelRazorpayOrder(createOrderRes.order_id).catch(() => {})
          setOrderError('Payment was cancelled. Your cart is saved — you can try again.')
        },
      },
    }

    const rzp = new (window as any).Razorpay(options)
    rzp.open()
  }

  const handleInputChange = (field: keyof typeof customerDetails, value: string) => {
    setCustomerDetails({ ...customerDetails, [field]: value })
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" })
    }
  }

  // ─── Coupon handlers ─────────────────────────────────────────────────────
  const handleApplyCoupon = async () => {
    const code = couponInput.trim().toUpperCase()
    if (!code) return
    setCouponError(null)
    setCouponSuccess(null)
    setCouponLoading(true)
    try {
      const res = await api.post('/coupons/validate', { code, cart_total: totalPrice })
      const data = res.data?.data
      setAppliedCoupon({ code, discount: data.discount_amount })
      setCouponSuccess(`Coupon applied! You save ${settings?.currency_symbol || '₹'}${data.discount_amount}`)
      setCouponInput('')
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Invalid coupon code'
      setCouponError(msg)
    } finally {
      setCouponLoading(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponError(null)
    setCouponSuccess(null)
    setCouponInput('')
  }

  if (!isHydrated) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: 'var(--surface-page)' }}>
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-[#1F4D3A] dark:text-[#C8A96B]" />
          <p className="font-body" style={{ color: 'var(--text-dim)' }}>Loading checkout...</p>
        </div>
      </main>
    )
  }

  if (items.length === 0 && step !== "success") {
    return null
  }

  return (
    <main className="relative min-h-screen bg-[#FDFBF7] dark:bg-[#0A0A0A] text-[#1F4D3A] dark:text-[#FDFBF7] transition-colors duration-500 overflow-hidden">
      {/* Decorative Background for Liquid Glass Effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#C8A96B]/10 dark:bg-[#C8A96B]/5 blur-[140px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#1F4D3A]/10 dark:bg-[#1F4D3A]/10 blur-[120px]" />
      </div>

      <Navbar />

      <div className="pt-24 pb-20 px-4 relative z-10">
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
                className="flex items-center gap-2 font-body text-xs uppercase tracking-widest font-bold transition-all text-neutral-500 hover:text-[#1F4D3A] dark:text-neutral-400 dark:hover:text-[#C8A96B] cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                {step === "review" ? "Back to Details" : "Continue Shopping"}
              </button>
            </motion.div>
          )}

          {/* Progress Steps */}
          {step !== "success" && (
            <div className="flex items-center justify-center gap-2 sm:gap-6 mb-12 flex-wrap animate-fade-in">
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
                  <div key={label} className="flex items-center gap-2 sm:gap-3">
                    <div
                      className={cn(
                        "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm font-heading transition-all duration-300 border",
                        isActive
                          ? "bg-[#1F4D3A] !text-white border-[#1F4D3A] dark:bg-[#C8A96B] dark:!text-[#1A1A1A] dark:border-[#C8A96B]"
                          : "bg-white/80 dark:bg-white/5 border-[#C8A96B]/25 text-neutral-400 dark:text-neutral-500"
                      )}
                      style={isActive && isCurrent ? { boxShadow: '0 0 0 2px #C8A96B' } : undefined}
                    >
                      {stepIndex}
                    </div>
                    <span
                      className={cn(
                        "font-body text-xs sm:text-sm font-bold tracking-wide",
                        isActive ? "text-[#1F4D3A] dark:text-[#FDFBF7]" : "text-neutral-400 dark:text-neutral-500"
                      )}
                    >
                      {label}
                    </span>
                    {index < 2 && (
                      <div
                        className={cn(
                          "w-8 sm:w-16 h-0.5 rounded-full transition-all duration-500",
                          isActive && stepIndex < (step === 'review' ? 2 : 1)
                            ? "bg-[#1F4D3A] dark:bg-[#C8A96B]"
                            : "bg-[#C8A96B]/15 dark:bg-white/10"
                        )}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Success State */}
          {step === "success" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-center py-16 px-6 rounded-3xl bg-white/70 dark:bg-[#121212]/70 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-[0_8px_40px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_40px_rgb(0,0,0,0.3)] max-w-2xl mx-auto relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center bg-green-500/10 border border-green-500/30"
              >
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </motion.div>
              <h1 className="font-serif text-3xl font-normal mb-3 text-[#1F4D3A] dark:text-[#FDFBF7]">
                Order Placed Successfully!
              </h1>
              <p className="font-body text-sm max-w-md mx-auto mb-6 text-neutral-600 dark:text-white/60">
                {confirmedOrder
                  ? 'Your payment was successful! Your order has been placed.'
                  : 'Our team will contact you soon for order and delivery confirmations.'
                }
              </p>
              <div className="flex items-center justify-center gap-2 font-body text-sm max-w-md mx-auto mb-10 text-[#1F4D3A]/70 dark:text-[#FDFBF7]/80 bg-[#1F4D3A]/5 dark:bg-[#C8A96B]/5 py-3.5 px-4 rounded-lg border border-[#1F4D3A]/10 dark:border-[#C8A96B]/15">
                <span className="font-medium">For details or support, WhatsApp:</span>
                <a 
                  href={`https://wa.me/${(settings?.whatsapp || settings?.phone || '919601874404').replace(/[^0-9]/g, '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="font-bold hover:text-green-500 transition-colors flex items-center gap-1 text-[#1F4D3A] dark:text-[#C8A96B]"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                  {settings?.whatsapp || settings?.phone || '+91 96018 74404'}
                </a>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-sm mx-auto">
                <button
                  onClick={() => {
                    if (confirmedOrder) {
                      generateInvoice("invoice-template-pdf", invoiceNumber, true, {
                        ...confirmedOrder,
                        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                      })
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3.5 text-[11px] font-bold uppercase tracking-[0.2em] rounded-xl transition-all hover:bg-white/50 dark:hover:bg-white/5 border border-[#1F4D3A]/20 dark:border-white/20 text-[#1F4D3A] dark:text-[#FDFBF7] bg-transparent cursor-pointer hover:scale-[1.02] active:scale-[0.98] duration-300 shadow-sm"
                >
                  <FileText className="w-4 h-4" />
                  Download Invoice
                </button>
                <Link
                  to="/products"
                  className="w-full flex items-center justify-center gap-2 px-5 py-3.5 text-[11px] font-bold uppercase tracking-[0.2em] !text-white bg-gradient-to-r from-[#1F4D3A] to-[#163829] hover:from-[#163829] hover:to-[#0f261c] dark:from-[#C8A96B] dark:to-[#E2C98A] dark:hover:from-[#E2C98A] dark:hover:to-[#f3e1a6] dark:!text-[#1A1A1A] rounded-xl shadow-[0_4px_20px_rgba(31,77,58,0.2)] dark:shadow-[0_4px_20px_rgba(200,169,107,0.3)] transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] duration-300"
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
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="rounded-3xl p-6 md:p-10 bg-white/70 dark:bg-[#121212]/70 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-[0_8px_40px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_40px_rgb(0,0,0,0.3)] relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    <h1 className="font-serif text-2xl font-normal mb-1 text-[#1F4D3A] dark:text-[#FDFBF7]">
                      Delivery Details
                    </h1>
                    <p className="font-body text-xs mb-8 text-neutral-500 dark:text-white/40">
                      Please enter your delivery information below to complete your order.
                    </p>

                    <div className="space-y-5">
                      {/* Full Name */}
                      <div>
                        <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest mb-1.5 font-body text-[#1F4D3A] dark:text-[#C8A96B]">
                          <User className="w-3.5 h-3.5" />
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={customerDetails.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          placeholder="Enter your full name"
                          className="w-full px-4 py-3.5 rounded-xl font-body text-sm bg-white dark:bg-[#1A1A1A] border border-[#1F4D3A]/20 dark:border-white/20 outline-none transition-all focus:ring-2 focus:ring-[#C8A96B]/50 focus:border-[#C8A96B] text-[#1F4D3A] dark:text-[#FDFBF7] placeholder:text-neutral-400 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-[#1F4D3A]/40 dark:hover:border-white/40"
                          style={{ borderColor: errors.name ? '#ef4444' : 'rgba(200,169,107,0.3)' }}
                        />
                        {errors.name && (
                          <p className="text-red-500 text-xs mt-1 font-body font-semibold">{errors.name}</p>
                        )}
                      </div>

                      {/* Phone Number */}
                      <div>
                        <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest mb-1.5 font-body text-[#1F4D3A] dark:text-[#C8A96B]">
                          <Phone className="w-3.5 h-3.5" />
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          value={customerDetails.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                          placeholder="Enter 10-digit phone number"
                          className="w-full px-4 py-3.5 rounded-xl font-body text-sm bg-white dark:bg-[#1A1A1A] border border-[#1F4D3A]/20 dark:border-white/20 outline-none transition-all focus:ring-2 focus:ring-[#C8A96B]/50 focus:border-[#C8A96B] text-[#1F4D3A] dark:text-[#FDFBF7] placeholder:text-neutral-400 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-[#1F4D3A]/40 dark:hover:border-white/40"
                          style={{ borderColor: errors.phone ? '#ef4444' : 'rgba(200,169,107,0.3)' }}
                        />
                        {errors.phone && (
                          <p className="text-red-500 text-xs mt-1 font-body font-semibold">{errors.phone}</p>
                        )}
                      </div>

                      {/* Delivery Address */}
                      <div>
                        <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest mb-1.5 font-body text-[#1F4D3A] dark:text-[#C8A96B]">
                          <MapPin className="w-3.5 h-3.5" />
                          Delivery Address *
                        </label>
                        <textarea
                          value={customerDetails.address}
                          onChange={(e) => handleInputChange("address", e.target.value)}
                          placeholder="Flat/House No., Building, Street, Area, Landmark"
                          rows={3}
                          className="w-full px-4 py-3.5 rounded-xl font-body text-sm bg-white dark:bg-[#1A1A1A] border border-[#1F4D3A]/20 dark:border-white/20 outline-none resize-none transition-all focus:ring-2 focus:ring-[#C8A96B]/50 focus:border-[#C8A96B] text-[#1F4D3A] dark:text-[#FDFBF7] placeholder:text-neutral-400 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-[#1F4D3A]/40 dark:hover:border-white/40"
                          style={{ borderColor: errors.address ? '#ef4444' : 'rgba(200,169,107,0.3)' }}
                        />
                        {errors.address && (
                          <p className="text-red-500 text-xs mt-1 font-body font-semibold">{errors.address}</p>
                        )}
                      </div>

                      {/* City & Pincode */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest mb-1.5 font-body text-[#1F4D3A] dark:text-[#C8A96B]">
                            <Building2 className="w-3.5 h-3.5" />
                            City *
                          </label>
                          <input
                            type="text"
                            value={customerDetails.city}
                            onChange={(e) => handleInputChange("city", e.target.value)}
                            placeholder="City"
                            className="w-full px-4 py-3.5 rounded-xl font-body text-sm bg-white dark:bg-[#1A1A1A] border border-[#1F4D3A]/20 dark:border-white/20 outline-none transition-all focus:ring-2 focus:ring-[#C8A96B]/50 focus:border-[#C8A96B] text-[#1F4D3A] dark:text-[#FDFBF7] placeholder:text-neutral-400 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-[#1F4D3A]/40 dark:hover:border-white/40"
                            style={{ borderColor: errors.city ? '#ef4444' : 'rgba(200,169,107,0.3)' }}
                          />
                          {errors.city && <p className="text-red-500 text-xs mt-1 font-body font-semibold">{errors.city}</p>}
                        </div>
                        <div>
                          <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest mb-1.5 font-body text-[#1F4D3A] dark:text-[#C8A96B]">
                            <MapPinned className="w-3.5 h-3.5" />
                            Pincode *
                          </label>
                          <input
                            type="text"
                            value={customerDetails.pincode}
                            onChange={(e) => handleInputChange("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
                            placeholder="6-digit PIN"
                            className="w-full px-4 py-3.5 rounded-xl font-body text-sm bg-white dark:bg-[#1A1A1A] border border-[#1F4D3A]/20 dark:border-white/20 outline-none transition-all focus:ring-2 focus:ring-[#C8A96B]/50 focus:border-[#C8A96B] text-[#1F4D3A] dark:text-[#FDFBF7] placeholder:text-neutral-400 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-[#1F4D3A]/40 dark:hover:border-white/40"
                            style={{ borderColor: errors.pincode ? '#ef4444' : 'rgba(200,169,107,0.3)' }}
                          />
                          {errors.pincode && <p className="text-red-500 text-xs mt-1 font-body font-semibold">{errors.pincode}</p>}
                        </div>
                      </div>

                      {/* Order Notes */}
                      <div>
                        <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest mb-1.5 font-body text-[#1F4D3A] dark:text-[#C8A96B]">
                          <FileText className="w-3.5 h-3.5" />
                          Order Notes (Optional)
                        </label>
                        <textarea
                          value={customerDetails.notes}
                          onChange={(e) => handleInputChange("notes", e.target.value)}
                          placeholder="Any special instructions for your delivery..."
                          rows={2}
                          className="w-full px-4 py-3.5 rounded-xl font-body text-sm bg-white dark:bg-[#1A1A1A] border border-[#1F4D3A]/20 dark:border-white/20 outline-none resize-none transition-all focus:ring-2 focus:ring-[#C8A96B]/50 focus:border-[#C8A96B] text-[#1F4D3A] dark:text-[#FDFBF7] placeholder:text-neutral-400 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-[#1F4D3A]/40 dark:hover:border-white/40"
                          style={{ borderColor: 'rgba(200,169,107,0.3)' }}
                        />
                      </div>

                      <button
                        onClick={handleProceedToReview}
                        className="w-full py-4 text-[11px] font-bold uppercase tracking-[0.2em] !text-white bg-gradient-to-r from-[#1F4D3A] to-[#163829] hover:from-[#163829] hover:to-[#0f261c] dark:from-[#C8A96B] dark:to-[#E2C98A] dark:hover:from-[#E2C98A] dark:hover:to-[#f3e1a6] dark:!text-[#1A1A1A] rounded-xl shadow-[0_4px_20px_rgba(31,77,58,0.2)] dark:shadow-[0_4px_20px_rgba(200,169,107,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] duration-300"
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
                    className="space-y-5"
                  >
                    {/* Delivery Info */}
                    <div className="rounded-3xl p-6 bg-white/70 dark:bg-[#121212]/70 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="font-serif text-lg font-normal text-[#1F4D3A] dark:text-[#FDFBF7]">
                          Delivery Information
                        </h2>
                        <button
                          onClick={() => setStep("details")}
                          className="font-body text-xs uppercase tracking-widest font-bold transition-colors text-[#C8A96B] hover:text-[#1F4D3A] dark:hover:text-[#FDFBF7] cursor-pointer"
                        >
                          Edit
                        </button>
                      </div>
                      <div className="space-y-2 font-body text-sm text-neutral-600 dark:text-white/60">
                        <p><span className="font-bold text-[#1F4D3A] dark:text-[#FDFBF7]">Name:</span> {customerDetails.name}</p>
                        <p><span className="font-bold text-[#1F4D3A] dark:text-[#FDFBF7]">Phone:</span> {customerDetails.phone}</p>
                        <p><span className="font-bold text-[#1F4D3A] dark:text-[#FDFBF7]">Address:</span> {customerDetails.address}</p>
                        <p><span className="font-bold text-[#1F4D3A] dark:text-[#FDFBF7]">City:</span> {customerDetails.city} - {customerDetails.pincode}</p>
                        {customerDetails.notes && (
                          <p><span className="font-bold text-[#1F4D3A] dark:text-[#FDFBF7]">Notes:</span> {customerDetails.notes}</p>
                        )}
                      </div>
                    </div>

                    {/* Order Items (Review) */}
                    <div className="rounded-3xl p-6 bg-white/70 dark:bg-[#121212]/70 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
                      <h2 className="font-serif text-lg font-normal mb-4 text-[#1F4D3A] dark:text-[#FDFBF7]">
                        Order Items ({items.length})
                      </h2>
                      <div className="space-y-3">
                        {items.map((item) => (
                          <div key={item.id} className="flex gap-4 py-4 bg-transparent border-b border-[#C8A96B]/15 dark:border-white/5 last:border-b-0 relative group">
                            <div className="relative w-16 h-16 bg-[#FDFBF7] dark:bg-[#121212] rounded-md overflow-hidden shrink-0 flex items-center justify-center p-1 border border-[#C8A96B]/15 dark:border-white/5">
                              <img src={item.image} alt={item.name} className="w-[90%] h-[90%] object-contain select-none transition-transform duration-300 group-hover:scale-105" />
                            </div>
                            <div className="flex-1 min-w-0 pr-2">
                              <h3 className="font-bold text-sm text-[#1F4D3A] dark:text-[#FDFBF7] truncate mb-0.5 leading-tight">{item.name}</h3>
                              {(item.size || item.color) && (
                                <div className="flex flex-wrap gap-1 mb-1.5">
                                  {item.size && (
                                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#1F4D3A]/5 text-[#1F4D3A] dark:bg-[#C8A96B]/10 dark:text-[#C8A96B] border border-[#1F4D3A]/15 dark:border-[#C8A96B]/15">Size: {item.size}</span>
                                  )}
                                  {item.color && (
                                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-neutral-500/10 text-neutral-500 dark:bg-white/10 dark:text-white/70">Color: {item.color}</span>
                                  )}
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <p className="font-mono text-sm font-bold text-[#C8A96B]">{settings?.currency_symbol || '₹'}{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                                {item.originalPrice && (
                                  <p className="font-mono text-xs line-through text-[#1F4D3A]/30 dark:text-neutral-500">{settings?.currency_symbol || '₹'}{(item.originalPrice * item.quantity).toLocaleString('en-IN')}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end justify-between shrink-0">
                              <button onClick={() => removeItem(item.id)} className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer">
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <div className="flex items-center p-0.5 border border-[#C8A96B]/20 dark:border-white/10 bg-[#FDFBF7] dark:bg-black/20 rounded-lg shadow-sm">
                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 dark:hover:bg-white/5 transition-all text-[#1F4D3A] dark:text-[#FDFBF7] hover:text-[#C8A96B] cursor-pointer">
                                  <Minus className="w-3.5 h-3.5 text-[#1F4D3A] dark:text-[#C8A96B]" />
                                </button>
                                <span className="text-[#1F4D3A] dark:text-[#FDFBF7] font-mono text-xs font-bold w-6 text-center">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  disabled={item.maxStock !== undefined && item.quantity >= item.maxStock}
                                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 dark:hover:bg-white/5 transition-all text-[#1F4D3A] dark:text-[#FDFBF7] hover:text-[#C8A96B] disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                                >
                                  <Plus className="w-3.5 h-3.5 text-[#1F4D3A] dark:text-[#C8A96B]" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Error Banner */}
                    {orderError && (
                      <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/25 rounded-2xl text-sm text-red-500 animate-pulse">
                        <svg className="w-5 h-5 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg>
                        <span className="font-semibold">{orderError}</span>
                      </div>
                    )}

                    {/* Payment Method Selector */}
                    {isCodEnabled && (
                      <div className="rounded-3xl p-6 bg-white/70 dark:bg-[#121212]/70 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
                        <p className="font-serif text-lg font-normal mb-4 text-[#1F4D3A] dark:text-[#FDFBF7]">
                          Payment Method
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                          {/* Online Payment */}
                          <button
                            type="button"
                            onClick={() => setPaymentMethod('razorpay')}
                            className="flex flex-col items-center gap-2.5 p-4 rounded-lg border-2 transition-all cursor-pointer relative overflow-hidden select-none hover:scale-[1.02] duration-300"
                            style={paymentMethod === 'razorpay'
                              ? { borderColor: '#1F4D3A', background: 'rgba(31,77,58,0.04)' }
                              : { borderColor: 'rgba(200,169,107,0.25)', background: 'transparent' }}
                          >
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke={paymentMethod === 'razorpay' ? '#1F4D3A' : '#C8A96B'} strokeWidth="1.8">
                              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                              <line x1="1" y1="10" x2="23" y2="10"/>
                            </svg>
                            <span className="font-body text-xs font-bold uppercase tracking-wider text-[#1F4D3A] dark:text-[#FDFBF7]">
                              Pay Online
                            </span>
                            {paymentMethod === 'razorpay' && (
                              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#1F4D3A]/5 border border-[#1F4D3A]/15 text-[#1F4D3A] dark:bg-[#C8A96B]/10 dark:text-[#C8A96B]">
                                Card · UPI · Wallet
                              </span>
                            )}
                          </button>

                          {/* Cash on Delivery */}
                          <button
                            type="button"
                            onClick={() => setPaymentMethod('cod')}
                            className="flex flex-col items-center gap-2.5 p-4 rounded-lg border-2 transition-all cursor-pointer relative overflow-hidden select-none hover:scale-[1.02] duration-300"
                            style={paymentMethod === 'cod'
                              ? { borderColor: '#1F4D3A', background: 'rgba(31,77,58,0.04)' }
                              : { borderColor: 'rgba(200,169,107,0.25)', background: 'transparent' }}
                          >
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke={paymentMethod === 'cod' ? '#1F4D3A' : '#C8A96B'} strokeWidth="1.8">
                              <rect x="1" y="6" width="15" height="10" rx="1"/>
                              <path d="M16 10h3l3 4H16"/>
                              <circle cx="5.5" cy="18.5" r="2.5"/>
                              <circle cx="18.5" cy="18.5" r="2.5"/>
                            </svg>
                            <span className="font-body text-xs font-bold uppercase tracking-wider text-[#1F4D3A] dark:text-[#FDFBF7]">
                              Cash on Delivery
                            </span>
                            {paymentMethod === 'cod' && (
                              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#1F4D3A]/5 border border-[#1F4D3A]/15 text-[#1F4D3A] dark:bg-[#C8A96B]/10 dark:text-[#C8A96B]">
                                Pay at Doorstep
                              </span>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                     {/* Place Order CTA Buttons */}
                    {paymentMethod === 'razorpay' ? (
                      <button
                        onClick={handleRazorpayPayment}
                        disabled={isSubmitting}
                        className="w-full py-4 text-[11px] font-bold uppercase tracking-[0.2em] !text-white bg-gradient-to-r from-[#1F4D3A] to-[#163829] hover:from-[#163829] hover:to-[#0f261c] dark:from-[#C8A96B] dark:to-[#E2C98A] dark:hover:from-[#E2C98A] dark:hover:to-[#f3e1a6] dark:!text-[#1A1A1A] rounded-xl shadow-[0_8px_30px_rgba(31,77,58,0.3)] dark:shadow-[0_8px_30px_rgba(200,169,107,0.4)] transition-all disabled:opacity-50 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] duration-300 cursor-pointer animate-fade-in relative overflow-hidden group"
                      >
                        <div className="absolute inset-0 bg-white/20 translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-1000" />
                        {isSubmitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            Processing Payment...
                          </>
                        ) : (
                          <>
                            <Shield className="w-4 h-4" />
                            Pay {settings?.currency_symbol || '₹'}{finalTotal.toLocaleString('en-IN')} Securely
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={handlePlaceOrder}
                        disabled={isSubmitting}
                        className="w-full py-4 bg-gradient-to-r from-[#25D366] to-[#20ba5a] hover:from-[#20ba5a] hover:to-[#1da851] !text-white font-bold text-[11px] uppercase tracking-[0.2em] rounded-xl shadow-[0_8px_30px_rgba(37,211,102,0.3)] transition-all disabled:opacity-50 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] duration-300 cursor-pointer animate-fade-in relative overflow-hidden group"
                      >
                        <div className="absolute inset-0 bg-white/20 translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-1000" />
                        {isSubmitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Submitting Order...
                          </>
                        ) : (
                          <>
                            <WhatsAppIcon className="w-5 h-5" />
                            Place Order via WhatsApp
                          </>
                        )}
                      </button>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Right Column - Order Summary */}
              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
                    className="rounded-3xl p-6 bg-white/70 dark:bg-[#121212]/70 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-[0_8px_40px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_40px_rgb(0,0,0,0.3)] relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    <h2 className="font-serif text-lg font-normal mb-4 flex items-center gap-2 text-[#1F4D3A] dark:text-[#FDFBF7]">
                      <ShoppingBag className="w-5 h-5 text-[#1F4D3A] dark:text-[#C8A96B]" />
                      Order Summary
                    </h2>

                    <div className="space-y-2 mb-5 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[#C8A96B]/20 scrollbar-track-transparent">
                      {items.map((item) => {
                        const savedAmount = item.discountPercent && item.originalPrice 
                          ? Math.round((item.originalPrice - item.price) * item.quantity)
                          : 0
                        return (
                          <div key={item.id} className="flex gap-3 items-center py-3 bg-transparent border-b border-[#C8A96B]/15 dark:border-white/5 last:border-b-0">
                            <div className="relative w-14 h-14 bg-[#FDFBF7] dark:bg-[#121212] rounded-md overflow-hidden shrink-0 flex items-center justify-center p-1 border border-[#C8A96B]/15 dark:border-white/5">
                              <img src={item.image} alt={item.name} className="w-[90%] h-[90%] object-contain" />
                            </div>
                            <div className="flex-1 min-w-0 pr-1">
                              <h3 className="font-bold text-xs text-[#1F4D3A] dark:text-[#FDFBF7] truncate mb-0.5 leading-tight">{item.name}</h3>
                              {(item.size || item.color) && (
                                <div className="flex flex-wrap gap-1 mb-1 leading-none">
                                  {item.size  && <span className="text-[8px] font-bold uppercase tracking-wider px-1 py-0.5 rounded bg-[#1F4D3A]/5 text-[#1F4D3A] dark:bg-[#C8A96B]/10 dark:text-[#C8A96B] border border-[#1F4D3A]/10 dark:border-[#C8A96B]/10">{item.size}</span>}
                                  {item.color && <span className="text-[8px] font-bold uppercase tracking-wider px-1 py-0.5 rounded bg-neutral-500/10 text-neutral-500 dark:bg-white/10 dark:text-white/70">{item.color}</span>}
                                </div>
                              )}
                              <div className="flex items-center justify-between">
                                <span className="font-body text-[10px] text-neutral-500 dark:text-white/40">
                                  Qty {item.quantity}
                                </span>
                                <div className="flex items-center gap-1.5 leading-none">
                                  <span className="font-mono text-xs font-bold text-[#C8A96B]">{settings?.currency_symbol || '₹'}{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                                  {item.discountPercent && (
                                    <span className="text-[8px] font-bold bg-red-500/10 border border-red-500/20 text-red-500 px-1 py-0.5 rounded">-{item.discountPercent}%</span>
                                  )}
                                </div>
                              </div>
                              {savedAmount > 0 && (
                                <p className="font-body text-[9px] font-bold text-[#1F4D3A]/60 dark:text-[#C8A96B]/80 mt-0.5">Saved {settings?.currency_symbol || '₹'}{savedAmount}</p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <div className="pt-4 space-y-3.5 border-t border-[#C8A96B]/20 dark:border-white/5">

                      {/* Coupon Section */}
                      <div>
                        <AnimatePresence mode="wait">
                          {!appliedCoupon ? (
                            <motion.div
                              key="input"
                              initial={{ opacity: 0, y: -6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -6 }}
                              className="space-y-2"
                            >
                              <div className="flex gap-2">
                                        <div className="relative flex-1">
                                          <Tag className="absolute left-3 top-3.5 w-3.5 h-3.5 text-[#1F4D3A] dark:text-[#C8A96B]" />
                                          <input
                                            type="text"
                                            value={couponInput}
                                            onChange={e => {
                                              setCouponInput(e.target.value.toUpperCase())
                                              setCouponError(null)
                                            }}
                                            onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                                            placeholder="COUPON CODE"
                                            maxLength={30}
                                            className="w-full pl-8 pr-3 py-2.5 rounded-xl font-mono text-xs font-bold bg-white dark:bg-[#1A1A1A] border border-[#1F4D3A]/20 dark:border-white/20 outline-none transition-all focus:ring-2 focus:ring-[#C8A96B]/50 focus:border-[#C8A96B] text-[#1F4D3A] dark:text-[#FDFBF7] placeholder-[#1F4D3A]/40 dark:placeholder-white/40 shadow-sm"
                                            style={{ borderColor: couponError ? '#ef4444' : 'rgba(200, 169, 107, 0.25)' }}
                                          />
                                        </div>
                                        <button
                                          onClick={handleApplyCoupon}
                                          disabled={couponLoading || !couponInput.trim()}
                                          className="px-4 py-2.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 shrink-0 cursor-pointer bg-[#C8A96B]/10 hover:bg-[#C8A96B]/20 border border-[#C8A96B]/25 text-[#1F4D3A] dark:text-[#C8A96B]"
                                        >
                                  {couponLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Apply'}
                                </button>
                              </div>
                              {couponError && (
                                <p className="text-red-500 text-xs font-body font-semibold flex items-center gap-1 pl-1">
                                  <X className="w-3.5 h-3.5" />
                                  {couponError}
                                </p>
                              )}
                            </motion.div>
                          ) : (
                            <motion.div
                              key="applied"
                              initial={{ opacity: 0, scale: 0.97 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.97 }}
                              className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30">
                                  <Check className="w-3.5 h-3.5 text-green-500" />
                                </div>
                                <div>
                                  <p className="font-mono text-xs font-bold text-green-600">{appliedCoupon.code}</p>
                                  <p className="text-[10px] text-green-600/70 font-body">You save {settings?.currency_symbol || '₹'}{appliedCoupon.discount}</p>
                                </div>
                              </div>
                              <button
                                onClick={handleRemoveCoupon}
                                className="p-1 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Pricing Summaries */}
                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="font-body text-neutral-500 dark:text-white/50">Subtotal</span>
                        <span className="font-mono text-neutral-800 dark:text-[#fef3e2] font-semibold">{settings?.currency_symbol || '₹'}{totalPrice.toLocaleString('en-IN')}</span>
                      </div>
                      {(() => {
                        const totalSaved = items.reduce((sum, item) => {
                          if (item.discountPercent && item.originalPrice) {
                            return sum + Math.round((item.originalPrice - item.price) * item.quantity)
                          }
                          return sum
                        }, 0)
                        return totalSaved > 0 ? (
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-body text-green-600">Discount Saved</span>
                            <span className="font-mono text-green-600 font-bold">-{settings?.currency_symbol || '₹'}{totalSaved.toLocaleString('en-IN')}</span>
                          </div>
                        ) : null
                      })()}
                      {couponDiscount > 0 && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-body text-green-600 font-semibold">Coupon ({appliedCoupon?.code})</span>
                          <span className="font-mono text-green-600 font-bold">-{settings?.currency_symbol || '₹'}{couponDiscount.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-body text-neutral-500 dark:text-white/50">Delivery</span>
                        {deliveryCharge === 0 && deliveryRule.free_delivery_above > 0 ? (
                          <span className="font-body text-green-600 font-bold uppercase text-[10px] tracking-wider leading-none">Free</span>
                        ) : (
                          <span className="font-mono text-neutral-800 dark:text-[#fef3e2] font-semibold">{settings?.currency_symbol || '₹'}{deliveryCharge}</span>
                        )}
                      </div>
                      {totalPrice < deliveryRule.free_delivery_above && deliveryRule.free_delivery_above > 0 && (
                        <div className="p-2.5 rounded-lg bg-[#1F4D3A]/5 border border-[#1F4D3A]/15 text-[10px] text-[#1F4D3A] dark:text-[#FDFBF7]/90 font-bold leading-normal">
                          Add {settings?.currency_symbol || '₹'}{Math.ceil(deliveryRule.free_delivery_above - totalPrice)} more for free delivery
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-4 border-t border-[#C8A96B]/20 dark:border-white/5">
                        <span className="font-bold text-sm uppercase tracking-wider text-[#1F4D3A] dark:text-[#FDFBF7]">Total</span>
                        <span className="text-3xl font-serif font-light text-[#1F4D3A] dark:text-[#C8A96B]">
                          {settings?.currency_symbol || '₹'}{finalTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Trust Badges */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-5 space-y-3 px-2"
                  >
                    {[
                      { icon: Truck,   text: `Free delivery on orders above ${settings?.currency_symbol || '₹'}${deliveryRule.free_delivery_above}` },
                      { icon: Shield,  text: '100% Premium quality guaranteed' },
                      { icon: Clock,   text: 'Delivery within 2-3 business days' },
                    ].map(({ icon: Icon, text }) => (
                      <div key={text} className="flex items-center gap-3 font-body text-xs text-neutral-500 dark:text-white/40">
                        <Icon className="w-4 h-4 flex-shrink-0 text-[#1F4D3A] dark:text-[#C8A96B]" />
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
          discount={confirmedOrder?.discount ?? couponDiscount}
          couponCode={confirmedOrder?.couponCode ?? (appliedCoupon?.code ?? null)}
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

