/**
 * EcoTradex — 2D Logo Customization Preview Tool
 * Canvas-based tool for uploading logo and previewing on products
 */

document.addEventListener('DOMContentLoaded', () => {
  initCustomizer();
});

function initCustomizer() {
  const canvas = document.getElementById('customizer-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const productSelect = document.getElementById('product-select');
  const logoUpload = document.getElementById('logo-upload');
  const logoScale = document.getElementById('logo-scale');
  const printColor = document.getElementById('print-color');
  const resetBtn = document.getElementById('customizer-reset');
  const quoteBtn = document.getElementById('customizer-quote');

  canvas.width = 500;
  canvas.height = 500;

  let state = {
    product: 'bowl',
    logo: null,
    logoX: 250,
    logoY: 220,
    logoWidth: 100,
    logoHeight: 100,
    scale: 1,
    color: '#166534',
    isDragging: false,
    dragOffsetX: 0,
    dragOffsetY: 0
  };

  // Product templates
  const templates = {
    bowl: {
      draw: (ctx, w, h) => {
        // Bowl shape
        ctx.fillStyle = '#E8DDD0';
        ctx.beginPath();
        ctx.ellipse(w/2, h/2 + 40, 180, 120, 0, 0, Math.PI * 2);
        ctx.fill();
        // Bowl rim
        ctx.strokeStyle = '#D4C5B0';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(w/2, h/2 - 20, 190, 50, 0, 0, Math.PI * 2);
        ctx.stroke();
        // Inner surface
        ctx.fillStyle = '#F0E6D8';
        ctx.beginPath();
        ctx.ellipse(w/2, h/2 - 20, 160, 40, 0, 0, Math.PI * 2);
        ctx.fill();
        // Bottom shadow
        ctx.fillStyle = 'rgba(0,0,0,0.05)';
        ctx.beginPath();
        ctx.ellipse(w/2, h/2 + 150, 140, 20, 0, 0, Math.PI * 2);
        ctx.fill();
      },
      logoArea: { x: 250, y: 220, maxW: 140, maxH: 80 }
    },
    plate: {
      draw: (ctx, w, h) => {
        // Plate
        ctx.fillStyle = '#E8DDD0';
        ctx.beginPath();
        ctx.ellipse(w/2, h/2, 200, 200, 0, 0, Math.PI * 2);
        ctx.fill();
        // Rim
        ctx.strokeStyle = '#D4C5B0';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(w/2, h/2, 200, 200, 0, 0, Math.PI * 2);
        ctx.stroke();
        // Inner circle
        ctx.strokeStyle = '#DDD0C0';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(w/2, h/2, 160, 160, 0, 0, Math.PI * 2);
        ctx.stroke();
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.04)';
        ctx.beginPath();
        ctx.ellipse(w/2, h/2 + 210, 180, 20, 0, 0, Math.PI * 2);
        ctx.fill();
      },
      logoArea: { x: 250, y: 250, maxW: 160, maxH: 100 }
    },
    bag: {
      draw: (ctx, w, h) => {
        // Bag body
        ctx.fillStyle = '#E8E0D4';
        ctx.beginPath();
        ctx.moveTo(130, 80);
        ctx.lineTo(370, 80);
        ctx.lineTo(380, 420);
        ctx.lineTo(120, 420);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#C5B8A8';
        ctx.lineWidth = 2;
        ctx.stroke();
        // Fold line
        ctx.strokeStyle = '#D4C8B8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(135, 120);
        ctx.lineTo(365, 120);
        ctx.stroke();
        // Handle cutouts
        ctx.fillStyle = isDark ? '#0B0F19' : '#F8FAFC';
        ctx.beginPath();
        ctx.ellipse(200, 85, 25, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(300, 85, 25, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.04)';
        ctx.beginPath();
        ctx.ellipse(w/2, 435, 120, 12, 0, 0, Math.PI * 2);
        ctx.fill();
      },
      logoArea: { x: 250, y: 260, maxW: 180, maxH: 120 }
    }
  };

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Theme-aware colors
    const isDark = document.documentElement.classList.contains('dark');
    const bgColor = isDark ? '#0B0F19' : '#FAFBFC';
    const gridColor = isDark ? '#141A27' : '#F1F5F9';

    // Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid pattern
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 0.5;
    for (let i = 0; i < canvas.width; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 20) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    // Draw product template
    templates[state.product].draw(ctx, canvas.width, canvas.height);

    // Draw logo if uploaded
    if (state.logo) {
      const w = state.logoWidth * state.scale;
      const h = state.logoHeight * state.scale;
      const x = state.logoX - w/2;
      const y = state.logoY - h/2;

      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.drawImage(state.logo, x, y, w, h);
      ctx.restore();

      // Logo boundary indicator
      ctx.strokeStyle = 'rgba(22, 163, 74, 0.5)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(x, y, w, h);
      ctx.setLineDash([]);
    } else {
      // Placeholder text
      const area = templates[state.product].logoArea;
      ctx.fillStyle = isDark ? '#7E8FA6' : '#94A3B8';
      ctx.font = '14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Upload logo to preview', area.x, area.y);
      ctx.font = '11px Inter, sans-serif';
      ctx.fillText('Drag to reposition', area.x, area.y + 20);
    }
  }

  // Event handlers
  if (productSelect) {
    productSelect.addEventListener('change', (e) => {
      state.product = e.target.value;
      const area = templates[state.product].logoArea;
      state.logoX = area.x;
      state.logoY = area.y;
      render();
    });
  }

  if (logoUpload) {
    logoUpload.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          state.logo = img;
          // Scale logo to fit area
          const area = templates[state.product].logoArea;
          const scaleW = area.maxW / img.width;
          const scaleH = area.maxH / img.height;
          const fitScale = Math.min(scaleW, scaleH, 1);
          state.logoWidth = img.width * fitScale;
          state.logoHeight = img.height * fitScale;
          state.logoX = area.x;
          state.logoY = area.y;
          state.scale = 1;
          if (logoScale) logoScale.value = 100;
          render();
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  if (logoScale) {
    logoScale.addEventListener('input', (e) => {
      state.scale = parseInt(e.target.value) / 100;
      render();
    });
  }

  // Canvas drag
  canvas.addEventListener('mousedown', (e) => {
    if (!state.logo) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const w = state.logoWidth * state.scale;
    const h = state.logoHeight * state.scale;
    const lx = state.logoX - w/2;
    const ly = state.logoY - h/2;

    if (x >= lx && x <= lx + w && y >= ly && y <= ly + h) {
      state.isDragging = true;
      state.dragOffsetX = x - state.logoX;
      state.dragOffsetY = y - state.logoY;
      canvas.style.cursor = 'grabbing';
    }
  });

  canvas.addEventListener('mousemove', (e) => {
    if (!state.isDragging) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    state.logoX = (e.clientX - rect.left) * scaleX - state.dragOffsetX;
    state.logoY = (e.clientY - rect.top) * scaleY - state.dragOffsetY;
    render();
  });

  canvas.addEventListener('mouseup', () => {
    state.isDragging = false;
    canvas.style.cursor = 'move';
  });

  canvas.addEventListener('mouseleave', () => {
    state.isDragging = false;
    canvas.style.cursor = 'move';
  });

  // Touch support
  canvas.addEventListener('touchstart', (e) => {
    if (!state.logo) return;
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (touch.clientX - rect.left) * scaleX;
    const y = (touch.clientY - rect.top) * scaleY;

    const w = state.logoWidth * state.scale;
    const h = state.logoHeight * state.scale;
    const lx = state.logoX - w/2;
    const ly = state.logoY - h/2;

    if (x >= lx && x <= lx + w && y >= ly && y <= ly + h) {
      state.isDragging = true;
      state.dragOffsetX = x - state.logoX;
      state.dragOffsetY = y - state.logoY;
    }
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    if (!state.isDragging) return;
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    state.logoX = (touch.clientX - rect.left) * scaleX - state.dragOffsetX;
    state.logoY = (touch.clientY - rect.top) * scaleY - state.dragOffsetY;
    render();
  }, { passive: false });

  canvas.addEventListener('touchend', () => {
    state.isDragging = false;
  });

  // Reset
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      state.logo = null;
      state.scale = 1;
      if (logoScale) logoScale.value = 100;
      if (logoUpload) logoUpload.value = '';
      const area = templates[state.product].logoArea;
      state.logoX = area.x;
      state.logoY = area.y;
      render();
    });
  }

  // Quote request with canvas snapshot
  if (quoteBtn) {
    quoteBtn.addEventListener('click', () => {
      if (typeof openModal === 'function') {
        // Attach canvas snapshot to form
        const dataUrl = canvas.toDataURL('image/png');
        const hiddenInput = document.getElementById('design-snapshot');
        if (hiddenInput) hiddenInput.value = dataUrl;
        openModal('quote-modal');
      }
    });
  }

  // Initial render
  render();
}
