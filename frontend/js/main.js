/**
 * EcoTradex — Main Application Initializer
 * Handles: nav toggle, header scroll effect, shared component init
 * Note: initNavigation() and initHeaderScroll() are called by components.js
 * after shared navbar is injected into the DOM.
 */

/* ── Navigation ── */
function initNavigation() {
  const toggle = document.getElementById('nav-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('is-active');
      mobileMenu.classList.toggle('is-active');
      document.body.style.overflow = mobileMenu.classList.contains('is-active') ? 'hidden' : '';
    });

    // Close mobile menu on link click
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('is-active');
        mobileMenu.classList.remove('is-active');
        document.body.style.overflow = '';
      });
    });
  }

  // Close mobile menu on escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('is-active')) {
      toggle.classList.remove('is-active');
      mobileMenu.classList.remove('is-active');
      document.body.style.overflow = '';
    }
  });
}

/* ── Header Scroll Effect ── */
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    if (currentScroll > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
  }, { passive: true });
}

/* ── Smooth Scroll for Anchor Links ── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/* ── Modal Helpers ── */
function openModal(modalId) {
  const backdrop = document.getElementById(modalId + '-backdrop');
  const modal = document.getElementById(modalId);
  if (backdrop && modal) {
    backdrop.classList.add('is-active');
    modal.classList.add('is-active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const backdrop = document.getElementById(modalId + '-backdrop');
  const modal = document.getElementById(modalId);
  if (backdrop && modal) {
    backdrop.classList.remove('is-active');
    modal.classList.remove('is-active');
    document.body.style.overflow = '';
  }
}

/* ── Toast Notification ── */
function showToast(message, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      ${type === 'success' 
        ? '<path d="M20 6L9 17l-5-5"/>'
        : '<circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/>'}
    </svg>
    <span>${message}</span>
  `;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('is-visible');
  });

  setTimeout(() => {
    toast.classList.remove('is-visible');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

/* ── Tab Component ── */
function initTabs(containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const buttons = container.querySelectorAll('.tab-btn');
  const panels = container.querySelectorAll('.tab-panel');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('is-active'));
      panels.forEach(p => p.classList.remove('is-active'));

      btn.classList.add('is-active');
      const panel = container.querySelector(`#${btn.dataset.tab}`);
      if (panel) panel.classList.add('is-active');
    });
  });
}
