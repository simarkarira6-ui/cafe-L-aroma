/**
 * L'Aroma Atelier - Data Storage & Initial Catalog
 * Uses LocalStorage for live synchronization between Storefront and Admin Panel (PKR Currency)
 */

const STORAGE_KEYS = {
  PRODUCTS: 'laroma_products_pkr_v2',
  ORDERS: 'laroma_orders_pkr_v2',
  RESERVATIONS: 'laroma_reservations_pkr_v2',
  SETTINGS: 'laroma_settings_pkr_v2',
  CART: 'laroma_cart_pkr_v2'
};

const DEFAULT_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Smoked Vanilla Cortado',
    category: 'hot-coffee',
    price: 850,
    oldPrice: 950,
    rating: 4.9,
    reviewsCount: 142,
    badge: 'Signature',
    tagline: 'Double ristretto with house Madagascar vanilla & velvety micro-foam',
    description: 'Our house jewel. Crafted from double-pulled single origin espresso cut with an equal part of steamed silky whole oat milk, kissed with flame-torched Madagascar vanilla pod reduction. Smooth, intensely aromatic, and balanced with natural sweetness.',
    tastingNotes: ['Madagascar Vanilla', 'Toasted Hazelnut', 'Golden Honey', 'Silky Crema'],
    roastLevel: 'Medium-Dark Velvet',
    origin: 'Antioquia, Colombia',
    image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=900&q=85',
    zoomImage: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=1800&q=95',
    inStock: true,
    featured: true
  },
  {
    id: 'prod-2',
    name: 'Ethiopian Floral V60 Pour-Over',
    category: 'specialty-brew',
    price: 950,
    oldPrice: null,
    rating: 5.0,
    reviewsCount: 98,
    badge: 'Barista Choice',
    tagline: 'Hand-dripped slow extraction highlighting jasmine & bergamot sweetness',
    description: 'Slow-dripped with Japanese Kalita glass filters at 93°C. Yields an ethereal, tea-like lightness with distinct jasmine floral top notes, lively Meyer lemon brightness, and a candied peach finish.',
    tastingNotes: ['Jasmine Blossom', 'Bergamot Tea', 'Candied Peach', 'Citrus Blossom'],
    roastLevel: 'Light Golden Roast',
    origin: 'Yirgacheffe G1, Ethiopia',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=900&q=85',
    zoomImage: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1800&q=95',
    inStock: true,
    featured: true
  },
  {
    id: 'prod-3',
    name: 'Salted Amber Cloud Cold Brew',
    category: 'cold-coffee',
    price: 1050,
    oldPrice: 1150,
    rating: 4.8,
    reviewsCount: 215,
    badge: 'Bestseller',
    tagline: '20-hour steeped slow brew topped with Maldon sea salt brown sugar cold cream',
    description: 'Steeped for 20 hours in cold filtered spring water. Poured over hand-carved crystal ice and crowned with a dense layer of whipped sea-salt cream and burnt caramel drizzle. Incredible contrast of cold, sweet, and bold roast.',
    tastingNotes: ['Dark Cocoa', 'Maldon Sea Salt', 'Burnt Amber Toffee', 'Heavy Cream'],
    roastLevel: 'Dark French Roast',
    origin: 'Sumatra Mandheling',
    image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=900&q=85',
    zoomImage: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=1800&q=95',
    inStock: true,
    featured: true
  },
  {
    id: 'prod-4',
    name: 'Gold Velvet Espresso Doppio',
    category: 'hot-coffee',
    price: 650,
    oldPrice: null,
    rating: 4.9,
    reviewsCount: 88,
    badge: 'Pure Roast',
    tagline: 'Thick, hazelnut crema with dark stonefruit and melted ganache profile',
    description: 'Extracted under 9 bars on our custom lever machine. Yields 36 grams of pure liquid velvet with dense amber crema that clings to the porcelain cup. A masterclass in espresso calibration.',
    tastingNotes: ['Melted Ganache', 'Dried Black Cherry', 'Toasted Walnut', 'Molasses'],
    roastLevel: 'Signature Medium Roast',
    origin: 'Guatemala Huehuetenango',
    image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=900&q=85',
    zoomImage: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=1800&q=95',
    inStock: true,
    featured: false
  },
  {
    id: 'prod-5',
    name: 'Pistachio Matcha Cloud Latte',
    category: 'specialty-brew',
    price: 1150,
    oldPrice: 1250,
    rating: 4.9,
    reviewsCount: 167,
    badge: 'Seasonal',
    tagline: 'Ceremonial Uji matcha paired with roasted pistachio milk and white velvet foam',
    description: 'First-harvest ceremonial grade Uji matcha whisked tableside into house-roasted pistachio milk. Topped with micro-foamed sweet milk and ground Sicilian pistachio dust.',
    tastingNotes: ['Uji Matcha Umami', 'Roasted Pistachio', 'Creamy Sweet Grass', 'White Cocoa'],
    roastLevel: 'Shade Grown Ceremonial',
    origin: 'Kyoto, Japan',
    image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=900&q=85',
    zoomImage: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=1800&q=95',
    inStock: true,
    featured: true
  },
  {
    id: 'prod-6',
    name: 'Hazelnut Praline Frappe Cremosa',
    category: 'cold-coffee',
    price: 1100,
    oldPrice: 1200,
    rating: 4.7,
    reviewsCount: 134,
    badge: 'Decadent',
    tagline: 'Blended cold espresso with roasted Piedmont hazelnut paste & whipped chantilly',
    description: 'Silky blended frappe crafted with chilled ristretto shots, organic milk, real Italian gianduja paste, crushed caramelized hazelnut brittle, and generous fresh chantilly cream.',
    tastingNotes: ['Piedmont Praline', 'Creamy Milk Chocolate', 'Roasted Nut Butter', 'Sweet Vanilla'],
    roastLevel: 'Medium Roast Blend',
    origin: 'Blend of Brazil & Colombia',
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=900&q=85',
    zoomImage: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=1800&q=95',
    inStock: true,
    featured: false
  },
  {
    id: 'prod-7',
    name: 'Artisan Normandy Butter Croissant',
    category: 'bakery',
    price: 750,
    oldPrice: null,
    rating: 4.9,
    reviewsCount: 310,
    badge: 'Freshly Baked',
    tagline: '72-layer laminated pastry made with cultured French AOP butter',
    description: 'Laminated by hand over 3 days using French Normandy AOP butter. Baked fresh three times daily. Features a golden honey honeycomb crumb that shatters upon first touch, leaving a heavenly buttery aroma.',
    tastingNotes: ['Cultured Butter', 'Toasted Wheat', 'Caramelized Honey Crust'],
    roastLevel: 'Freshly Baked at 7:00 AM',
    origin: 'Normandy Butter AOP',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=900&q=85',
    zoomImage: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1800&q=95',
    inStock: true,
    featured: true
  },
  {
    id: 'prod-8',
    name: 'Cardamom Cinnamon Brioche Knot',
    category: 'bakery',
    price: 800,
    oldPrice: null,
    rating: 4.8,
    reviewsCount: 182,
    badge: 'Cozy Morning',
    tagline: 'Swedish style kanelbulle twisted with freshly crushed green cardamom & pearl sugar',
    description: 'Rich brioche dough folded with freshly ground green cardamom pods, cinnamon butter, and topped with Swedish pearl sugar crystals. Served slightly warm from the bakery hearth.',
    tastingNotes: ['Crushed Cardamom', 'Ceylon Cinnamon', 'Buttery Brioche', 'Crunchy Sugar'],
    roastLevel: 'Hearth Baked Daily',
    origin: 'Artisan Sourdough Yeast',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=85',
    zoomImage: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1800&q=95',
    inStock: true,
    featured: false
  },
  {
    id: 'prod-9',
    name: 'Wild Highlands Whole Bean (250g)',
    category: 'coffee-beans',
    price: 2850,
    oldPrice: 3200,
    rating: 5.0,
    reviewsCount: 76,
    badge: 'Limited Batch',
    tagline: 'Direct-trade anaerobic natural processed beans with blackberry wine finish',
    description: 'Sourced directly from our partner family farm at 1,950m elevation. Anaerobically fermented in cherry for 72 hours before slow drying on raised African beds. Bursting with dark berries and cacao nib complexity.',
    tastingNotes: ['Blackberry Wine', 'Dark Cacao Nibs', 'Plum Preserves', 'Star Anise'],
    roastLevel: 'Omni Light Roast (Filter & Espresso)',
    origin: 'Tarrazú, Costa Rica',
    image: 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=900&q=85',
    zoomImage: 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=1800&q=95',
    inStock: true,
    featured: true
  }
];

