/**
 * L'Aroma Atelier - Main Storefront Application
 * Product Zoom Engine, Cart Operations, Ambient Audio & Dynamic Catalog
 */

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  const AppState = {
    currentCategory: 'all',
    searchQuery: '',
    cart: JSON.parse(localStorage.getItem(STORAGE_KEYS.CART) || '[]'),
    activeZoomProduct: null,
    zoomFactor: 2.5,
    ambientAudioPlaying: false,
    audioCtx: null,
    audioGainNode: null
  };

  // DOM Elements
  const productsContainer = document.getElementById('productsContainer');
  const categoryTabs = document.querySelectorAll('.tab-btn');
  const searchInput = document.getElementById('menuSearchInput');
  const cartToggleBtn = document.getElementById('cartToggleBtn');
  const cartDrawerOverlay = document.getElementById('cartDrawerOverlay');
  const cartDrawer = document.getElementById('cartDrawer');
  const closeCartBtn = document.getElementById('closeCartBtn');
  const cartItemsContainer = document.getElementById('cartItemsList');
  const cartSubtotalEl = document.getElementById('cartSubtotal');
  const cartTaxEl = document.getElementById('cartTax');
  const cartTotalEl = document.getElementById('cartTotal');
  const cartBadge = document.getElementById('cartBadge');
  const ambientAudioBtn = document.getElementById('ambientAudioBtn');
  
  // Zoom Modal Elements
  const zoomModalOverlay = document.getElementById('zoomModalOverlay');
  const closeZoomModalBtn = document.getElementById('closeZoomModalBtn');
  const zoomFrame = document.getElementById('zoomFrame');
  const zoomMainImg = document.getElementById('zoomMainImg');
  const zoomLens = document.getElementById('zoomLens');
  const zoomLevelBtns = document.querySelectorAll('.zoom-level-btn');
  
  // Checkout Modal Elements
  const checkoutModalOverlay = document.getElementById('checkoutModalOverlay');
  const closeCheckoutBtn = document.getElementById('closeCheckoutBtn');
  const openCheckoutBtn = document.getElementById('openCheckoutBtn');
  const checkoutForm = document.getElementById('checkoutForm');
  const reservationForm = document.getElementById('reservationForm');
  const announcementText = document.getElementById('announcementText');

  /* ==========================================================
     INITIALIZATION & SETTINGS SYNC
     ========================================================== */
  function init() {
    loadSettings();
    renderProducts();
    updateCartUI();
    setupEventListeners();
    setupAmbientSound();

    // Listen for cross-tab or admin updates
    window.addEventListener('laroma_products_updated', () => {
      renderProducts();
    });
    window.addEventListener('laroma_settings_updated', () => {
      loadSettings();
    });
  }

  function loadSettings() {
    const settings = CafeDB.getSettings();
    if (announcementText && settings.announcement) {
      announcementText.innerHTML = `<span class="sparkle">✦</span> ${settings.announcement}`;
      const banner = document.getElementById('announcementBanner');
      if (banner) {
        banner.style.display = settings.announcementActive ? 'flex' : 'none';
      }
    }
    const hoursEl = document.getElementById('footerOpeningHours');
    if (hoursEl && settings.openingHours) {
      hoursEl.innerText = settings.openingHours;
    }
    const addressEl = document.getElementById('footerAddress');
    if (addressEl && settings.address) {
      addressEl.innerText = settings.address;
    }
  }

  /* ==========================================================
     CATALOG RENDERING & FILTERING
     ========================================================== */
  function renderProducts() {
    if (!productsContainer) return;
    const allProducts = CafeDB.getProducts();

    // Filter by Category and Search
    const filtered = allProducts.filter(item => {
      const matchesCategory = (AppState.currentCategory === 'all') || (item.category === AppState.currentCategory);
      const matchesSearch = !AppState.searchQuery || 
        item.name.toLowerCase().includes(AppState.searchQuery.toLowerCase()) ||
        item.tagline.toLowerCase().includes(AppState.searchQuery.toLowerCase()) ||
        (item.tastingNotes && item.tastingNotes.some(note => note.toLowerCase().includes(AppState.searchQuery.toLowerCase())));
      return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
      productsContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
          <i class="fas fa-coffee" style="font-size: 2.5rem; color: var(--color-caramel-light); margin-bottom: 14px;"></i>
          <h3 style="font-family: var(--font-serif); font-size: 1.6rem; color: var(--color-espresso); margin-bottom: 8px;">No Artisan Roasts Found</h3>
          <p>Try selecting a different filter or adjusting your search phrase.</p>
        </div>
      `;
      return;
    }

    productsContainer.innerHTML = filtered.map(product => {
      const tastingChipsHtml = (product.tastingNotes || []).slice(0, 3).map(note => `
        <span class="tasting-chip">${note}</span>
      `).join('');

      return `
        <article class="product-card" data-id="${product.id}">
          <div class="product-image-container" onclick="window.L_Aroma.openZoomModal('${product.id}')">
            <span class="product-badge">${product.badge || 'Crafted'}</span>
            <button class="zoom-hint-btn" title="Inspect Crema & Roast Texture" aria-label="Zoom in">
              <i class="fas fa-search-plus"></i> Zoom Details
            </button>
            <img class="product-img" src="${product.image}" alt="${product.name}" loading="lazy">
          </div>

          <div class="product-content">
            <div class="product-meta">
              <span class="product-origin">${product.origin || 'Artisan Craft'}</span>
              <div class="product-rating">
                <i class="fas fa-star"></i>
                <span>${product.rating || '5.0'}</span>
                <span style="color: var(--text-muted); font-size: 0.75rem;">(${product.reviewsCount || 48})</span>
              </div>
            </div>

            <h3 class="product-title" onclick="window.L_Aroma.openZoomModal('${product.id}')">${product.name}</h3>
            <p class="product-tagline">${product.tagline || product.description || ''}</p>

            <div class="tasting-chips">
              ${tastingChipsHtml}
            </div>

            <div class="product-footer">
              <div class="price-wrap">
                <span class="current-price">$${parseFloat(product.price).toFixed(2)}</span>
                ${product.oldPrice ? `<span class="old-price">$${parseFloat(product.oldPrice).toFixed(2)}</span>` : ''}
              </div>

              <div class="card-actions">
                <button class="btn-inspect" onclick="window.L_Aroma.openZoomModal('${product.id}')" title="Zoom & Tasting Notes" aria-label="Zoom in on ${product.name}">
                  <i class="fas fa-eye"></i>
                </button>
                <button class="btn-add-cart" onclick="window.L_Aroma.addToCart('${product.id}')" aria-label="Add ${product.name} to order">
                  <i class="fas fa-shopping-bag"></i> Add
                </button>
              </div>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  /* ==========================================================
     INTERACTIVE PRODUCT ZOOM ENGINE
     ========================================================== */
  function openZoomModal(productId) {
    const product = CafeDB.getProductById(productId);
    if (!product) return;

    AppState.activeZoomProduct = product;

    // Populate Details
    document.getElementById('modalProductTitle').innerText = product.name;
    document.getElementById('modalCategoryTag').innerText = product.category.replace('-', ' ');
    document.getElementById('modalOriginPill').innerText = product.origin || 'Single Origin Craft';
    document.getElementById('modalProductPrice').innerText = '$' + parseFloat(product.price).toFixed(2);
    document.getElementById('modalProductRating').innerText = `${product.rating || '4.9'} (${product.reviewsCount || 84} reviews)`;
    document.getElementById('modalProductDesc').innerText = product.description || product.tagline;
    document.getElementById('modalRoastLevelText').innerText = product.roastLevel || 'Medium Dark Roast';

    // Populate Tasting chips
    const notesContainer = document.getElementById('modalTastingChips');
    if (notesContainer) {
      notesContainer.innerHTML = (product.tastingNotes || []).map(n => `<span class="tasting-chip" style="font-size: 0.8rem; padding: 4px 12px;">${n}</span>`).join('');
    }

    // Set Main Image
    zoomMainImg.src = product.image;
    zoomMainImg.alt = product.name;

    // Reset stepper
    document.getElementById('modalStepperVal').innerText = '1';

    // Set background image of magnifying lens
    const highResUrl = product.zoomImage || product.image;
    zoomLens.style.backgroundImage = `url('${highResUrl}')`;

    // Show modal
    zoomModalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Ensure image dimensions are loaded for accurate lens calculation
    zoomMainImg.onload = () => {
      initMagnifier();
    };
    initMagnifier();
  }

  function closeZoomModal() {
    zoomModalOverlay.classList.remove('active');
    document.body.style.overflow = '';
    zoomLens.style.display = 'none';
    AppState.activeZoomProduct = null;
  }

  function initMagnifier() {
    if (!zoomFrame || !zoomMainImg || !zoomLens) return;

    const zoomFactor = AppState.zoomFactor;
    const lensWidth = zoomLens.offsetWidth || 140;
    const lensHeight = zoomLens.offsetHeight || 140;

    function moveLens(e) {
      const rect = zoomFrame.getBoundingClientRect();
      let clientX, clientY;

      if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      let x = clientX - rect.left;
      let y = clientY - rect.top;

      // Restrict within image bounds
      x = Math.max(0, Math.min(x, rect.width));
      y = Math.max(0, Math.min(y, rect.height));

      // Lens position centered on cursor
      let lensX = x - (lensWidth / 2);
      let lensY = y - (lensHeight / 2);

      // Keep lens inside the container
      lensX = Math.max(0, Math.min(lensX, rect.width - lensWidth));
      lensY = Math.max(0, Math.min(lensY, rect.height - lensHeight));

      zoomLens.style.left = `${lensX}px`;
      zoomLens.style.top = `${lensY}px`;

      // High res background sizing and offset
      const bgWidth = rect.width * AppState.zoomFactor;
      const bgHeight = rect.height * AppState.zoomFactor;

      zoomLens.style.backgroundSize = `${bgWidth}px ${bgHeight}px`;

      const bgX = (x * AppState.zoomFactor) - (lensWidth / 2);
      const bgY = (y * AppState.zoomFactor) - (lensHeight / 2);

      zoomLens.style.backgroundPosition = `-${bgX}px -${bgY}px`;
    }

    // Events
    zoomFrame.onmouseenter = () => {
      zoomLens.style.display = 'block';
    };

    zoomFrame.onmouseleave = () => {
      zoomLens.style.display = 'none';
    };

    zoomFrame.onmousemove = moveLens;

    // Touch support for mobile/tablets
    zoomFrame.ontouchstart = (e) => {
      zoomLens.style.display = 'block';
      moveLens(e);
    };
    zoomFrame.ontouchmove = (e) => {
      e.preventDefault();
      moveLens(e);
    };
    zoomFrame.ontouchend = () => {
      zoomLens.style.display = 'none';
    };
  }

  /* ==========================================================
     CART MANAGEMENT & PERSISTENCE
     ========================================================== */
  function saveCart() {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(AppState.cart));
    updateCartUI();
  }

  function addToCart(productId, quantity = 1, options = {}) {
    const product = CafeDB.getProductById(productId);
    if (!product) return;

    const existingIndex = AppState.cart.findIndex(item => item.id === productId);
    if (existingIndex > -1) {
      AppState.cart[existingIndex].quantity += quantity;
    } else {
      AppState.cart.push({
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        image: product.image,
        quantity: quantity,
        size: options.size || 'Regular (12oz)',
        milk: options.milk || 'Oat Milk'
      });
    }

    saveCart();
    showToast(`Added "${product.name}" to your tray`);
  }

  function updateCartQuantity(productId, delta) {
    const item = AppState.cart.find(i => i.id === productId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      AppState.cart = AppState.cart.filter(i => i.id !== productId);
    }
    saveCart();
  }

  function removeCartItem(productId) {
    AppState.cart = AppState.cart.filter(i => i.id !== productId);
    saveCart();
    showToast('Item removed from tray');
  }

  function updateCartUI() {
    // Total count for badge
    const totalCount = AppState.cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartBadge) {
      cartBadge.innerText = totalCount;
      cartBadge.style.display = totalCount > 0 ? 'flex' : 'none';
    }

    // Render items inside drawer
    if (!cartItemsContainer) return;

    if (AppState.cart.length === 0) {
      cartItemsContainer.innerHTML = `
        <div class="empty-cart-state">
          <i class="fas fa-mug-hot"></i>
          <h4>Your Tray is Empty</h4>
          <p>Discover our cozy roasts and fresh artisanal pastries to begin your day.</p>
        </div>
      `;
      if (cartSubtotalEl) cartSubtotalEl.innerText = '$0.00';
      if (cartTaxEl) cartTaxEl.innerText = '$0.00';
      if (cartTotalEl) cartTotalEl.innerText = '$0.00';
      return;
    }

    cartItemsContainer.innerHTML = AppState.cart.map(item => `
      <div class="cart-item">
        <img class="cart-item-img" src="${item.image}" alt="${item.name}">
        <div class="cart-item-info">
          <h4 class="cart-item-title">${item.name}</h4>
          <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
          <div class="cart-item-controls">
            <div class="cart-stepper">
              <button onclick="window.L_Aroma.updateCartQuantity('${item.id}', -1)" aria-label="Decrease quantity">-</button>
              <span style="font-size: 0.85rem; font-weight: 700;">${item.quantity}</span>
              <button onclick="window.L_Aroma.updateCartQuantity('${item.id}', 1)" aria-label="Increase quantity">+</button>
            </div>
            <button class="cart-item-remove" onclick="window.L_Aroma.removeCartItem('${item.id}')" title="Remove item">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
      </div>
    `).join('');

    // Totals
    const subtotal = AppState.cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const tax = subtotal * 0.0825; // 8.25% sales tax
    const total = subtotal + tax;

    if (cartSubtotalEl) cartSubtotalEl.innerText = `$${subtotal.toFixed(2)}`;
    if (cartTaxEl) cartTaxEl.innerText = `$${tax.toFixed(2)}`;
    if (cartTotalEl) cartTotalEl.innerText = `$${total.toFixed(2)}`;
  }

  function toggleCartDrawer(open) {
    if (open) {
      cartDrawerOverlay.classList.add('active');
      cartDrawer.classList.add('active');
      document.body.style.overflow = 'hidden';
    } else {
      cartDrawerOverlay.classList.remove('active');
      cartDrawer.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  /* ==========================================================
     COZY AMBIENT RAIN & VINYL SOUND GENERATOR (Web Audio API)
     ========================================================== */
  function setupAmbientSound() {
    if (!ambientAudioBtn) return;

    ambientAudioBtn.addEventListener('click', () => {
      if (AppState.ambientAudioPlaying) {
        stopAmbientAudio();
      } else {
        startAmbientAudio();
      }
    });
  }

  function startAmbientAudio() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      AppState.audioCtx = new AudioContext();

      // Create Brown Noise for cozy warm rain & fireplace rush
      const bufferSize = AppState.audioCtx.sampleRate * 2;
      const noiseBuffer = AppState.audioCtx.createBuffer(1, bufferSize, AppState.audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // Gain compensation
      }

      const whiteNoise = AppState.audioCtx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Warm low-pass filter to make it sound like gentle autumn rain outside cafe windows
      const filter = AppState.audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, AppState.audioCtx.currentTime);

      AppState.audioGainNode = AppState.audioCtx.createGain();
      AppState.audioGainNode.gain.setValueAtTime(0.08, AppState.audioCtx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(AppState.audioGainNode);
      AppState.audioGainNode.connect(AppState.audioCtx.destination);

      whiteNoise.start();

      AppState.ambientAudioPlaying = true;
      ambientAudioBtn.classList.add('playing');
      const textSpan = ambientAudioBtn.querySelector('.sound-text');
      if (textSpan) textSpan.innerText = 'Cozy Rain & Hearth Playing';
      showToast('Cozy ambient background audio enabled ☕🌧️');
    } catch (e) {
      console.warn('Audio API init error', e);
    }
  }

  function stopAmbientAudio() {
    if (AppState.audioCtx) {
      AppState.audioCtx.close();
      AppState.audioCtx = null;
    }
    AppState.ambientAudioPlaying = false;
    ambientAudioBtn.classList.remove('playing');
    const textSpan = ambientAudioBtn.querySelector('.sound-text');
    if (textSpan) textSpan.innerText = 'Cozy Cafe Sound';
  }

  /* ==========================================================
     TOAST NOTIFICATIONS
     ========================================================== */
  function showToast(message) {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fas fa-check-circle"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      if (toast && toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 3000);
  }

  /* ==========================================================
     EVENT LISTENERS & BINDINGS
     ========================================================== */
  function setupEventListeners() {
    // Category Tabs
    categoryTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        categoryTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        AppState.currentCategory = tab.dataset.category;
        renderProducts();
      });
    });

    // Search Input
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        AppState.searchQuery = e.target.value.trim();
        renderProducts();
      });
    }

    // Cart Drawer Triggers
    if (cartToggleBtn) {
      cartToggleBtn.addEventListener('click', () => toggleCartDrawer(true));
    }
    if (closeCartBtn) {
      closeCartBtn.addEventListener('click', () => toggleCartDrawer(false));
    }
    if (cartDrawerOverlay) {
      cartDrawerOverlay.addEventListener('click', (e) => {
        if (e.target === cartDrawerOverlay) toggleCartDrawer(false);
      });
    }

    // Zoom Modal Triggers
    if (closeZoomModalBtn) {
      closeZoomModalBtn.addEventListener('click', closeZoomModal);
    }
    if (zoomModalOverlay) {
      zoomModalOverlay.addEventListener('click', (e) => {
        if (e.target === zoomModalOverlay) closeZoomModal();
      });
    }

    // Zoom Level Selector inside Modal
    zoomLevelBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        zoomLevelBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        AppState.zoomFactor = parseFloat(btn.dataset.zoom) || 2.5;
        initMagnifier();
      });
    });

    // Modal Stepper & Add to Order
    const stepperMinus = document.getElementById('modalStepperMinus');
    const stepperPlus = document.getElementById('modalStepperPlus');
    const stepperVal = document.getElementById('modalStepperVal');

    if (stepperMinus && stepperPlus && stepperVal) {
      stepperMinus.addEventListener('click', () => {
        let val = parseInt(stepperVal.innerText) || 1;
        if (val > 1) stepperVal.innerText = val - 1;
      });
      stepperPlus.addEventListener('click', () => {
        let val = parseInt(stepperVal.innerText) || 1;
        stepperVal.innerText = val + 1;
      });
    }

    const modalAddBtn = document.getElementById('modalAddToCartBtn');
    if (modalAddBtn) {
      modalAddBtn.addEventListener('click', () => {
        if (!AppState.activeZoomProduct) return;
        const qty = parseInt(stepperVal.innerText) || 1;
        addToCart(AppState.activeZoomProduct.id, qty);
        closeZoomModal();
        toggleCartDrawer(true);
      });
    }

    // Option pills (Cup size / Milk choice in modal)
    document.querySelectorAll('.option-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const parent = pill.parentElement;
        parent.querySelectorAll('.option-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
      });
    });

    // Checkout Modal
    if (openCheckoutBtn) {
      openCheckoutBtn.addEventListener('click', () => {
        if (AppState.cart.length === 0) {
          showToast('Please add items to your tray before checkout.');
          return;
        }
        toggleCartDrawer(false);
        checkoutModalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Update checkout preview
        const subtotal = AppState.cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
        const total = subtotal * 1.0825;
        document.getElementById('checkoutTotalAmount').innerText = `$${total.toFixed(2)}`;
      });
    }

    if (closeCheckoutBtn) {
      closeCheckoutBtn.addEventListener('click', () => {
        checkoutModalOverlay.classList.remove('active');
        document.body.style.overflow = '';
      });
    }

    if (checkoutForm) {
      checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const customerName = document.getElementById('checkoutName').value.trim();
        const customerPhone = document.getElementById('checkoutPhone').value.trim();
        const orderType = document.getElementById('checkoutType').value;

        const subtotal = AppState.cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
        const total = subtotal * 1.0825;

        // Create new order record in database
        const createdOrder = CafeDB.addOrder({
          customerName: customerName || 'Valued Guest',
          customerPhone: customerPhone || 'Not provided',
          items: [...AppState.cart],
          total: parseFloat(total.toFixed(2)),
          orderType: orderType
        });

        // Clear cart
        AppState.cart = [];
        saveCart();

        // Close checkout modal
        checkoutModalOverlay.classList.remove('active');
        document.body.style.overflow = '';

        // Congratulate customer
        showToast(`Order #${createdOrder.id} confirmed! Sent to Barista station ☕`);
        alert(`✨ Thank you, ${customerName}!\nYour order #${createdOrder.id} has been received and is now being crafted by our baristas.`);
      });
    }

    // Table Reservation Form
    if (reservationForm) {
      reservationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('resName').value.trim();
        const email = document.getElementById('resEmail').value.trim();
        const phone = document.getElementById('resPhone').value.trim();
        const date = document.getElementById('resDate').value;
        const time = document.getElementById('resTime').value;
        const guests = document.getElementById('resGuests').value;
        const zone = document.getElementById('resZone').value;
        const notes = document.getElementById('resNotes').value.trim();

        const newRes = CafeDB.addReservation({
          name, email, phone, date, time, guests, zone, notes
        });

        reservationForm.reset();
        showToast(`Table reservation #${newRes.id} confirmed for ${name}!`);
      });
    }

    // Mobile Menu Toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navLinksList = document.querySelector('.nav-links');
    if (mobileMenuToggle && navLinksList) {
      mobileMenuToggle.addEventListener('click', () => {
        navLinksList.classList.toggle('open');
      });
      navLinksList.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => navLinksList.classList.remove('open'));
      });
    }

    // Scroll header styling
    window.addEventListener('scroll', () => {
      const header = document.querySelector('.site-header');
      if (header) {
        if (window.scrollY > 40) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }
    });
  }

  // Expose methods globally for inline HTML buttons
  window.L_Aroma = {
    openZoomModal,
    closeZoomModal,
    addToCart,
    updateCartQuantity,
    removeCartItem,
    showToast
  };

  // Launch application
  init();
});
