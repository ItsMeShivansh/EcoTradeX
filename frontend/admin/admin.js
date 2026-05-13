/**
 * EcoTradex Admin Dashboard
 */
const API_BASE_URL = 'https://ecotradex-qeqc.onrender.com';
const apiUrl = (path) => new URL(path, API_BASE_URL).toString();

let TOKEN = '';
let siteContent = {};
let productsData = {};

// ── Auth ──
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  TOKEN = document.getElementById('passcode').value;
  try {
    const res = await api('GET', '/api/admin/verify');
    if (res.authenticated) {
      document.getElementById('login-screen').style.display = 'none';
      document.getElementById('dashboard').style.display = 'block';
      sessionStorage.setItem('admin_token', TOKEN);
      loadAll();
    }
  } catch (e) {
    document.getElementById('login-error').textContent = 'Invalid passcode';
    TOKEN = '';
  }
});

// Check saved session
window.addEventListener('DOMContentLoaded', () => {
  const saved = sessionStorage.getItem('admin_token');
  if (saved) { TOKEN = saved; checkSession(); }
});

async function checkSession() {
  try {
    const res = await api('GET', '/api/admin/verify');
    if (res.authenticated) {
      document.getElementById('login-screen').style.display = 'none';
      document.getElementById('dashboard').style.display = 'block';
      loadAll();
    }
  } catch (e) { sessionStorage.removeItem('admin_token'); }
}

function logout() {
  TOKEN = '';
  sessionStorage.removeItem('admin_token');
  document.getElementById('dashboard').style.display = 'none';
  document.getElementById('login-screen').style.display = 'flex';
}

// ── API Helper ──
async function api(method, url, body) {
  const opts = { method, headers: { 'x-admin-token': TOKEN, 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(apiUrl(url), opts);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

function toast(msg, err) {
  const el = document.createElement('div');
  el.className = 'toast' + (err ? ' error' : '');
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

// ── Panel Navigation ──
function showPanel(name) {
  document.querySelectorAll('.dash-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.dash-nav').forEach(n => n.classList.remove('active'));
  document.getElementById('panel-' + name).classList.add('active');
  document.querySelector(`.dash-nav[data-panel="${name}"]`).classList.add('active');
}

// ── Load All Data ──
async function loadAll() {
  try {
    siteContent = await api('GET', '/api/admin/content');
    productsData = await api('GET', '/api/admin/products');
    populateAll();
  } catch (e) { toast('Failed to load data', true); }
}

function populateAll() {
  // Company
  const c = siteContent.company || {};
  setVal('c-name', c.name); setVal('c-email', c.email); setVal('c-phone', c.phone);
  setVal('c-whatsapp', c.whatsappNumber); setVal('c-address', c.address);
  setVal('c-linkedin', c.socialLinks?.linkedin); setVal('c-instagram', c.socialLinks?.instagram);

  // Hero
  setVal('h-badge', c.heroBadge); setVal('h-tagline', c.tagline);
  setVal('h-subtitle', c.heroSubtitle); setVal('h-mission', c.mission);

  // Stats
  renderStats();
  // Certs
  renderCerts();
  // LC
  const lc = siteContent.lcPayment || {};
  setVal('lc-title', lc.title); setVal('lc-desc', lc.description);
  setVal('lc-features', (lc.features || []).join('\n'));
  // HWW
  renderHWW();
  // FAQs
  renderFAQs();
  // Solutions
  renderSolutions();
  // Products
  showProductTab('tableware');
  // Private Label
  renderPLFeatures();
  renderMOQ();
  // Traceability
  renderTraceSteps();
  // About
  renderAboutDiff();
  // Images
  renderImages();
  // Inquiries
  renderInquiries();
}

function setVal(id, val) { const el = document.getElementById(id); if (el) el.value = val || ''; }

// ── Company Save ──
document.getElementById('form-company').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    await api('PATCH', '/api/admin/content/company', {
      name: gv('c-name'), email: gv('c-email'), phone: gv('c-phone'),
      whatsappNumber: gv('c-whatsapp'), address: gv('c-address'),
      socialLinks: { linkedin: gv('c-linkedin'), instagram: gv('c-instagram') }
    });
    toast('Company info saved!');
  } catch (e) { toast('Save failed', true); }
});

// ── Hero Save ──
document.getElementById('form-hero').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    await api('PATCH', '/api/admin/content/company', {
      heroBadge: gv('h-badge'), tagline: gv('h-tagline'),
      heroSubtitle: gv('h-subtitle'), mission: gv('h-mission')
    });
    toast('Hero content saved!');
  } catch (e) { toast('Save failed', true); }
});

