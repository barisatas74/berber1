/* ============================================================
   NAVBAR — scroll & burger
   ============================================================ */
const navbar  = document.getElementById('navbar');
const burger  = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

burger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

// Close menu when a link is clicked
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

/* ============================================================
   SCROLL ANIMATIONS
   ============================================================ */
const fadeEls = document.querySelectorAll(
  '.service-card, .review-card, .stat, .about__text, .about__visual, .contact__item, .gallery-item'
);

fadeEls.forEach(el => el.classList.add('fade-up'));

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 60);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

fadeEls.forEach(el => observer.observe(el));

/* ============================================================
   DATE — set minimum date to today
   ============================================================ */
const dateInput = document.getElementById('date');
if (dateInput) {
  const today = new Date().toISOString().split('T')[0];
  dateInput.setAttribute('min', today);
}

/* ============================================================
   APPOINTMENT FORM
   ============================================================ */
const apptForm    = document.getElementById('apptForm');
const apptSuccess = document.getElementById('apptSuccess');
const newApptBtn  = document.getElementById('newAppt');

function validate(form) {
  let valid = true;
  const required = form.querySelectorAll('[required]');
  required.forEach(field => {
    field.classList.remove('error');
    if (!field.value.trim()) {
      field.classList.add('error');
      valid = false;
    }
  });
  return valid;
}

if (apptForm) {
  apptForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validate(apptForm)) return;

    // Simulate a short loading state on the button
    const btn = apptForm.querySelector('button[type="submit"]');
    btn.textContent = 'Gönderiliyor...';
    btn.disabled = true;

    setTimeout(() => {
      // Ana site → Admin entegrasyonu: localStorage'a kaydet
      const existing = JSON.parse(localStorage.getItem('kb_site_appointments') || '[]');
      const newAppt = {
        id: Date.now(),
        _siteId: Date.now(),
        name:    document.getElementById('name').value.trim(),
        phone:   document.getElementById('phone').value.trim(),
        service: document.getElementById('service').options[document.getElementById('service').selectedIndex]?.text.split(' —')[0] || '',
        barber:  document.getElementById('barber').value || 'Fark Etmez',
        date:    document.getElementById('date').value,
        time:    document.getElementById('time').value,
        status:  'bekliyor',
        note:    document.getElementById('note').value.trim(),
        price:   0,
        source:  'site'
      };
      existing.push(newAppt);
      localStorage.setItem('kb_site_appointments', JSON.stringify(existing));
      // Admin listesini de güncelle (admin panel açıksa)
      const adminAppts = JSON.parse(localStorage.getItem('kb_appts') || 'null');
      if (adminAppts) { adminAppts.push(newAppt); localStorage.setItem('kb_appts', JSON.stringify(adminAppts)); }

      apptForm.style.display = 'none';
      apptSuccess.classList.add('show');
    }, 900);
  });
}

if (newApptBtn) {
  newApptBtn.addEventListener('click', () => {
    apptForm.reset();
    const btn = apptForm.querySelector('button[type="submit"]');
    btn.textContent = 'Randevu Onayla';
    btn.disabled = false;
    apptForm.style.display = '';
    apptSuccess.classList.remove('show');
  });
}

/* ============================================================
   SMOOTH ACTIVE NAV LINK HIGHLIGHT
   ============================================================ */
const sections = document.querySelectorAll('section[id]');

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      document.querySelectorAll('.nav__links a').forEach(a => {
        a.style.color = '';
        if (a.getAttribute('href') === '#' + entry.target.id) {
          a.style.color = 'var(--gold)';
        }
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => navObserver.observe(s));
