export interface Review {
  id: string;
  user: string;
  rating: number;
  date: string;
  comment: string;
}

export interface ColorOption {
  name: string;
  hex: string;
  images: string[];
  family?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  salePrice: number | null;
  images: string[];
  colors: ColorOption[];
  sizes: string[];
  category: string;
  description: string;
  materials: string;
  care: string;
  shipping: string;
  rating: number;
  reviews: Review[];
  isNew: boolean;
  isBestSeller: boolean;
  isCustomerFavorite: boolean;
  popularity: number;
  fabric: string;
  availability: boolean;
  collectionRef?: string | null;
}

export const products: Product[] = [
  {
    id: "wool-trench",
    name: "Minimalist Wool-Cashmere Trench Coat",
    price: 890,
    salePrice: 750,
    images: ["/assets/wool_coat_front.png", "/assets/wool_coat_back.png"],
    colors: [
      {
        name: "Obsidian Black",
        hex: "#111111",
        images: ["/assets/wool_coat_front.png", "/assets/wool_coat_back.png"]
      },
      {
        name: "Slate Grey",
        hex: "#5E5E5E",
        images: ["/assets/wool_coat_front.png", "/assets/wool_coat_back.png"]
      }
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    category: "Coats",
    fabric: "Wool-Cashmere",
    availability: true,
    isNew: true,
    isBestSeller: true,
    isCustomerFavorite: false,
    popularity: 98,
    rating: 4.9,
    description: "An elegant, double-breasted trench coat tailored in a premium wool and cashmere blend. Designed with a clean silhouette, dropped shoulders, and a detachable belt for versatile styling. Offers exceptional warmth and a luxurious drape.",
    materials: "90% Virgin Wool, 10% Cashmere. Lining: 100% Viscose.",
    care: "Dry clean only. Iron on low heat. Do not wash or tumble dry.",
    shipping: "Complimentary standard delivery within 3-5 business days. Express shipping available.",
    reviews: [
      {
        id: "r1",
        user: "Eleanor V.",
        rating: 5,
        date: "2026-06-12",
        comment: "Absolutely stunning drape. It feels incredibly soft and has a commanding presence. The tailoring is flawless."
      },
      {
        id: "r2",
        user: "Sophia K.",
        rating: 5,
        date: "2026-06-28",
        comment: "Perfect winter coat. Sleek, warm, and the belt allows you to change the silhouette easily."
      }
    ]
  },
  {
    id: "linen-dress",
    name: "Asymmetrical Organic Linen Dress",
    price: 340,
    salePrice: null,
    images: ["/assets/linen_dress_front.png", "/assets/linen_dress_back.png"],
    colors: [
      {
        name: "Bone White",
        hex: "#FAFAF8",
        images: ["/assets/linen_dress_front.png", "/assets/linen_dress_back.png"]
      },
      {
        name: "Warm Ochre",
        hex: "#8B6F47",
        images: ["/assets/linen_dress_front.png", "/assets/linen_dress_back.png"]
      }
    ],
    sizes: ["XS", "S", "M", "L"],
    category: "Dresses",
    fabric: "Organic Linen",
    availability: true,
    isNew: true,
    isBestSeller: false,
    isCustomerFavorite: true,
    popularity: 89,
    rating: 4.7,
    description: "Crafted from highly breathable organic linen, this dress features a subtle asymmetrical neckline and a beautifully draped wrap skirt. Cut for a relaxed yet refined fit, perfect for warm summer days and editorial styling.",
    materials: "100% Organic Linen.",
    care: "Hand wash cold or dry clean. Hang dry. Iron while slightly damp.",
    shipping: "Complimentary standard delivery within 3-5 business days. Express shipping available.",
    reviews: [
      {
        id: "r3",
        user: "Margot L.",
        rating: 5,
        date: "2026-07-02",
        comment: "The cut is so unique. Linen feels premium and doesn't wrinkle as easily as cheaper blends."
      },
      {
        id: "r4",
        user: "Amara D.",
        rating: 4,
        date: "2026-07-08",
        comment: "Beautiful dress, fits true to size. An absolute staple for summer."
      }
    ]
  },
  {
    id: "cashmere-knit",
    name: "Ribbed Cashmere Mock-Neck Knit",
    price: 420,
    salePrice: null,
    images: ["/assets/cashmere_knit_front.png", "/assets/cashmere_knit_back.png"],
    colors: [
      {
        name: "Oatmeal",
        hex: "#D2B48C",
        images: ["/assets/cashmere_knit_front.png", "/assets/cashmere_knit_back.png"]
      },
      {
        name: "Obsidian Black",
        hex: "#111111",
        images: ["/assets/cashmere_knit_front.png", "/assets/cashmere_knit_back.png"]
      }
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    category: "Knitwear",
    fabric: "100% Cashmere",
    availability: true,
    isNew: false,
    isBestSeller: true,
    isCustomerFavorite: true,
    popularity: 95,
    rating: 5.0,
    description: "An essential mock-neck sweater knitted from exceptionally soft, sustainably sourced cashmere. Feautring a premium heavy-ribbed finish, dropped shoulders, and relaxed cuffs. A timeless piece designed to last.",
    materials: "100% Grade-A Cashmere.",
    care: "Hand wash cold in cashmere wash. Reshape and dry flat. Store folded, never hung.",
    shipping: "Complimentary standard delivery within 3-5 business days. Express shipping available.",
    reviews: [
      {
        id: "r5",
        user: "Claire M.",
        rating: 5,
        date: "2026-05-18",
        comment: "Hands down the softest cashmere sweater I own. The mock neck is the perfect height."
      },
      {
        id: "r6",
        user: "Isabella T.",
        rating: 5,
        date: "2026-06-05",
        comment: "Warm, cozy, yet fits elegantly without looking bulky. Worth every penny."
      }
    ]
  },
  {
    id: "tailored-trousers",
    name: "Wide-Leg Tailored Linen Trousers",
    price: 280,
    salePrice: 220,
    images: ["/assets/tailored_trousers_front.png", "/assets/tailored_trousers_back.png"],
    colors: [
      {
        name: "Light Camel",
        hex: "#C19A6B",
        images: ["/assets/tailored_trousers_front.png", "/assets/tailored_trousers_back.png"]
      },
      {
        name: "Slate Grey",
        hex: "#5E5E5E",
        images: ["/assets/tailored_trousers_front.png", "/assets/tailored_trousers_back.png"]
      }
    ],
    sizes: ["34", "36", "38", "40", "42"],
    category: "Trousers",
    fabric: "Organic Linen",
    availability: true,
    isNew: false,
    isBestSeller: true,
    isCustomerFavorite: false,
    popularity: 92,
    rating: 4.6,
    description: "Sophisticated wide-leg trousers tailored from structured organic linen. Featuring a high-rise waist, single front pleats, and pressed creases. Designed to fall beautifully for an elongated silhouette.",
    materials: "100% Organic Linen. Pocket lining: 100% Cotton.",
    care: "Dry clean recommended. Iron on high heat with steam.",
    shipping: "Complimentary standard delivery within 3-5 business days. Express shipping available.",
    reviews: [
      {
        id: "r7",
        user: "Camille P.",
        rating: 5,
        date: "2026-06-15",
        comment: "The drape of these trousers is unmatched. High waisted and incredibly flattering."
      },
      {
        id: "r8",
        user: "Victoria B.",
        rating: 4,
        date: "2026-07-01",
        comment: "Excellent fabric weight. They run a little long, but perfect with heels."
      }
    ]
  },
  {
    id: "silk-shirt",
    name: "Classic Silk Crepe Shirt",
    price: 310,
    salePrice: null,
    images: ["/assets/linen_dress_front.png", "/assets/linen_dress_back.png"], // Reuse linen dress as placeholder
    colors: [
      {
        name: "Bone White",
        hex: "#FAFAF8",
        images: ["/assets/linen_dress_front.png", "/assets/linen_dress_back.png"]
      },
      {
        name: "Obsidian Black",
        hex: "#111111",
        images: ["/assets/linen_dress_front.png", "/assets/linen_dress_back.png"]
      }
    ],
    sizes: ["XS", "S", "M", "L"],
    category: "Shirts",
    fabric: "100% Silk",
    availability: true,
    isNew: true,
    isBestSeller: false,
    isCustomerFavorite: true,
    popularity: 87,
    rating: 4.8,
    description: "An elegant classic button-down shirt cut from premium sandwashed silk crepe de chine. Featuring a soft collar, single chest pocket, and a beautiful fluid silhouette that catches light elegantly.",
    materials: "100% Mulberry Silk.",
    care: "Hand wash cold with silk detergent or dry clean.",
    shipping: "Complimentary standard delivery within 3-5 business days. Express shipping available.",
    reviews: [
      {
        id: "r9",
        user: "Helena R.",
        rating: 5,
        date: "2026-06-20",
        comment: "Feels like butter on the skin. The sandwashed finish makes it look matte and luxurious."
      }
    ]
  },
  {
    id: "oversized-blazer",
    name: "Structured Wool Blazer",
    price: 590,
    salePrice: null,
    images: ["/assets/wool_coat_front.png", "/assets/wool_coat_back.png"], // Reuse wool trench as placeholder
    colors: [
      {
        name: "Obsidian Black",
        hex: "#111111",
        images: ["/assets/wool_coat_front.png", "/assets/wool_coat_back.png"]
      },
      {
        name: "Slate Grey",
        hex: "#5E5E5E",
        images: ["/assets/wool_coat_front.png", "/assets/wool_coat_back.png"]
      }
    ],
    sizes: ["34", "36", "38", "40", "42"],
    category: "Coats",
    fabric: "Wool-Cashmere",
    availability: true,
    isNew: false,
    isBestSeller: false,
    isCustomerFavorite: true,
    popularity: 84,
    rating: 4.7,
    description: "An oversized double-breasted blazer crafted from structured virgin wool. Features clean padded shoulders, peak lapels, and flap pockets. Fully lined for seamless layering.",
    materials: "100% Virgin Wool. Lining: 100% Cupro.",
    care: "Dry clean only. Medium iron. Do not steam excessively.",
    shipping: "Complimentary standard delivery within 3-5 business days. Express shipping available.",
    reviews: [
      {
        id: "r10",
        user: "Georgia S.",
        rating: 5,
        date: "2026-07-04",
        comment: "Fabulous structural fit. The shoulders are perfectly constructed, giving a sharp but effortless look."
      }
    ]
  }
];
