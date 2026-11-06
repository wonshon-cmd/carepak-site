# Forms backend: Let's Talk + Onboarding → email, Google Sheet, /admin

A small Google Apps Script that:
- saves Let's Talk and Onboarding submissions to two tabs of a Google Sheet
- emails mhinojosa@carepakpharmacy.com and jshon@carepakpharmacy.com for each one (Reply goes to the sender)
- emails the Let's Talk sender a copy if they ticked "Send a copy to my email"
- feeds start.carepakpharmacy.com/admin, but only with the admin password

Emails are sent from the Google account that deploys the script. Use a Carepak account if you have one.

## One-time setup (about 5 minutes)
1. Go to https://sheets.new and name the sheet **Carepak submissions**.
2. **Extensions → Apps Script**.
3. Delete the sample code and paste all of `Code.gs` from this folder. Click **Save** (💾).
4. In the function dropdown at the top, choose **authorize**, then click **Run**.
   Approve: **Review permissions** → pick your account → **Advanced** → **Go to … (unsafe)** → **Allow**.
   (The "unsafe" warning appears because it's your own unpublished script.)
5. **Project Settings** (⚙ in the left sidebar) → **Script properties** → **Add script property**:
   Property `ADMIN_PASSWORD`, Value = the admin password → **Save script properties**.
   (Kept here, not in the code, because this repository is public.)
6. **Deploy → New deployment** → gear ⚙ → **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click **Deploy** and copy the **Web app URL** (ends in `/exec`).
7. Send the URL to Claude, or paste it into `assets/config.js`.

## Changing the code later
After editing Code.gs: **Deploy → Manage deployments → ✏️ → Version: New version → Deploy**. The URL stays the same.
To change the admin password, just edit the `ADMIN_PASSWORD` script property; no redeploy needed.

Limit: about 100 emails/day on a free Gmail account, 1,500/day on Google Workspace.