// ── Stats ──
function renderStats() {
  const stats = siteContent.stats || [];
  document.getElementById('stats-editor').innerHTML = stats.map((s, i) => `
    <div class="edit-item"><div class="edit-item__header"><span class="edit-item__title">Stat ${i+1}</span><button class="del-btn" onclick="delStat(${i})">Delete</button></div>
    <div class="edit-item__row"><div class="field"><label>Value</label><input id="stat-val-${i}" value="${s.value}"></div><div class="field"><label>Label</label><input id="stat-lbl-${i}" value="${s.label}"></div></div></div>
  `).join('');
}
function addStat() { siteContent.stats = siteContent.stats || []; siteContent.stats.push({value:'0',label:'New Stat'}); renderStats(); }
function delStat(i) { siteContent.stats.splice(i, 1); renderStats(); }
async function saveStats() {
  const stats = (siteContent.stats || []).map((_, i) => ({ value: gv(`stat-val-${i}`), label: gv(`stat-lbl-${i}`) }));
  try { await api('PUT', '/api/admin/content/stats', stats); siteContent.stats = stats; toast('Stats saved!'); } catch(e) { toast('Failed',true); }
}

// ── Certifications ──
function renderCerts() {
  const certs = siteContent.certifications || [];
  document.getElementById('cert-editor').innerHTML = certs.map((c, i) => `
    <div class="edit-item"><div class="edit-item__header"><span class="edit-item__title">${c.name}</span><button class="del-btn" onclick="delCert(${i})">Delete</button></div>
    <div class="edit-item__fields">
      <div class="edit-item__row"><div class="field"><label>Name</label><input id="cert-name-${i}" value="${c.name}"></div><div class="field"><label>Issuer</label><input id="cert-issuer-${i}" value="${c.issuer}"></div></div>
      <div class="edit-item__row"><div class="field"><label>Validity</label><input id="cert-validity-${i}" value="${c.validity}"></div><div class="field"><label>Status</label><input id="cert-status-${i}" value="${c.status}"></div></div>
      <div class="field"><label>Description</label><textarea id="cert-desc-${i}" rows="3">${c.description}</textarea></div>
    </div></div>
  `).join('');
}
function addCert() { siteContent.certifications = siteContent.certifications||[]; siteContent.certifications.push({id:'new',name:'New Cert',issuer:'',validity:'',status:'Active',description:''}); renderCerts(); }
function delCert(i) { siteContent.certifications.splice(i,1); renderCerts(); }
async function saveCerts() {
  const certs = (siteContent.certifications||[]).map((_,i) => ({
    id: gv(`cert-name-${i}`).toLowerCase().replace(/\s/g,'-'), name: gv(`cert-name-${i}`), issuer: gv(`cert-issuer-${i}`),
    validity: gv(`cert-validity-${i}`), status: gv(`cert-status-${i}`), description: gv(`cert-desc-${i}`), image: ''
  }));
  try { await api('PUT','/api/admin/content/certifications',certs); siteContent.certifications=certs; toast('Certifications saved!'); } catch(e) { toast('Failed',true); }
}

