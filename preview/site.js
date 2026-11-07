(() => {
  const $ = (id) => document.getElementById(id);
  // Mobile menu
  const btn = $('menuBtn'), menu = $('menu');
  btn.addEventListener('click', () => { const open = menu.classList.toggle('open'); btn.setAttribute('aria-expanded', open); });
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) { menu.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); } });
  $('yr').textContent = new Date().getFullYear();

  // "Request a call" → same Google script as the other Carepak forms (callback requests show in the admin dashboard)
  const form = $('cbForm'), msg = $('cbMsg');
  form.addEventListener('submit', async (e) => {
    e.preventDefault(); msg.className = 'form-msg'; msg.textContent = '';
    const f = (n) => form.elements[n];
    if (!f('name').value.trim() || f('phone').value.replace(/\D/g, '').length < 10) { msg.className = 'form-msg err'; msg.textContent = 'Please enter your name and a 10-digit phone number.'; return; }
    if (!f('consent').checked) { msg.className = 'form-msg err'; msg.textContent = 'Please check the box so we can contact you.'; return; }
    const endpoint = window.CAREPAK_ENDPOINT;
    if (!endpoint) { msg.className = 'form-msg err'; msg.textContent = 'Please call us at 1.800.601.7092.'; return; }
    const b = form.querySelector('button'); b.disabled = true;
    try {
      const r = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({
        type: 'onboarding', name: f('name').value, phone: f('phone').value, email: f('email').value, bestTime: f('bestTime').value,
        currentPharmacy: f('currentPharmacy').value, consent: true, website: f('website').value }) });
      const j = await r.json();
      if (!j.ok) throw new Error();
      form.reset(); msg.className = 'form-msg ok'; msg.textContent = '✓ Thank you! A Carepak pharmacist will call you shortly.';
    } catch { msg.className = 'form-msg err'; msg.textContent = 'Sorry, that didn’t go through. Please call us at 1.800.601.7092.'; }
    finally { b.disabled = false; }
  });
})();
