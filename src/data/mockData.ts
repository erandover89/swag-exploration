export type ProductCategory = 'Apparel' | 'Electronics' | 'Home & Decor' | 'Drinkware' | 'Bags' | 'Accessories' | 'Outdoor';
export type ProductType = 'on-demand' | 'bulk';
export type PrintStyle = 'embroidery' | 'screen-print' | 'emboss';
export type LogoPlacement = 'left-chest' | 'center' | 'back' | 'sleeve';

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  brand: string;
  name: string;
  price: number;
  category: ProductCategory;
  type: ProductType;
  tags: string[];
  colors: ProductColor[];
  sizes: string[];
  description: string;
  minQuantity?: number;
  leadTimeDays?: number;
  shippingIncluded: boolean;
  image: string; // emoji or placeholder
  mockupImage?: string;
  hasMoreOptions?: boolean;
}

export const MOCK_COMPANY = {
  name: 'Acme Corp',
  logo: 'ACME',
  logoColor: '#E63946',
  plan: 'Snappy Essential',
};

export const PRODUCTS: Product[] = [
  {
    id: '1',
    brand: 'Patagonia',
    name: 'Synchilla Snap-T Fleece Pullover',
    price: 155,
    category: 'Apparel',
    type: 'on-demand',
    tags: ['POPULAR'],
    colors: [
      { name: 'Gray', hex: '#9ca3af' },
      { name: 'Navy', hex: '#1e3a5f' },
      { name: 'Black', hex: '#1a1a1a' },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
    description: 'The original fleece pullover with snap-T neck closure. 100% recycled polyester, Fair Trade Certified sewn. An iconic piece for branding with your company logo.',
    shippingIncluded: true,
    image: '/products/PatagoniaFleece.png',
    hasMoreOptions: true,
  },
  {
    id: '2',
    brand: 'Hydro Flask',
    name: 'Wide Mouth Flex Cap 32oz Water Bottle',
    price: 45,
    category: 'Drinkware',
    type: 'on-demand',
    tags: ['POPULAR'],
    colors: [
      { name: 'Pacific', hex: '#3b82f6' },
      { name: 'Black', hex: '#1a1a1a' },
      { name: 'Stainless', hex: '#c0c0c0' },
      { name: 'Lupine', hex: '#7c3aed' },
    ],
    sizes: ['One Size'],
    description: 'Double-wall vacuum insulation keeps drinks cold 24 hours, hot 12 hours. 18/8 pro-grade stainless steel. Wide mouth for easy cleaning and filling.',
    shippingIncluded: true,
    image: '/products/HydroFlaskBottle.png',
    hasMoreOptions: true,
  },
  {
    id: '3',
    brand: 'Le Creuset',
    name: 'Signature Round Dutch Oven 5.5 Qt',
    price: 345,
    category: 'Home & Decor',
    type: 'on-demand',
    tags: ['PREMIUM'],
    colors: [
      { name: 'Flame', hex: '#e97316' },
      { name: 'Cerise', hex: '#e11d48' },
      { name: 'Marseille', hex: '#1d4ed8' },
    ],
    sizes: ['One Size'],
    description: 'French enameled cast iron Dutch oven. Superior heat distribution and retention. Oven safe to 500°F. Built to last a lifetime — ideal as a premium gift.',
    shippingIncluded: true,
    image: '/products/LeCresseutCasserole.jpg',
    hasMoreOptions: false,
  },
  {
    id: '4',
    brand: 'Gildan',
    name: 'Premium Fleece Crewneck Sweatshirt',
    price: 32,
    category: 'Apparel',
    type: 'on-demand',
    tags: ['SUSTAINABLE'],
    colors: [
      { name: 'White', hex: '#f9fafb' },
      { name: 'Gray', hex: '#9ca3af' },
      { name: 'Navy', hex: '#1e3a5f' },
      { name: 'Black', hex: '#1a1a1a' },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
    description: 'Soft fleece crewneck with a classic unisex fit. 50% cotton/50% polyester blend. Pre-shrunk for consistent sizing. The perfect blank canvas for your brand.',
    shippingIncluded: true,
    image: '/products/WhiteSweatshirt.png',
    hasMoreOptions: true,
  },
  {
    id: '5',
    brand: 'Carhartt',
    name: 'Midweight Hooded Sweatshirt',
    price: 65,
    category: 'Apparel',
    type: 'bulk',
    tags: ['POPULAR'],
    colors: [
      { name: 'Brown', hex: '#78350f' },
      { name: 'Black', hex: '#1a1a1a' },
      { name: 'Gray', hex: '#9ca3af' },
    ],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
    description: 'Rugged and durable hooded sweatshirt built for long-term wear. Fleece-lined hood with drawstring. Known for exceptional longevity and premium branding results.',
    shippingIncluded: false,
    minQuantity: 24,
    leadTimeDays: 14,
    image: '/products/Hoodie.png',
    hasMoreOptions: true,
  },
  {
    id: '6',
    brand: 'Baggu',
    name: 'Standard Canvas Tote Bag',
    price: 28,
    category: 'Bags',
    type: 'on-demand',
    tags: ['SUSTAINABLE'],
    colors: [
      { name: 'Natural', hex: '#d4c5a0' },
      { name: 'Black', hex: '#1a1a1a' },
      { name: 'Slate', hex: '#475569' },
    ],
    sizes: ['One Size'],
    description: '100% cotton canvas tote with extra-long handles for shoulder carry. Holds up to 50 lbs. Machine washable. Huge branding area for maximum logo visibility.',
    shippingIncluded: true,
    image: '/products/ToteBag.png',
    hasMoreOptions: false,
  },
  {
    id: '7',
    brand: 'Apple',
    name: 'AirPods Pro (2nd Gen) with USB-C',
    price: 249,
    category: 'Electronics',
    type: 'on-demand',
    tags: ['PREMIUM'],
    colors: [
      { name: 'White', hex: '#f9fafb' },
    ],
    sizes: ['One Size'],
    description: 'Active Noise Cancellation, Transparency mode, and Personalized Spatial Audio. Up to 30 hours total listening time with the MagSafe Charging Case.',
    shippingIncluded: true,
    image: '/products/AppleAirpods.png',
    hasMoreOptions: false,
  },
  {
    id: '8',
    brand: 'Klean Kanteen',
    name: 'TKWide 20oz Insulated Bottle',
    price: 38,
    category: 'Drinkware',
    type: 'on-demand',
    tags: ['POPULAR', 'SUSTAINABLE'],
    colors: [
      { name: 'Shale Black', hex: '#2d3748' },
      { name: 'Coastal Blue', hex: '#2563eb' },
      { name: 'Chrome', hex: '#c0c0c0' },
    ],
    sizes: ['One Size'],
    description: 'Wide-mouth insulated bottle in climate lock® stainless steel. Keeps cold 20 hours, hot 8 hours. Made with 90% post-consumer recycled stainless steel.',
    shippingIncluded: true,
    image: '/products/SteelBottle.png',
    hasMoreOptions: true,
  },
  {
    id: '9',
    brand: 'Stance',
    name: '3-Pack Cushioned Crew Socks',
    price: 34,
    category: 'Accessories',
    type: 'on-demand',
    tags: ['POPULAR'],
    colors: [
      { name: 'Black', hex: '#1a1a1a' },
      { name: 'Charcoal', hex: '#374151' },
      { name: 'White', hex: '#f9fafb' },
    ],
    sizes: ['S', 'M', 'L'],
    description: 'Premium knit crew socks with comfort footbed and reinforced heel and toe. One of the most gifted swag items — practical, premium, and always appreciated.',
    shippingIncluded: true,
    image: '/products/DarkSocks.png',
    hasMoreOptions: false,
  },
  {
    id: '10',
    brand: 'Fujifilm',
    name: 'Instax Mini 12 Instant Camera',
    price: 89,
    category: 'Electronics',
    type: 'on-demand',
    tags: ['POPULAR'],
    colors: [
      { name: 'Pastel Blue', hex: '#93c5fd' },
      { name: 'Blossom Pink', hex: '#f9a8d4' },
      { name: 'Mint Green', hex: '#86efac' },
    ],
    sizes: ['One Size'],
    description: 'Shoot and print credit-card sized instant photos. Parallax correction for close-up shots, automatic exposure, and built-in selfie mirror. Fun for any occasion.',
    shippingIncluded: true,
    image: '/products/InstaxCamera.png',
    hasMoreOptions: false,
  },
  {
    id: '11',
    brand: 'Apple',
    name: 'Apple Watch Series 9 GPS 41mm',
    price: 399,
    category: 'Electronics',
    type: 'on-demand',
    tags: ['PREMIUM'],
    colors: [
      { name: 'Midnight', hex: '#1a1a1a' },
      { name: 'Starlight', hex: '#f5f0e8' },
      { name: 'Product Red', hex: '#dc2626' },
    ],
    sizes: ['41mm', '45mm'],
    description: 'S9 chip with on-device Siri, double tap gesture, and the brightest Apple Watch display ever. Carbon neutral when purchased with a Sport Loop.',
    shippingIncluded: true,
    image: '/products/AppleWatch.jpg',
    hasMoreOptions: false,
  },
  {
    id: '12',
    brand: 'Casetify',
    name: 'Custom Print Impact Case for iPhone',
    price: 45,
    category: 'Accessories',
    type: 'on-demand',
    tags: ['POPULAR'],
    colors: [
      { name: 'Clear', hex: '#f9fafb' },
      { name: 'Black', hex: '#1a1a1a' },
      { name: 'Blush', hex: '#fbcfe8' },
    ],
    sizes: ['iPhone 15', 'iPhone 15 Pro', 'iPhone 15 Plus', 'iPhone 15 Pro Max', 'iPhone 14', 'iPhone 14 Pro'],
    description: 'Full-color custom print case with military-grade drop protection. UV-resistant ink. Add your company logo, art, or any design — ships in days.',
    shippingIncluded: true,
    image: '/products/PhoneCase.png',
    hasMoreOptions: true,
  },
  {
    id: '13',
    brand: 'Nike',
    name: 'Dri-FIT Legend Short Sleeve Training Top',
    price: 35,
    category: 'Apparel',
    type: 'on-demand',
    tags: ['POPULAR'],
    colors: [
      { name: 'White', hex: '#f9fafb' },
      { name: 'Black', hex: '#1a1a1a' },
      { name: 'University Red', hex: '#cc0000' },
      { name: 'Navy', hex: '#1e3a5f' },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
    description: 'Lightweight, breathable performance fabric with Dri-FIT technology to wick sweat away. Slim fit with set-in sleeves. Perfect canvas for left-chest or full-back branding.',
    shippingIncluded: true,
    image: '/products/WhiteSweatshirt.png',
    hasMoreOptions: true,
  },
  {
    id: '14',
    brand: 'Adidas',
    name: 'Classic 3-Stripes Backpack 25L',
    price: 50,
    category: 'Bags',
    type: 'on-demand',
    tags: ['POPULAR'],
    colors: [
      { name: 'Black', hex: '#1a1a1a' },
      { name: 'Navy', hex: '#1e3a5f' },
      { name: 'Gray', hex: '#9ca3af' },
    ],
    sizes: ['One Size'],
    description: 'Iconic 3-Stripes design crafted from 100% recycled materials. Padded 15" laptop sleeve, front organizer zip pocket, and mesh water bottle pockets. Maximum logo real estate on the front panel.',
    shippingIncluded: true,
    image: '/products/ToteBag.png',
    hasMoreOptions: false,
  },
  {
    id: '15',
    brand: 'Under Armour',
    name: 'Tech 2.0 Performance Polo',
    price: 42,
    category: 'Apparel',
    type: 'bulk',
    tags: ['POPULAR'],
    colors: [
      { name: 'Black', hex: '#1a1a1a' },
      { name: 'Navy', hex: '#1e3a5f' },
      { name: 'Royal Blue', hex: '#1d4ed8' },
      { name: 'Forest Green', hex: '#166534' },
    ],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
    description: 'HeatGear fabric delivers superior moisture transport to keep you cool and dry. Anti-odor technology prevents growth of odor-causing microbes. Professional look, athletic performance. Ideal for team events and corporate gifting.',
    shippingIncluded: false,
    minQuantity: 24,
    leadTimeDays: 14,
    image: '/products/Hoodie.png',
    hasMoreOptions: true,
  },
  {
    id: '16',
    brand: 'Marine Layer',
    name: 'Signature Henley Long Sleeve',
    price: 68,
    category: 'Apparel',
    type: 'on-demand',
    tags: ['POPULAR', 'SUSTAINABLE'],
    colors: [
      { name: 'Vintage Blue', hex: '#5b7fa6' },
      { name: 'Heather Gray', hex: '#9ca3af' },
      { name: 'Vintage White', hex: '#f5f0e8' },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
    description: 'Made from a proprietary micro modal blend sourced from sustainable beechwood trees. Incredibly soft, breathable, and maintains its shape over time. The go-to elevated swag item for tech companies and creative agencies.',
    shippingIncluded: true,
    image: '/products/PatagoniaFleece.png',
    hasMoreOptions: false,
  },
  {
    id: '17',
    brand: 'Snappy Kits',
    name: 'New Hire Welcome Kit',
    price: 89,
    category: 'Accessories',
    type: 'bulk',
    tags: ['POPULAR'],
    colors: [{ name: 'Custom', hex: '#3077c9' }],
    sizes: ['One Size'],
    description: 'A curated welcome kit including a branded notebook, pen set, tote bag, and sticker sheet — all customized with your logo and brand colors. Arrives assembly-ready. Perfect for onboarding and team gifting at scale.',
    shippingIncluded: false,
    minQuantity: 25,
    leadTimeDays: 21,
    image: '📦',
    hasMoreOptions: true,
  },
  {
    id: '18',
    brand: 'Moleskine',
    name: 'Custom Hardcover Notebook — Classic XL',
    price: 29,
    category: 'Accessories',
    type: 'bulk',
    tags: [],
    colors: [
      { name: 'Black', hex: '#1a1a1a' },
      { name: 'Sapphire Blue', hex: '#1d4ed8' },
      { name: 'Scarlet Red', hex: '#dc2626' },
    ],
    sizes: ['A5', 'B5'],
    description: 'Iconic Italian notebook with full custom cover printing plus debossed or foil-stamped branding on the spine. 200 ruled pages, ribbon bookmark, elastic closure. Universally loved premium gift.',
    shippingIncluded: false,
    minQuantity: 50,
    leadTimeDays: 14,
    image: '📓',
    hasMoreOptions: false,
  },
  {
    id: '19',
    brand: 'YETI',
    name: 'Rambler 20oz Tumbler — Laser Engraved',
    price: 38,
    category: 'Drinkware',
    type: 'bulk',
    tags: ['POPULAR'],
    colors: [
      { name: 'Black', hex: '#1a1a1a' },
      { name: 'White', hex: '#f9fafb' },
      { name: 'Navy', hex: '#1e3a5f' },
      { name: 'Rescue Red', hex: '#dc2626' },
    ],
    sizes: ['One Size'],
    description: 'Double-wall vacuum insulation that keeps cold for 24 hours. Dishwasher-safe stainless steel. Laser-engraved branding delivers a premium permanent finish that won\'t fade or peel. A gifting staple people use every single day.',
    shippingIncluded: false,
    minQuantity: 50,
    leadTimeDays: 14,
    image: '🥤',
    hasMoreOptions: true,
  },
  {
    id: '20',
    brand: 'Custom Made',
    name: 'Sherpa Fleece Branded Blanket',
    price: 48,
    category: 'Home & Decor',
    type: 'bulk',
    tags: [],
    colors: [
      { name: 'Gray', hex: '#9ca3af' },
      { name: 'Navy', hex: '#1e3a5f' },
      { name: 'Charcoal', hex: '#374151' },
    ],
    sizes: ['50×60"', '60×80"'],
    description: 'Super-soft sherpa fleece blanket with your logo or artwork embroidered or screen-printed. Available in two sizes. Perfect for remote team gifts, employee appreciation, or conference giveaways — high perceived value at a great price.',
    shippingIncluded: false,
    minQuantity: 48,
    leadTimeDays: 18,
    image: '🛋️',
    hasMoreOptions: false,
  },
];

export const CATEGORIES: ProductCategory[] = [
  'Apparel', 'Electronics', 'Home & Decor', 'Drinkware', 'Bags', 'Accessories', 'Outdoor'
];

export const BRANDS = [...new Set(PRODUCTS.map(p => p.brand))];

export const FEATURED_BRANDS = ['Patagonia', 'Nike', 'Adidas', 'Under Armour', 'Marine Layer'];

export const COUNTRIES = [
  { code: 'US', name: 'USA', flag: '🇺🇸' },
  { code: 'GB', name: 'UK', flag: '🇬🇧' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'IL', name: 'Israel', flag: '🇮🇱' },
];

export interface SwagDesign {
  id: string;
  name: string;
  productId: string;
  colorHex: string;
  colorName: string;
  placement: LogoPlacement;
  printStyle: PrintStyle;
  createdAt: string;
  sendCount: number;
}

export const MY_DESIGNS: SwagDesign[] = [
  { id: 'd1', name: 'Onboarding Kit Jacket',  productId: '1', colorHex: '#9ca3af', colorName: 'Gray',  placement: 'left-chest', printStyle: 'embroidery',   createdAt: 'Jan 15, 2024', sendCount: 12 },
  { id: 'd2', name: 'Summer Camp Hoodie',      productId: '5', colorHex: '#1a1a1a', colorName: 'Black', placement: 'center',     printStyle: 'screen-print', createdAt: 'Mar 2, 2024',  sendCount: 47 },
  { id: 'd3', name: 'Finance Team Tumbler',    productId: '2', colorHex: '#3b82f6', colorName: 'Blue',  placement: 'center',     printStyle: 'emboss',       createdAt: 'Feb 20, 2024', sendCount: 8  },
  { id: 'd4', name: 'Sales Kickoff Crew Socks', productId: '9', colorHex: '#1a1a1a', colorName: 'Black', placement: 'center',     printStyle: 'embroidery',   createdAt: 'Apr 10, 2024', sendCount: 0  },
];

export type BulkOrderStatus = 'in-production' | 'in-warehouse' | 'partially-sent';

export interface BulkOrder {
  id: string;
  name: string;
  productId: string;
  quantity: number;
  status: BulkOrderStatus;
  createdAt: string;
  estimatedDelivery: string;
  totalAmount: number;
}

export const MY_BULK_ORDERS: BulkOrder[] = [
  { id: 'bo1', name: 'Q1 Onboarding Kits',     productId: '17', quantity: 50,  status: 'in-warehouse',    createdAt: 'Jan 5, 2024',  estimatedDelivery: 'Jan 26, 2024', totalAmount: 4450  },
  { id: 'bo2', name: 'Sales Kickoff Hoodies',   productId: '5',  quantity: 48,  status: 'partially-sent',  createdAt: 'Feb 1, 2024',  estimatedDelivery: 'Feb 22, 2024', totalAmount: 3120  },
  { id: 'bo3', name: 'Q4 Holiday Tumblers',     productId: '19', quantity: 100, status: 'in-warehouse',    createdAt: 'Nov 20, 2024', estimatedDelivery: 'Dec 15, 2024', totalAmount: 3800  },
];

export interface MarketplaceGift {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  image: string;
}

export const MARKETPLACE_GIFTS: MarketplaceGift[] = [
  { id: 'g1',  name: 'Echo Flex Smart Speaker',          brand: 'Amazon',   category: 'Electronics',  price: 25,  image: '/products/AmazonEchoFlex.jpg' },
  { id: 'g2',  name: 'AirTag 4-Pack Location Tracker',   brand: 'Apple',    category: 'Electronics',  price: 99,  image: '/products/AppleAirtags.jpg' },
  { id: 'g3',  name: 'Watch SE 2nd Gen GPS 44mm',         brand: 'Apple',    category: 'Electronics',  price: 249, image: '/products/AppleWatchSE.png' },
  { id: 'g4',  name: 'PowerShot V10 Vlog Camera',         brand: 'Canon',    category: 'Electronics',  price: 79,  image: '/products/Camera.png' },
  { id: 'g5',  name: 'No.5 Eau de Parfum 100ml',          brand: 'Chanel',   category: 'Beauty',       price: 152, image: '/products/CocoChanelPerfume.png' },
  { id: 'g6',  name: 'R1280DB Bookshelf Speakers',        brand: 'Edifier',  category: 'Electronics',  price: 100, image: '/products/Edifier_Subwoofer.jpg' },
  { id: 'g7',  name: 'Classic 8-Piece Knife Block Set',   brand: 'Wüsthof',  category: 'Kitchen',      price: 189, image: '/products/KnifeSet.jpg' },
  { id: 'g8',  name: 'LABUBU Halloween Limited Edition',  brand: 'Pop Mart', category: 'Collectibles', price: 49,  image: '/products/LabubuHaloween.png' },
  { id: 'g9',  name: 'Pumpkin Spice Syrup 1L',            brand: 'Monin',    category: 'Food & Drink', price: 18,  image: '/products/LeSiropDeMoninPumpkinSpiceBottle.png' },
  { id: 'g10', name: 'Video Doorbell Pro 2',               brand: 'Ring',     category: 'Smart Home',   price: 170, image: '/products/RingCam.png' },
  { id: 'g11', name: 'Premium 3-Month Gift Subscription', brand: 'Spotify',  category: 'Subscriptions',price: 33,  image: '/products/SpotifySubscription.png' },
];

export interface CollectionExample {
  id: string;
  name: string;
  tag: string;
  tagColor: string;
  description: string;
  collectionType: 'swag-only' | 'mixed';
  swagProductIds: string[];    // multiple for swag-only, one for mixed
  otherGiftIds: string[];      // MarketplaceGift IDs (mixed only)
  budgetTier: number;          // suggested per-recipient budget in $
}

export const COLLECTION_EXAMPLES: CollectionExample[] = [
  {
    id: 'c1',
    name: 'New Employee Welcome',
    tag: 'MOST POPULAR',
    tagColor: '#3077c9',
    description: 'Branded swag alongside products from the marketplace — every new hire picks what excites them most.',
    collectionType: 'mixed',
    swagProductIds: ['1'],
    otherGiftIds: ['g11', 'g2', 'g3'],
    budgetTier: 75,
  },
  {
    id: 'c2',
    name: 'Holiday Team Gift',
    tag: 'SEASONAL',
    tagColor: '#059669',
    description: 'Mix branded swag with products, subscriptions, and fun finds — recipients choose their favorite.',
    collectionType: 'mixed',
    swagProductIds: ['2'],
    otherGiftIds: ['g8', 'g11', 'g9'],
    budgetTier: 50,
  },
  {
    id: 'c3',
    name: 'Sales Achievement Award',
    tag: 'HIGH IMPACT',
    tagColor: '#7c3aed',
    description: 'Premium swag alongside high-value marketplace picks for your top performers.',
    collectionType: 'mixed',
    swagProductIds: ['5'],
    otherGiftIds: ['g3', 'g5', 'g6'],
    budgetTier: 150,
  },
  {
    id: 'c4',
    name: 'Team Apparel Bundle',
    tag: 'SWAG CHOICE',
    tagColor: '#e97316',
    description: 'Let your team pick their favorite branded apparel item — all in your colors.',
    collectionType: 'swag-only',
    swagProductIds: ['1', '4', '5'],
    otherGiftIds: [],
    budgetTier: 65,
  },
  {
    id: 'c5',
    name: 'Everyday Carry Essentials',
    tag: 'SWAG CHOICE',
    tagColor: '#e97316',
    description: 'Branded gear recipients actually use every day — they pick the item that fits their style.',
    collectionType: 'swag-only',
    swagProductIds: ['2', '9', '12'],
    otherGiftIds: [],
    budgetTier: 50,
  },
];