// ── LC Payment ──
document.getElementById('form-lc').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    await api('PUT', '/api/admin/content/lcPayment', { title: gv('lc-title'), description: gv('lc-desc'), features: gv('lc-features').split('\n').filter(x=>x.trim()) });
    toast('LC Payment saved!');
  } catch(e) { toast('Failed',true); }
});

// ── How We Work ──
function renderHWW() {
  const steps = siteContent.howWeWork?.steps || [];
  document.getElementById('hww-editor').innerHTML = steps.map((s,i) => `
    <div class="edit-item"><div class="edit-item__header"><span class="edit-item__title">Step ${s.number}</span><button class="del-btn" onclick="delHWW(${i})">Delete</button></div>
    <div class="edit-item__fields"><div class="edit-item__row"><div class="field"><label>Number</label><input id="hww-num-${i}" value="${s.number}"></div><div class="field"><label>Title</label><input id="hww-title-${i}" value="${s.title}"></div></div>
    <div class="field"><label>Description</label><textarea id="hww-desc-${i}" rows="2">${s.description}</textarea></div></div></div>
  `).join('');
}
function addHWWStep() { if(!siteContent.howWeWork)siteContent.howWeWork={title:'How We Work',steps:[]}; siteContent.howWeWork.steps.push({number:String(siteContent.howWeWork.steps.length+1).padStart(2,'0'),title:'New Step',description:''}); renderHWW(); }
function delHWW(i) { siteContent.howWeWork.steps.splice(i,1); renderHWW(); }
async function saveHWW() {
  const steps = (siteContent.howWeWork?.steps||[]).map((_,i) => ({ number:gv(`hww-num-${i}`), title:gv(`hww-title-${i}`), description:gv(`hww-desc-${i}`) }));
  try { await api('PUT','/api/admin/content/howWeWork',{title:siteContent.howWeWork?.title||'How We Work',steps}); toast('Steps saved!'); } catch(e) { toast('Failed',true); }
}

// ── FAQs ──
function renderFAQs() {
  const faqs = siteContent.faqs || [];
  document.getElementById('faq-editor').innerHTML = faqs.map((f,i) => `
    <div class="edit-item"><div class="edit-item__header"><span class="edit-item__title">FAQ ${i+1}</span><button class="del-btn" onclick="delFAQ(${i})">Delete</button></div>
    <div class="edit-item__fields"><div class="field"><label>Question</label><input id="faq-q-${i}" value="${esc(f.question)}"></div>
    <div class="field"><label>Answer</label><textarea id="faq-a-${i}" rows="3">${esc(f.answer)}</textarea></div></div></div>
  `).join('');
}
function addFAQ() { siteContent.faqs=siteContent.faqs||[]; siteContent.faqs.push({question:'New question?',answer:'Answer here.'}); renderFAQs(); }
function delFAQ(i) { siteContent.faqs.splice(i,1); renderFAQs(); }
async function saveFAQs() {
  const faqs = (siteContent.faqs||[]).map((_,i) => ({ question:gv(`faq-q-${i}`), answer:gv(`faq-a-${i}`) }));
  try { await api('PUT','/api/admin/content/faqs',faqs); siteContent.faqs=faqs; toast('FAQs saved!'); } catch(e) { toast('Failed',true); }
}

