/**
 * EcoTradex — Product Catalog Rendering
 * Loads products from API (Firestore) and renders product cards/details
 */

let productsData = null;

async function loadProducts() {
  if (productsData) return productsData;
  try {
    const res = await fetch(apiUrl('/api/products'));
    productsData = await res.json();
    return productsData;
  } catch (err) {
    console.error('Failed to load products from API:', err);
    return null;
  }
}

if (typeof getBasePath === 'undefined') {
  function getBasePath() {
    const path = window.location.pathname;
    if (path.includes('/pages/') || path.includes('/admin')) return '../';
    return '';
  }
}

/* ── Render Product Grid ── */
async function renderProductGrid(containerId, category, subcategoryFilter = 'all') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const data = await loadProducts();
  if (!data) {
    container.innerHTML = '<p class="text-secondary">Unable to load products.</p>';
    return;
  }

  const products = data[category] || [];
  const filtered = subcategoryFilter === 'all'
    ? products
    : products.filter(p => p.subcategory === subcategoryFilter);

  container.innerHTML = filtered.map(product => createProductCard(product)).join('');
}

function createProductCard(product) {
  const basePath = getBasePath();
  const specsHTML = Object.entries(product.specs)
    .slice(0, 3)
    .map(([key, val]) => `<span class="product-card__spec">${formatSpecKey(key)}: ${val}</span>`)
    .join('');

  const badgeHTML = product.badge
    ? `<span class="product-card__badge">${product.badge}</span>`
    : '';

  const imgUrl = product.image 
    ? (product.image.startsWith('http') || product.image.startsWith('/') ? product.image : basePath + product.image) 
    : '';

  return `
    <a href="${basePath}pages/product-detail.html?id=${product.id}" class="product-card" id="product-${product.id}">
      <div class="product-card__image-wrap">
        ${imgUrl ? `<img src="${imgUrl}" alt="${product.name}" class="product-card__image" style="width:100%; height:100%; object-fit:cover;">` : `
        <div class="product-card__image" style="background: linear-gradient(135deg, var(--color-slate-100), var(--color-slate-200)); display:flex; align-items:center; justify-content:center;">
          <img src="${basePath}assets/logo.png" alt="Placeholder" style="width:48px; height:auto; opacity:0.5;">
        </div>`}
        ${badgeHTML}
      </div>
      <div class="product-card__body">
        <h3 class="product-card__title">${product.name}</h3>
        <div class="product-card__specs">${specsHTML}</div>
        <div class="product-card__cta">
          View Full Specs
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </div>
      </div>
    </a>
  `;
}

