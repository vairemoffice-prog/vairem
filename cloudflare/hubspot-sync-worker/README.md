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

Settings → Properties → Contact properties → Create property, dla każdej:

| Nazwa wewnętrzna (internal name) | Typ      | Etykieta                  |
|-----------------------------------|----------|---------------------------|
| `vairem_ltv`                      | Number   | VAIREM — LTV (PLN)        |
| `vairem_order_count`              | Number   | VAIREM — liczba zamówień  |
| `vairem_last_order_at`            | Date     | VAIREM — ostatnie zamówienie |

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

## 5. Podepnij adres Workera w checkout.html

W pliku `checkout.html` znajdź stałą `ORDER_SYNC_WORKER_URL` (obecnie pusty
string — do tego czasu wysyłka zamówień do HubSpot jest wyłączona, strona
działa normalnie) i wstaw adres z kroku 3, np.:

```js
var ORDER_SYNC_WORKER_URL = 'https://vairem-hubspot-sync.twoja-subdomena.workers.dev';
```

## 6. CORS

Worker akceptuje zapytania tylko z `https://vairemoffice-prog.github.io`
(zdefiniowane w `src/index.js` jako `ALLOWED_ORIGIN`). Jeśli strona kiedyś
przeniesie się pod własną domenę, zaktualizuj tę stałą i wdróż ponownie
(`npx wrangler deploy`).
