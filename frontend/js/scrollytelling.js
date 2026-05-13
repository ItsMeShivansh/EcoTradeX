/**
 * EcoTradex — Scrollytelling Decomposition Animation
 * Scroll-driven animation: bagasse plate decomposes over 90 days
 */

document.addEventListener('DOMContentLoaded', () => {
  initScrollytelling();
});

function initScrollytelling() {
  const section = document.querySelector('.scrollytelling');
  if (!section) return;

  const plate = section.querySelector('.scrollytelling__plate');
  const markers = section.querySelectorAll('.scrollytelling__marker');
  const steps = section.querySelectorAll('.scrollytelling__step');

  if (!plate || steps.length === 0) return;

  // Create an IntersectionObserver for each step
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const stepIndex = parseInt(entry.target.dataset.step);
        updateDecomposition(plate, markers, stepIndex);
      }
    });
  }, {
    threshold: 0.5,
    rootMargin: '-20% 0px -20% 0px'
  });

  steps.forEach(step => observer.observe(step));

  // Also track scroll progress for smooth plate transition
  window.addEventListener('scroll', () => {
    if (!isElementInViewport(section)) return;

    const rect = section.getBoundingClientRect();
    const sectionHeight = section.offsetHeight;
    const scrolled = -rect.top;
    const progress = Math.max(0, Math.min(1, scrolled / (sectionHeight - window.innerHeight)));

    // Apply subtle continuous rotation based on scroll
    if (plate) {
      const rotation = progress * 15;
      plate.style.setProperty('--scroll-rotation', `${rotation}deg`);
    }
  }, { passive: true });
}

function updateDecomposition(plate, markers, stage) {
  plate.setAttribute('data-stage', stage);

  markers.forEach((marker, index) => {
    if (index <= stage) {
      marker.classList.add('is-active');
    } else {
      marker.classList.remove('is-active');
    }
  });
}

function isElementInViewport(el) {
  const rect = el.getBoundingClientRect();
  return rect.top < window.innerHeight && rect.bottom > 0;
}