// ── Solutions ──
function renderSolutions() {
  const sols = siteContent.solutions || [];
  document.getElementById('solutions-editor').innerHTML = sols.map((s,si) => `
    <div class="edit-item" style="margin-bottom:24px;">
      <h3 style="font-size:16px;font-weight:700;margin-bottom:12px;">${s.badge}</h3>
      <div class="field" style="margin-bottom:12px;"><label>Title</label><input id="sol-title-${si}" value="${s.title}"></div>
      <div class="field" style="margin-bottom:12px;"><label>Description</label><textarea id="sol-desc-${si}" rows="2">${s.description}</textarea></div>
      <h4 style="font-size:13px;font-weight:600;color:#64748b;margin:12px 0 8px;">Challenges</h4>
      ${s.challenges.map((c,ci) => `<div class="edit-item__row" style="margin-bottom:6px;">
        <div class="field"><label>Title</label><input id="sol-ch-t-${si}-${ci}" value="${c.title}"></div>
        <div class="field"><label>Text</label><input id="sol-ch-x-${si}-${ci}" value="${esc(c.text)}"></div>
      </div>`).join('')}
      <h4 style="font-size:13px;font-weight:600;color:#64748b;margin:12px 0 8px;">Solution Points</h4>
      ${s.solutionPoints.map((p,pi) => `<div class="edit-item__row" style="margin-bottom:6px;">
        <div class="field"><label>Title</label><input id="sol-sp-t-${si}-${pi}" value="${p.title}"></div>
        <div class="field"><label>Text</label><input id="sol-sp-x-${si}-${pi}" value="${esc(p.text)}"></div>
      </div>`).join('')}
    </div>
  `).join('');
}
async function saveSolutions() {
  const sols = (siteContent.solutions||[]).map((s,si) => ({
    ...s, title:gv(`sol-title-${si}`), description:gv(`sol-desc-${si}`),
    challenges:s.challenges.map((c,ci) => ({...c,title:gv(`sol-ch-t-${si}-${ci}`),text:gv(`sol-ch-x-${si}-${ci}`)})),
    solutionPoints:s.solutionPoints.map((p,pi) => ({...p,title:gv(`sol-sp-t-${si}-${pi}`),text:gv(`sol-sp-x-${si}-${pi}`)}))
  }));
  try { await api('PUT','/api/admin/content/solutions',sols); siteContent.solutions=sols; toast('Solutions saved!'); } catch(e) { toast('Failed',true); }
}

// ── Products ──
let currentProductTab = 'tableware';
function showProductTab(cat) {
  currentProductTab = cat;
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.textContent.toLowerCase() === cat));
  const prods = productsData[cat] || [];
  document.getElementById('products-editor').innerHTML = prods.map((p,i) => `
    <div class="edit-item"><div class="edit-item__header"><span class="edit-item__title">${p.name}</span><button class="del-btn" onclick="delProduct('${cat}',${i})">Delete</button></div>
    <div class="edit-item__fields">
      <div class="edit-item__row"><div class="field"><label>Name</label><input id="p-name-${i}" value="${p.name}"></div><div class="field"><label>ID</label><input id="p-id-${i}" value="${p.id}"></div></div>
      <div class="field"><label>Description</label><textarea id="p-desc-${i}" rows="2">${p.description}</textarea></div>
      <div class="edit-item__row"><div class="field"><label>Category</label><input id="p-cat-${i}" value="${p.category}"></div><div class="field"><label>Subcategory</label><input id="p-sub-${i}" value="${p.subcategory}"></div></div>
      <div class="field"><label>Image URL</label><input id="p-img-${i}" value="${p.image||''}"></div>
      <button class="save-btn" onclick="saveProduct('${cat}',${i})" style="margin-top:8px;">Save This Product</button>
    </div></div>
  `).join('');
}
async function saveProduct(cat,i) {
  const p = productsData[cat][i];
  const updated = {...p, name:gv(`p-name-${i}`), id:gv(`p-id-${i}`), description:gv(`p-desc-${i}`), category:gv(`p-cat-${i}`), subcategory:gv(`p-sub-${i}`), image:gv(`p-img-${i}`) };
  try { 
    if (p._isNew) {
      delete updated._isNew;
      await api('POST',`/api/admin/products/${cat}`,updated); 
    } else {
      await api('PUT',`/api/admin/products/${cat}/${p.id}`,updated); 
    }
    productsData[cat][i]=updated; 
    toast('Product saved!'); 
    showProductTab(cat);
  } catch(e) { toast('Failed',true); }
}
function delProduct(cat,i) { 
  if(!confirm('Delete this product?'))return; 
  const p = productsData[cat][i];
  if (p._isNew) {
    productsData[cat].splice(i,1);
    showProductTab(cat);
    return;
  }
  api('DELETE',`/api/admin/products/${cat}/${p.id}`).then(()=>{
    productsData[cat].splice(i,1);
    toast('Deleted');
    showProductTab(cat);
  }).catch(e => toast('Delete failed', true)); 
}
function addProduct() {
  const cat = currentProductTab;
  if (!productsData[cat]) productsData[cat] = [];
  productsData[cat].unshift({ id: 'new-product-' + Date.now(), name: 'New Product', description: '', category: cat, subcategory: '', image: '', _isNew: true });
  showProductTab(cat);
}

