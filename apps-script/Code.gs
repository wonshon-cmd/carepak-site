/**
 * Carepak "Let's Talk" form receiver (Google Apps Script web app).
 * Each submission is saved to the "Submissions" tab of the Google Sheet this
 * script is attached to, and emailed to the Carepak team. If the visitor ticked
 * "Send a copy to my email", they get a copy too.
 * Setup steps: apps-script/README.md
 */
const RECIPIENTS = 'mhinojosa@carepakpharmacy.com,jshon@carepakpharmacy.com';
const PHONE = '1.800.601.7092';
const SHEET_NAME = 'Submissions';
const HEADERS = ['Received', 'Organization', 'Name', 'Title', 'Email', 'Biggest concern', 'Services of interest', 'Questions', 'Copy requested'];

function doPost(e) {
  try {
    const d = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (d.website) return json({ ok: true }); // spam trap: real visitors never fill this hidden field

    const txt = (v, max) => String(v == null ? '' : v).trim().slice(0, max || 3000);
    const r = {
      org: txt(d.organization, 80),
      name: txt(d.name, 120),
      title: txt(d.title, 120),
      email: txt(d.email, 200),
      concern: txt(d.concern),
      services: (Array.isArray(d.services) ? d.services : []).slice(0, 20).map(s => txt(s, 120)).join(', '),
      questions: txt(d.questions),
      copy: d.emailCopy === true
    };
    if (!r.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email)) return json({ ok: false, error: 'Missing name or valid email' });

    // Save to the sheet (values starting with = + - @ are prefixed so they aren't run as formulas)
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    if (sh.getLastRow() === 0) { sh.appendRow(HEADERS); sh.setFrozenRows(1); }
    const safe = v => (typeof v === 'string' && /^[=+\-@]/.test(v)) ? "'" + v : v;
    sh.appendRow([new Date(), r.org, r.name, r.title, r.email, r.concern, r.services, r.questions, r.copy ? 'Yes' : 'No'].map(safe));

    const body = [
      'Organization: ' + r.org,
      'Name: ' + r.name,
      'Title: ' + r.title,
      'Email: ' + r.email,
      '',
      'Biggest concern when coordinating patients’ medications:',
      r.concern || '(none)',
      '',
      'Services that would be most helpful:',
      r.services || '(none selected)',
      '',
      'Questions / services they would like to see:',
      r.questions || '(none)'
    ].join('\n');

    MailApp.sendEmail({
      to: RECIPIENTS,
      replyTo: r.email,
      name: 'Carepak Website',
      subject: 'Let’s Talk submission: ' + r.name + (r.org ? ' (' + r.org + ')' : ''),
      body: body + '\n\nCopy requested by sender: ' + (r.copy ? 'Yes' : 'No') + '\nReply to this email to respond to ' + r.name + '.'
    });

    if (r.copy) {
      MailApp.sendEmail({
        to: r.email,
        replyTo: RECIPIENTS.split(',')[0],
        name: 'Carepak Pharmacy',
        subject: 'Your responses to Carepak Pharmacy',
        body: 'Thank you for getting in touch. Here is a copy of what you sent us.\n\n' + body +
              '\n\nQuestions? Call us at ' + PHONE + ' or reply to this email.\n\nCarepak Pharmacy'
      });
    }
    return json({ ok: true });
  } catch (err) {
    console.error(err);
    return json({ ok: false, error: 'Server error' });
  }
}

function doGet() {
  return json({ ok: true, service: 'carepak-letstalk' });
}

/** Run this once from the editor to grant permissions (Sheets + email). */
function authorize() {
  SpreadsheetApp.getActiveSpreadsheet().getName();
  Logger.log('Emails left today: ' + MailApp.getRemainingDailyQuota());
}

function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