const DEFAULT_ORDERS = [
  {
    id: 'ORD-8941',
    customerName: 'Clara Beaumont',
    customerEmail: 'clara.b@lifestyle.com',
    customerPhone: '+92 300 2345678',
    items: [
      { id: 'prod-1', name: 'Smoked Vanilla Cortado', price: 850, quantity: 2 },
      { id: 'prod-7', name: 'Artisan Normandy Butter Croissant', price: 750, quantity: 1 }
    ],
    total: 2450,
    status: 'Brewing',
    orderType: 'Table Dine-in (Nook #4)',
    time: '12 mins ago',
    date: '2026-10-18 10:15 AM'
  },
  {
    id: 'ORD-8940',
    customerName: 'Julian Vance',
    customerEmail: 'julian@vancearch.com',
    customerPhone: '+92 321 8765432',
    items: [
      { id: 'prod-3', name: 'Salted Amber Cloud Cold Brew', price: 1050, quantity: 1 },
      { id: 'prod-9', name: 'Wild Highlands Whole Bean (250g)', price: 2850, quantity: 1 }
    ],
    total: 3900,
    status: 'Completed',
    orderType: 'Express Takeaway',
    time: '45 mins ago',
    date: '2026-10-18 09:42 AM'
  },
  {
    id: 'ORD-8939',
    customerName: 'Elena Rostova',
    customerEmail: 'elena.rostova@design.co',
    customerPhone: '+92 333 4567890',
    items: [
      { id: 'prod-5', name: 'Pistachio Matcha Cloud Latte', price: 1150, quantity: 2 },
      { id: 'prod-8', name: 'Cardamom Cinnamon Brioche Knot', price: 800, quantity: 2 }
    ],
    total: 3900,
    status: 'Pending',
    orderType: 'Counter Pickup',
    time: 'Just now',
    date: '2026-10-18 10:28 AM'
  }
];

