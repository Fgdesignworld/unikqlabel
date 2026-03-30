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
}

export const products: Product[] = [
  // Snacks & Sweets
  {
    id: "nethi-sunnunda",
    name: "Nethi Sunnunda",
    price: 1000,
    weight: "1kg",
    image: "/images/nethi-sunnunda.jpg",
    category: "limited",
    description: "Traditional urad dal sweet with pure ghee",
    rating: 4.9,
    bestseller: true,
    variants: [
      { weight: "250g", price: 300 },
      { weight: "500g", price: 550 },
      { weight: "1kg", price: 1000 },
    ],
  }
]

export const categories = [
  { id: "men", name: "Men Collection",        description: "Premium menswear" },
  { id: "women", name: "Women Collection",    description: "Elegant womenswear" },
  { id: "unisex", name: "Unisex Collection",  description: "Unisex streetwear" },
  { id: "limited", name: "Limited Drops",     description: "Exclusive editions" },
]

export function getProductsByCategory(category: string): Product[] {
  return products.filter((p) => p.category === category)
}

export function getBestsellers(): Product[] {
  return products.filter((p) => p.bestseller)
}
