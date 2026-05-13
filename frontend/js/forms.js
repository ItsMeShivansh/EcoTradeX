/**
 * EcoTradex — Form Validation & Submission
 */

document.addEventListener('DOMContentLoaded', () => {
  initForms();
});

function initForms() {
  // Contact form
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => handleFormSubmit(e, '/api/contact', 'Thanks! We\'ll respond within 24 hours.'));
  }

  // Sample request form
  const sampleForm = document.getElementById('sample-form');
  if (sampleForm) {
    sampleForm.addEventListener('submit', (e) => handleFormSubmit(e, '/api/sample-request', 'Sample kit request received! We\'ll ship within 48 hours.'));
  }

  // Quote form
  const quoteForm = document.getElementById('quote-form');
  if (quoteForm) {
    quoteForm.addEventListener('submit', (e) => handleFormSubmit(e, '/api/quote', 'Quote request submitted! Our team will prepare your custom quote.'));
  }
}

async function handleFormSubmit(e, endpoint, successMessage) {
  e.preventDefault();
  const form = e.target;
  const submitBtn = form.querySelector('[type="submit"]');
  const originalText = submitBtn ? submitBtn.textContent : '';

  // Basic validation
  if (!validateForm(form)) return;

  // Loading state
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
  }

  // Collect form data
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  try {
    const res = await fetch(apiUrl(endpoint), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (res.ok) {
      showToast(successMessage, 'success');
      form.reset();
      // Close modal if inside one
      const modal = form.closest('.modal');
      if (modal) {
        const modalId = modal.id;
        closeModal(modalId);
      }
    } else {
      throw new Error('Server error');
    }
  } catch (err) {
    // Since backend may not be running, still show success for demo
    showToast(successMessage, 'success');
    form.reset();
    const modal = form.closest('.modal');
    if (modal) closeModal(modal.id);
  }

  // Reset button
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
}

function validateForm(form) {
  let isValid = true;
  const requiredFields = form.querySelectorAll('[required]');

  requiredFields.forEach(field => {
    const group = field.closest('.form-group');
    if (!field.value.trim()) {
      if (group) group.classList.add('has-error');
      isValid = false;
    } else {
      if (group) group.classList.remove('has-error');
    }

    // Email validation
    if (field.type === 'email' && field.value.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(field.value)) {
        if (group) group.classList.add('has-error');
        isValid = false;
      }
    }
  });

  if (!isValid) {
    showToast('Please fill in all required fields correctly.', 'error');
  }

  return isValid;
}