const DEFAULT_RESERVATIONS = [
  {
    id: 'RES-302',
    name: 'Soren & Camille Kjaer',
    email: 'soren.k@nordic.dk',
    phone: '+92 300 1122334',
    date: '2026-10-18',
    time: '14:30',
    guests: 2,
    zone: 'Fireplace Velvet Lounge',
    notes: 'Anniversary coffee tasting & reading session',
    status: 'Confirmed'
  },
  {
    id: 'RES-301',
    name: 'Marcus Sterling',
    email: 'marcus@sterlingmedia.org',
    phone: '+92 322 9988776',
    date: '2026-10-18',
    time: '16:00',
    guests: 4,
    zone: 'Sunlit Window Bay',
    notes: 'Creative design meeting, requested quiet corner',
    status: 'Confirmed'
  },
  {
    id: 'RES-300',
    name: 'Amara Patel',
    email: 'amara.patel@botany.edu',
    phone: '+92 345 5566778',
    date: '2026-10-19',
    time: '10:00',
    guests: 1,
    zone: 'Library Bookshelf Nook',
    notes: 'Working remote with laptop, outlet needed',
    status: 'Confirmed'
  }
];

const DEFAULT_SETTINGS = {
  cafeName: "L'Aroma Atelier & Roastery",
  tagline: "Handcrafted Roasts, Slow Living & Warm Conversations",
  currency: "PKR",
  announcement: "Autumn Special: Try our Smoked Vanilla Cortado paired with fresh hearth pastries ✨",
  announcementActive: true,
  openingHours: "Mon - Fri: 7:00 AM – 8:00 PM | Sat - Sun: 8:00 AM – 9:00 PM",
  address: "428 Amberwood Lane, Old Town Arts District",
  phone: "+92 (21) 3587-9200",
  adminPin: "1234"
};

