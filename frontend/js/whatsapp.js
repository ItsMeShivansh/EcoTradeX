/**
 * EcoTradex — WhatsApp B2B Integration
 * Floating button with country-code auto-detection
 * Phone number loaded dynamically from site content API
 */

document.addEventListener('DOMContentLoaded', () => {
  // Delay init slightly to allow shared components to inject
  setTimeout(initWhatsApp, 500);
});

async function initWhatsApp() {
  const btn = document.getElementById('whatsapp-btn');
  if (!btn) return;

  // Load phone number from API
  let WHATSAPP_NUMBER = '918799608288';
  try {
    const res = await fetch(apiUrl('/api/content/company'));
    if (res.ok) {
      const data = await res.json();
      if (data.whatsappNumber) WHATSAPP_NUMBER = data.whatsappNumber;
    }
  } catch(e) {}

  // Detect country for localized message
  let country = 'your country';
  try {
    const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      country = data.country_name || 'your country';
    }
  } catch (e) {}

  const message = encodeURIComponent(
    `Hi EcoTradex,\n\nI'm interested in your compostable packaging products for export to ${country}.\n\nCould you share your latest catalog and pricing?\n\nThank you.`
  );

  btn.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
  btn.target = '_blank';
  btn.rel = 'noopener noreferrer';
}
