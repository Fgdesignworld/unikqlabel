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
    id: "neem-lemongrass-floor-cleaner",
    name: "Neem & Lemongrass Floor Cleaner",
    price: 299,
    weight: "1 Litre",
    image: "/images/pv2.png",
    category: "home-wellness",
    description: "Formulated with the power of Neem and Lemongrass extracts to clean floors naturally, leaving a fresh botanical aroma and maintaining a hygienic home wellness environment.",
    rating: 4.9,
    bestseller: true,
    numericId: 101,
    variants: [
      { weight: "1 Litre", price: 299 }
    ],
    sizeVariants: [
      { label: "1 Litre", price: 299 }
    ]
  },
  {
    id: "lemon-fresh-dishwashing-liquid",
    name: "Lemon Fresh Dishwashing Liquid",
    price: 199,
    weight: "1 Litre",
    image: "/images/pv2.png",
    category: "home-wellness",
    description: "Tough on grease, gentle on hands. Infused with natural lemon extract for a fresh citrus scent and sparkling clean dishes.",
    rating: 4.8,
    bestseller: true,
    numericId: 102,
    variants: [
      { weight: "1 Litre", price: 199 }
    ],
    sizeVariants: [
      { label: "1 Litre", price: 199 }
    ]
  },
  {
    id: "neem-tulsi-hand-wash",
    name: "Neem & Tulsi Hand Wash",
    price: 149,
    weight: "500 ml",
    image: "/images/pv2.png",
    category: "home-wellness",
    description: "A gentle, nature-inspired hand wash enriched with Neem and Tulsi extracts to cleanse, soothe, and refresh your hands everyday.",
    rating: 4.9,
    bestseller: false,
    numericId: 103,
    variants: [
      { weight: "500 ml", price: 149 }
    ],
    sizeVariants: [
      { label: "500 ml", price: 149 }
    ]
  },
  {
    id: "fresh-linen-laundry-liquid",
    name: "Fresh Linen Laundry Liquid",
    price: 349,
    weight: "1 Litre",
    image: "/images/pv2.png",
    category: "home-wellness",
    description: "Gentle on fabrics, tough on dirt. Keeps your clothes feeling fresh and soft, infused with a clean linen scent.",
    rating: 4.7,
    bestseller: false,
    numericId: 104,
    variants: [
      { weight: "1 Litre", price: 349 }
    ],
    sizeVariants: [
      { label: "1 Litre", price: 349 }
    ]
  },
  {
    id: "citrus-fresh-multi-purpose-cleaner",
    name: "Citrus Fresh Multi-Purpose Cleaner",
    price: 179,
    weight: "500 ml",
    image: "/images/pv2.png",
    category: "home-wellness",
    description: "Clean surfaces effortlessly. Safe for countertops, glass, tile, and wood, infused with refreshing citrus essential oils.",
    rating: 4.8,
    bestseller: true,
    numericId: 105,
    variants: [
      { weight: "500 ml", price: 179 }
    ],
    sizeVariants: [
      { label: "500 ml", price: 179 }
    ]
  }
]

export const categories = [
  { id: "home-wellness", name: "Home Wellness", description: "Nature-inspired solutions designed for everyday home care." },
]

export function getProductsByCategory(category: string): Product[] {
  return products.filter((p) => p.category === category)
}

export function getBestsellers(): Product[] {
  return products.filter((p) => p.bestseller)
}