// Database Access Layer
const CafeDB = {
  formatPrice(amount) {
    const num = Math.round(parseFloat(amount) || 0);
    return `PKR ${num.toLocaleString('en-PK')}`;
  },

  getProducts() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (!data) {
        this.saveProducts(DEFAULT_PRODUCTS);
        return DEFAULT_PRODUCTS;
      }
      const parsed = JSON.parse(data);
      // Auto-migrate legacy dollar amounts (< 50) to PKR
      if (Array.isArray(parsed) && parsed.some(p => p.price < 50)) {
        this.saveProducts(DEFAULT_PRODUCTS);
        return DEFAULT_PRODUCTS;
      }
      return parsed;
    } catch (e) {
      console.error('Error reading products', e);
      return DEFAULT_PRODUCTS;
    }
  },

  saveProducts(products) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    window.dispatchEvent(new CustomEvent('laroma_products_updated', { detail: products }));
  },

  getProductById(id) {
    const list = this.getProducts();
    return list.find(p => p.id === id);
  },

  addProduct(productData) {
    const list = this.getProducts();
    const newProduct = {
      ...productData,
      id: 'prod-' + Date.now(),
      rating: 5.0,
      reviewsCount: 1
    };
    list.unshift(newProduct);
    this.saveProducts(list);
    return newProduct;
  },

  updateProduct(id, updatedFields) {
    const list = this.getProducts();
    const index = list.findIndex(p => p.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updatedFields };
      this.saveProducts(list);
      return list[index];
    }
    return null;
  },

  deleteProduct(id) {
    const list = this.getProducts().filter(p => p.id !== id);
    this.saveProducts(list);
    return true;
  },

  // Orders
  getOrders() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (!data) {
        this.saveOrders(DEFAULT_ORDERS);
        return DEFAULT_ORDERS;
      }
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.some(o => o.total < 100)) {
        this.saveOrders(DEFAULT_ORDERS);
        return DEFAULT_ORDERS;
      }
      return parsed;
    } catch (e) {
      return DEFAULT_ORDERS;
    }
  },

  saveOrders(orders) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    window.dispatchEvent(new CustomEvent('laroma_orders_updated', { detail: orders }));
  },

  addOrder(order) {
    const orders = this.getOrders();
    const newOrder = {
      ...order,
      id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
      time: 'Just now',
      date: new Date().toLocaleString(),
      status: 'Brewing'
    };
    orders.unshift(newOrder);
    this.saveOrders(orders);
    return newOrder;
  },

  updateOrderStatus(orderId, newStatus) {
    const orders = this.getOrders();
    const target = orders.find(o => o.id === orderId);
    if (target) {
      target.status = newStatus;
      this.saveOrders(orders);
      return target;
    }
    return null;
  },

  // Reservations
  getReservations() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RESERVATIONS);
      if (!data) {
        this.saveReservations(DEFAULT_RESERVATIONS);
        return DEFAULT_RESERVATIONS;
      }
      return JSON.parse(data);
    } catch (e) {
      return DEFAULT_RESERVATIONS;
    }
  },

  saveReservations(reservations) {
    localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(reservations));
    window.dispatchEvent(new CustomEvent('laroma_reservations_updated', { detail: reservations }));
  },

  addReservation(resData) {
    const list = this.getReservations();
    const newRes = {
      ...resData,
      id: 'RES-' + Math.floor(100 + Math.random() * 900),
      status: 'Confirmed'
    };
    list.unshift(newRes);
    this.saveReservations(list);
    return newRes;
  },

  updateReservationStatus(resId, status) {
    const list = this.getReservations();
    const target = list.find(r => r.id === resId);
    if (target) {
      target.status = status;
      this.saveReservations(list);
      return target;
    }
    return null;
  },

  // Settings
  getSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) {
        this.saveSettings(DEFAULT_SETTINGS);
        return DEFAULT_SETTINGS;
      }
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent('laroma_settings_updated', { detail: settings }));
  },

  // Reset to sample initial state
  resetAll() {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(DEFAULT_ORDERS));
    localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(DEFAULT_RESERVATIONS));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    location.reload();
  }
};

window.CafeDB = CafeDB;
