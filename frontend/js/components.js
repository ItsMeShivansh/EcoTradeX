/**
 * EcoTradex — Shared Components (Navbar + Footer + Theme Toggle)
 * Injected dynamically on every page for consistency
 */

function getBasePath() {
  const path = window.location.pathname;
  if (path.includes('/pages/') || path.includes('/admin')) return '../';
  return '';
}

/* ══════════════════════════════════════
   Theme Manager
   ══════════════════════════════════════ */

const ThemeManager = {
  STORAGE_KEY: 'ecotradex-theme',

  /** Get the user's preferred theme, checking localStorage then system preference */
  getPreferred() {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
    // Respect system preference as default
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  },

  /** Apply the theme to <html> and update all theme-dependent elements */
  apply(theme) {
    const html = document.documentElement;

    // Smooth transition
    html.classList.add('theme-transition');

    if (theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }

    // Store user preference
    localStorage.setItem(this.STORAGE_KEY, theme);

    // Switch logos
    this.switchLogos(theme);

    // Update toggle button aria
    const toggleBtns = document.querySelectorAll('.theme-toggle');
    toggleBtns.forEach(btn => {
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    });

    // Remove transition class after animation completes
    setTimeout(() => {
      html.classList.remove('theme-transition');
    }, 350);
  },

  /** Toggle between light and dark */
  toggle() {
    const current = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    this.apply(current === 'dark' ? 'light' : 'dark');
  },

  /** Switch all logos based on theme */
  switchLogos(theme) {
    const bp = getBasePath();
    // Navbar logos (data-logo-light / data-logo-dark)
    document.querySelectorAll('[data-logo-light][data-logo-dark]').forEach(img => {
      img.src = theme === 'dark' ? img.dataset.logoDark : img.dataset.logoLight;
    });
  },

  /** Initialize: apply saved/system preference and listen for system changes */
  init() {
    // Apply immediately (no transition on initial load)
    const theme = this.getPreferred();
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    }
    this.switchLogos(theme);

    // Listen for system preference changes
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        // Only auto-switch if user hasn't explicitly set a preference
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (!stored) {
          this.apply(e.matches ? 'dark' : 'light');
        }
      });
    }
  }
};

// Initialize theme as early as possible
ThemeManager.init();


/* ══════════════════════════════════════
   Navbar Builder
   ══════════════════════════════════════ */

