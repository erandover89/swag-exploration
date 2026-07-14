export const STORE_URL = 'https://store.snappy.com/rabbit-security-demo-test-aaa-mountain-west-group/collections/swag-store-4np';

export type ProductCategory = 'Apparel' | 'Electronics' | 'Home & Decor' | 'Drinkware' | 'Bags' | 'Accessories' | 'Outdoor';
export type ProductType = 'on-demand' | 'bulk';
export type PrintTechnique = 'dtf' | 'dtg' | 'embroidery' | 'sublimation' | 'digital-inkjet' | 'laser-printing' | 'uv-printing' | 'digital-printing';

export const PRINT_TECHNIQUE_CHIPS: Record<PrintTechnique, { label: string; bg: string; text: string }> = {
  'embroidery':       { label: 'Embroidery',     bg: '#f5f3ff', text: '#7c3aed' },
  'dtf':              { label: 'DTF',             bg: '#fff7ed', text: '#ea580c' },
  'dtg':              { label: 'DTG',             bg: '#f0fdf4', text: '#16a34a' },
  'sublimation':      { label: 'Sublimation',     bg: '#fdf4ff', text: '#c026d3' },
  'digital-inkjet':   { label: 'Digital Inkjet',  bg: '#f0f9ff', text: '#0284c7' },
  'laser-printing':   { label: 'Laser Print',     bg: '#f0fdfa', text: '#0d9488' },
  'uv-printing':      { label: 'UV Printing',     bg: '#eef2ff', text: '#4338ca' },
  'digital-printing': { label: 'Digital Print',   bg: '#eff6ff', text: '#2563eb' },
};
export type LogoPlacement = 'left-chest' | 'center' | 'back' | 'sleeve';

export interface ProductColor {
  name: string;
  hex: string;
}

export interface QuantityTier {
  qty: number;       // minimum quantity for this tier
  pricePerUnit: number;
}