// ── Private Label ──
function renderPLFeatures() {
  const feats = siteContent.privateLabelFeatures || [];
  document.getElementById('pl-editor').innerHTML = feats.map((f,i) => `
    <div class="edit-item"><div class="edit-item__fields">
      <div class="edit-item__row"><div class="field"><label>Title</label><input id="pl-t-${i}" value="${f.title}"></div><div class="field"><label>Icon (print/stamp/palette)</label><input id="pl-i-${i}" value="${f.icon}"></div></div>
      <div class="field"><label>Description</label><textarea id="pl-d-${i}" rows="2">${f.description}</textarea></div>
    </div></div>
  `).join('');
}
async function savePLFeatures() {
  const feats = (siteContent.privateLabelFeatures||[]).map((_,i) => ({title:gv(`pl-t-${i}`),icon:gv(`pl-i-${i}`),description:gv(`pl-d-${i}`)}));
  try { await api('PUT','/api/admin/content/privateLabelFeatures',feats); toast('Saved!'); } catch(e) { toast('Failed',true); }
}

// ── MOQ ──
function renderMOQ() {
  const rows = siteContent.moqTable || [];
  document.getElementById('moq-editor').innerHTML = rows.map((r,i) => `
    <div class="edit-item"><div class="edit-item__header"><span class="edit-item__title">Row ${i+1}</span><button class="del-btn" onclick="delMOQ(${i})">Delete</button></div>
    <div class="edit-item__row"><div class="field"><label>Product</label><input id="moq-p-${i}" value="${r.product}"></div><div class="field"><label>Method</label><input id="moq-m-${i}" value="${r.method}"></div></div>
    <div class="edit-item__row"><div class="field"><label>MOQ</label><input id="moq-q-${i}" value="${r.moq}"></div><div class="field"><label>Lead Time</label><input id="moq-l-${i}" value="${r.leadTime}"></div></div></div>
  `).join('');
}
function addMOQ() { siteContent.moqTable=siteContent.moqTable||[]; siteContent.moqTable.push({product:'',method:'',moq:'',leadTime:''}); renderMOQ(); }
function delMOQ(i) { siteContent.moqTable.splice(i,1); renderMOQ(); }
async function saveMOQ() {
  const rows = (siteContent.moqTable||[]).map((_,i) => ({product:gv(`moq-p-${i}`),method:gv(`moq-m-${i}`),moq:gv(`moq-q-${i}`),leadTime:gv(`moq-l-${i}`)}));
  try { await api('PUT','/api/admin/content/moqTable',rows); toast('MOQ saved!'); } catch(e) { toast('Failed',true); }
}