function buildNavbar(activePage, content = {}) {
  const bp = getBasePath();
  const imgs = content.images || {};
  const logoLightSrc = imgs.logoLight || bp + 'assets/logo_light.png';
  const logoDarkSrc = imgs.logoDark || bp + 'assets/logo_dark.png';
  const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  const currentLogo = currentTheme === 'dark' ? logoDarkSrc : logoLightSrc;

  return `
<header class="site-header" id="site-header">
  <div class="nav-container">
    <a href="${bp}index.html" class="nav-logo">
      <img src="${currentLogo}" alt="Eco TradeX Logo" data-logo-light="${logoLightSrc}" data-logo-dark="${logoDarkSrc}" style="height:64px; width:auto; max-height:100%; object-fit:contain;">
    </a>
    <nav class="nav-menu" id="nav-menu">
      <div class="nav-dropdown">
        <a class="nav-link nav-dropdown__trigger ${activePage === 'solutions' ? 'active' : ''}">Solutions <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg></a>
        <div class="nav-dropdown__menu">
          <a href="${bp}pages/solutions-hospitality.html" class="nav-dropdown__item">
            <div class="nav-dropdown__item-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 2h18v20H3z"/><path d="M9 22V12h6v10"/></svg></div>
            <div><span class="nav-dropdown__item-label">Hospitality & Catering</span><span class="nav-dropdown__item-desc">Tableware for hotels, restaurants</span></div>
          </a>
          <a href="${bp}pages/solutions-ecommerce.html" class="nav-dropdown__item">
            <div class="nav-dropdown__item-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v3"/></svg></div>
            <div><span class="nav-dropdown__item-label">E-commerce & Retail</span><span class="nav-dropdown__item-desc">Mailers, carry bags, liners</span></div>
          </a>
        </div>
      </div>
      <div class="nav-dropdown">
        <a class="nav-link nav-dropdown__trigger ${activePage === 'products' ? 'active' : ''}">Products <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg></a>
        <div class="nav-dropdown__menu">
          <a href="${bp}pages/products-tableware.html" class="nav-dropdown__item">
            <div class="nav-dropdown__item-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg></div>
            <div><span class="nav-dropdown__item-label">Compostable Tableware</span><span class="nav-dropdown__item-desc">Plates, bowls, clamshells, cutlery</span></div>
          </a>
          <a href="${bp}pages/products-bags.html" class="nav-dropdown__item">
            <div class="nav-dropdown__item-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/></svg></div>
            <div><span class="nav-dropdown__item-label">Compostable Bags</span><span class="nav-dropdown__item-desc">Carry bags, liners, mailers</span></div>
          </a>
        </div>
      </div>
      <a href="${bp}pages/private-label.html" class="nav-link ${activePage === 'private-label' ? 'active' : ''}">Private Label Studio</a>
      <a href="${bp}pages/eco-vault.html" class="nav-link ${activePage === 'eco-vault' ? 'active' : ''}">Eco-Vault</a>
      <a href="${bp}pages/about.html" class="nav-link ${activePage === 'about' ? 'active' : ''}">About</a>
    </nav>
    <div class="nav-cta">
      <button class="theme-toggle" id="theme-toggle" type="button" aria-label="Toggle dark mode" onclick="ThemeManager.toggle()">
        <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
      </button>
      <a href="${bp}pages/contact.html" class="btn btn-primary btn-sm">Request Sample Kit</a>
    </div>
    <button class="nav-toggle" id="nav-toggle" aria-label="Toggle menu"><span></span><span></span><span></span></button>
  </div>
</header>
<div class="mobile-menu" id="mobile-menu">
  <a href="${bp}pages/solutions-hospitality.html" class="mobile-menu__link">Hospitality & Catering</a>
  <a href="${bp}pages/solutions-ecommerce.html" class="mobile-menu__link">E-commerce & Retail</a>
  <a href="${bp}pages/products-tableware.html" class="mobile-menu__link">Compostable Tableware</a>
  <a href="${bp}pages/products-bags.html" class="mobile-menu__link">Compostable Bags</a>
  <a href="${bp}pages/private-label.html" class="mobile-menu__link">Private Label Studio</a>
  <a href="${bp}pages/eco-vault.html" class="mobile-menu__link">Eco-Vault</a>
  <a href="${bp}pages/about.html" class="mobile-menu__link">About</a>
  <a href="${bp}pages/contact.html" class="mobile-menu__link">Contact</a>
  <div class="mobile-menu__cta">
    <button class="theme-toggle" type="button" aria-label="Toggle dark mode" onclick="ThemeManager.toggle()" style="width:100%;border-radius:var(--radius-md);justify-content:center;gap:var(--space-2);">
      <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
      <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
    </button>
    <a href="${bp}pages/contact.html" class="btn btn-primary w-full">Request Sample Kit</a>
  </div>
</div>
<div class="header-spacer"></div>`;
}


/* ══════════════════════════════════════
   Footer Builder
   ══════════════════════════════════════ */