/** Where the logo lands on the product image (% of visible card container) */
export interface PrintArea {
  x: number;      // % from left
  y: number;      // % from top
  width: number;  // % of container width
  height: number; // % of container height
  /** 'multiply' = direct blend (light products), 'badge' = white-backed patch (dark/colored) */
  style: 'multiply' | 'badge';
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
  printTechnique: PrintTechnique;
  printArea?: PrintArea; // where the logo appears on the product
  photoType?: 'flat' | 'model'; // 'model' = worn/lifestyle shot (no simulated back view)
  mockupImage?: string;
  hasMoreOptions?: boolean;
  quantityTiers?: QuantityTier[]; // bulk products only
  hasImageQualityIssue?: boolean; // demo flag: logo image has quality/resolution issues
  isPersonalized?: boolean;       // product includes recipient merge-tag decoration (e.g. @first_name)
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
    printTechnique: 'embroidery',
    printArea: { x: 30, y: 34, width: 17, height: 11, style: 'multiply' },
    photoType: 'model',
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
    printTechnique: 'laser-printing',
    printArea: { x: 26, y: 37, width: 48, height: 24, style: 'multiply' },
    hasMoreOptions: true,
    hasImageQualityIssue: true,
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
    printTechnique: 'uv-printing',
    printArea: { x: 38, y: 60, width: 24, height: 11, style: 'badge' },
    photoType: 'flat',
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
    printTechnique: 'dtf',
    printArea: { x: 24, y: 20, width: 26, height: 14, style: 'multiply' },
    hasMoreOptions: true,
    isPersonalized: true,
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
    printTechnique: 'embroidery',
    printArea: { x: 32, y: 30, width: 36, height: 16, style: 'badge' },
    photoType: 'model',
    hasMoreOptions: true,
    quantityTiers: [
      { qty: 24,  pricePerUnit: 65 },
      { qty: 48,  pricePerUnit: 59 },
      { qty: 100, pricePerUnit: 54 },
      { qty: 250, pricePerUnit: 49 },
    ],
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
    printTechnique: 'digital-printing',
    printArea: { x: 34, y: 52, width: 32, height: 17, style: 'multiply' },
    photoType: 'flat',
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
    printTechnique: 'uv-printing',
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
    printTechnique: 'laser-printing',
    printArea: { x: 22, y: 30, width: 56, height: 40, style: 'badge' },
    hasMoreOptions: true,
    isPersonalized: true,
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
    printTechnique: 'sublimation',
    hasMoreOptions: false,
    hasImageQualityIssue: true,
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
    printTechnique: 'uv-printing',
    printArea: { x: 24, y: 11, width: 16, height: 10, style: 'badge' },
    photoType: 'flat',
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
    printTechnique: 'laser-printing',
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
    printTechnique: 'uv-printing',
    printArea: { x: 33, y: 42, width: 34, height: 20, style: 'multiply' },
    photoType: 'flat',
    hasMoreOptions: true,
    isPersonalized: true,
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
    image: '/products/Unisex-Classic-Tee.png',
    printTechnique: 'dtg',
    printArea: { x: 52, y: 33, width: 15, height: 10, style: 'multiply' },
    photoType: 'model',
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
    printTechnique: 'digital-printing',
    printArea: { x: 34, y: 52, width: 32, height: 17, style: 'multiply' },
    photoType: 'flat',
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
    image: "/products/Tentree Men's TreeBlend Polo Shirt .jpg",
    printTechnique: 'embroidery',
    printArea: { x: 56, y: 33, width: 13, height: 9, style: 'badge' },
    photoType: 'model',
    hasMoreOptions: true,
    quantityTiers: [
      { qty: 24,  pricePerUnit: 42 },
      { qty: 48,  pricePerUnit: 38 },
      { qty: 100, pricePerUnit: 35 },
      { qty: 250, pricePerUnit: 31 },
    ],
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
    printTechnique: 'dtf',
    printArea: { x: 30, y: 34, width: 17, height: 11, style: 'multiply' },
    photoType: 'model',
    hasMoreOptions: false,
  },
  {
    id: '27',
    brand: 'Bella + Canvas',
    name: 'Unisex Classic Crewneck Tee',
    price: 22,
    category: 'Apparel',
    type: 'on-demand',
    tags: ['POPULAR', 'SUSTAINABLE'],
    colors: [
      { name: 'White', hex: '#f9fafb' },
      { name: 'Black', hex: '#1a1a1a' },
      { name: 'Navy', hex: '#1e3a5f' },
      { name: 'Heather Gray', hex: '#9ca3af' },
      { name: 'Red', hex: '#dc2626' },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
    description: 'Soft, lightweight jersey tee in a relaxed unisex fit. 100% Airlume combed and ring-spun cotton. The go-to canvas for DTG printing — colors pop, edges stay crisp wash after wash.',
    shippingIncluded: true,
    image: '/products/Unisex-Classic-Tee.png',
    printTechnique: 'dtg',
    printArea: { x: 30, y: 37, width: 24, height: 16, style: 'multiply' },
    photoType: 'model',
    hasMoreOptions: true,
    isPersonalized: true,
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
    printTechnique: 'digital-printing',
    hasMoreOptions: true,
    quantityTiers: [
      { qty: 25,  pricePerUnit: 89 },
      { qty: 50,  pricePerUnit: 82 },
      { qty: 100, pricePerUnit: 76 },
      { qty: 250, pricePerUnit: 69 },
    ],
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
    printTechnique: 'digital-inkjet',
    hasMoreOptions: false,
    quantityTiers: [
      { qty: 50,  pricePerUnit: 29 },
      { qty: 100, pricePerUnit: 26 },
      { qty: 250, pricePerUnit: 23 },
      { qty: 500, pricePerUnit: 20 },
    ],
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
    printTechnique: 'laser-printing',
    hasMoreOptions: true,
    quantityTiers: [
      { qty: 50,  pricePerUnit: 38 },
      { qty: 100, pricePerUnit: 34 },
      { qty: 250, pricePerUnit: 30 },
      { qty: 500, pricePerUnit: 27 },
    ],
  },
  {
    id: '26',
    brand: 'Custom Made',
    name: 'Stainless Steel Pet Bowl',
    price: 22,
    category: 'Accessories',
    type: 'on-demand',
    tags: [],
    colors: [
      { name: 'Red', hex: '#dc2626' },
      { name: 'Blue', hex: '#1d4ed8' },
      { name: 'Black', hex: '#111827' },
      { name: 'Silver', hex: '#9ca3af' },
    ],
    sizes: ['Small (16oz)', 'Large (32oz)'],
    description: 'Durable stainless steel pet bowl with a laser-engraved logo on the side.',
    shippingIncluded: true,
    image: '/products/Stainless Steel Pet Bowl .jpg',
    printTechnique: 'laser-printing',
    printArea: { x: 30, y: 52, width: 32, height: 20, style: 'badge' },
    hasMoreOptions: false,
  },
  {
    id: '25',
    brand: 'TravisMathew',
    name: 'Cuffed Beanie',
    price: 38,
    category: 'Accessories',
    type: 'on-demand',
    tags: ['POPULAR'],
    colors: [
      { name: 'Heather Gray', hex: '#6b7280' },
      { name: 'Black', hex: '#111827' },
      { name: 'Navy', hex: '#1e3a5f' },
      { name: 'Burgundy', hex: '#7f1d1d' },
    ],
    sizes: ['One Size'],
    description: 'Soft cuffed beanie with a custom embroidered logo on the front cuff.',
    shippingIncluded: true,
    image: '/products/TravisMathew Cuffed Beanie .jpg',
    printTechnique: 'embroidery',
    printArea: { x: 30, y: 72, width: 30, height: 14, style: 'badge' },
    hasMoreOptions: true,
  },
  {
    id: '24',
    brand: 'Tentree',
    name: "Men's TreeBlend Polo Shirt",
    price: 68,
    category: 'Apparel',
    type: 'on-demand',
    tags: ['SUSTAINABLE'],
    colors: [
      { name: 'Dark Teal', hex: '#1a4a5c' },
      { name: 'White', hex: '#f9fafb' },
      { name: 'Olive', hex: '#4a5240' },
      { name: 'Stone', hex: '#8c7b6b' },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
    description: 'Eco-friendly polo made with Tentree TreeBlend fabric, embroidered logo on the left chest.',
    shippingIncluded: true,
    image: "/products/Tentree Men's TreeBlend Polo Shirt .jpg",
    printTechnique: 'embroidery',
    printArea: { x: 56, y: 33, width: 13, height: 9, style: 'badge' },
    photoType: 'model',
    hasMoreOptions: true,
  },
  {
    id: '23',
    brand: 'The North Face',
    name: "Women's Everyday Insulated Jacket",
    price: 155,
    category: 'Apparel',
    type: 'on-demand',
    tags: ['POPULAR'],
    colors: [
      { name: 'Black', hex: '#111827' },
      { name: 'Navy', hex: '#1e3a5f' },
      { name: 'Red', hex: '#b91c1c' },
      { name: 'Forest Green', hex: '#166534' },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
    description: 'Lightweight insulated jacket from The North Face with embroidered logo on the left chest.',
    shippingIncluded: true,
    image: "/products/The North Face Women's Everyday Insulated Jacket .jpg",
    printTechnique: 'embroidery',
    printArea: { x: 30, y: 30, width: 14, height: 10, style: 'badge' },
    photoType: 'model',
    hasMoreOptions: true,
  },
  {
    id: '22',
    brand: 'Stanley/Stella',
    name: "Women's Nora Oversized Hoodie",
    price: 72,
    category: 'Apparel',
    type: 'on-demand',
    tags: ['POPULAR', 'SUSTAINABLE'],
    colors: [
      { name: 'White', hex: '#f9fafb' },
      { name: 'Black', hex: '#111827' },
      { name: 'Sand', hex: '#d4c5a9' },
      { name: 'Dusty Pink', hex: '#e8b4b8' },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
    description: 'Organic cotton oversized hoodie from Stanley/Stella with DTG-printed logo on the chest.',
    shippingIncluded: true,
    image: "/products/Stanley:Stella Women's Nora Hoodie.jpg",
    printTechnique: 'dtg',
    printArea: { x: 37, y: 42, width: 26, height: 15, style: 'multiply' },
    photoType: 'model',
    hasMoreOptions: true,
  },
  {
    id: '21',
    brand: 'Vans',
    name: 'Canvas Slip-On Sneakers',
    price: 65,
    category: 'Accessories',
    type: 'on-demand',
    tags: ['POPULAR'],
    colors: [
      { name: 'White', hex: '#f9fafb' },
      { name: 'Black', hex: '#111827' },
      { name: 'Navy', hex: '#1e3a5f' },
    ],
    sizes: ['W6', 'W7', 'W8', 'W9', 'W10', 'M7', 'M8', 'M9', 'M10', 'M11', 'M12'],
    description: 'Classic Vans Canvas Slip-On sneakers with a custom DTF-printed logo on the side.',
    shippingIncluded: true,
    image: '/products/ Canvas Slip-On Sneakers.png',
    printTechnique: 'dtf',
    printArea: { x: 28, y: 42, width: 44, height: 28, style: 'multiply' },
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
    printTechnique: 'sublimation',
    hasMoreOptions: false,
    quantityTiers: [
      { qty: 48,  pricePerUnit: 48 },
      { qty: 100, pricePerUnit: 44 },
      { qty: 250, pricePerUnit: 40 },
      { qty: 500, pricePerUnit: 36 },
    ],
  },
];

export const CATEGORIES: ProductCategory[] = [
  'Apparel', 'Electronics', 'Home & Decor', 'Drinkware', 'Bags', 'Accessories', 'Outdoor'
];

export const BRANDS = [...new Set(PRODUCTS.map(p => p.brand))];

export const FEATURED_BRANDS = ['Patagonia', 'Nike', 'Adidas', 'Under Armour', 'Marine Layer'];

export const COUNTRIES = [
  { code: 'US', name: 'USA',       flag: '🇺🇸' },
  { code: 'GB', name: 'UK',        flag: '🇬🇧' },
  { code: 'DE', name: 'Germany',   flag: '🇩🇪' },
  { code: 'FR', name: 'France',    flag: '🇫🇷' },
  { code: 'CA', name: 'Canada',    flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'IL', name: 'Israel',    flag: '🇮🇱' },
];

// Price multipliers per country — reflects shipping, import duties, and local taxes
export const COUNTRY_PRICE_MULTIPLIERS: Record<string, number> = {
  US: 1.00,
  GB: 1.18,
  DE: 1.22,
  FR: 1.22,
  CA: 1.16,
  AU: 1.30,
  IL: 1.38,
};

// Lookbook = logo-anchored collection of products (= Collection + Logo in the spec).
// Previously called "Design" in this codebase. The design tool creates printfile data
// per product within a lookbook — that's the actual "Design" entity in the spec.
export interface Lookbook {
  id: string;
  name: string;
  logoUrl: string | null;
  productIds: string[];      // ordered list of products in this lookbook
  themeName?: string;        // attribution if created from a theme
  createdAt: string;
  updatedAt: string;
  sharedWith?: string[];
}

// Backward-compat alias — prefer Lookbook for new code
export type Design = Lookbook;

export const LOOKBOOKS: Lookbook[] = [];

// Backward-compat alias
export const DESIGNS = LOOKBOOKS;

export interface DesignedItem {
  id: string;
  productId: string;
  designId: string;              // references Lookbook.id
  colorHex: string;
  colorName: string;
  placement: LogoPlacement;
  printTechnique: PrintTechnique;
  hasPersonalization?: boolean;
  hasGraphic?: boolean;
  createdAt: string;
  sendCount: number;
}

export const MY_DESIGNED_ITEMS: DesignedItem[] = [];

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
    swagProductIds: ['5', '1', '6', '8', '9', '14', '22', '24'],
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
    swagProductIds: ['25', '1', '6', '4', '9', '21', '8', '16'],
    otherGiftIds: ['g8', 'g9', 'g11'],
    budgetTier: 50,
  },
  {
    id: 'c3',
    name: 'Sales Achievement Award',
    tag: 'HIGH IMPACT',
    tagColor: '#7c3aed',
    description: 'Premium swag alongside high-value marketplace picks for your top performers.',
    collectionType: 'mixed',
    swagProductIds: ['1', '23', '2', '13', '22', '6', '25', '19'],
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
    swagProductIds: ['22', '24', '27', '5', '1', '4', '21', '26'],
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
    swagProductIds: ['2', '8', '6', '9', '14', '12', '13', '3'],
    otherGiftIds: [],
    budgetTier: 50,
  },
  {
    id: 'c6',
    name: 'Work Anniversary',
    tag: 'MILESTONE',
    tagColor: '#f59e0b',
    description: 'Honor loyalty and tenure with premium gifts that mark the milestone — from 1 year to 10+.',
    collectionType: 'mixed',
    swagProductIds: ['23', '1', '25', '2', '13', '22', '6', '19'],
    otherGiftIds: ['g3', 'g6', 'g2'],
    budgetTier: 150,
  },
  {
    id: 'c7',
    name: 'Birthday Surprise',
    tag: 'PERSONAL',
    tagColor: '#ec4899',
    description: 'A fun, personalized birthday pick that makes every employee feel seen and celebrated.',
    collectionType: 'mixed',
    swagProductIds: ['21', '9', '6', '4', '25', '8', '5', '16'],
    otherGiftIds: ['g8', 'g4', 'g11'],
    budgetTier: 50,
  },
  {
    id: 'c8',
    name: 'Remote Work Kit',
    tag: 'REMOTE LIFE',
    tagColor: '#6366f1',
    description: 'Equip your distributed team with branded essentials built for the home office.',
    collectionType: 'swag-only',
    swagProductIds: ['12', '8', '14', '16', '6', '9', '13', '2'],
    otherGiftIds: [],
    budgetTier: 85,
  },
  {
    id: 'c9',
    name: 'Employee Appreciation',
    tag: 'TEAM WIDE',
    tagColor: '#0d9488',
    description: "Show your whole team they matter — send something they'll actually love on Appreciation Day.",
    collectionType: 'swag-only',
    swagProductIds: ['4', '9', '25', '6', '1', '8', '21', '22'],
    otherGiftIds: [],
    budgetTier: 60,
  },
  {
    id: 'c10',
    name: 'Promotion Celebration',
    tag: 'LEADERSHIP',
    tagColor: '#0891b2',
    description: 'Mark a career step up with a curated collection that feels as big as the moment.',
    collectionType: 'mixed',
    swagProductIds: ['22', '1', '23', '2', '13', '25', '19', '6'],
    otherGiftIds: ['g3', 'g10', 'g6'],
    budgetTier: 200,
  },
];

// ── My Collections (user-created) ────────────────────────────────────────────
export interface MyCollection {
  id: string;
  name: string;
  type: 'swag-only' | 'mixed';
  productIds: string[];       // swag product IDs for preview
  itemCount: number;
  recipientCount: number;
  lastSentAt: string | null;  // null = never sent
  createdAt: string;
}

export const MY_COLLECTIONS: MyCollection[] = [];

// ── Collection Themes ─────────────────────────────────────────────────────────
export interface CollectionTheme {
  id: string;
  name: string;
  tagline: string;
  emoji: string;
  gradient: string;
  accentColor: string;
  accentLight: string;
  productIds: string[];
  productCount: number; // display count
}

export const COLLECTION_THEMES: CollectionTheme[] = [
  {
    id: 'classic',
    name: 'Classic',
    tagline: 'Timeless branded essentials for any occasion',
    emoji: '⭐',
    gradient: 'linear-gradient(135deg, #1e3a8a 0%, #3077c9 100%)',
    accentColor: '#3077c9',
    accentLight: '#eef5ff',
    // fleece · hoodie · hydro flask · backpack · tee · socks · beanie · sweatshirt · steel bottle · tote
    productIds: ['1', '5', '2', '14', '13', '9', '25', '4', '8', '6'],
    productCount: 50,
  },
  {
    id: 'summer',
    name: 'Summer',
    tagline: 'Bright, warm-weather gear for outdoor adventures',
    emoji: '☀️',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
    accentColor: '#d97706',
    accentLight: '#fffbeb',
    // instax camera · hydro flask · tote · sneakers · tee · phone case · socks · backpack · steel bottle · pet bowl
    productIds: ['10', '2', '6', '21', '13', '12', '9', '14', '8', '26'],
    productCount: 50,
  },
  {
    id: 'onboarding',
    name: 'Onboarding',
    tagline: 'Everything a new hire needs to feel right at home',
    emoji: '🎉',
    gradient: 'linear-gradient(135deg, #059669 0%, #0891b2 100%)',
    accentColor: '#059669',
    accentLight: '#f0fdf4',
    // sweatshirt · backpack · hydro flask · tote · phone case · socks · patagonia fleece · tee · hoodie · steel bottle
    productIds: ['4', '14', '2', '6', '12', '9', '1', '27', '5', '8'],
    productCount: 50,
  },
  {
    id: 'eco',
    name: 'Eco Friendly',
    tagline: 'Sustainable swag that puts your values on display',
    emoji: '🌿',
    gradient: 'linear-gradient(135deg, #365314 0%, #65a30d 100%)',
    accentColor: '#65a30d',
    accentLight: '#f7fee7',
    // tote · klean kanteen · tentree polo · hydro flask · marine layer henley · sweatshirt · adidas backpack · sneakers · socks · bella+canvas tee
    productIds: ['6', '8', '24', '2', '16', '4', '14', '21', '9', '27'],
    productCount: 50,
  },
  {
    id: 'anniversary',
    name: 'Anniversary',
    tagline: 'Premium gifts for celebrating years of loyalty',
    emoji: '🏆',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #f59e0b 100%)',
    accentColor: '#7c3aed',
    accentLight: '#f5f3ff',
    // airpods · apple watch · le creuset · north face jacket · patagonia fleece · stella hoodie · carhartt hoodie · sneakers · beanie · instax camera
    productIds: ['7', '11', '3', '23', '1', '22', '5', '21', '25', '10'],
    productCount: 50,
  },
  {
    id: 'winter',
    name: 'Winter',
    tagline: 'Cozy branded gear to warm up the coldest months',
    emoji: '❄️',
    gradient: 'linear-gradient(135deg, #0369a1 0%, #60a5fa 100%)',
    accentColor: '#0369a1',
    accentLight: '#f0f9ff',
    // carhartt hoodie · north face jacket · patagonia fleece · beanie · stella hoodie · sweatshirt · hydro flask · steel bottle · marine layer henley · le creuset
    productIds: ['5', '23', '1', '25', '22', '4', '2', '8', '16', '3'],
    productCount: 50,
  },
  {
    id: 'birthday',
    name: 'Birthday',
    tagline: 'Make every birthday feel personal and unforgettable',
    emoji: '🎂',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
    accentColor: '#d946ef',
    accentLight: '#fdf4ff',
    // instax camera · phone case · sneakers · airpods · socks · stella hoodie · beanie · tote · sweatshirt · pet bowl
    productIds: ['10', '12', '21', '7', '9', '22', '25', '6', '4', '26'],
    productCount: 50,
  },
];

// ── Shipments ──────────────────────────────────────────────────────────────────

export type ShipmentStatus = 'processing' | 'processed' | 'canceled' | 'in-transit';

export interface ShipmentItem {
  name: string;
  qty: number;
  sku?: string;
}

export interface Shipment {
  id: string;
  description: string;
  requestDate: string; // 'YYYY-MM-DD'
  status: ShipmentStatus;
  recipient: {
    name: string;
    email: string;
    phone?: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  items: ShipmentItem[];
  carrier?: string;
  trackingNumber?: string;
  carrierUrl?: string;
}

export const SHIPMENTS: Shipment[] = [
  {
    id: 'sh-001',
    description: 'New Hire Kit — Sarah Chen',
    requestDate: '2026-03-10',
    status: 'processed',
    recipient: { name: 'Sarah Chen', email: 'sarah.chen@acme.com', phone: '+1 415 555 0192', address: '742 Evergreen Terrace', city: 'San Francisco', state: 'CA', zip: '94103', country: 'US' },
    items: [{ name: 'Branded Hoodie (M)', qty: 1 }, { name: 'Snappy Mug', qty: 1 }, { name: 'Tote Bag', qty: 1 }],
    carrier: 'FedEx',
    trackingNumber: '7489234791234',
    carrierUrl: 'https://www.fedex.com/fedextrack/?trknbr=7489234791234',
  },
  {
    id: 'sh-002',
    description: 'Q1 Milestone Gift — Marcus Rivera',
    requestDate: '2026-03-09',
    status: 'processed',
    recipient: { name: 'Marcus Rivera', email: 'marcus.r@acme.com', address: '1600 Amphitheatre Pkwy', city: 'Mountain View', state: 'CA', zip: '94043', country: 'US' },
    items: [{ name: 'Insulated Water Bottle', qty: 1 }, { name: 'Branded Cap', qty: 1 }],
    carrier: 'UPS',
    trackingNumber: '1Z999AA10123456784',
    carrierUrl: 'https://www.ups.com/track?tracknum=1Z999AA10123456784',
  },
  {
    id: 'sh-003',
    description: 'New Hire Kit — James Okafor',
    requestDate: '2026-03-08',
    status: 'processing',
    recipient: { name: 'James Okafor', email: 'j.okafor@acme.com', phone: '+44 20 7946 0958', address: '10 Downing Street', city: 'London', state: '', zip: 'SW1A 2AA', country: 'GB' },
    items: [{ name: 'Branded Hoodie (L)', qty: 1 }, { name: 'Snappy Mug', qty: 1 }],
  },
  {
    id: 'sh-004',
    description: 'Customer Appreciation Pack — Priya Patel',
    requestDate: '2026-03-07',
    status: 'processing',
    recipient: { name: 'Priya Patel', email: 'priya@techcorp.io', phone: '+1 512 555 0148', address: '500 W 2nd St', city: 'Austin', state: 'TX', zip: '78701', country: 'US' },
    items: [{ name: 'Snappy Notebook', qty: 1 }, { name: 'Pen Set', qty: 1 }, { name: 'Sticker Pack', qty: 1 }],
  },
  {
    id: 'sh-005',
    description: 'New Hire Kit — Lena Schmidt',
    requestDate: '2026-03-05',
    status: 'canceled',
    recipient: { name: 'Lena Schmidt', email: 'lena.s@acme.de', address: 'Unter den Linden 77', city: 'Berlin', state: '', zip: '10117', country: 'DE' },
    items: [{ name: 'Branded Hoodie (S)', qty: 1 }, { name: 'Tote Bag', qty: 1 }],
  },
  {
    id: 'sh-006',
    description: 'Anniversary Gift — Tom Nguyen',
    requestDate: '2026-03-03',
    status: 'processed',
    recipient: { name: 'Tom Nguyen', email: 'tom.nguyen@acme.com', phone: '+1 206 555 0177', address: '2031 6th Ave', city: 'Seattle', state: 'WA', zip: '98121', country: 'US' },
    items: [{ name: 'Premium Jacket (XL)', qty: 1 }, { name: 'Branded Tumbler', qty: 1 }],
    carrier: 'USPS',
    trackingNumber: '9400111899223387624910',
    carrierUrl: 'https://tools.usps.com/go/TrackConfirmAction?tLabels=9400111899223387624910',
  },
  {
    id: 'sh-007',
    description: 'Offsite Swag Pack — Design Team (×12)',
    requestDate: '2026-02-28',
    status: 'processed',
    recipient: { name: 'Emma Torres', email: 'emma.t@acme.com', address: '1 Infinite Loop', city: 'Cupertino', state: 'CA', zip: '95014', country: 'US' },
    items: [{ name: 'Branded T-Shirt (Assorted)', qty: 12 }, { name: 'Snappy Mug', qty: 12 }],
    carrier: 'FedEx',
    trackingNumber: '6129483021847563',
    carrierUrl: 'https://www.fedex.com/fedextrack/?trknbr=6129483021847563',
  },
  {
    id: 'sh-008',
    description: 'New Hire Kit — Yuki Tanaka',
    requestDate: '2026-02-25',
    status: 'canceled',
    recipient: { name: 'Yuki Tanaka', email: 'y.tanaka@acme.jp', address: '2-1-1 Nihonbashi', city: 'Tokyo', state: '', zip: '103-0027', country: 'JP' },
    items: [{ name: 'Branded Hoodie (M)', qty: 1 }, { name: 'Tote Bag', qty: 1 }],
  },
  {
    id: 'sh-009',
    description: 'Replacement Pin — James Sponsler (10YR)',
    requestDate: '2026-04-30',
    status: 'processed',
    recipient: { name: 'James Sponsler', email: 'j.sponsler@acme.com', address: '850 Hansen Way', city: 'Palo Alto', state: 'CA', zip: '94304', country: 'US' },
    items: [{ name: '10 Year Anniversary Pin', qty: 1 }],
    carrier: 'USPS',
    trackingNumber: '9400111899223387000001',
  },
  {
    id: 'sh-010',
    description: 'Replacement Pin — Scott Noe (25YR)',
    requestDate: '2026-04-30',
    status: 'processed',
    recipient: { name: 'Scott Noe', email: 's.noe@acme.com', address: '321 N Clark St', city: 'Chicago', state: 'IL', zip: '60654', country: 'US' },
    items: [{ name: '25 Year Anniversary Pin', qty: 1 }],
    carrier: 'USPS',
    trackingNumber: '9400111899223387000002',
  },
  {
    id: 'sh-011',
    description: 'Replacement Pin — Eldher Demedicis (10YR)',
    requestDate: '2026-04-30',
    status: 'processed',
    recipient: { name: 'Eldher Demedicis', email: 'e.demedicis@acme.com', address: '200 Park Ave', city: 'New York', state: 'NY', zip: '10166', country: 'US' },
    items: [{ name: '10 Year Anniversary Pin', qty: 1 }],
    carrier: 'USPS',
    trackingNumber: '9400111899223387000003',
  },
  {
    id: 'sh-012',
    description: 'Replacement Pin — Lizeth Perez (15YR)',
    requestDate: '2026-04-30',
    status: 'processed',
    recipient: { name: 'Lizeth Perez', email: 'l.perez@acme.com', address: '100 N Main St', city: 'Dallas', state: 'TX', zip: '75201', country: 'US' },
    items: [{ name: '15 Year Anniversary Pin', qty: 1 }],
    carrier: 'USPS',
    trackingNumber: '9400111899223387000004',
  },
  {
    id: 'sh-013',
    description: 'Replacement Pin — Zack Wingen (IAH)',
    requestDate: '2026-04-30',
    status: 'processed',
    recipient: { name: 'Zack Wingen', email: 'z.wingen@acme.com', address: '2800 N Terminal Rd', city: 'Houston', state: 'TX', zip: '77032', country: 'US' },
    items: [{ name: '10 Year Anniversary Pin', qty: 1 }],
    carrier: 'FedEx',
    trackingNumber: '7489234791234001',
  },
  {
    id: 'sh-014',
    description: 'Replacement Pin — Max Lock (5Yr)',
    requestDate: '2026-04-30',
    status: 'processed',
    recipient: { name: 'Max Lock', email: 'm.lock@acme.com', address: '500 Terry Ave N', city: 'Seattle', state: 'WA', zip: '98109', country: 'US' },
    items: [{ name: '5 Year Anniversary Pin', qty: 1 }],
    carrier: 'UPS',
    trackingNumber: '1Z999AA10123456001',
  },
  {
    id: 'sh-015',
    description: 'Replacement Pin — YUL (10yr)',
    requestDate: '2026-04-29',
    status: 'in-transit',
    recipient: { name: 'YUL Airport Team', email: 'yul@acme.com', address: '975 Roméo-Vachon Blvd N', city: 'Dorval', state: 'QC', zip: 'H4Y 1H1', country: 'CA' },
    items: [{ name: '10 Year Anniversary Pin', qty: 1 }],
    carrier: 'Canada Post',
    trackingNumber: '1234567890CA',
  },
  {
    id: 'sh-016',
    description: 'Replacement Pin — Lily Barba (10yr)',
    requestDate: '2026-04-23',
    status: 'in-transit',
    recipient: { name: 'Lily Barba', email: 'l.barba@acme.com', address: '1 World Way', city: 'Los Angeles', state: 'CA', zip: '90045', country: 'US' },
    items: [{ name: '10 Year Anniversary Pin', qty: 1 }],
    carrier: 'FedEx',
    trackingNumber: '7489234791234002',
  },
  {
    id: 'sh-017',
    description: 'Replacement Pin — Gary Koegler (15-Year)',
    requestDate: '2026-04-23',
    status: 'in-transit',
    recipient: { name: 'Gary Koegler', email: 'g.koegler@acme.com', address: '10 S Dearborn St', city: 'Chicago', state: 'IL', zip: '60603', country: 'US' },
    items: [{ name: '15 Year Anniversary Pin', qty: 1 }],
    carrier: 'UPS',
    trackingNumber: '1Z999AA10123456002',
  },
  {
    id: 'sh-018',
    description: 'Q2 2026 — ATL (25Yr Pin)',
    requestDate: '2026-04-16',
    status: 'in-transit',
    recipient: { name: 'ATL Hub Manager', email: 'atl@acme.com', address: '6000 N Terminal Pkwy', city: 'Atlanta', state: 'GA', zip: '30320', country: 'US' },
    items: [{ name: '25 Year Anniversary Pin', qty: 4 }],
    carrier: 'FedEx',
    trackingNumber: '7489234791234003',
  },
];

// ── Inventory ──────────────────────────────────────────────────────────────────

export interface InventorySize {
  size: string;
  qty: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  imageUrl: string;
  sizes: InventorySize[];
}

export const INVENTORY_ITEMS: InventoryItem[] = [
  { id: 'inv-1', name: '30 Year Anniversary Pin',    imageUrl: '/products/ACME_logo.png',          sizes: [{ size: 'One Size', qty: 51 }] },
  { id: 'inv-2', name: '40 Year Anniversary Pin',    imageUrl: '/products/ACME_logo.png',          sizes: [{ size: 'One Size', qty: 0  }] },
  { id: 'inv-3', name: '35 Year Anniversary Pin',    imageUrl: '/products/ACME_logo.png',          sizes: [{ size: 'One Size', qty: 3  }] },
  { id: 'inv-4', name: 'Branded Fleece Pullover',    imageUrl: '/products/PatagoniaFleece.png',    sizes: [{ size: 'S', qty: 0 }, { size: 'M', qty: 14 }, { size: 'L', qty: 9 }, { size: 'XL', qty: 6 }] },
  { id: 'inv-5', name: 'Classic Crew Tee',           imageUrl: '/products/Unisex-Classic-Tee.png', sizes: [{ size: 'S', qty: 22 }, { size: 'M', qty: 38 }, { size: 'L', qty: 31 }, { size: 'XL', qty: 0 }] },
  { id: 'inv-6', name: 'Canvas Tote Bag',            imageUrl: '/products/ToteBag.png',            sizes: [{ size: 'One Size', qty: 74 }] },
  { id: 'inv-7', name: 'Insulated Water Bottle',     imageUrl: '/products/HydroFlaskBottle.png',   sizes: [{ size: 'One Size', qty: 0  }] },
  { id: 'inv-8', name: 'Carhartt Hoodie',            imageUrl: '/products/Hoodie.png',             sizes: [{ size: 'S', qty: 8 }, { size: 'M', qty: 19 }, { size: 'L', qty: 11 }, { size: 'XL', qty: 3 }] },
  { id: 'inv-9', name: 'Steel Insulated Bottle',     imageUrl: '/products/SteelBottle.png',        sizes: [{ size: 'One Size', qty: 29 }] },
];

// ── Swag Stores ────────────────────────────────────────────────────────────────

export interface SwagStore {
  id: string;
  name: string;
  productCount: number;
  status: 'live' | 'draft';
}

export const BUDGET_RANGES = [
  { label: '$14–$25',   min: 14,  max: 25  },
  { label: '$19–$50',   min: 19,  max: 50  },
  { label: '$19–$75',   min: 19,  max: 75  },
  { label: '$19–$100',  min: 19,  max: 100 },
  { label: '$51–$125',  min: 51,  max: 125 },
  { label: '$76–$150',  min: 76,  max: 150 },
  { label: '$76–$175',  min: 76,  max: 175 },
  { label: '$151–$200', min: 151, max: 200 },
  { label: '$200–$250', min: 200, max: 250 },
  { label: '$250–$300', min: 250, max: 300 },
  { label: '$250–$350', min: 250, max: 350 },
];

export const STORES: SwagStore[] = [
  { id: 'store-1', name: 'New Hire Welcome Store',   productCount: 8,  status: 'live'  },
  { id: 'store-2', name: 'Holiday Gift Shop 2025',   productCount: 12, status: 'live'  },
  { id: 'store-3', name: 'Sales Team Essentials',    productCount: 5,  status: 'draft' },
];
