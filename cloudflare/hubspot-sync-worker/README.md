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
płatności** (webhook `payment_intent.succeeded`). Ceny, rabat (`WITAJ10`) i dostawę (9,99 zł, gratis
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
- zdarzenie: `payment_intent.succeeded` (płatność udana; to jedyne, którego używa Worker, inne ignoruje)
- styl ładunku: **Snapshot** (nie „Thin”)
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


## 8. Przypomnienie o porzuconym koszyku

W kasie (krok „Dostawa”) jest pole „Chcę otrzymać jedną wiadomość e-mail
z przypomnieniem…” — **domyślnie niezaznaczone**. Dopiero po zaznaczeniu
i przejściu dalej strona wysyła `POST /abandoned` do Workera, a ten zapisuje
w kontakcie HubSpot zgodę, listę produktów i wartość koszyka (cenę Worker
liczy sam z `PRODUCTS`). Po udanej płatności Worker czyści te pola, żeby
przypomnienie nie poszło do osoby, która jednak kupiła.

### 8.1 Właściwości kontaktu w HubSpot (raz)

Settings → Properties → Contact properties → Create property:

| Etykieta (dowolna)               | Typ                 | Stała w `src/index.js` |
|----------------------------------|---------------------|------------------------|
| VAIREM — zgoda na przypomnienie  | Single checkbox     | `PROP_CART_CONSENT`    |
| VAIREM — produkty w koszyku      | Single-line text    | `PROP_CART_ITEMS`      |
| VAIREM — wartość koszyka (PLN)   | Number              | `PROP_CART_VALUE`      |

Tak jak w sekcji 1: sprawdź **rzeczywistą nazwę wewnętrzną** każdej
właściwości i popraw stałe na górze `src/index.js`, jeśli się różnią
(domyślnie `vairem_koszyk_zgoda`, `vairem_koszyk_produkty`,
`vairem_koszyk_wartosc`). Dopóki właściwości nie istnieją, `/abandoned`
zwraca błąd 502, ale **nie wpływa na realizację zamówień**.

### 8.2 Workflow (Automation → Workflows → Contact-based)

1. **Wyzwalacz:** „VAIREM — zgoda na przypomnienie” jest równe *true*
   ORAZ „VAIREM — wartość koszyka” jest znana. Włącz ponowne zapisywanie
   (re-enrollment) po zmianie wartości koszyka.
2. **Opóźnienie:** 1 godzina (opcjonalnie 24 h na drugą wiadomość — ale zgoda
   dotyczy *jednej* wiadomości, więc zostaw jedną).
3. **Warunek (If/then):** „VAIREM — wartość koszyka” nadal jest znana.
   (Po zakupie Worker ją czyści, więc kupujący odpadają tutaj.)
4. **Akcja:** wyślij e-mail z przypomnieniem. W treści użyj tokenów kontaktu
   `{{ contact.vairem_koszyk_produkty }}` i `{{ contact.vairem_koszyk_wartosc }}`
   oraz linku do `https://vairemoffice-prog.github.io/vairem/checkout.html`
   (koszyk jest zapamiętany w przeglądarce klienta, więc działa na tym samym
   urządzeniu).
5. **Akcja:** wyczyść „VAIREM — wartość koszyka” i „VAIREM — produkty
   w koszyku”, żeby wiadomość nie poszła drugi raz.

Wiadomość musi zawierać stopkę z linkiem do wypisania się (HubSpot dodaje ją
do e-maili marketingowych automatycznie).

### 8.3 Wdrożenie

```bash
cd cloudflare/hubspot-sync-worker
npx wrangler deploy
```

Uwaga: zaznaczenie pola przez osobę wpisującą cudzy adres nie jest tu
weryfikowane (brak double opt-in). Jeśli to ryzyko jest niepożądane, dodaj
w workflow krok z potwierdzeniem adresu przed wysyłką.
