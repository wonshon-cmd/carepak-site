// Anonymous visit counter for the Carepak pages (shown in /admin → Visits).
// Sends only: page, event, approximate city (from a free IP-to-city lookup,
// GeoJS), time zone, device type, browser, referring website and language.
// The IP address itself is never stored. No cookies, no location permission prompt.
(function () {
  var endpoint = window.CAREPAK_ENDPOINT;
  if (!endpoint) { window.carepakTrack = function () {}; return; }
  var ua = navigator.userAgent;
  var device = /iPad|Tablet/i.test(ua) ? 'Tablet' : /Mobi|Android|iPhone/i.test(ua) ? 'Phone' : 'Computer';
  var browser = /Edg\//.test(ua) ? 'Edge' : /SamsungBrowser/.test(ua) ? 'Samsung' : /CriOS|Chrome\//.test(ua) ? 'Chrome'
    : /FxiOS|Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Other';
  var os = /iPhone|iPad|iPod/.test(ua) ? 'iOS' : /Android/.test(ua) ? 'Android' : /Windows/.test(ua) ? 'Windows'
    : /Mac OS X/.test(ua) ? 'Mac' : /Linux/.test(ua) ? 'Linux' : '';
  var ref = '';
  try { var r = new URL(document.referrer); if (r.hostname !== location.hostname) ref = r.hostname; } catch (e) {}
  var tz = '';
  try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}

  // Approximate city, looked up once per page (gives up after 2 seconds).
  var geo = new Promise(function (resolve) {
    var done = function (v) { resolve(v || ''); };
    setTimeout(done, 2000);
    try {
      fetch('https://get.geojs.io/v1/ip/geo.json').then(function (r) { return r.json(); }).then(function (g) {
        done([g.city, g.region, g.country_code].filter(Boolean).join(', '));
      }).catch(function () { done(''); });
    } catch (e) { done(''); }
  });

  window.carepakTrack = function (event) { geo.then(function (city) { send(event, city); }); };

  function send(event, city) {
    var body = JSON.stringify({
      action: 'visit', event: event || 'Page view', page: location.pathname.replace(/index\.html$/, ''),
      city: city, tz: tz, device: device, browser: browser + (os ? ' · ' + os : ''), ref: ref, lang: navigator.language || ''
    });
    try {
      if (navigator.sendBeacon && navigator.sendBeacon(endpoint, new Blob([body], { type: 'text/plain' }))) return;
    } catch (e) {}
    try { fetch(endpoint, { method: 'POST', mode: 'no-cors', keepalive: true, headers: { 'Content-Type': 'text/plain' }, body: body }); } catch (e) {}
  }
  window.carepakTrack('Page view');
})();
