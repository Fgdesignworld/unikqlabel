

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

// Bump this version when cart structure changes
const CART_VERSION = 2

export interface CartItem {
  id: string
  name: string
  price: number
  originalPrice?: number  // Price before discount
  discountPercent?: number // Discount percentage (0-100)
  weight: string
  size?: string   // Selected size variant label (e.g. M, XL)
  color?: string  // Selected color variant name (e.g. Navy, Black)
  quantity: number
  image: string
  category: string
  productId?: number  // Numeric DB product id for inventory validation
  maxStock?: number   // Known stock at time of adding; undefined = unlimited
}

export interface CustomerDetails {
  name: string
  phone: string
  address: string
  city: string
  pincode: string
  notes: string
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "quantity">) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
  isCartOpen: boolean
  setIsCartOpen: (open: boolean) => void
  isCheckoutOpen: boolean
  setIsCheckoutOpen: (open: boolean) => void
  customerDetails: CustomerDetails
  setCustomerDetails: (details: CustomerDetails) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const defaultCustomerDetails: CustomerDetails = {
  name: "",
  phone: "",
  address: "",
  city: "",
  pincode: "",
  notes: "",
}

function loadCustomerDetails(): CustomerDetails {
  try {
    const raw = localStorage.getItem('lakshmi-customer-details')
    return raw ? (JSON.parse(raw) as CustomerDetails) : defaultCustomerDetails
  } catch {
    return defaultCustomerDetails
  }
}

// Helper to persist customerDetails
function persistCustomerDetails(details: CustomerDetails) {
  try {
    localStorage.setItem('lakshmi-customer-details', JSON.stringify(details))
  } catch (err) {
    console.error('Failed to persist customer details:', err)
  }
}

function loadCart(): CartItem[] {
  try {
    const version = localStorage.getItem('lakshmi-cart-version')
    if (version !== String(CART_VERSION)) {
      // Clear old cart format when version changes
      localStorage.removeItem('lakshmi-cart')
      localStorage.setItem('lakshmi-cart-version', String(CART_VERSION))
      return []
    }
    
    const raw = localStorage.getItem('lakshmi-cart')
    return raw ? (JSON.parse(raw) as CartItem[]) : []
  } catch {
    return []
  }
}

// Helper to persist cart atomically to localStorage
function persistCart(items: CartItem[]) {
  try {
    localStorage.setItem('lakshmi-cart-version', String(CART_VERSION))
    localStorage.setItem('lakshmi-cart', JSON.stringify(items))
  } catch (err) {
    console.error('Failed to persist cart:', err)
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  // Lazy initialiser — reads localStorage synchronously so the persisted
  // cart is available on the very first render (no flash of empty cart).
  const [items, setItems] = useState<CartItem[]>(loadCart)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>(loadCustomerDetails)
  
  // Persist cart to localStorage on every change
  useEffect(() => {
    persistCart(items)
  }, [items])

  // Persist customer details to localStorage on every change
  useEffect(() => {
    persistCustomerDetails(customerDetails)
  }, [customerDetails])

  const addItem = (newItem: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existingItem = prev.find((item) => item.id === newItem.id)
      if (existingItem) {
        const cap = newItem.maxStock ?? existingItem.maxStock ?? 10
        const newQty = Math.min(cap, existingItem.quantity + 1)
        if (newQty === existingItem.quantity) return prev // already at max
        return prev.map((item) =>
          item.id === newItem.id
            ? { ...item, quantity: newQty, maxStock: newItem.maxStock ?? item.maxStock }
            : item
        )
      }
      return [...prev, { ...newItem, quantity: 1 }]
    })
  }

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id)
      return
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item
        const cap = item.maxStock ?? 10
        return { ...item, quantity: Math.min(cap, quantity) }
      })
    )
  }

  const clearCart = () => {
    persistCart([])
    setItems([])
    persistCustomerDetails(defaultCustomerDetails)
    setCustomerDetails(defaultCustomerDetails)
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        customerDetails,
        setCustomerDetails,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