/* ── Render Product Detail ── */
async function renderProductDetail() {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');
  if (!productId) return;

  const data = await loadProducts();
  if (!data) return;

  const allProducts = [...(data.tableware || []), ...(data.bags || [])];
  const product = allProducts.find(p => p.id === productId);
  if (!product) {
    document.getElementById('product-detail-content').innerHTML = '<p>Product not found.</p>';
    return;
  }

  // Set page title
  document.title = `${product.name} — Eco TradeX`;

  // Render Image
  const mainImageContainer = document.getElementById('product-main-image');
  if (mainImageContainer && product.image) {
    const basePath = getBasePath();
    const imgUrl = product.image.startsWith('http') || product.image.startsWith('/') 
      ? product.image 
      : basePath + product.image;
    mainImageContainer.innerHTML = `<img src="${imgUrl}" alt="${product.name}" style="width:100%; height:100%; object-fit:cover; border-radius:inherit;">`;
    mainImageContainer.style.background = 'transparent';
  }

  // Render header
  const header = document.getElementById('detail-header');
  if (header) {
    header.innerHTML = `
      <span class="product-detail__category">${product.category} / ${product.subcategory}</span>
      <h1 class="product-detail__title">${product.name}</h1>
      <p class="product-detail__desc">${product.description}</p>
      <div style="display:flex; gap:var(--space-2); margin-top:var(--space-4); flex-wrap:wrap;">
        ${product.certifications.map(c => `<span class="badge badge-green">${c}</span>`).join('')}
      </div>
    `;
  }

  // Render tech specs
  const techSpecs = document.getElementById('tech-specs');
  if (techSpecs) {
    techSpecs.innerHTML = Object.entries(product.specs)
      .map(([key, val]) => `
        <div class="spec-row">
          <span class="spec-row__key">${formatSpecKey(key)}</span>
          <span class="spec-row__value">${val}</span>
        </div>
      `).join('');
  }

  // Render export data
  const exportData = document.getElementById('export-data');
  if (exportData) {
    const e = product.export;
    exportData.innerHTML = `
      <div class="export-grid">
        <div class="export-card">
          <div class="export-card__label">HS Code</div>
          <div class="export-card__value">${e.hsCode}</div>
        </div>
        <div class="export-card">
          <div class="export-card__label">Per 20ft Container</div>
          <div class="export-card__value">${(e.unitsPerContainer20ft).toLocaleString()}</div>
          <div class="export-card__unit">units</div>
        </div>
        <div class="export-card">
          <div class="export-card__label">Pallet Size</div>
          <div class="export-card__value" style="font-size:var(--fs-lg);">${e.palletSize}</div>
        </div>
      </div>
      <table class="spec-table" style="margin-top:var(--space-6);">
        <tr><td class="spec-key">Units per Carton</td><td class="spec-value">${e.unitsPerCarton}</td></tr>
        <tr><td class="spec-key">Carton Dimensions</td><td class="spec-value">${e.cartonDimensions}</td></tr>
        <tr><td class="spec-key">Carton Weight</td><td class="spec-value">${e.cartonWeight}</td></tr>
        <tr><td class="spec-key">Cartons per Pallet</td><td class="spec-value">${e.cartonsPerPallet}</td></tr>
      </table>
    `;
  }

  // Render pricing
  const pricingGrid = document.getElementById('pricing-tiers');
  if (pricingGrid && product.pricing) {
    const p = product.pricing;
    pricingGrid.innerHTML = `
      <div class="pricing-card">
        <div class="pricing-card__tier">Starter</div>
        <div class="pricing-card__volume">${p.starter.volume}</div>
        <div class="pricing-card__price">${p.starter.pricePerUnit}<span class="pricing-card__unit"> / unit</span></div>
        <div class="pricing-card__features">
          <div class="pricing-card__feature">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>
            Sample order quantity
          </div>
          <div class="pricing-card__feature">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>
            Standard packaging
          </div>
        </div>
        <a href="#quote-modal" onclick="openModal('quote-modal'); return false;" class="btn btn-secondary w-full">Get Quote</a>
      </div>
      <div class="pricing-card pricing-card--featured">
        <div class="pricing-card__tier">Volume</div>
        <div class="pricing-card__volume">${p.bulk.volume}</div>
        <div class="pricing-card__price">${p.bulk.pricePerUnit}<span class="pricing-card__unit"> / unit</span></div>
        <div class="pricing-card__features">
          <div class="pricing-card__feature">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>
            Custom branding available
          </div>
          <div class="pricing-card__feature">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>
            Priority production
          </div>
          <div class="pricing-card__feature">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>
            Batch QC report included
          </div>
        </div>
        <a href="#quote-modal" onclick="openModal('quote-modal'); return false;" class="btn btn-primary w-full">Get Quote</a>
      </div>
      <div class="pricing-card">
        <div class="pricing-card__tier">Full Container</div>
        <div class="pricing-card__volume">${p.container.volume}</div>
        <div class="pricing-card__price">${p.container.pricePerUnit}<span class="pricing-card__unit"> / unit</span></div>
        <div class="pricing-card__features">
          <div class="pricing-card__feature">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>
            Full custom branding
          </div>
          <div class="pricing-card__feature">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>
            Dedicated QA liaison
          </div>
          <div class="pricing-card__feature">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>
            LC payment accepted
          </div>
          <div class="pricing-card__feature">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>
            Free shipping (FOB/CIF)
          </div>
        </div>
        <a href="#quote-modal" onclick="openModal('quote-modal'); return false;" class="btn btn-primary w-full">Get Quote</a>
      </div>
    `;
  }
}

/* ── Filter Products ── */
function initProductFilters(containerId, category) {
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      renderProductGrid(containerId, category, btn.dataset.filter);
    });
  });
}

/* ── Helpers ── */
function formatSpecKey(key) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, s => s.toUpperCase())
    .trim();
}
