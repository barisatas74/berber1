/* ============================================================
   AUTH CHECK
   ============================================================ */
const auth = JSON.parse(sessionStorage.getItem('kb_auth') || 'null');
if (!auth) window.location.href = 'login.html';

/* ============================================================
   STORAGE LAYER — localStorage persistence
   ============================================================ */
const SK = { appts:'kb_appts', services:'kb_services', staff:'kb_staff', users:'kb_users', settings:'kb_settings', theme:'kb_theme' };

function load(key)        { try { return JSON.parse(localStorage.getItem(key)); } catch{ return null; } }
function save(key, data)  { localStorage.setItem(key, JSON.stringify(data)); }

/* ============================================================
   SEED DATA (first run only)
   ============================================================ */
const DEFAULT_SERVICES = [
  { id:1, name:'Saç Kesimi',          price:150, duration:30, icon:'✂',  desc:'Yüz şekline özel modern ve klasik kesimler.',     active:true  },
  { id:2, name:'Ustura Tıraşı',       price:200, duration:45, icon:'🪒', desc:'Geleneksel ustura ile sıcak havlu ritüeli.',       active:true  },
  { id:3, name:'Saç + Sakal Paketi',  price:300, duration:60, icon:'👑', desc:'Saç kesimi ve sakal düzeltmesi tek seansta.',      active:true  },
  { id:4, name:'Sakal Şekillendirme', price:120, duration:20, icon:'💈', desc:'Hassas el işçiliğiyle istediğiniz form.',          active:true  },
  { id:5, name:'Saç Bakımı & Boya',   price:350, duration:90, icon:'✨', desc:'Doğal görünümlü renk ve bakım uygulamaları.',     active:true  },
  { id:6, name:'Kafa Masajı',         price:100, duration:20, icon:'💆', desc:'Stres atın, saç derinizi canlandıran masaj.',      active:false },
];

const DEFAULT_STAFF = [
  { id:1, name:'Mehmet Yıldız', title:'Baş Berber Ustası', phone:'05321112233', exp:18, spec:['Fade','Ustura','Sakal'], days:[1,2,3,4,5,6], appts:412, rating:4.9 },
  { id:2, name:'Ali Demir',     title:'Berber Ustası',     phone:'05433334455', exp:10, spec:['Klasik Kesim','Boya'],   days:[1,2,3,4,5],   appts:278, rating:4.7 },
  { id:3, name:'Kemal Arslan',  title:'Berber',            phone:'05544445566', exp:5,  spec:['Modern','Sakal'],        days:[2,3,4,5,6],   appts:195, rating:4.8 },
  { id:4, name:'Can Öztürk',    title:'Berber',            phone:'05655556677', exp:3,  spec:['Fade','Klasik'],         days:[1,3,4,5,6],   appts:120, rating:4.6 },
];

const DEFAULT_USERS = [
  { id:1, username:'admin',   password:'1234',    name:'Mehmet Usta', role:'superadmin', active:true },
  { id:2, username:'berber1', password:'pass123', name:'Ali Usta',    role:'staff',      active:true },
];

function seedAppointments(services, staff) {
  const names   = ['Kadir Aydın','Murat Erdoğan','Burak Kaya','Serkan Çelik','Emre Doğan','Hakan Şahin','Ozan Yıldırım','Tolga Kurt','Baran Demir','Cem Aksoy','Alp Güven','Sinan Yılmaz','Fatih Bozkurt','Deniz Korkmaz','Metin Şen'];
  const statuses= ['bekliyor','onaylandı','tamamlandı','iptal'];
  const times   = ['09:00','09:30','10:00','10:30','11:00','13:00','14:00','15:00','16:00','17:00'];
  const now     = new Date();
  const appts   = [];
  for (let i = 1; i <= 40; i++) {
    const d   = new Date(now); d.setDate(d.getDate() + Math.floor(Math.random()*14) - 7);
    const svc = services[Math.floor(Math.random()*services.length)];
    const stf = staff[Math.floor(Math.random()*staff.length)];
    appts.push({ id:i, name:names[Math.floor(Math.random()*names.length)], phone:`05${String(Math.floor(Math.random()*9e8+1e8))}`,
      service:svc.name, price:svc.price, barber:stf.name,
      date:d.toISOString().split('T')[0], time:times[Math.floor(Math.random()*times.length)],
      status:statuses[Math.floor(Math.random()*statuses.length)], note:'' });
  }
  const today_ = now.toISOString().split('T')[0];
  for (let i = 0; i < 4; i++) { appts[i].date = today_; appts[i].status = i < 2 ? 'onaylandı' : 'bekliyor'; }
  return appts.sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
}

// Load or seed
let SERVICES = load(SK.services) || DEFAULT_SERVICES;
let STAFF    = load(SK.staff)    || DEFAULT_STAFF;
let USERS    = load(SK.users)    || DEFAULT_USERS;
let appointments = (() => {
  // Merge site form submissions + existing admin data
  const admin  = load(SK.appts);
  const fromSite = load('kb_site_appointments') || [];
  if (admin) {
    // Append any new site submissions not yet in admin list
    const ids = new Set(admin.map(a => a._siteId).filter(Boolean));
    const newFromSite = fromSite.filter(a => !ids.has(a._siteId));
    const merged = [...admin, ...newFromSite];
    if (newFromSite.length) save(SK.appts, merged);
    return merged;
  }
  const seeded = seedAppointments(SERVICES, STAFF);
  const all    = [...seeded, ...fromSite];
  save(SK.appts, all);
  return all;
})();
let nextId = Math.max(0, ...appointments.map(a=>a.id)) + 1;