// ── Traceability ──
function renderTraceSteps() {
  const steps = siteContent.traceabilitySteps || [];
  document.getElementById('trace-editor').innerHTML = steps.map((s,i) => `
    <div class="edit-item"><div class="edit-item__header"><span class="edit-item__title">Step ${s.number}</span><button class="del-btn" onclick="delTrace(${i})">Delete</button></div>
    <div class="edit-item__fields"><div class="edit-item__row"><div class="field"><label>Number</label><input id="tr-n-${i}" value="${s.number}"></div><div class="field"><label>Title</label><input id="tr-t-${i}" value="${s.title}"></div></div>
    <div class="field"><label>Description</label><textarea id="tr-d-${i}" rows="2">${s.description}</textarea></div></div></div>
  `).join('');
}
function addTraceStep() { siteContent.traceabilitySteps=siteContent.traceabilitySteps||[]; siteContent.traceabilitySteps.push({number:String(siteContent.traceabilitySteps.length+1).padStart(2,'0'),title:'New Step',description:''}); renderTraceSteps(); }
function delTrace(i) { siteContent.traceabilitySteps.splice(i,1); renderTraceSteps(); }
async function saveTraceSteps() {
  const steps = (siteContent.traceabilitySteps||[]).map((_,i) => ({number:gv(`tr-n-${i}`),title:gv(`tr-t-${i}`),description:gv(`tr-d-${i}`)}));
  try { await api('PUT','/api/admin/content/traceabilitySteps',steps); toast('Traceability saved!'); } catch(e) { toast('Failed',true); }
}

// ── About Differentiators ──
function renderAboutDiff() {
  const diffs = siteContent.aboutDifferentiators || [];
  document.getElementById('about-editor').innerHTML = diffs.map((d,i) => `
    <div class="edit-item"><div class="edit-item__fields">
      <div class="edit-item__row"><div class="field"><label>Title</label><input id="ad-t-${i}" value="${d.title}"></div><div class="field"><label>Icon (shield/globe/edit)</label><input id="ad-i-${i}" value="${d.icon}"></div></div>
      <div class="field"><label>Description</label><textarea id="ad-d-${i}" rows="2">${d.description}</textarea></div>
    </div></div>
  `).join('');
}
async function saveAboutDiff() {
  const diffs = (siteContent.aboutDifferentiators||[]).map((_,i) => ({title:gv(`ad-t-${i}`),icon:gv(`ad-i-${i}`),description:gv(`ad-d-${i}`)}));
  try { await api('PUT','/api/admin/content/aboutDifferentiators',diffs); toast('About saved!'); } catch(e) { toast('Failed',true); }
}

// ── Images ──
async function uploadImage() {
  const input = document.getElementById('img-upload');
  if (!input.files[0]) return;
  const formData = new FormData();
  formData.append('image', input.files[0]);
  try {
    const res = await fetch(apiUrl('/api/admin/upload'), { method:'POST', headers:{'x-admin-token':TOKEN}, body:formData });
    const data = await res.json();
    if (data.success) { toast('Image uploaded!'); input.value=''; renderImages(); }
  } catch(e) { toast('Upload failed',true); }
}
async function renderImages() {
  try {
    const res = await api('GET', '/api/admin/uploads');
    const files = res.files || [];
    
    // Show uploaded images
    document.getElementById('uploaded-images').innerHTML = files.map(f => `
      <div class="img-card" style="border:1px solid #e2e8f0;padding:8px;border-radius:8px;text-align:center;">
        <img src="/assets/uploads/${f}" style="max-width:100%;height:80px;object-fit:cover;margin-bottom:8px;border-radius:4px;">
        <div style="font-size:11px;word-break:break-all;margin-bottom:4px;color:#64748b;">${f}</div>
        <input type="text" value="/assets/uploads/${f}" style="width:100%;font-size:11px;padding:4px;border:1px solid #e2e8f0;border-radius:4px;" readonly onclick="this.select()">
      </div>
    `).join('');

    // List known image assignments
    const imgs = siteContent.images || { logoLight: '', logoDark: '', heroBg: '' };
    if (!imgs.logoLight) imgs.logoLight = '/assets/logo_light.png';
    if (!imgs.logoDark) imgs.logoDark = '/assets/logo_dark.png';
    delete imgs.logo; // Remove old generic logo
    const assignments = Object.entries(imgs);
    document.getElementById('image-assignments').innerHTML = `
      <p style="font-size:13px;color:#64748b;margin-bottom:12px;">Set image URLs for site placeholders. Copy an uploaded URL above and paste it here.</p>
      ${Object.keys(imgs).map(k => `
        <div class="field" style="margin-bottom:8px;"><label>${k}</label><input id="img-${k}" value="${imgs[k]||''}" placeholder="/assets/uploads/filename.jpg">
        <button class="save-btn" style="margin-top:4px;font-size:12px;padding:6px 14px;" onclick="saveImageRef('${k}')">Save</button></div>
      `).join('')}
      <div style="margin-top:16px;">
        <input id="new-img-key" placeholder="New placeholder name (e.g. footerLogo)" style="padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;margin-right:8px;width:200px;">
        <button class="add-btn" onclick="addNewImageRef()">+ Add Placeholder</button>
      </div>
    `;
  } catch(e) {}
}

