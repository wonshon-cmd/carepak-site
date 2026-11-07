(() => {
  const $ = (id) => document.getElementById(id);
  // Header menu (phones)
  const btn = $('menuBtn'), menu = $('menu');
  btn.addEventListener('click', () => { const open = menu.classList.toggle('open'); btn.setAttribute('aria-expanded', open); });
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) { menu.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); } });
  $('yr').textContent = new Date().getFullYear();

  // "Request information" → the same Google script as Let's Connect, so each request shows up
  // in the owner dashboard (Let's Connect tab) as a to-do and is emailed to jshon@.
  const form = $('infoForm'), msg = $('infoMsg');
  const who = () => form.querySelector('input[name=who]:checked').value;
  const syncOrg = () => { form.querySelector('.org-field').hidden = who() === 'Patient / caregiver'; };
  form.querySelectorAll('input[name=who]').forEach((r) => r.addEventListener('change', syncOrg)); syncOrg();

  form.addEventListener('submit', async (e) => {
    e.preventDefault(); msg.className = 'form-msg'; msg.textContent = '';
    const f = (n) => form.elements[n].value.trim();
    if (f('name').length < 2) return fail('Please enter your name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f('email'))) return fail('Please enter a valid email so we can send you information.');
    const endpoint = window.CAREPAK_ENDPOINT;
    if (!endpoint) return fail('Please call us at 1.800.601.7092.');
    const interests = [...form.querySelectorAll('.interests input:checked')].map((c) => c.value);
    const b = form.querySelector('button[type=submit]'); b.disabled = true;
    try {
      const r = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({
        type: 'letstalk',
        organization: who() === 'Patient / caregiver' ? 'Patient / caregiver (website)' : (f('organization') || who()) + ' (website)',
        name: f('name'), title: who(), email: f('email'),
        concern: 'Requested information from carepakpharmacy.com',
        services: interests,
        questions: [f('phone') && 'Phone: ' + f('phone'), f('message')].filter(Boolean).join('\n'),
        emailCopy: false, website: form.elements.website.value }) });
      const j = await r.json();
      if (!j.ok) throw new Error();
      form.reset(); syncOrg();
      msg.className = 'form-msg ok'; msg.textContent = '✓ Thank you! A Carepak representative will be in touch shortly.';
    } catch { fail('Sorry, that didn’t go through. Please call us at 1.800.601.7092.'); }
    finally { b.disabled = false; }
  });
  function fail(t) { msg.className = 'form-msg err'; msg.textContent = t; }
})();