function persistAppts()    { save(SK.appts, appointments); }
function persistServices() { save(SK.services, SERVICES); }
function persistStaff()    { save(SK.staff, STAFF); }
function persistUsers()    { save(SK.users, USERS); }

const DAYS_TR = ['Paz','Pzt','Sal','Çar','Per','Cum','Cmt'];

/* ============================================================
   THEME
   ============================================================ */
let currentTheme = load(SK.theme) || 'dark';
function applyTheme(t) {
  document.body.classList.toggle('light-theme', t === 'light');
  const btn = document.getElementById('themeToggle');
  if (btn) btn.textContent = t === 'light' ? '🌙' : '☀️';
  currentTheme = t;
  save(SK.theme, t);
}
applyTheme(currentTheme);

/* ============================================================
   HELPERS
   ============================================================ */
function toast(msg, type='') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show' + (type ? ' toast--'+type : '');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 3000);
}

function badge(status) {
  const map = { bekliyor:'pending', onaylandı:'confirmed', tamamlandı:'done', iptal:'cancel' };
  const lbl = { bekliyor:'⏳ Bekliyor', onaylandı:'✔ Onaylandı', tamamlandı:'● Tamamlandı', iptal:'✕ İptal' };
  return `<span class="badge badge--${map[status]||'pending'}">${lbl[status]||status}</span>`;
}

function initials(name) { return (name||'').split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2); }
function fmt(date) { if(!date) return ''; const [y,m,d]=date.split('-'); return `${d}.${m}.${y}`; }
function today() { return new Date().toISOString().split('T')[0]; }

/* ============================================================
   CONFLICT CHECK
   ============================================================ */
function checkConflict(barber, date, time, excludeId=null) {
  return appointments.some(a =>
    a.barber === barber && a.date === date && a.time === time &&
    a.status !== 'iptal' && a.id !== excludeId
  );
}

/* ============================================================
   USER INFO
   ============================================================ */
document.getElementById('sidebarName').textContent    = auth.name;
document.getElementById('sidebarRole').textContent    = auth.role === 'superadmin' ? 'Süper Admin' : 'Personel';
document.getElementById('topbarName').textContent     = auth.name;
document.getElementById('userAvatarSide').textContent = initials(auth.name);
document.getElementById('userAvatarTop').textContent  = initials(auth.name);
const greets = ['Bugün harika bir gün!','Başarılı bir gün dileriz!','Hadi başlayalım!','Yoğun bir gün sizi bekliyor.'];
document.getElementById('dashGreeting').textContent   = `${auth.name} — ${greets[Math.floor(Math.random()*greets.length)]}`;

/* ============================================================
   NAVIGATION
   ============================================================ */
const navItems  = document.querySelectorAll('.nav-item[data-page]');
const pages     = document.querySelectorAll('.page');
const pageTitle = document.getElementById('pageTitle');
const pageTitles = { dashboard:'Dashboard', appointments:'Randevular', customers:'Müşteriler', services:'Hizmetler', staff:'Personel', calendar:'Takvim', reports:'Raporlar', users:'Kullanıcılar', settings:'Ayarlar' };

function navigate(page) {
  navItems.forEach(n => n.classList.toggle('active', n.dataset.page === page));
  pages.forEach(p => p.classList.toggle('active', p.id === `page-${page}`));
  pageTitle.textContent = pageTitles[page] || page;
  document.getElementById('sidebar').classList.remove('open');
  const fns = { dashboard:renderDashboard, appointments:renderAppointments, customers:renderCustomers, services:renderServices, staff:renderStaff, calendar:renderCalendar, reports:renderReports, users:renderUsers, settings:renderSettings };
  if (fns[page]) fns[page]();
}

navItems.forEach(item => item.addEventListener('click', e => { e.preventDefault(); navigate(item.dataset.page); }));
document.addEventListener('click', e => {
  const link = e.target.closest('[data-page]');
  if (link && !link.classList.contains('nav-item')) { e.preventDefault(); navigate(link.dataset.page); }
});

/* ============================================================
   SIDEBAR / TOPBAR
   ============================================================ */
document.getElementById('sidebarToggle').addEventListener('click', () => document.getElementById('sidebar').classList.toggle('open'));

const dropdown = document.getElementById('userDropdown');
document.getElementById('topbarUser').addEventListener('click', e => { e.stopPropagation(); dropdown.classList.toggle('show'); });
document.addEventListener('click', () => dropdown.classList.remove('show'));
document.getElementById('logoutBtn').addEventListener('click', e => { e.preventDefault(); sessionStorage.removeItem('kb_auth'); window.location.href='login.html'; });

document.getElementById('themeToggle').addEventListener('click', () => applyTheme(currentTheme==='dark'?'light':'dark'));

/* ============================================================
   MODALS
   ============================================================ */
