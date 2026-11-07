// Google Apps Script "Web app URL" (ends in /exec). Used by /letsconnect, /onboarding and /admin.
// Uses the plain /macros/s/ form (not /a/macros/<domain>/) so it works for visitors signed in to any Google account.
// Leave empty to put the forms back in preview mode.
window.CAREPAK_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwxqBp_EYbYm7Lmr3ZrPFXzK4lSNK5ro3yZ_4BYRN9-lMUadhAK2dpsL9lJzMEEOp429w/exec';

// Onboarding/dashboard server (Render): sends and checks email verification codes for access requests.
window.CAREPAK_API = 'https://carepak-onboarding.onrender.com';
