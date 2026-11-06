/**
 * Carepak forms backend (Google Apps Script web app).
 *  - Let's Talk submissions  → "Let's Talk" tab + email to jshon@ (+ optional copy to sender)
 *  - Onboarding submissions  → "Onboarding" tab + email to jshon@ only
 *  - Admin page (/admin)     → lists both tabs, only with the admin password
 *
 * The admin password is NOT stored in this file (the repository is public).
 * Set it in Apps Script: Project Settings → Script properties → ADMIN_PASSWORD.
 * Setup steps: apps-script/README.md
 */
const PHONE = '1.800.601.7092';

// Who gets the notification email for each form. Edit these to change recipients.
const FORMS = {
  letstalk: {
    notify: 'jshon@carepakpharmacy.com', // mhinojosa@carepakpharmacy.com removed for now
    sheet: "Let's Talk",
    headers: ['Received', 'Organization', 'Name', 'Title', 'Email', 'Biggest concern', 'Services of interest', 'Questions', 'Copy requested'],
    fields: ['organization', 'name', 'title', 'email', 'concern', 'services', 'questions', 'emailCopy'],
    required: d => d.name && isEmail(d.email)
  },
  onboarding: {
    notify: 'jshon@carepakpharmacy.com', // onboarding goes to jshon only
    sheet: 'Onboarding',
    headers: ['Received', 'Name', 'Phone', 'Email', 'Best time to call', 'Current pharmacy', 'Consent to contact'],
    fields: ['name', 'phone', 'email', 'bestTime', 'currentPharmacy', 'consent'],
    required: d => d.name && d.phone && (!d.email || isEmail(d.email))
  }
};

function doPost(e) {
  try {
    const d = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (d.action === 'list') return json(listSubmissions(d.password));
    if (d.action === 'delete') return json(deleteSubmission(d));
    if (d.website) return json({ ok: true }); // spam trap: real visitors never fill this hidden field

    const type = d.type === 'onboarding' ? 'onboarding' : 'letstalk';
    const form = FORMS[type];
    const r = clean(d);
    if (!form.required(r)) return json({ ok: false, error: 'Missing required fields' });

    const values = form.fields.map(f => typeof r[f] === 'boolean' ? (r[f] ? 'Yes' : 'No') : r[f]);
    const sh = sheetFor(form);
    sh.appendRow([new Date()].concat(values).map(safe));

    const lines = form.headers.slice(1).map((h, i) => h + ': ' + (values[i] || '—'));
    const label = type === 'onboarding' ? 'New onboarding request' : 'Let’s Talk submission';
    MailApp.sendEmail({
      to: form.notify,
      replyTo: r.email || form.notify.split(',')[0],
      name: 'Carepak Website',
      subject: label + ': ' + r.name + (r.organization ? ' (' + r.organization + ')' : ''),
      body: lines.join('\n') + '\n\nAll submissions: https://start.carepakpharmacy.com/admin/'
    });

    if (type === 'letstalk' && r.emailCopy) {
      MailApp.sendEmail({
        to: r.email,
        replyTo: form.notify,
        name: 'Carepak Pharmacy',
        subject: 'Your responses to Carepak Pharmacy',
        body: 'Thank you for getting in touch. A Carepak representative will get in touch with you shortly.\n\nHere is a copy of what you sent us.\n\n' +
              lines.filter(l => !/^Copy requested/.test(l)).join('\n') +
              '\n\nQuestions? Call us at ' + PHONE + ' or reply to this email.\n\nCarepak Pharmacy'
      });
    }
    return json({ ok: true });
  } catch (err) {
    console.error(err);
    return json({ ok: false, error: 'Server error' });
  }
}

// Returns an error message, or '' when the admin password is correct.
function passwordError(password) {
  const cache = CacheService.getScriptCache();
  const fails = Number(cache.get('adminFails') || 0);
  if (fails >= 10) return 'Too many attempts. Try again in 15 minutes.';
  const real = PropertiesService.getScriptProperties().getProperty('ADMIN_PASSWORD');
  if (!real) return 'Admin password not set up yet (Script properties → ADMIN_PASSWORD).';
  if (String(password || '') !== real) {
    cache.put('adminFails', String(fails + 1), 900);
    return 'Wrong password.';
  }
  return '';
}

function listSubmissions(password) {
  const err = passwordError(password);
  if (err) return { ok: false, error: err };
  const out = { ok: true };
  Object.keys(FORMS).forEach(type => {
    const form = FORMS[type];
    const sh = sheetFor(form);
    const n = sh.getLastRow();
    const rows = n > 1 ? sh.getRange(2, 1, n - 1, form.headers.length).getDisplayValues() : [];
    const ids = rows.map((_, i) => i + 2); // sheet row numbers, used for delete
    out[type] = { headers: form.headers, rows: rows.reverse(), ids: ids.reverse() }; // newest first
  });
  return out;
}

// Deletes one submission. `match` must equal the row's current contents, so a
// stale admin page can never delete the wrong row if the sheet changed meanwhile.
function deleteSubmission(d) {
  const err = passwordError(d.password);
  if (err) return { ok: false, error: err };
  const form = FORMS[d.type];
  const row = Number(d.id);
  if (!form || !(row >= 2)) return { ok: false, error: 'Unknown submission.' };
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = sheetFor(form);
    if (row > sh.getLastRow()) return { ok: false, error: 'This submission was already removed. Click Refresh.' };
    const current = sh.getRange(row, 1, 1, form.headers.length).getDisplayValues()[0];
    if (JSON.stringify(current) !== JSON.stringify(d.match)) return { ok: false, error: 'The list changed since you loaded it. Click Refresh and try again.' };
    sh.deleteRow(row);
  } finally {
    lock.releaseLock();
  }
  return listSubmissions(d.password);
}

function clean(d) {
  const txt = (v, max) => String(v == null ? '' : v).trim().slice(0, max || 3000);
  return {
    type: d.type,
    organization: txt(d.organization, 80),
    name: txt(d.name, 120),
    title: txt(d.title, 120),
    email: txt(d.email, 200),
    phone: txt(d.phone, 40),
    bestTime: txt(d.bestTime, 40),
    currentPharmacy: txt(d.currentPharmacy, 200),
    consent: d.consent === true,
    concern: txt(d.concern),
    services: (Array.isArray(d.services) ? d.services : []).slice(0, 20).map(s => txt(s, 120)).join(', '),
    questions: txt(d.questions),
    emailCopy: d.emailCopy === true
  };
}

function sheetFor(form) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(form.sheet);
  if (!sh) sh = ss.insertSheet(form.sheet);
  if (sh.getLastRow() === 0) { sh.appendRow(form.headers); sh.setFrozenRows(1); }
  return sh;
}

// Values starting with = + - @ are prefixed so the sheet never runs them as formulas.
function safe(v) { return (typeof v === 'string' && /^[=+\-@]/.test(v)) ? "'" + v : v; }
function isEmail(s) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || '')); }

function doGet() { return json({ ok: true, service: 'carepak-forms' }); }

/** Run once from the editor to grant permissions (Sheets + email). */
function authorize() {
  SpreadsheetApp.getActiveSpreadsheet().getName();
  Logger.log('Emails left today: ' + MailApp.getRemainingDailyQuota());
  Logger.log('Admin password set: ' + !!PropertiesService.getScriptProperties().getProperty('ADMIN_PASSWORD'));
}

function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