function openModal(id)  { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
document.querySelectorAll('[data-close]').forEach(btn => btn.addEventListener('click', () => closeModal(btn.dataset.close)));
document.querySelectorAll('.modal-overlay').forEach(ov => ov.addEventListener('click', e => { if(e.target===ov) ov.classList.remove('open'); }));

/* ============================================================
   PENDING BADGE
   ============================================================ */
function updatePendingBadge() {
  const n = appointments.filter(a=>a.status==='bekliyor').length;
  const b = document.getElementById('pendingBadge');
  b.textContent = n; b.style.display = n ? '' : 'none';
  document.getElementById('notifDot').classList.toggle('show', n>0);
}

/* ============================================================
   DASHBOARD
   ============================================================ */
function renderDashboard() {
  const total   = appointments.length;
  const pending = appointments.filter(a=>a.status==='bekliyor').length;
  const done    = appointments.filter(a=>a.status==='tamamlandı').length;
  const revenue = appointments.filter(a=>a.status==='tamamlandı').reduce((s,a)=>s+a.price,0);
  document.getElementById('kpiTotal').textContent   = total;
  document.getElementById('kpiPending').textContent = pending;
  document.getElementById('kpiDone').textContent    = done;
  document.getElementById('kpiRevenue').textContent = `₺${revenue.toLocaleString('tr-TR')}`;

  const todayAppts = appointments.filter(a=>a.date===today()).sort((a,b)=>a.time.localeCompare(b.time));
  document.getElementById('todayCount').textContent = todayAppts.length;
  const todayList = document.getElementById('todayList');
  todayList.innerHTML = todayAppts.length
    ? todayAppts.map(a=>`<div class="today-item"><span class="today-item__time">${a.time}</span><span class="today-item__name">${a.name}</span><span class="today-item__service">${a.service}</span>${badge(a.status)}</div>`).join('')
    : '<div class="empty-state">Bugün randevu yok</div>';

  // Bar chart
  const days=[];
  for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const ds=d.toISOString().split('T')[0];days.push({label:DAYS_TR[d.getDay()],count:appointments.filter(a=>a.date===ds).length});}
  const maxB=Math.max(...days.map(d=>d.count),1);
  document.getElementById('barChart').innerHTML=days.map(d=>`<div class="bar-item"><span class="bar-item__val">${d.count}</span><div class="bar-item__fill" style="height:${Math.max(8,(d.count/maxB)*130)}px"></div><span class="bar-item__label">${d.label}</span></div>`).join('');

  // Donut
  const svcCount={};
  appointments.forEach(a=>{svcCount[a.service]=(svcCount[a.service]||0)+1;});
  const colors=['#c9a84c','#818cf8','#34d399','#fb923c','#f472b6','#60a5fa'];
  const entries=Object.entries(svcCount).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const totalC=entries.reduce((s,[,v])=>s+v,0);
  drawDonut(entries,colors,totalC);

  // Recent
  document.getElementById('recentList').innerHTML=[...appointments].reverse().slice(0,6).map(a=>`<div class="mini-row"><div class="user-avatar sm" style="font-size:.6rem">${initials(a.name)}</div><span class="mini-row__name">${a.name}</span><span class="mini-row__svc">${a.service}</span><span style="color:var(--text-3);font-size:.75rem">${fmt(a.date)}</span>${badge(a.status)}</div>`).join('');
}

function drawDonut(entries,colors,total) {
  const canvas=document.getElementById('donutChart');if(!canvas)return;
  const ctx=canvas.getContext('2d');const cx=90,cy=90,r=70,innerR=46;
  ctx.clearRect(0,0,180,180);
  let sa=-Math.PI/2;
  entries.forEach(([,count],i)=>{const slice=(count/total)*2*Math.PI;ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,r,sa,sa+slice);ctx.closePath();ctx.fillStyle=colors[i%colors.length];ctx.fill();sa+=slice;});
  ctx.beginPath();ctx.arc(cx,cy,innerR,0,2*Math.PI);ctx.fillStyle=currentTheme==='light'?'#f0ede8':'#1a1d24';ctx.fill();
  ctx.fillStyle=currentTheme==='light'?'#2c2c2c':'#e2e8f0';ctx.font='bold 18px Inter';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(total,cx,cy-6);
  ctx.font='10px Inter';ctx.fillStyle='#64748b';ctx.fillText('Randevu',cx,cy+10);
  document.getElementById('donutLegend').innerHTML=entries.map(([name,count],i)=>`<div class="legend-item"><div class="legend-dot" style="background:${colors[i%colors.length]}"></div><span>${name}</span><span>${((count/total)*100).toFixed(0)}%</span></div>`).join('');
}

/* ============================================================
   APPOINTMENTS — pagination + quick status + conflict
   ============================================================ */
let apptPage = 1;
const APPT_PAGE_SIZE = 10;

function populateServiceSelect(selId) {
  document.getElementById(selId).innerHTML = SERVICES.map(s=>`<option value="${s.name}">${s.name} — ₺${s.price}</option>`).join('');
}
function populateBarberSelect(selId) {
  document.getElementById(selId).innerHTML = STAFF.map(s=>`<option value="${s.name}">${s.name}</option>`).join('');
}

function renderAppointments() {
  const search = document.getElementById('apptSearch').value.toLowerCase();
  const status = document.getElementById('apptStatusFilter').value;
  const barber = document.getElementById('apptBarberFilter').value;
  const dateF  = document.getElementById('apptDateFilter').value;

  // Populate barber filter
  const barberSel = document.getElementById('apptBarberFilter');
  if (barberSel.options.length === 1) STAFF.forEach(s=>{ const o=new Option(s.name,s.name); barberSel.add(o); });

  let data = [...appointments];
  if (search) data = data.filter(a=>a.name.toLowerCase().includes(search)||a.service.toLowerCase().includes(search));
  if (status) data = data.filter(a=>a.status===status);
  if (barber) data = data.filter(a=>a.barber===barber);
  if (dateF)  data = data.filter(a=>a.date===dateF);
  data.sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));

  const totalPages = Math.ceil(data.length / APPT_PAGE_SIZE) || 1;
  if (apptPage > totalPages) apptPage = totalPages;
  const slice = data.slice((apptPage-1)*APPT_PAGE_SIZE, apptPage*APPT_PAGE_SIZE);

  const tbody = document.getElementById('apptBody');
  const empty = document.getElementById('apptEmpty');

  if (slice.length === 0) { tbody.innerHTML=''; empty.style.display=''; }
  else {
    empty.style.display='none';
    tbody.innerHTML = slice.map(a=>`
      <tr>
        <td style="color:var(--text-3)">#${a.id}</td>
        <td><div style="display:flex;align-items:center;gap:8px"><div class="user-avatar sm">${initials(a.name)}</div><div><div style="font-weight:600;color:var(--white-dyn)">${a.name}</div><div style="font-size:.72rem;color:var(--text-3)">${a.phone}</div></div></div></td>
        <td>${a.service}</td>
        <td>${a.barber}</td>
        <td><div style="font-weight:500">${fmt(a.date)}</div><div style="font-size:.75rem;color:var(--text-3)">${a.time}</div></td>
        <td style="color:var(--gold);font-weight:600">₺${a.price}</td>
        <td>${badge(a.status)}</td>
        <td>
          <div class="action-btns">
            ${a.status==='bekliyor'?`<button class="act-btn green" onclick="quickStatus(${a.id},'onaylandı')" title="Onayla">✔</button><button class="act-btn red" onclick="quickStatus(${a.id},'iptal')" title="İptal">✕</button>`:''}
            <button class="act-btn" onclick="editAppt(${a.id})">✏</button>
            <button class="act-btn red" onclick="deleteAppt(${a.id})">🗑</button>
          </div>
        </td>
      </tr>`).join('');
  }

  // Pagination
  renderPagination('apptPagination', apptPage, totalPages, p=>{ apptPage=p; renderAppointments(); });
  updatePendingBadge();
}

