// ─── BAGARES SUPABASE CONFIG ────────────────────────────────────────────────
// Replace these two values with your actual Supabase project details.
// Find them at: supabase.com → your project → Settings → API
const SUPA_URL = 'https://wmfalunlgrzbxlcxivit.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtZmFsdW5sZ3J6YnhsY3hpdml0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3ODY1ODQsImV4cCI6MjA4OTM2MjU4NH0.6xWwtAla9COLVJz05YuVuYhl4QkkmULMdlESLse2VUo';

// ─── SUPABASE HELPER ────────────────────────────────────────────────────────
const db = {
  async query(table, method = 'GET', body = null, params = '') {
    const res = await fetch(`${SUPA_URL}/rest/v1/${table}${params}`, {
      method,
      headers: {
        'apikey': SUPA_KEY,
        'Authorization': `Bearer ${SUPA_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': method === 'POST' ? 'return=representation' : ''
      },
      body: body ? JSON.stringify(body) : null
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err);
    }
    return method === 'DELETE' ? null : res.json();
  },

  get: (table, params = '')        => db.query(table, 'GET', null, params),
  post: (table, body)              => db.query(table, 'POST', body),
  patch: (table, body, params = '') => db.query(table, 'PATCH', body, params),
  delete: (table, params = '')     => db.query(table, 'DELETE', null, params),
};

// ─── BAGARES APP ─────────────────────────────────────────────────────────────
const Bagares = {

  // ── AUTH (still localStorage — no Supabase Auth for simplicity) ─────────
  getUser()  { try { return JSON.parse(localStorage.getItem('bag_user')) || null; } catch { return null; } },
  setUser(u) { localStorage.setItem('bag_user', JSON.stringify(u)); },
  logout()   { localStorage.removeItem('bag_user'); window.location.href = 'index.html'; },

  requireAuth() {
    if (!this.getUser()) {
      sessionStorage.setItem('bag_redirect', window.location.href);
      window.location.href = 'login.html'; return false;
    }
    return true;
  },
  getRedirect() {
    const r = sessionStorage.getItem('bag_redirect');
    sessionStorage.removeItem('bag_redirect'); return r;
  },

  // ── ACCOUNTS ─────────────────────────────────────────────────────────────
  async findAccount(email, password) {
    const rows = await db.get('patient_accounts', `?email=eq.${encodeURIComponent(email)}&password=eq.${encodeURIComponent(password)}&limit=1`);
    return rows[0] || null;
  },

  async emailExists(email) {
    const rows = await db.get('patient_accounts', `?email=eq.${encodeURIComponent(email)}&limit=1`);
    return rows.length > 0;
  },

  async createAccount(name, email, phone, password) {
    const rows = await db.post('patient_accounts', { name, email, phone, password });
    return rows[0];
  },

  // ── SLOTS — key feature: real-time taken slots ────────────────────────────
  /**
   * Returns an array of taken time strings for a given doctor + date.
   * e.g. ['09:00', '14:00']
   */
  async getTakenSlots(doctor, date) {
    const rows = await db.get(
      'bookings',
      `?doctor=eq.${encodeURIComponent(doctor)}&date=eq.${date}&status=neq.Cancelled&select=time`
    );
    return rows.map(r => r.time);
  },

  // ── BOOKINGS ──────────────────────────────────────────────────────────────
  async saveBooking(b) {
    const id = 'BOC-' + Date.now().toString(36).toUpperCase().slice(-6);

    // 1. Insert booking row
    await db.post('bookings', {
      id,
      patient_email: b.patientEmail,
      patient_name:  b.patientName,
      phone:         b.phone,
      dob:           b.dob,
      address:       b.address,
      sex:           b.sex || null,
      patient_type:  b.patientType || 'New patient',
      service:       b.service,
      doctor:        b.doctor,
      date:          b.date,
      time:          b.time,        // stored as '09:00'
      notif:         b.notif,
      notes:         b.notes || null,
      status:        'Pending'
    });

    // 2. Insert auto confirmation message
    await db.post('booking_messages', {
      booking_id: id,
      from_role:  'clinic',
      subject:    `Booking Received — ${id}`,
      body:       `Dear ${b.patientName},\n\nThank you for booking with us. We have received your appointment request:\n\n  Service:  ${b.service}\n  Doctor:   ${b.doctor}\n  Date:     ${b.dateFormatted}\n  Time:     ${b.timeLabel}\n\nYour booking is currently pending review. A member of our staff will confirm it within a few hours during clinic hours.\n\n  Reference No: ${id}\n\nIf you need to reach us:\n  Phone: (055) 251-XXXX\n  Email: bagares@optical.ph\n\nThank you,\nBagares Optical Clinic`,
      is_read:    false
    });

    return id;
  },

  async getUserBookings(email) {
    return db.get('bookings', `?patient_email=eq.${encodeURIComponent(email)}&order=created_at.desc`);
  },

  // ── MESSAGES ──────────────────────────────────────────────────────────────
  async getAllMessages(email) {
    // Get all booking IDs for this patient first
    const bookings = await this.getUserBookings(email);
    if (!bookings.length) return [];
    const ids = bookings.map(b => b.id).join(',');
    const msgs = await db.get(
      'booking_messages',
      `?booking_id=in.(${ids})&order=created_at.desc`
    );
    // Attach service name from booking lookup
    const bMap = Object.fromEntries(bookings.map(b => [b.id, b]));
    return msgs.map(m => ({ ...m, service: bMap[m.booking_id]?.service || '' }));
  },

  async markRead(bookingId, msgId) {
    await db.patch('booking_messages', { is_read: true }, `?id=eq.${msgId}&booking_id=eq.${bookingId}`);
  },

  async unreadCount() {
    const u = this.getUser(); if (!u) return 0;
    try {
      const msgs = await this.getAllMessages(u.email);
      return msgs.filter(m => !m.is_read).length;
    } catch { return 0; }
  },

  // ── TOAST ──────────────────────────────────────────────────────────────────
  toast(msg, type = 'default', ms = 3000) {
    let el = document.getElementById('_toast');
    if (!el) { el = document.createElement('div'); el.id = '_toast'; el.className = 'toast'; document.body.appendChild(el); }
    el.className = 'toast' + (type !== 'default' ? ' ' + type : '');
    const icons = { success: '✓', error: '✕', default: '' };
    el.textContent = (icons[type] ? icons[type] + ' ' : '') + msg;
    el.classList.add('show');
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('show'), ms);
  },

  // ── NAV ────────────────────────────────────────────────────────────────────
  renderNav(active, unread = 0) {
    const user = this.getUser();
    const links = [
      { href:'index.html',   label:'Home' },
      { href:'booking.html', label:'Book Appointment' },
    ].map(p => `<a href="${p.href}" class="nav-link${active===p.label?' active':''}">${p.label}</a>`).join('');

    const right = user
      ? `<div class="nav-user">
           <a href="dashboard.html" class="nav-avatar" title="Dashboard">${user.name.charAt(0).toUpperCase()}</a>
           <a href="dashboard.html" class="nav-name">${user.name.split(' ')[0]}</a>
           ${unread > 0 ? `<span class="nav-badge">${unread}</span>` : ''}
           <button class="nav-signout" onclick="Bagares.logout()">Sign out</button>
         </div>`
      : `<div style="display:flex;gap:8px;">
           <a href="login.html" class="nav-btn nav-btn-outline">Sign in</a>
           <a href="login.html?r=1" class="nav-btn nav-btn-solid">Register</a>
         </div>`;

    document.getElementById('nav-placeholder').innerHTML = `
      <nav class="site-nav">
        <div class="nav-inner">
          <a href="index.html" class="nav-brand">
            <div class="nav-logo">B</div>
            <span class="nav-wordmark">Bagares <span>Optical Clinic</span></span>
          </a>
          <div class="nav-links">${links}</div>
          <div class="nav-right">${right}</div>
        </div>
      </nav>
      <div class="nav-spacer"></div>`;
  },

  renderFooter() {
    const el = document.getElementById('footer-placeholder');
    if (!el) return;
    el.innerHTML = `
      <footer class="site-footer">
        <div class="footer-inner">
          <div class="footer-grid">
            <div class="footer-brand">
              <div class="footer-logo"><div class="footer-logo-box">B</div><strong>Bagares Optical Clinic</strong></div>
              <p>Comprehensive eye care in Catarman, Northern Samar. Trusted by patients since day one.</p>
            </div>
            <div class="footer-col">
              <h4>Navigation</h4>
              <a href="index.html">Home</a><a href="booking.html">Book Appointment</a><a href="login.html">Sign In</a><a href="dashboard.html">Dashboard</a>
            </div>
            <div class="footer-col">
              <h4>Contact</h4>
              <a href="#">C.P. Garcia St., Catarman</a><a href="#">Northern Samar, Philippines</a><a href="#">(055) 251-XXXX</a><a href="#">bagares@optical.ph</a>
            </div>
          </div>
          <div class="footer-bottom">
            <p>© ${new Date().getFullYear()} Bagares Optical Clinic</p>
            <p>Mon – Sat &nbsp;·&nbsp; 8:00 AM – 5:00 PM</p>
          </div>
        </div>
      </footer>`;
  },

  formatDate(s) {
    return new Date(s + 'T00:00:00').toLocaleDateString('en-PH', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  },
  genRef() { return 'BOC-' + Date.now().toString(36).toUpperCase().slice(-6); }
};