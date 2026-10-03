# Uruchomienie sprzedaży na żywo — lista kontrolna

Stan na dziś: sklep działa na **sandboxie Stripe** (płatności testowe). Prawdziwi
klienci nie mogą zapłacić. Poniżej wszystko, co trzeba zrobić, żeby przyjmować
prawdziwe pieniądze. Odhaczaj po kolei.

## 0. Zanim zaczniesz — potrzebne dane
- [ ] Dane firmy: nazwa, forma prawna, adres siedziby, NIP, REGON (lub KRS)
- [ ] Dane osoby reprezentującej: imię, nazwisko, data urodzenia, adres, PESEL, dokument tożsamości
- [ ] Firmowe konto bankowe w PLN (IBAN) na wypłaty
- [ ] Adres sklepu i krótki opis działalności

## 1. Stripe — konto na żywo
- [ ] Aktywuj konto (panel Stripe → „Aktywuj konto"), wypełnij dane firmy i konto bankowe
- [ ] Poczekaj na weryfikację (od kilku minut do kilku dni)
- [ ] Nazwa na wyciągu klienta: `VAIREM`
- [ ] Ustawienia → Metody płatności: włącz **BLIK, Przelewy24, Apple Pay, Google Pay** (PLN) — osobno od sandboxa
- [ ] Ustawienia → E-maile klienta: włącz **„Wysyłaj paragony za udane płatności"**
- [ ] Deweloperzy → Webhooki → Dodaj endpoint (konto **na żywo**):
  - adres: `https://vairem-hubspot-sync.hubspot-sync-worker.workers.dev/stripe-webhook`
  - zdarzenie: `payment_intent.succeeded`
  - skopiuj **Signing secret** (`whsec_…`)
- [ ] Deweloperzy → Klucze API (konto na żywo): skopiuj **Secret key** (`sk_live_…`)

## 2. Cloudflare — sekrety i kod
- [ ] Workers & Pages → `vairem-hubspot-sync` → Settings → Variables and Secrets:
  - `STRIPE_SECRET_KEY` = `sk_live_…`
  - `STRIPE_WEBHOOK_SECRET` = nowe `whsec_…` (z konta na żywo)
- [ ] Wdróż aktualny kod Workera z `main` (`cloudflare/hubspot-sync-worker/src/index.js`):
  `cd cloudflare/hubspot-sync-worker && npx wrangler deploy`.
  Uwaga: kod w repo ma zmiany (np. faktura VAT), których nie ma w ręcznie edytowanym Workerze.
- [ ] Sekretów nie wklejaj na czacie ani do repo

## 3. Strona
- [ ] Ceny: 249 zł w `js/app.js`, `checkout.html`, `index.html`, `katalog.html` **oraz** w `PRODUCTS` w Workerze — muszą być takie same
- [ ] Wysyłka: 9,99 zł, gratis od 300 zł (po rabacie) — zgodne z regulaminem
- [ ] Kod rabatowy `WITAJ10` (−10%): zostaw albo usuń z `DISCOUNT_CODE` w Workerze i na stronie
- [ ] Regulamin, polityka prywatności, zasady zwrotów: uzupełnij **dane firmy** (nazwa, adres, NIP, e-mail kontaktowy)
- [ ] Zwrot 30 dni, wysyłka 1–3 dni — sprawdź, czy to prawda i czy zgadza się z regulaminem

## 4. Faktury
- [ ] Klient zaznacza „Chcę otrzymać fakturę VAT" i podaje firmę oraz NIP — trafia to do Stripe (metadata `company`, `nip`) i do HubSpot (opis transakcji, firma kontaktu)
- [ ] Sam dokument faktury trzeba wystawić poza sklepem (system księgowy / księgowa) na podstawie danych z HubSpot lub Stripe
- [ ] Paragon Stripe **nie jest** fakturą VAT

## 5. Próba na żywo
- [ ] Kup 1 produkt własną kartą (249 zł + wysyłka)
- [ ] Sprawdź: płatność w Stripe (na żywo), kontakt i transakcja `VR-…` w HubSpot, paragon w skrzynce
- [ ] Sprawdź webhook w Stripe: przy `payment_intent.succeeded` status „Succeeded"
- [ ] Zwróć płatność (Stripe → Płatności → Zwróć)
- [ ] Test z fakturą: powtórz z zaznaczoną fakturą i prawdziwym NIP-em

## 6. Po uruchomieniu
- [ ] Sprawdzaj codziennie przez pierwszy tydzień: płatności w Stripe vs. transakcje w HubSpot (powinny się zgadzać)
- [ ] Wypłaty pojawią się na koncie po kilku dniach roboczych
- [ ] W razie problemu: Stripe → Deweloperzy → Webhooki → dziennik dostaw; Cloudflare → Worker → Logs

## Wycofanie (gdyby coś poszło źle)
Wróć do kluczy `sk_test_…` i testowego `whsec_…` w Cloudflare. Sklep znów będzie
przyjmował tylko płatności testowe.
