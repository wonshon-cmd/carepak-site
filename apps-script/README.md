# Let's Talk form → email + Google Sheet

Submissions from start.carepakpharmacy.com/letstalk go to a small Google Apps Script that:
- saves each one as a row in a Google Sheet ("Submissions" tab)
- emails mhinojosa@carepakpharmacy.com and jshon@carepakpharmacy.com (Reply goes straight to the visitor)
- emails the visitor a copy if they ticked "Send a copy to my email"

Emails are sent from the Google account that deploys the script. Use a Carepak account if you have one.

## One-time setup (about 5 minutes)
1. Go to https://sheets.new and name the sheet **Carepak Let's Talk submissions**.
2. **Extensions → Apps Script**.
3. Delete the sample code and paste all of `Code.gs` from this folder. Click **Save** (💾).
4. In the function dropdown at the top, choose **authorize**, then click **Run**.
   Approve: **Review permissions** → pick your account → **Advanced** → **Go to … (unsafe)** → **Allow**.
   (The "unsafe" warning appears because it's your own unpublished script.)
5. **Deploy → New deployment** → gear ⚙ → **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click **Deploy** and copy the **Web app URL** (ends in `/exec`).
6. Send the URL to Claude, or paste it into `letstalk/index.html` at `endpoint:''`.

## Changing the code later
After editing Code.gs: **Deploy → Manage deployments → ✏️ → Version: New version → Deploy**. The URL stays the same.

Limit: about 100 emails/day on a free Gmail account, 1,500/day on Google Workspace.
