# Synchronizacja zamówień VAIREM → HubSpot (Cloudflare Worker)

Ta funkcja łączy statyczną stronę (GitHub Pages, bez backendu) z HubSpot CRM.
Strona nie może bezpiecznie wywoływać HubSpot bezpośrednio, bo wymagałoby to
umieszczenia tajnego tokena w kodzie widocznym dla każdego odwiedzającego —
zamiast tego strona woła ten Worker, a Worker (z tokenem trzymanym bezpiecznie
w Cloudflare) rozmawia z HubSpot.

Co robi przy każdym złożonym zamówieniu:
1. Tworzy/aktualizuje kontakt w HubSpot po adresie e-mail.
2. Dolicza wartość zamówienia do `vairem_ltv` (LTV klienta) i zwiększa
   `vairem_order_count` (licznik zamówień/refilli) o 1.
3. Tworzy w HubSpot Deal (transakcję) z kwotą i listą produktów, powiązaną
   z kontaktem.

## 1. Utwórz właściwości w HubSpot (raz)

Settings → Properties → Contact properties → Create property, dla każdej —
etykieta może być dowolna, typ musi być jak w tabeli:

| Etykieta (dowolna)          | Typ      |
|------------------------------|----------|
| VAIREM — LTV (PLN)           | Number   |
| VAIREM — liczba zamówień     | Number   |
| VAIREM — ostatnie zamówienie | Date picker |

HubSpot sam generuje "Internal name" z etykiety i zwykle wychodzi inaczej,
niż się oczekuje (np. z podwójnym podkreślnikiem albo dodatkowym słowem).
**Po utworzeniu każdej właściwości sprawdź jej rzeczywistą nazwę wewnętrzną**
(w liście właściwości, albo eksportując CSV) i wpisz ją w
`src/index.js`, w stałych `PROP_LTV`, `PROP_ORDER_COUNT`, `PROP_LAST_ORDER`
na górze pliku — bieżące wartości odpowiadają portalowi VAIREM.

## 2. Utwórz Private App w HubSpot (raz)

Settings → Integrations → Private Apps → Create a private app.
Zakresy (scopes) do zaznaczenia:
- `crm.objects.contacts.read`
- `crm.objects.contacts.write`
- `crm.objects.deals.read`
- `crm.objects.deals.write`

Po utworzeniu skopiuj **Access token** — to jedyny sekret w tym całym
zestawie. Nigdy nie wklejaj go na czacie ani do kodu — trafia tylko do
Cloudflare (krok 4).

## 3. Zaloguj się do Cloudflare i wdróż Workera

```bash
cd cloudflare/hubspot-sync-worker
npx wrangler login
npx wrangler deploy
```

Po wdrożeniu `wrangler` wypisze publiczny adres Workera, np.
`https://vairem-hubspot-sync.<twoja-subdomena>.workers.dev` — zapisz go,
będzie potrzebny w kroku 5.

## 4. Dodaj sekret tokena

```bash
npx wrangler secret put HUBSPOT_PRIVATE_APP_TOKEN
```

Wklej token z kroku 2, kiedy zapyta (nie trafia do żadnego pliku w repo).

## 5. Adres Workera w checkout.html

W pliku `checkout.html` stała `PAYMENT_WORKER_URL` wskazuje adres Workera z
kroku 3. Kasa wysyła tam zamówienie (`POST /checkout`), a klient trafia na
stronę płatności Stripe.

## 6. Płatności Stripe

Worker tworzy sesję Stripe Checkout (BLIK, karta, Apple Pay, Google Pay,
Przelewy24), a **do HubSpot zamówienie trafia dopiero po potwierdzeniu
płatności** (webhook). Ceny, rabat (`WITAJ10`) i dostawę (9,99 zł, gratis
powyżej 300 zł po rabacie) liczy Worker — `PRODUCTS`, `DISCOUNT_*`,
`SHIPPING_COST` i `FREE_SHIPPING_ABOVE` w `src/index.js`. Przy zmianie cen
popraw je **także** w `js/app.js`, `checkout.html`, `katalog.html` i
`index.html` (to tylko wyświetlanie; obowiązuje cena z Workera).

Sekrety Workera (Cloudflare → Workers & Pages → vairem-hubspot-sync →
Settings → Variables and Secrets, typ *Secret*):

| Nazwa | Wartość |
|---|---|
| `HUBSPOT_PRIVATE_APP_TOKEN` | token Private App z HubSpot |
| `STRIPE_SECRET_KEY` | `sk_test_…` (piaskownica) lub `sk_live_…` (produkcja) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` z kroku poniżej |

Webhook w Stripe (Deweloperzy → Webhooki → Dodaj punkt końcowy):
- adres: `https://vairem-hubspot-sync.<twoja-subdomena>.workers.dev/stripe-webhook`
- zdarzenia: `checkout.session.completed` i `checkout.session.async_payment_succeeded`
- po utworzeniu skopiuj *Klucz podpisywania* (`whsec_…`) do sekretu `STRIPE_WEBHOOK_SECRET`.

Przejście na produkcję: w trybie „na żywo” utwórz **osobny** webhook i podmień
oba sekrety (`sk_live_…`, nowy `whsec_…`). Potem ustaw w `src/index.js`
`LEGACY_SYNC_ENABLED = false` i wdróż (`npx wrangler deploy`), żeby nikt nie mógł
tworzyć transakcji bez płatności.

## 7. CORS

Worker akceptuje zapytania tylko z `https://vairemoffice-prog.github.io`
(zdefiniowane w `src/index.js` jako `ALLOWED_ORIGIN`). Jeśli strona kiedyś
przeniesie się pod własną domenę, zaktualizuj tę stałą i wdróż ponownie
(`npx wrangler deploy`).
