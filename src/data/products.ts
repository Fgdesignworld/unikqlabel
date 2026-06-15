export interface WeightVariant {
  weight: string
  price: number
}

export interface SizeVariant {
  label: string    // e.g. "XS", "SM", "MD"
  price?: number | null  // null = fall back to basePrice
}

export interface ColorVariant {
  color: string    // e.g. "Black"
  hex: string      // e.g. "#000000"
  images: string[] // upload paths
}

export interface Product {
  id: string
  name: string
  price: number
  discount_price?: number
  weight: string
  image: string
  gallery?: string[]
  category: string
  description?: string
  rating?: number
  bestseller?: boolean
  variants?: WeightVariant[]
  sizeVariants?: SizeVariant[]   // NEW: size-based pricing
  colorVariants?: ColorVariant[] // NEW: color-based image switching
  sortOrder?: number
  totalStock?: number | null     // from API: null = no inventory configured
  variantInventory?: Array<{ size: string | null; color: string | null; stock: number }> | null
  numericId?: number             // raw DB id (slug is used as id above)
}

export const products: Product[] = [
  {
    id: "ashwagandha-cookies",
    name: "Ashwagandha Cookies",
    price: 450,
    weight: "400g",
    image: "/images/pv2.png", // Main luxury pack render
    category: "cookies",
    description: "Ancient wellness meets modern indulgence. Infused with premium Ashwagandha root extract to ease stress and enhance cognitive clarity. Rich, melt-in-your-mouth flavor.",
    rating: 4.9,
    bestseller: true,
    numericId: 48,
    variants: [
      { weight: "400g", price: 450 },
      { weight: "800g", price: 800 },
    ],
  },
  {
    id: "shilajit-cookies",
    name: "Shilajit Cookies",
    price: 499,
    weight: "400g",
    image: "/images/pv2.png", // Main luxury pack render
    category: "cookies",
    description: "Fuel your daily energy, stamina, and vitality. Infused with pure Himalayan Shilajit and healthy fats, these cookies provide clean, slow-burning strength.",
    rating: 5.0,
    bestseller: true,
    numericId: 47,
    variants: [
      { weight: "400g", price: 499 },
      { weight: "800g", price: 900 },
    ],
  },
  {
    id: "whey-protein-cookies",
    name: "Whey Protein Cookies",
    price: 399,
    weight: "400g",
    image: "/images/pv2.png", // Main luxury pack render
    category: "cookies",
    description: "Designed for recovery and active lifestyles. Packaged with 10g of pure whey protein per serving, dark chocolate chips, and gluten-free ragi.",
    rating: 4.8,
    bestseller: true,
    numericId: 46,
    variants: [
      { weight: "400g", price: 399 },
      { weight: "800g", price: 720 },
    ],
  }
]

export const categories = [
  { id: "cookies", name: "Wellness Cookies",        description: "Premium wellness cookies" },
  { id: "limited", name: "Limited Drops",    description: "Exclusive batch drops" },
]

export function getProductsByCategory(category: string): Product[] {
  return products.filter((p) => p.category === category)
}

export function getBestsellers(): Product[] {
  return products.filter((p) => p.bestseller)
}
