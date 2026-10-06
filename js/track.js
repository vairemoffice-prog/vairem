// Consent-gated visit tracking for logged-in customers.
//
// Runs only when (1) the visitor accepted cookies/analytics (the banner, or
// Ustawienia konta -> Prywatność i zgody) AND (2) is logged in, so an e-mail is
// known. Sends at most one event per browser session to the Worker, which adds
// the visit to the customer's HubSpot contact (visit count, last visit,
// approximate country/city). Nothing is sent without consent; withdrawing
// consent stops it immediately and clears the local counters.
(function () {
  var WORKER_URL = 'https://vairem-hubspot-sync.hubspot-sync-worker.workers.dev';
  var CONSENT_KEY = 'vairem-cookie-consent';
  var VISITS_KEY = 'vairem-visits';
  var SENT_KEY = 'vairem-visit-sent';

  try {
    if (localStorage.getItem(CONSENT_KEY) !== 'accepted') {
      localStorage.removeItem(VISITS_KEY);
      return;
    }
    if (localStorage.getItem('vairem-session') !== '1') return;
    var account = JSON.parse(localStorage.getItem('vairem-account') || 'null');
    if (!account || !account.email) return;
    if (sessionStorage.getItem(SENT_KEY) === '1') return;
    sessionStorage.setItem(SENT_KEY, '1');

    var visits = JSON.parse(localStorage.getItem(VISITS_KEY) || '{}');
    visits.count = (visits.count || 0) + 1;
    visits.first = visits.first || Date.now();
    visits.last = Date.now();
    localStorage.setItem(VISITS_KEY, JSON.stringify(visits));

    fetch(WORKER_URL + '/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({ email: account.email, consent: true })
    }).catch(function () {});
  } catch (e) {}
})();