function buildFooter(content = {}) {
  const bp = getBasePath();
  const c = content.company || {};
  const imgs = content.images || {};
  const logoDarkSrc = imgs.logoDark || bp + 'assets/logo_dark.png';
  const email = c.email || 'export@ecotradex.in';
  const phone = c.phone || '+91 87996 08288';
  const address = c.address || 'Ahmedabad, Gujarat, India';

  return `
<footer class="site-footer" id="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <div class="footer-brand__logo">
          <img src="${logoDarkSrc}" alt="Eco TradeX Logo" style="height:80px; width:auto; object-fit:contain; margin-bottom:8px;">
        </div>
        <p class="footer-brand__desc">Export-grade compostable packaging, certified for global markets. From bagasse tableware to compostable courier mailers.</p>
        <div class="footer-certifications">
          <span class="footer-cert-badge">CPCB</span>
          <span class="footer-cert-badge">EN 13432</span>
          <span class="footer-cert-badge">PFAS-Free</span>
          <span class="footer-cert-badge">IS/ISO 17088</span>
        </div>
      </div>
      <div class="footer-col">
        <h4 class="footer-col__title">Products</h4>
        <a href="${bp}pages/products-tableware.html" class="footer-col__link">Compostable Tableware</a>
        <a href="${bp}pages/products-bags.html" class="footer-col__link">Compostable Bags</a>
        <a href="${bp}pages/private-label.html" class="footer-col__link">Private Label Studio</a>
        <a href="${bp}pages/eco-vault.html" class="footer-col__link">Eco-Vault</a>
      </div>
      <div class="footer-col">
        <h4 class="footer-col__title">Solutions</h4>
        <a href="${bp}pages/solutions-hospitality.html" class="footer-col__link">Hospitality & Catering</a>
        <a href="${bp}pages/solutions-ecommerce.html" class="footer-col__link">E-commerce & Retail</a>
        <a href="${bp}pages/about.html" class="footer-col__link">About Us</a>
        <a href="${bp}index.html#faqs-section" class="footer-col__link">FAQs</a>
        <a href="${bp}pages/contact.html" class="footer-col__link">Contact</a>
      </div>
      <div class="footer-col">
        <h4 class="footer-col__title">Contact</h4>
        <a href="mailto:${email}" class="footer-col__link">${email}</a>
        <a href="tel:${phone.replace(/\\s/g, '')}" class="footer-col__link">${phone}</a>
        <span class="footer-col__link">${address}</span>
        <div style="margin-top:var(--space-4)">
          <span class="footer-lc-badge">LC & Flexible Terms Available</span>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <span class="footer-bottom__copy">&copy; ${new Date().getFullYear()} Eco TradeX. All rights reserved.</span>
      <div class="footer-bottom__links">
        <a href="#" class="footer-bottom__link">Privacy Policy</a>
        <a href="#" class="footer-bottom__link">Terms of Service</a>
        <a href="#" class="footer-bottom__link">Export Compliance</a>
      </div>
    </div>
  </div>
</footer>`;
}

function buildWhatsAppFloat() {
  return `
<div class="whatsapp-float">
  <div class="whatsapp-float__tooltip">Chat with us on WhatsApp</div>
  <a href="#" class="whatsapp-float__btn" id="whatsapp-btn" aria-label="Chat on WhatsApp">
    <svg viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
  </a>
</div>`;
}

/**
 * Initialize shared components on page load
 * Usage: call injectSharedComponents('pageName') in each page
 */
async function injectSharedComponents(activePage) {
  // Fetch full content
  let content = {};
  try {
    const res = await fetch('/api/content');
    if (res.ok) content = await res.json();
  } catch(e) {}

  // Inject navbar
  const navPlaceholder = document.getElementById('shared-navbar');
  if (navPlaceholder) {
    navPlaceholder.innerHTML = buildNavbar(activePage, content);
  }

  // Inject footer
  const footerPlaceholder = document.getElementById('shared-footer');
  if (footerPlaceholder) {
    footerPlaceholder.innerHTML = buildFooter(content);
  }

  // Inject WhatsApp
  const waPlaceholder = document.getElementById('shared-whatsapp');
  if (waPlaceholder) {
    waPlaceholder.innerHTML = buildWhatsAppFloat();
  }

  // Re-apply logo state after injection
  const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  ThemeManager.switchLogos(currentTheme);

  // Re-init navigation after injection
  if (typeof initNavigation === 'function') initNavigation();
  if (typeof initHeaderScroll === 'function') initHeaderScroll();
  if (typeof initSmoothScroll === 'function') initSmoothScroll();
  if (typeof initWhatsApp === 'function') initWhatsApp();
}

/**
 * Load dynamic site content from API
 */
async function loadSiteContent() {
  try {
    const res = await fetch('/api/content');
    if (res.ok) return await res.json();
  } catch(e) {}
  return null;
}
