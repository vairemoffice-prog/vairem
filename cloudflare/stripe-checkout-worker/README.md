# Płatności Stripe (tryb testowy) — Cloudflare Worker

Strona jest statyczna (GitHub Pages), więc tajny klucz Stripe nie może trafić do
przeglądarki. Ten Worker tworzy sesje Stripe Checkout i sprawdza, czy zapłacono.
**Ceny są w Workerze** (`PRODUCTS` w `src/index.js`), a przeglądarka wysyła tylko
numery produktów i ilości — nikt nie może zmienić kwoty w przeglądarce.
Worker odrzuca klucze inne niż `sk_test_`, więc nie da się przypadkiem pobrać prawdziwych pieniędzy.

## Przepływ
1. Klient wybiera „Złóż zamówienie" → `checkout.html` woła `POST /create-session`.
2. Przeglądarka przechodzi na stronę płatności Stripe (karta, Apple/Google Pay, BLIK, Przelewy24).
3. Po płatności Stripe wraca na `checkout.html?paid=1&session_id=…`; strona pyta
   `GET /session-status` i dopiero po potwierdzeniu zapisuje zamówienie
   (HubSpot, e-mail do właściciela, historia zamówień, czyszczenie koszyka).
   Anulowanie płatności zostawia koszyk nietknięty.

## Uruchomienie
1. W Stripe Dashboard włącz **tryb testowy** i skopiuj *Secret key* (`sk_test_…`).
   Nie wklejaj go na czacie ani do repo.
2. **Settings → Payment methods**: włącz BLIK, Przelewy24, Apple Pay, Google Pay (PLN).
3. Wdróż:
   ```bash
   cd cloudflare/stripe-checkout-worker
   npx wrangler login
   npx wrangler deploy
   npx wrangler secret put STRIPE_SECRET_KEY
   ```
4. W `checkout.html` wpisz adres Workera w `STRIPE_WORKER_URL`
   (np. `https://vairem-stripe-checkout.<subdomena>.workers.dev`). Dopóki jest pusty,
   zamówienia działają jak dotychczas (bez płatności).
5. Ceny: w sklepie nadal jest `[CENA]`. W `PRODUCTS` wpisano **testowe 189 zł** —
   ustaw prawdziwe ceny (w groszach) oraz w `js/app.js` / `checkout.html` (wyświetlanie).

## Test
Karta `4242 4242 4242 4242`, dowolna przyszła data i CVC. Odmowa: `4000 0000 0000 0002`.
Inne karty testowe: https://docs.stripe.com/testing

## Uwagi
- Potwierdzenie płatności odbywa się przy powrocie na stronę. Jeśli klient zamknie
  kartę po zapłacie, zamówienie zobaczysz w Stripe, ale nie w HubSpot. Przed
  uruchomieniem produkcyjnym warto dodać webhook `checkout.session.completed`.
- Kod rabatowy `WITAJ10` (−10%) jest liczony po stronie Workera.
- CORS: tylko `https://vairemoffice-prog.github.io` (`ALLOWED_ORIGIN`).
