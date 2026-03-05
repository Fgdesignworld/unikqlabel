export interface WeightVariant {
  weight: string
  price: number
}

export interface Product {
  id: string
  name: string
  price: number
  weight: string
  image: string
  category: "snacks" | "pickles" | "spices" | "sweets"
  description?: string
  rating?: number
  bestseller?: boolean
  variants?: WeightVariant[]
}

export const products: Product[] = [
  // Snacks
  {
    id: "palli-pakodi",
    name: "Palli Pakodi",
    price: 180,
    weight: "250g",
    image: "/images/palli-pakodi.jpg",
    category: "snacks",
    description: "Crispy peanut snack made with traditional recipe",
    rating: 4.8,
    bestseller: true,
    variants: [
      { weight: "250g", price: 180 },
      { weight: "500g", price: 340 },
      { weight: "1kg", price: 600 },
    ],
  },
  {
    id: "ribbon-pakodi",
    name: "Ribbon Pakodi",
    price: 150,
    weight: "250g",
    image: "/images/ribbon-pakodi.jpg",
    category: "snacks",
    description: "Wavy crispy snack perfect for tea time",
    rating: 4.7,
    bestseller: true,
    variants: [
      { weight: "250g", price: 150 },
      { weight: "500g", price: 280 },
      { weight: "1kg", price: 500 },
    ],
  },
  {
    id: "chakralu",
    name: "Chakralu",
    price: 150,
    weight: "250g",
    image: "/images/chakralu.jpg",
    category: "snacks",
    description: "Traditional spiral shaped crispy snack",
    rating: 4.6,
    variants: [
      { weight: "250g", price: 150 },
      { weight: "500g", price: 280 },
      { weight: "1kg", price: 500 },
    ],
  },
  {
    id: "sanna-karam-pusa",
    name: "Sanna Karam Pusa",
    price: 180,
    weight: "250g",
    image: "/images/sanna-karam-pusa.jpg",
    category: "snacks",
    description: "Spicy puffed rice mix with authentic flavors",
    rating: 4.5,
    variants: [
      { weight: "250g", price: 180 },
      { weight: "500g", price: 340 },
      { weight: "1kg", price: 600 },
    ],
  },
  {
    id: "spl-kaju-bundhi",
    name: "SPL Kaju Bundhi",
    price: 200,
    weight: "250g",
    image: "/images/kaju-bundhi.jpg",
    category: "snacks",
    description: "Special sweet boondi with premium cashews",
    rating: 4.9,
    bestseller: true,
    variants: [
      { weight: "250g", price: 200 },
      { weight: "500g", price: 380 },
      { weight: "1kg", price: 700 },
    ],
  },
  {
    id: "minapa-chakralu",
    name: "Minapa Chakralu",
    price: 160,
    weight: "250g",
    image: "/images/minapa-chakralu.jpg",
    category: "snacks",
    description: "Urad dal crispy spirals with perfect crunch",
    rating: 4.6,
    variants: [
      { weight: "250g", price: 160 },
      { weight: "500g", price: 300 },
      { weight: "1kg", price: 550 },
    ],
  },
  {
    id: "ragi-bundhi",
    name: "Ragi Bundhi",
    price: 140,
    weight: "250g",
    image: "/images/ragi-bundhi.jpg",
    category: "snacks",
    description: "Healthy finger millet boondi snack",
    rating: 4.4,
    variants: [
      { weight: "250g", price: 140 },
      { weight: "500g", price: 260 },
      { weight: "1kg", price: 450 },
    ],
  },

  // Pickles
  {
    id: "avakaya-pickle",
    name: "Avakaya Mango Pickle",
    price: 200,
    weight: "250g",
    image: "/images/mango-pickle.jpg",
    category: "pickles",
    description: "Famous Andhra raw mango pickle with mustard and chili, the king of pickles",
    rating: 4.9,
    bestseller: true,
    variants: [
      { weight: "250g", price: 200 },
      { weight: "500g", price: 350 },
      { weight: "1kg", price: 650 },
    ],
  },
  {
    id: "gongura-pickle",
    name: "Gongura Pickle",
    price: 180,
    weight: "250g",
    image: "/images/gongura-pickle.jpg",
    category: "pickles",
    description: "Authentic Andhra sorrel leaves pickle with tangy taste",
    rating: 4.8,
    bestseller: true,
    variants: [
      { weight: "250g", price: 180 },
      { weight: "500g", price: 320 },
      { weight: "1kg", price: 580 },
    ],
  },
  {
    id: "kotimera-pickle",
    name: "Kotimera Pickle",
    price: 170,
    weight: "250g",
    image: "/images/kotimera-pickle.jpg",
    category: "pickles",
    description: "Tangy coriander seed pickle with traditional spices",
    rating: 4.7,
    bestseller: true,
    variants: [
      { weight: "250g", price: 170 },
      { weight: "500g", price: 300 },
      { weight: "1kg", price: 550 },
    ],
  },
  {
    id: "lemon-pickle",
    name: "Nimma Kaya Pickle",
    price: 160,
    weight: "250g",
    image: "/images/lemon-pickle.jpg",
    category: "pickles",
    description: "Zesty lemon pickle with aromatic spices and mustard oil",
    rating: 4.7,
    variants: [
      { weight: "250g", price: 160 },
      { weight: "500g", price: 280 },
      { weight: "1kg", price: 500 },
    ],
  },
  {
    id: "tamota-pickle",
    name: "Tamota Pickle",
    price: 160,
    weight: "250g",
    image: "/images/tamota-pickle.jpg",
    category: "pickles",
    description: "Tangy tomato pickle with authentic Andhra taste",
    rating: 4.6,
    variants: [
      { weight: "250g", price: 160 },
      { weight: "500g", price: 280 },
      { weight: "1kg", price: 500 },
    ],
  },
  {
    id: "garlic-pickle",
    name: "Velluli Pachadi",
    price: 170,
    weight: "250g",
    image: "/images/garlic-pickle.jpg",
    category: "pickles",
    description: "Spicy garlic pickle with whole cloves in aromatic oil",
    rating: 4.6,
    variants: [
      { weight: "250g", price: 170 },
      { weight: "500g", price: 300 },
      { weight: "1kg", price: 550 },
    ],
  },
  {
    id: "ginger-pickle",
    name: "Allam Pachadi",
    price: 165,
    weight: "250g",
    image: "/images/ginger-pickle.jpg",
    category: "pickles",
    description: "Tangy ginger pickle with digestive benefits",
    rating: 4.5,
    variants: [
      { weight: "250g", price: 165 },
      { weight: "500g", price: 290 },
      { weight: "1kg", price: 520 },
    ],
  },
  {
    id: "kakaragaya-pickle",
    name: "Kakaragaya Pickle",
    price: 180,
    weight: "250g",
    image: "/images/kakaragaya-pickle.jpg",
    category: "pickles",
    description: "Healthy bitter gourd pickle with medicinal benefits",
    rating: 4.5,
    variants: [
      { weight: "250g", price: 180 },
      { weight: "500g", price: 320 },
      { weight: "1kg", price: 580 },
    ],
  },

  // Spices
  {
    id: "kobbari-karam",
    name: "Kobbari Karam",
    price: 100,
    weight: "100g",
    image: "/images/kobbari-karam.jpg",
    category: "spices",
    description: "Coconut chutney powder for rice and idli",
    rating: 4.8,
    bestseller: true,
    variants: [
      { weight: "100g", price: 100 },
      { weight: "250g", price: 200 },
      { weight: "500g", price: 380 },
    ],
  },
  {
    id: "nalla-karam",
    name: "Nalla Karam",
    price: 90,
    weight: "100g",
    image: "/images/nalla-karam.jpg",
    category: "spices",
    description: "Black sesame spice powder with unique flavor",
    rating: 4.7,
    bestseller: true,
    variants: [
      { weight: "100g", price: 90 },
      { weight: "250g", price: 180 },
      { weight: "500g", price: 340 },
    ],
  },
  {
    id: "karivepaku-karam",
    name: "Karivepaku Karam",
    price: 110,
    weight: "100g",
    image: "/images/karivepaku-karam.jpg",
    category: "spices",
    description: "Curry leaves chutney powder rich in iron",
    rating: 4.6,
    variants: [
      { weight: "100g", price: 110 },
      { weight: "250g", price: 220 },
      { weight: "500g", price: 420 },
    ],
  },
  {
    id: "munagaku-karam",
    name: "Munagaku Karam",
    price: 120,
    weight: "100g",
    image: "/images/munagaku-karam.jpg",
    category: "spices",
    description: "Drumstick leaves powder with nutritional benefits",
    rating: 4.5,
    variants: [
      { weight: "100g", price: 120 },
      { weight: "250g", price: 250 },
      { weight: "500g", price: 480 },
    ],
  },
  {
    id: "velluli-karam",
    name: "Velluli Karam",
    price: 95,
    weight: "100g",
    image: "/images/velluli-karam.jpg",
    category: "spices",
    description: "Garlic chutney powder with bold flavor",
    rating: 4.7,
    variants: [
      { weight: "100g", price: 95 },
      { weight: "250g", price: 190 },
      { weight: "500g", price: 360 },
    ],
  },
  {
    id: "guntur-karam",
    name: "Red Chilly Guntur Karam",
    price: 80,
    weight: "100g",
    image: "/images/guntur-karam.jpg",
    category: "spices",
    description: "Famous Guntur red chilli powder with intense heat",
    rating: 4.8,
    variants: [
      { weight: "100g", price: 80 },
      { weight: "250g", price: 150 },
      { weight: "500g", price: 280 },
    ],
  },
  {
    id: "turmeric-pasupu",
    name: "Turmeric Pasupu",
    price: 70,
    weight: "100g",
    image: "/images/turmeric-pasupu.jpg",
    category: "spices",
    description: "Pure organic turmeric powder with high curcumin",
    rating: 4.9,
    variants: [
      { weight: "100g", price: 70 },
      { weight: "250g", price: 120 },
      { weight: "500g", price: 220 },
    ],
  },

  // Sweets
  {
    id: "laddu",
    name: "Boondi Laddu",
    price: 220,
    weight: "250g",
    image: "/images/gallery-1.jpg",
    category: "sweets",
    description: "Traditional round sweet balls with cardamom flavor",
    rating: 4.8,
    bestseller: true,
    variants: [
      { weight: "250g", price: 220 },
      { weight: "500g", price: 400 },
      { weight: "1kg", price: 750 },
    ],
  },
  {
    id: "sunnunda",
    name: "Sunnunda",
    price: 250,
    weight: "250g",
    image: "/images/sweets.jpg",
    category: "sweets",
    description: "Traditional urad dal sweet with jaggery",
    rating: 4.7,
    variants: [
      { weight: "250g", price: 250 },
      { weight: "500g", price: 450 },
      { weight: "1kg", price: 850 },
    ],
  },
]

export const categories = [
  { id: "snacks", name: "Snacks", description: "Crispy traditional snacks" },
  { id: "pickles", name: "Pickles", description: "Authentic homemade pickles" },
  { id: "spices", name: "Spices", description: "Fresh ground spice powders" },
  { id: "sweets", name: "Sweets", description: "Traditional homemade sweets" },
]

export function getProductsByCategory(category: string): Product[] {
  return products.filter((p) => p.category === category)
}

export function getBestsellers(): Product[] {
  return products.filter((p) => p.bestseller)
}