async function addNewImageRef() {
  const key = document.getElementById('new-img-key').value.trim();
  if (!key) return;
  if (!siteContent.images) siteContent.images = {};
  if (siteContent.images[key] !== undefined) return toast('Key already exists', true);
  siteContent.images[key] = '';
  renderImages();
}
async function saveImageRef(key) {
  const url = gv(`img-${key}`);
  try {
    await api('PUT', `/api/admin/images/${key}`, {key, url});
    siteContent.images[key] = url;
    toast('Image reference saved!');
  } catch(e) { toast('Failed',true); }
}

// ── Inquiries ──
async function renderInquiries() {
  const container = document.getElementById('inquiries-container');
  if (!container) return;
  try {
    const res = await api('GET', '/api/admin/inquiries');
    const inqs = res.inquiries || [];
    if (inqs.length === 0) {
      container.innerHTML = '<p style="color:#64748b;font-size:14px;">No inquiries found.</p>';
      return;
    }
    container.innerHTML = inqs.map(i => `
      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:16px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:12px;border-bottom:1px solid #f1f5f9;padding-bottom:12px;">
          <div>
            <span style="font-weight:600;font-size:15px;color:#0f172a;">${esc(i.name)}</span>
            <span style="color:#64748b;margin-left:8px;font-size:13px;">${i.type.toUpperCase()}</span>
          </div>
          <div style="color:#64748b;font-size:12px;">${new Date(i.timestamp).toLocaleString()}</div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px;margin-bottom:12px;">
          <div><strong>Email:</strong> <a href="mailto:${esc(i.email)}" style="color:#2563eb;text-decoration:none;">${esc(i.email)}</a></div>
          <div><strong>Phone:</strong> ${esc(i.phone || 'N/A')}</div>
          <div><strong>Company:</strong> ${esc(i.company || 'N/A')}</div>
          <div><strong>Country:</strong> ${esc(i.country || 'N/A')}</div>
          ${i.quantity ? `<div><strong>Quantity:</strong> ${esc(i.quantity)}</div>` : ''}
          ${i.inquiry_type ? `<div><strong>Inquiry Type:</strong> ${esc(i.inquiry_type)}</div>` : ''}
          ${i.product_interest ? `<div><strong>Product:</strong> ${esc(i.product_interest)}</div>` : ''}
        </div>
        ${i.message || i.details ? `
          <div style="background:#f8fafc;padding:12px;border-radius:6px;font-size:13px;color:#334155;white-space:pre-wrap;"><strong>Message:</strong>\n${esc(i.message || i.details)}</div>
        ` : ''}
      </div>
    `).join('');
  } catch(e) {
    container.innerHTML = '<p style="color:#ef4444;font-size:14px;">Failed to load inquiries.</p>';
  }
}

// ── Helpers ──
function gv(id) { const el = document.getElementById(id); return el ? el.value : ''; }
function esc(str) { return (str||'').replace(/"/g, '&quot;'); }