window.quickStatus = function(id, status) {
  const a = appointments.find(x=>x.id===id);
  if (!a) return;
  a.status = status;
  persistAppts();
  renderAppointments();
  toast(status==='onaylandı' ? '✔ Randevu onaylandı' : '✕ Randevu iptal edildi', status==='onaylandı'?'success':'');
};

function renderPagination(containerId, current, total, onPage) {
  const c = document.getElementById(containerId);
  if (!c) return;
  if (total <= 1) { c.innerHTML=''; return; }
  let html = `<button class="pg-btn" ${current===1?'disabled':''} onclick="(${onPage.toString()})(${current-1})">‹</button>`;
  for (let i=1;i<=total;i++) html+=`<button class="pg-btn${i===current?' active':''}" onclick="(${onPage.toString()})(${i})">${i}</button>`;
  html+=`<button class="pg-btn" ${current===total?'disabled':''} onclick="(${onPage.toString()})(${current+1})">›</button>`;
  c.innerHTML=html;
}

['apptSearch','apptStatusFilter','apptBarberFilter','apptDateFilter'].forEach(id=>{
  const el=document.getElementById(id);
  el.addEventListener('input',()=>{apptPage=1;renderAppointments();});
  el.addEventListener('change',()=>{apptPage=1;renderAppointments();});
});

