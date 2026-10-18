/**
 * L'Aroma Atelier - Admin Portal Script
 * Product Management, Live Orders Queue, Table Reservations & Cafe Settings
 */

document.addEventListener('DOMContentLoaded', () => {
  // State
  let activeTab = 'products';
  let editingProductId = null;

  // DOM Elements
  const sidebarItems = document.querySelectorAll('.sidebar-item');
  const adminSections = document.querySelectorAll('.admin-section');
  const productsTableBody = document.getElementById('adminProductsTableBody');
  const ordersTableBody = document.getElementById('adminOrdersTableBody');
  const reservationsTableBody = document.getElementById('adminReservationsTableBody');
  
  // KPI Elements
  const kpiRevenueEl = document.getElementById('kpiRevenue');
  const kpiOrdersEl = document.getElementById('kpiOrders');
  const kpiProductsEl = document.getElementById('kpiProducts');
  const kpiReservationsEl = document.getElementById('kpiReservations');

  // Modal Elements
  const productModalOverlay = document.getElementById('productModalOverlay');
  const openAddProductBtn = document.getElementById('openAddProductBtn');
  const closeProductModalBtn = document.getElementById('closeProductModalBtn');
  const cancelProductBtn = document.getElementById('cancelProductBtn');
  const productForm = document.getElementById('adminProductForm');
  const modalFormTitle = document.getElementById('modalFormTitle');

  // Settings Elements
  const settingsForm = document.getElementById('adminSettingsForm');
  const btnResetData = document.getElementById('btnResetData');

  function init() {
    renderKPIs();
    renderProducts();
    renderOrders();
    renderReservations();
    loadSettingsIntoForm();
    setupEventListeners();
  }

  /* ==========================================================
     METRICS & KPIS
     ========================================================== */
  function renderKPIs() {
    const orders = CafeDB.getOrders();
    const products = CafeDB.getProducts();
    const reservations = CafeDB.getReservations();

    const totalRevenue = orders.reduce((sum, ord) => sum + (parseFloat(ord.total) || 0), 0);
    const activeOrders = orders.filter(o => o.status === 'Brewing' || o.status === 'Pending').length;

    if (kpiRevenueEl) kpiRevenueEl.innerText = `$${totalRevenue.toFixed(2)}`;
    if (kpiOrdersEl) kpiOrdersEl.innerText = activeOrders;
    if (kpiProductsEl) kpiProductsEl.innerText = products.length;
    if (kpiReservationsEl) kpiReservationsEl.innerText = reservations.length;
  }

  /* ==========================================================
     PRODUCTS TABLE & CRUD
     ========================================================== */
  function renderProducts() {
    if (!productsTableBody) return;
    const products = CafeDB.getProducts();

    if (products.length === 0) {
      productsTableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 40px; color: var(--admin-text-sub);">
            No menu items found. Click "+ Add New Roast / Item" above to create one.
          </td>
        </tr>
      `;
      return;
    }

    productsTableBody.innerHTML = products.map(item => `
      <tr>
        <td>
          <div class="product-row-flex">
            <img class="product-thumb-sm" src="${item.image}" alt="${item.name}">
            <div>
              <div class="product-cell-name">${item.name}</div>
              <div class="product-cell-sub">${item.origin || 'Artisan blend'}</div>
            </div>
          </div>
        </td>
        <td>
          <span style="text-transform: capitalize; color: var(--admin-gold);">${item.category.replace('-', ' ')}</span>
        </td>
        <td style="font-weight: 700;">$${parseFloat(item.price).toFixed(2)}</td>
        <td>
          <span class="status-pill ${item.inStock !== false ? 'confirmed' : 'cancelled'}" 
                style="cursor: pointer;" 
                onclick="window.AdminApp.toggleStock('${item.id}')"
                title="Click to toggle availability">
            ${item.inStock !== false ? 'In Stock' : 'Sold Out'}
          </span>
        </td>
        <td>
          <span style="font-size: 0.8rem; background: rgba(226, 167, 101, 0.1); padding: 3px 8px; border-radius: 4px; color: var(--admin-gold);">
            ${item.badge || 'Crafted'}
          </span>
        </td>
        <td>
          <div class="action-btns-group">
            <button class="btn-table-action" onclick="window.AdminApp.openEditModal('${item.id}')" title="Edit Item">
              <i class="fas fa-pencil-alt"></i>
            </button>
            <button class="btn-table-action delete" onclick="window.AdminApp.deleteProduct('${item.id}')" title="Delete Item">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  function toggleStock(productId) {
    const item = CafeDB.getProductById(productId);
    if (!item) return;
    CafeDB.updateProduct(productId, { inStock: item.inStock === false ? true : false });
    renderProducts();
  }

  function openEditModal(productId) {
    const item = CafeDB.getProductById(productId);
    if (!item) return;

    editingProductId = productId;
    modalFormTitle.innerText = `Edit: ${item.name}`;

    document.getElementById('formItemName').value = item.name;
    document.getElementById('formItemCategory').value = item.category;
    document.getElementById('formItemPrice').value = item.price;
    document.getElementById('formItemOldPrice').value = item.oldPrice || '';
    document.getElementById('formItemBadge').value = item.badge || 'Signature';
    document.getElementById('formItemOrigin').value = item.origin || '';
    document.getElementById('formItemRoast').value = item.roastLevel || '';
    document.getElementById('formItemTagline').value = item.tagline || '';
    document.getElementById('formItemDesc').value = item.description || '';
    document.getElementById('formItemNotes').value = (item.tastingNotes || []).join(', ');
    document.getElementById('formItemImage').value = item.image;
    document.getElementById('formItemZoomImage').value = item.zoomImage || item.image;

    productModalOverlay.classList.add('active');
  }

  function deleteProduct(productId) {
    const item = CafeDB.getProductById(productId);
    if (!item) return;

    if (confirm(`Are you sure you want to delete "${item.name}" from the menu?`)) {
      CafeDB.deleteProduct(productId);
      renderProducts();
      renderKPIs();
    }
  }

  /* ==========================================================
     ORDERS MANAGEMENT
     ========================================================== */
  function renderOrders() {
    if (!ordersTableBody) return;
    const orders = CafeDB.getOrders();

    if (orders.length === 0) {
      ordersTableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 40px; color: var(--admin-text-sub);">
            No customer orders placed yet.
          </td>
        </tr>
      `;
      return;
    }

    ordersTableBody.innerHTML = orders.map(ord => {
      const itemsSummary = (ord.items || []).map(i => `${i.quantity}x ${i.name}`).join(', ');
      const statusClass = ord.status.toLowerCase();

      return `
        <tr>
          <td style="font-weight: 700; color: var(--admin-gold);">${ord.id}</td>
          <td>
            <div style="font-weight: 600; color: #fff;">${ord.customerName}</div>
            <div style="font-size: 0.78rem; color: var(--admin-text-muted);">${ord.orderType || 'Pickup'} • ${ord.customerPhone || ''}</div>
          </td>
          <td style="max-width: 280px; font-size: 0.82rem; color: var(--admin-text-sub); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${itemsSummary}">
            ${itemsSummary}
          </td>
          <td style="font-weight: 700; color: #fff;">$${parseFloat(ord.total).toFixed(2)}</td>
          <td>
            <span class="status-pill ${statusClass}">${ord.status}</span>
          </td>
          <td>
            <div class="action-btns-group">
              ${ord.status !== 'Completed' ? `
                <button class="btn-table-action" onclick="window.AdminApp.changeOrderStatus('${ord.id}', 'Completed')" title="Mark as Completed" style="color: var(--admin-success);">
                  <i class="fas fa-check"></i>
                </button>
              ` : ''}
              ${ord.status !== 'Brewing' ? `
                <button class="btn-table-action" onclick="window.AdminApp.changeOrderStatus('${ord.id}', 'Brewing')" title="Mark as Brewing" style="color: var(--admin-warning);">
                  <i class="fas fa-fire"></i>
                </button>
              ` : ''}
              ${ord.status !== 'Cancelled' ? `
                <button class="btn-table-action delete" onclick="window.AdminApp.changeOrderStatus('${ord.id}', 'Cancelled')" title="Cancel Order">
                  <i class="fas fa-times"></i>
                </button>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function changeOrderStatus(orderId, newStatus) {
    CafeDB.updateOrderStatus(orderId, newStatus);
    renderOrders();
    renderKPIs();
  }

  /* ==========================================================
     RESERVATIONS MANAGEMENT
     ========================================================== */
  function renderReservations() {
    if (!reservationsTableBody) return;
    const reservations = CafeDB.getReservations();

    if (reservations.length === 0) {
      reservationsTableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 40px; color: var(--admin-text-sub);">
            No table reservations booked yet.
          </td>
        </tr>
      `;
      return;
    }

    reservationsTableBody.innerHTML = reservations.map(res => `
      <tr>
        <td style="font-weight: 700; color: var(--admin-gold);">${res.id}</td>
        <td>
          <div style="font-weight: 600; color: #fff;">${res.name}</div>
          <div style="font-size: 0.78rem; color: var(--admin-text-muted);">${res.email || ''} • ${res.phone || ''}</div>
        </td>
        <td>
          <div style="font-weight: 600; color: #fff;">${res.date} at ${res.time}</div>
          <div style="font-size: 0.78rem; color: var(--admin-text-sub);">${res.guests} Guests</div>
        </td>
        <td>
          <span style="color: var(--admin-gold); font-size: 0.85rem;">${res.zone}</span>
          ${res.notes ? `<div style="font-size: 0.75rem; color: var(--admin-text-muted); font-style: italic;">"${res.notes}"</div>` : ''}
        </td>
        <td>
          <span class="status-pill ${res.status.toLowerCase()}">${res.status}</span>
        </td>
        <td>
          <div class="action-btns-group">
            ${res.status !== 'Seated' ? `
              <button class="btn-table-action" onclick="window.AdminApp.changeResStatus('${res.id}', 'Seated')" title="Mark as Seated" style="color: var(--admin-success);">
                <i class="fas fa-chair"></i>
              </button>
            ` : ''}
            ${res.status !== 'Cancelled' ? `
              <button class="btn-table-action delete" onclick="window.AdminApp.changeResStatus('${res.id}', 'Cancelled')" title="Cancel Reservation">
                <i class="fas fa-times"></i>
              </button>
            ` : ''}
          </div>
        </td>
      </tr>
    `).join('');
  }

  function changeResStatus(resId, status) {
    CafeDB.updateReservationStatus(resId, status);
    renderReservations();
    renderKPIs();
  }

  /* ==========================================================
     SETTINGS MANAGEMENT
     ========================================================== */
  function loadSettingsIntoForm() {
    if (!settingsForm) return;
    const settings = CafeDB.getSettings();

    document.getElementById('settingsCafeName').value = settings.cafeName || '';
    document.getElementById('settingsTagline').value = settings.tagline || '';
    document.getElementById('settingsAnnouncement').value = settings.announcement || '';
    document.getElementById('settingsAnnouncementActive').checked = settings.announcementActive !== false;
    document.getElementById('settingsHours').value = settings.openingHours || '';
    document.getElementById('settingsAddress').value = settings.address || '';
    document.getElementById('settingsPhone').value = settings.phone || '';
  }

  function saveSettingsFromForm(e) {
    e.preventDefault();
    const updated = {
      cafeName: document.getElementById('settingsCafeName').value.trim(),
      tagline: document.getElementById('settingsTagline').value.trim(),
      announcement: document.getElementById('settingsAnnouncement').value.trim(),
      announcementActive: document.getElementById('settingsAnnouncementActive').checked,
      openingHours: document.getElementById('settingsHours').value.trim(),
      address: document.getElementById('settingsAddress').value.trim(),
      phone: document.getElementById('settingsPhone').value.trim()
    };
    CafeDB.saveSettings(updated);
    alert('✨ Cafe Settings & Announcements have been updated successfully and applied to the live storefront!');
  }

  /* ==========================================================
     MODAL CONTROLS & FORM SUBMISSIONS
     ========================================================== */
  function setupEventListeners() {
    // Navigation Tabs
    sidebarItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const tab = item.dataset.tab;
        if (!tab) return; // e.g. external link
        e.preventDefault();

        sidebarItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        adminSections.forEach(sec => {
          sec.classList.remove('active');
          if (sec.id === `section-${tab}`) {
            sec.classList.add('active');
          }
        });
      });
    });

    // Add Product Modal
    if (openAddProductBtn) {
      openAddProductBtn.addEventListener('click', () => {
        editingProductId = null;
        modalFormTitle.innerText = 'Add New Coffee Roast / Item';
        productForm.reset();
        productModalOverlay.classList.add('active');
      });
    }

    const closeModal = () => {
      productModalOverlay.classList.remove('active');
      editingProductId = null;
    };

    if (closeProductModalBtn) closeProductModalBtn.addEventListener('click', closeModal);
    if (cancelProductBtn) cancelProductBtn.addEventListener('click', closeModal);
    if (productModalOverlay) {
      productModalOverlay.addEventListener('click', (e) => {
        if (e.target === productModalOverlay) closeModal();
      });
    }

    // Product Form Submit (Create or Update)
    if (productForm) {
      productForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const rawNotes = document.getElementById('formItemNotes').value.trim();
        const notesArr = rawNotes ? rawNotes.split(',').map(n => n.trim()).filter(Boolean) : [];

        const payload = {
          name: document.getElementById('formItemName').value.trim(),
          category: document.getElementById('formItemCategory').value,
          price: parseFloat(document.getElementById('formItemPrice').value),
          oldPrice: document.getElementById('formItemOldPrice').value ? parseFloat(document.getElementById('formItemOldPrice').value) : null,
          badge: document.getElementById('formItemBadge').value.trim() || 'Specialty',
          origin: document.getElementById('formItemOrigin').value.trim(),
          roastLevel: document.getElementById('formItemRoast').value.trim(),
          tagline: document.getElementById('formItemTagline').value.trim(),
          description: document.getElementById('formItemDesc').value.trim(),
          tastingNotes: notesArr,
          image: document.getElementById('formItemImage').value.trim(),
          zoomImage: document.getElementById('formItemZoomImage').value.trim() || document.getElementById('formItemImage').value.trim(),
          inStock: true
        };

        if (editingProductId) {
          CafeDB.updateProduct(editingProductId, payload);
        } else {
          CafeDB.addProduct(payload);
        }

        closeModal();
        renderProducts();
        renderKPIs();
      });
    }

    // Settings Form
    if (settingsForm) {
      settingsForm.addEventListener('submit', saveSettingsFromForm);
    }

    // Reset All Data
    if (btnResetData) {
      btnResetData.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all products, orders, and reservations back to default demo state?')) {
          CafeDB.resetAll();
        }
      });
    }
  }

  // Global interface
  window.AdminApp = {
    toggleStock,
    openEditModal,
    deleteProduct,
    changeOrderStatus,
    changeResStatus
  };

  init();
});