document.getElementById('addApptBtn').addEventListener('click', () => {
  document.getElementById('apptModalTitle').textContent='Randevu Ekle';
  document.getElementById('apptId').value='';
  populateServiceSelect('m_service'); populateBarberSelect('m_barber');
  ['m_name','m_phone','m_note'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('m_date').value=today();
  document.getElementById('m_time').value='10:00';
  document.getElementById('m_status').value='bekliyor';
  openModal('apptModal');
});

document.getElementById('quickApptBtn').addEventListener('click', () => { navigate('appointments'); setTimeout(()=>document.getElementById('addApptBtn').click(),100); });

window.editAppt = function(id) {
  const a=appointments.find(x=>x.id===id); if(!a) return;
  document.getElementById('apptModalTitle').textContent='Randevu Düzenle';
  populateServiceSelect('m_service'); populateBarberSelect('m_barber');
  document.getElementById('apptId').value=a.id;
  document.getElementById('m_name').value=a.name;
  document.getElementById('m_phone').value=a.phone;
  document.getElementById('m_service').value=a.service;
  document.getElementById('m_barber').value=a.barber;
  document.getElementById('m_date').value=a.date;
  document.getElementById('m_time').value=a.time;
  document.getElementById('m_status').value=a.status;
  document.getElementById('m_note').value=a.note||'';
  openModal('apptModal');
};

document.getElementById('saveApptBtn').addEventListener('click', () => {
  const id     = document.getElementById('apptId').value;
  const name   = document.getElementById('m_name').value.trim();
  const phone  = document.getElementById('m_phone').value.trim();
  const service= document.getElementById('m_service').value;
  const barber = document.getElementById('m_barber').value;
  const date   = document.getElementById('m_date').value;
  const time   = document.getElementById('m_time').value;
  const status = document.getElementById('m_status').value;
  const note   = document.getElementById('m_note').value;
  if (!name||!phone||!service||!date) { toast('Lütfen zorunlu alanları doldurun.'); return; }

  // Conflict check
  if (status !== 'iptal' && checkConflict(barber, date, time, id ? +id : null)) {
    toast(`⚠ ${barber} bu saat için dolu!`); return;
  }

  const price = SERVICES.find(s=>s.name===service)?.price || 0;
  if (id) {
    const idx=appointments.findIndex(a=>a.id===+id);
    if(idx>-1) appointments[idx]={...appointments[idx],name,phone,service,barber,date,time,status,note,price};
    toast('Randevu güncellendi.','success');
  } else {
    appointments.push({id:nextId++,name,phone,service,barber,date,time,status,note,price});
    toast('Randevu eklendi.','success');
  }
  persistAppts(); closeModal('apptModal'); renderAppointments(); updatePendingBadge();
});

let confirmCallback = null;
window.deleteAppt = function(id) {
  document.getElementById('confirmMsg').textContent='Bu randevuyu silmek istediğinize emin misiniz?';
  confirmCallback=()=>{ appointments=appointments.filter(a=>a.id!==id); persistAppts(); closeModal('confirmModal'); renderAppointments(); toast('Randevu silindi.'); };
  openModal('confirmModal');
};
document.getElementById('confirmOkBtn').addEventListener('click', ()=>{ if(confirmCallback) confirmCallback(); });

/* ============================================================
   CUSTOMERS — with detail modal
   ============================================================ */
function renderCustomers() {
  const search = document.getElementById('custSearch').value.toLowerCase();
  const custMap={};
  appointments.forEach(a=>{
    if(!custMap[a.name]) custMap[a.name]={name:a.name,phone:a.phone,visits:0,lastVisit:'',spend:0};
    custMap[a.name].visits++;
    custMap[a.name].spend+=a.price;
    if(!custMap[a.name].lastVisit||a.date>custMap[a.name].lastVisit) custMap[a.name].lastVisit=a.date;
  });
  let customers=Object.values(custMap).sort((a,b)=>b.visits-a.visits);
  if(search) customers=customers.filter(c=>c.name.toLowerCase().includes(search)||c.phone.includes(search));

  document.getElementById('custBody').innerHTML=customers.map(c=>`
    <tr class="clickable-row" onclick="openCustomerDetail('${c.name.replace(/'/g,"\\'")}')">
      <td><div style="display:flex;align-items:center;gap:8px"><div class="user-avatar sm">${initials(c.name)}</div><span style="font-weight:600;color:var(--white-dyn)">${c.name}</span></div></td>
      <td>${c.phone}</td>
      <td style="text-align:center;font-weight:600">${c.visits}</td>
      <td>${fmt(c.lastVisit)}</td>
      <td style="color:var(--gold);font-weight:600">₺${c.spend.toLocaleString('tr-TR')}</td>
      <td><span class="badge badge--confirmed">Aktif</span></td>
    </tr>`).join('');
}

document.getElementById('custSearch').addEventListener('input', renderCustomers);

window.openCustomerDetail = function(name) {
  const appts = appointments.filter(a=>a.name===name).sort((a,b)=>(b.date+b.time).localeCompare(a.date+a.time));
  const total  = appts.reduce((s,a)=>s+a.price,0);
  document.getElementById('custDetailName').textContent   = name;
  document.getElementById('custDetailPhone').textContent  = appts[0]?.phone||'';
  document.getElementById('custDetailVisits').textContent = appts.length;
  document.getElementById('custDetailSpend').textContent  = `₺${total.toLocaleString('tr-TR')}`;
  document.getElementById('custDetailList').innerHTML = appts.map(a=>`
    <div class="mini-row">
      <span style="min-width:70px;color:var(--text-3);font-size:.78rem">${fmt(a.date)} ${a.time}</span>
      <span class="mini-row__name">${a.service}</span>
      <span style="color:var(--gold);font-weight:600">₺${a.price}</span>
      ${badge(a.status)}
    </div>`).join('');
  openModal('custDetailModal');
};

/* ============================================================
   SERVICES
   ============================================================ */
function renderServices() {
  document.getElementById('servicesGrid').innerHTML=SERVICES.map(s=>`
    <div class="svc-card">
      <div class="svc-card__top">
        <span class="svc-card__icon">${s.icon}</span>
        <div class="svc-card__actions">
          <button class="act-btn green" onclick="editService(${s.id})">✏</button>
          <button class="act-btn red" onclick="deleteService(${s.id})">🗑</button>
        </div>
      </div>
      <h3>${s.name}</h3><p>${s.desc}</p>
      <div class="svc-card__meta">
        <span class="svc-price">₺${s.price}</span>
        <span class="svc-duration">⏱ ${s.duration} dk</span>
        <span><span class="svc-status-dot ${s.active?'':'off'}"></span>${s.active?'Aktif':'Pasif'}</span>
      </div>
    </div>`).join('');
}

document.getElementById('addServiceBtn').addEventListener('click', ()=>{
  document.getElementById('serviceModalTitle').textContent='Hizmet Ekle';
  ['s_id','s_name','s_price','s_duration','s_icon','s_desc'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('s_active').checked=true;
  openModal('serviceModal');
});

window.editService = function(id) {
  const s=SERVICES.find(x=>x.id===id); if(!s) return;
  document.getElementById('serviceModalTitle').textContent='Hizmet Düzenle';
  document.getElementById('s_id').value=s.id; document.getElementById('s_name').value=s.name;
  document.getElementById('s_price').value=s.price; document.getElementById('s_duration').value=s.duration;
  document.getElementById('s_icon').value=s.icon; document.getElementById('s_desc').value=s.desc;
  document.getElementById('s_active').checked=s.active;
  openModal('serviceModal');
};

document.getElementById('saveServiceBtn').addEventListener('click', ()=>{
  const id=document.getElementById('s_id').value;
  const name=document.getElementById('s_name').value.trim();
  if(!name){toast('Hizmet adı zorunlu.');return;}
  const data={name,price:+document.getElementById('s_price').value,duration:+document.getElementById('s_duration').value,icon:document.getElementById('s_icon').value||'✂',desc:document.getElementById('s_desc').value,active:document.getElementById('s_active').checked};
  if(id){const idx=SERVICES.findIndex(s=>s.id===+id);if(idx>-1)Object.assign(SERVICES[idx],data);toast('Hizmet güncellendi.','success');}
  else{SERVICES.push({id:Math.max(0,...SERVICES.map(s=>s.id))+1,...data});toast('Hizmet eklendi.','success');}
  persistServices(); closeModal('serviceModal'); renderServices();
});

window.deleteService = function(id) {
  document.getElementById('confirmMsg').textContent='Bu hizmeti silmek istiyor musunuz?';
  confirmCallback=()=>{const idx=SERVICES.findIndex(s=>s.id===id);if(idx>-1)SERVICES.splice(idx,1);persistServices();closeModal('confirmModal');renderServices();toast('Hizmet silindi.');};
  openModal('confirmModal');
};

/* ============================================================
   STAFF — with search filter
   ============================================================ */
function renderStaff() {
  const search = (document.getElementById('staffSearch')?.value||'').toLowerCase();
  let list = STAFF;
  if (search) list = list.filter(s=>s.name.toLowerCase().includes(search)||s.title.toLowerCase().includes(search));

  document.getElementById('staffGrid').innerHTML = list.map(s=>`
    <div class="staff-card">
      <div class="staff-card__actions">
        <button class="act-btn green" onclick="editStaff(${s.id})">✏</button>
        <button class="act-btn red" onclick="deleteStaff(${s.id})">🗑</button>
      </div>
      <div class="staff-avatar">${initials(s.name)}</div>
      <h3>${s.name}</h3>
      <p class="staff-card__title">${s.title}</p>
      <div class="staff-tags">${s.spec.map(t=>`<span class="staff-tag">${t}</span>`).join('')}</div>
      <div class="staff-stats">
        <div class="staff-stat"><strong>${s.exp}</strong><span>Yıl</span></div>
        <div class="staff-stat"><strong>${appointments.filter(a=>a.barber===s.name).length}</strong><span>Randevu</span></div>
        <div class="staff-stat"><strong>${s.rating}</strong><span>Puan</span></div>
      </div>
    </div>`).join('');
}

document.getElementById('staffSearch')?.addEventListener('input', renderStaff);

document.getElementById('addStaffBtn').addEventListener('click', ()=>{
  document.getElementById('staffModalTitle').textContent='Personel Ekle';
  ['st_id','st_name','st_phone','st_title','st_exp','st_spec'].forEach(id=>document.getElementById(id).value='');
  renderDayPicker([]);
  openModal('staffModal');
});

function renderDayPicker(activeDays) {
  document.getElementById('dayPicker').innerHTML=DAYS_TR.map((d,i)=>`<button type="button" class="day-btn ${activeDays.includes(i)?'active':''}" data-day="${i}">${d}</button>`).join('');
  document.querySelectorAll('#dayPicker .day-btn').forEach(btn=>btn.addEventListener('click',()=>btn.classList.toggle('active')));
}

window.editStaff = function(id) {
  const s=STAFF.find(x=>x.id===id); if(!s) return;
  document.getElementById('staffModalTitle').textContent='Personel Düzenle';
  document.getElementById('st_id').value=s.id; document.getElementById('st_name').value=s.name;
  document.getElementById('st_phone').value=s.phone; document.getElementById('st_title').value=s.title;
  document.getElementById('st_exp').value=s.exp; document.getElementById('st_spec').value=s.spec.join(', ');
  renderDayPicker(s.days);
  openModal('staffModal');
};

document.getElementById('saveStaffBtn').addEventListener('click', ()=>{
  const id=document.getElementById('st_id').value;
  const name=document.getElementById('st_name').value.trim();
  if(!name){toast('Ad zorunlu.');return;}
  const days=[...document.querySelectorAll('#dayPicker .day-btn.active')].map(b=>+b.dataset.day);
  const data={name,phone:document.getElementById('st_phone').value,title:document.getElementById('st_title').value,exp:+document.getElementById('st_exp').value,spec:document.getElementById('st_spec').value.split(',').map(s=>s.trim()).filter(Boolean),days};
  if(id){const idx=STAFF.findIndex(s=>s.id===+id);if(idx>-1)Object.assign(STAFF[idx],data);toast('Personel güncellendi.','success');}
  else{STAFF.push({id:Math.max(0,...STAFF.map(s=>s.id))+1,appts:0,rating:5.0,...data});toast('Personel eklendi.','success');}
  persistStaff(); closeModal('staffModal'); renderStaff();
});

window.deleteStaff = function(id) {
  document.getElementById('confirmMsg').textContent='Bu personeli silmek istiyor musunuz?';
  confirmCallback=()=>{const idx=STAFF.findIndex(s=>s.id===id);if(idx>-1)STAFF.splice(idx,1);persistStaff();closeModal('confirmModal');renderStaff();toast('Personel silindi.');};
  openModal('confirmModal');
};

/* ============================================================
   CALENDAR VIEW
   ============================================================ */
let calYear, calMonth;

function renderCalendar() {
  const now = new Date();
  if (calYear===undefined) { calYear=now.getFullYear(); calMonth=now.getMonth(); }
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth+1, 0).getDate();
  const monthName = new Date(calYear, calMonth).toLocaleString('tr-TR',{month:'long',year:'numeric'});

  document.getElementById('calMonthLabel').textContent = monthName.charAt(0).toUpperCase()+monthName.slice(1);

  const todayStr = now.toISOString().split('T')[0];
  let cells = '';
  const startOffset = (firstDay+6)%7; // Mon start
  for(let i=0;i<startOffset;i++) cells+=`<div class="cal-cell cal-cell--empty"></div>`;
  for(let d=1;d<=daysInMonth;d++) {
    const ds=`${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const dayAppts=appointments.filter(a=>a.date===ds);
    const isToday=ds===todayStr;
    const pending=dayAppts.filter(a=>a.status==='bekliyor').length;
    const confirmed=dayAppts.filter(a=>a.status==='onaylandı').length;
    cells+=`<div class="cal-cell${isToday?' cal-cell--today':''}" onclick="openCalDay('${ds}')">
      <span class="cal-day">${d}</span>
      ${dayAppts.length?`<div class="cal-dots">
        ${pending?`<span class="cal-dot cal-dot--pending" title="${pending} bekliyor"></span>`:''}
        ${confirmed?`<span class="cal-dot cal-dot--confirmed" title="${confirmed} onaylı"></span>`:''}
        ${dayAppts.length-pending-confirmed>0?`<span class="cal-dot" title="${dayAppts.length-pending-confirmed} diğer"></span>`:''}
      </div><span class="cal-count">${dayAppts.length} randevu</span>`:''}
    </div>`;
  }
  document.getElementById('calGrid').innerHTML=cells;
}

window.openCalDay = function(dateStr) {
  const dayAppts = appointments.filter(a=>a.date===dateStr).sort((a,b)=>a.time.localeCompare(b.time));
  const d = new Date(dateStr); const label=d.toLocaleString('tr-TR',{day:'numeric',month:'long',year:'numeric'});
  document.getElementById('calDayTitle').textContent=label;
  document.getElementById('calDayList').innerHTML = dayAppts.length
    ? dayAppts.map(a=>`<div class="mini-row"><span style="min-width:42px;color:var(--gold);font-weight:700">${a.time}</span><div class="user-avatar sm" style="font-size:.6rem">${initials(a.name)}</div><span class="mini-row__name">${a.name}</span><span class="mini-row__svc">${a.service}</span>${badge(a.status)}</div>`).join('')
    : '<div class="empty-state">Bu gün randevu yok</div>';
  openModal('calDayModal');
};

document.getElementById('calPrev').addEventListener('click', ()=>{ calMonth--; if(calMonth<0){calMonth=11;calYear--;} renderCalendar(); });
document.getElementById('calNext').addEventListener('click', ()=>{ calMonth++; if(calMonth>11){calMonth=0;calYear++;} renderCalendar(); });

/* ============================================================
   REPORTS — with CSV export
   ============================================================ */
function renderReports() {
  const thisMonth=new Date().toISOString().slice(0,7);
  const monthAppts=appointments.filter(a=>a.date.startsWith(thisMonth));
  const monthRev=monthAppts.filter(a=>a.status==='tamamlandı').reduce((s,a)=>s+a.price,0);
  const avgVal=monthAppts.length?Math.round(monthAppts.reduce((s,a)=>s+a.price,0)/monthAppts.length):0;
  const custCount=new Set(appointments.filter(a=>{return appointments.filter(x=>x.name===a.name).length>1;}).map(a=>a.name)).size;

  document.getElementById('repMonthRev').textContent=`₺${monthRev.toLocaleString('tr-TR')}`;
  document.getElementById('repMonthAppt').textContent=monthAppts.length;
  document.getElementById('repAvgVal').textContent=`₺${avgVal}`;
  document.getElementById('repCustCount').textContent=custCount;

  const months=[];
  for(let i=11;i>=0;i--){const d=new Date();d.setMonth(d.getMonth()-i);const key=d.toISOString().slice(0,7);const rev=appointments.filter(a=>a.date.startsWith(key)&&a.status==='tamamlandı').reduce((s,a)=>s+a.price,0);months.push({label:d.toLocaleString('tr-TR',{month:'short'}),rev});}
  const maxRev=Math.max(...months.map(m=>m.rev),1);
  document.getElementById('lineChart').innerHTML=months.map(m=>`<div class="line-bar" style="height:${Math.max(4,(m.rev/maxRev)*110)}px" data-label="${m.label}" title="₺${m.rev.toLocaleString('tr-TR')}"></div>`).join('');

  const svcC={};
  appointments.forEach(a=>{svcC[a.service]=(svcC[a.service]||0)+1;});
  const svcEntries=Object.entries(svcC).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const maxSvc=svcEntries[0]?.[1]||1;
  document.getElementById('rankList').innerHTML=svcEntries.map(([name,count],i)=>`<div class="rank-item"><span class="rank-num">${i+1}</span><div class="rank-bar-wrap"><div class="rank-label">${name}</div><div class="rank-bar"><div class="rank-bar__fill" style="width:${(count/maxSvc)*100}%"></div></div></div><span class="rank-val">${count}</span></div>`).join('');

  const stfC={};
  appointments.forEach(a=>{stfC[a.barber]=(stfC[a.barber]||0)+1;});
  const stfEntries=Object.entries(stfC).sort((a,b)=>b[1]-a[1]);
  const maxStf=stfEntries[0]?.[1]||1;
  document.getElementById('staffRankList').innerHTML=stfEntries.map(([name,count],i)=>`<div class="rank-item"><span class="rank-num">${i+1}</span><div class="rank-bar-wrap"><div class="rank-label">${name}</div><div class="rank-bar"><div class="rank-bar__fill" style="width:${(count/maxStf)*100}%"></div></div></div><span class="rank-val">${count}</span></div>`).join('');
}

window.exportCSV = function() {
  const header='ID,Ad Soyad,Telefon,Hizmet,Berber,Tarih,Saat,Tutar,Durum';
  const rows=appointments.map(a=>[a.id,`"${a.name}"`,a.phone,`"${a.service}"`,`"${a.barber}"`,a.date,a.time,a.price,a.status].join(','));
  const csv='\uFEFF'+[header,...rows].join('\n');
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});
  const link=document.createElement('a');
  link.href=URL.createObjectURL(blob);
  link.download=`klasikberber_randevular_${today()}.csv`;
  link.click();
  toast('CSV indirildi.','success');
};

window.printReport = function() { window.print(); };

/* ============================================================
   USERS MANAGEMENT
   ============================================================ */
function renderUsers() {
  document.getElementById('usersBody').innerHTML = USERS.map(u=>`
    <tr>
      <td><div style="display:flex;align-items:center;gap:8px"><div class="user-avatar sm">${initials(u.name)}</div><span style="font-weight:600;color:var(--white-dyn)">${u.name}</span></div></td>
      <td style="color:var(--text-3)">@${u.username}</td>
      <td><span class="badge ${u.role==='superadmin'?'badge--confirmed':'badge--pending'}">${u.role==='superadmin'?'Süper Admin':'Personel'}</span></td>
      <td><span class="badge ${u.active?'badge--confirmed':'badge--cancel'}">${u.active?'Aktif':'Pasif'}</span></td>
      <td>
        <div class="action-btns">
          <button class="act-btn green" onclick="editUser(${u.id})">✏</button>
          ${u.id!==1?`<button class="act-btn red" onclick="deleteUser(${u.id})">🗑</button>`:'<button class="act-btn" disabled title="Silinemez">🔒</button>'}
        </div>
      </td>
    </tr>`).join('');
}

document.getElementById('addUserBtn').addEventListener('click', ()=>{
  document.getElementById('userModalTitle').textContent='Kullanıcı Ekle';
  ['u_id','u_username','u_name','u_password'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('u_role').value='staff';
  document.getElementById('u_active').checked=true;
  openModal('userModal');
});

window.editUser = function(id) {
  const u=USERS.find(x=>x.id===id); if(!u) return;
  document.getElementById('userModalTitle').textContent='Kullanıcı Düzenle';
  document.getElementById('u_id').value=u.id;
  document.getElementById('u_username').value=u.username;
  document.getElementById('u_name').value=u.name;
  document.getElementById('u_password').value='';
  document.getElementById('u_role').value=u.role;
  document.getElementById('u_active').checked=u.active;
  openModal('userModal');
};

document.getElementById('saveUserBtn').addEventListener('click', ()=>{
  const id=document.getElementById('u_id').value;
  const username=document.getElementById('u_username').value.trim();
  const name=document.getElementById('u_name').value.trim();
  const password=document.getElementById('u_password').value;
  if(!username||!name){toast('Kullanıcı adı ve ad zorunlu.');return;}
  if(!id&&!password){toast('Yeni kullanıcı için şifre zorunlu.');return;}
  const role=document.getElementById('u_role').value;
  const active=document.getElementById('u_active').checked;
  if(id){
    const idx=USERS.findIndex(u=>u.id===+id);
    if(idx>-1){USERS[idx]={...USERS[idx],username,name,role,active,...(password?{password}:{})};}
    toast('Kullanıcı güncellendi.','success');
  } else {
    if(USERS.find(u=>u.username===username)){toast('Bu kullanıcı adı zaten mevcut.');return;}
    USERS.push({id:Math.max(0,...USERS.map(u=>u.id))+1,username,name,password,role,active});
    toast('Kullanıcı eklendi.','success');
  }
  persistUsers(); closeModal('userModal'); renderUsers();
});

window.deleteUser = function(id) {
  if(id===1){toast('Varsayılan admin silinemez.');return;}
  document.getElementById('confirmMsg').textContent='Bu kullanıcıyı silmek istiyor musunuz?';
  confirmCallback=()=>{const idx=USERS.findIndex(u=>u.id===id);if(idx>-1)USERS.splice(idx,1);persistUsers();closeModal('confirmModal');renderUsers();toast('Kullanıcı silindi.');};
  openModal('confirmModal');
};

/* ============================================================
   SETTINGS
   ============================================================ */
function renderSettings() {
  const HOURS=[{day:'Pazartesi',open:'09:00',close:'20:00'},{day:'Salı',open:'09:00',close:'20:00'},{day:'Çarşamba',open:'09:00',close:'20:00'},{day:'Perşembe',open:'09:00',close:'20:00'},{day:'Cuma',open:'09:00',close:'20:00'},{day:'Cumartesi',open:'09:00',close:'20:00'},{day:'Pazar',open:'10:00',close:'17:00'}];
  document.getElementById('hoursList').innerHTML=HOURS.map(h=>`<div class="hours-row"><span class="hours-day">${h.day}</span><input type="time" value="${h.open}" /><span style="color:var(--text-3)">—</span><input type="time" value="${h.close}" /></div>`).join('');
}

document.getElementById('saveBusinessBtn')?.addEventListener('click', ()=>toast('İşletme bilgileri kaydedildi.','success'));
document.getElementById('saveHoursBtn')?.addEventListener('click', ()=>toast('Çalışma saatleri kaydedildi.','success'));
document.getElementById('savePwBtn')?.addEventListener('click', ()=>{
  const cur=document.getElementById('pw_current').value;
  const nw=document.getElementById('pw_new').value;
  const rep=document.getElementById('pw_repeat').value;
  if(!cur||!nw||!rep){toast('Tüm alanları doldurun.');return;}
  if(nw!==rep){toast('Yeni şifreler eşleşmiyor.');return;}
  const u=USERS.find(x=>x.username===auth.username);
  if(u&&u.password!==cur){toast('Mevcut şifre hatalı.');return;}
  if(u){u.password=nw;persistUsers();}
  toast('Şifre güncellendi.','success');
  ['pw_current','pw_new','pw_repeat'].forEach(id=>document.getElementById(id).value='');
});

/* ============================================================
   INIT
   ============================================================ */
navigate('dashboard');
updatePendingBadge();

document.getElementById('notifBtn').addEventListener('click', ()=>{
  navigate('appointments');
  document.getElementById('apptStatusFilter').value='bekliyor';
  renderAppointments();
});

document.querySelectorAll('.dropdown-link[data-page]').forEach(link=>{
  link.addEventListener('click', e=>{ e.preventDefault(); dropdown.classList.remove('show'); navigate(link.dataset.page); });
});
