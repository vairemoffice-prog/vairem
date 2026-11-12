## Aneks: stan strony, przyjęte decyzje i rachunki

Aneks uzupełnia strategię o to, co o Vairem wiadomo ze strony i repozytorium (stan: commit `2b84e2b`, 12.11.2026), wyjaśnia, dlaczego przyjęto konkretne decyzje, i zbiera rachunki, na których opierają się liczby w głównym tekście. Fakty pochodzą ze strony lub kodu; to, co jest propozycją, jest oznaczone jako **propozycja**.

### A. Stan strony

| Obszar | Stan na stronie | Wniosek dla strategii |
| --- | --- | --- |
| Nazwa i źródło | „O marce”: VAIREM nawiązuje do fazy REM (Rapid Eye Movement). Podpis: „VAIREM — A trace of a dream.” | Prawdziwa historia nazwy pasuje do idei „sen / pamięć”. |
| Głos założyciela | „O marce” pisane w 1. osobie liczby pojedynczej („interesuje mnie…”); marka na styku sztuki, designu i zapachu. | Dwa rejestry: założyciel w 1. os. (o marce, Journal), produkt w 2. os. (sceny, karty). Nie mieszać. |
| Zapachy | 017 Anamnesis, 042 Nocturne, 086 Liminal — „Archiwum snów”. Opisy `[TAGLINE]`, `[OPIS]`, `[CHARAKTER]`, `[FORMULA]` są jeszcze puste. | Są nazwy i numery, brakuje scen (sekcja C). |
| Dane produktu | Naczynie 200 ml, stężenie 0,8 %, dyfuzja pasywna bez ciepła, do 40 m², 10–14 tyg., szkło wielokrotnego użytku, nośnik biodegradowalny, bez alkoholu. | „Bez alkoholu” i „bez prądu” to realna, tania do powiedzenia przewaga. Wszystko wymaga potwierdzenia testami. |
| Cena i koszty | 249 zł za 200 ml (1,25 zł/ml), ceny z VAT. Wysyłka 9,99 zł, gratis od 300 zł (po rabacie). Kod `WITAJ10` (−10 %). | Cena w górnej części widełek 189–249 zł. |
| Obsługa | Wysyłka 1–3 dni rob., zwrot 30 dni (ponad ustawowe 14), BLIK, karta, Apple/Google Pay, P24, faktura VAT na życzenie. | Gotowy „fundament dowodów” do messaging house. |
| Usługa | **Personal Memory**: autorska interpretacja snu lub wspomnienia klienta, na zamówienie. | Wcielenie idei marki; w strategii po premierze dyfuzora. |
| Treści | „List” (newsletter, 4–5 wysyłek w roku, bez ofert) i Journal (seria MATTER, np. „Czy metal pachnie?”). | Patrz decyzje w sekcji B. |
| Doświadczenie strony | PL/EN, tryb dzień/noc z muzyką, animacje, GitHub Pages. | EN „w tle” już istnieje; tryb nocny to dosłowny „sen”. |
| Zaplecze | Stripe (jeszcze sandbox), Cloudflare Worker, HubSpot, automatyczny teaser na Telegram. | Sprzedaż jeszcze nie działa na żywo (lista kontrolna w `docs/uruchomienie-na-zywo.md`). |
| Dane firmy | Kontakt: vairem.office@gmail.com, Warszawa; w regulaminie i stopce nadal `[NIP]`, `[ADRES]`, `[DOMENA]`. | Do uzupełnienia przed sprzedażą; adres na gmail osłabia „niszową markę” — **propozycja:** skrzynka na własnej domenie. |

### B. Przyjęte decyzje i uzasadnienie

W razie rozbieżności między wcześniejszą wersją strategii a stroną przyjęto stan strony, bo jest już wdrożony. Wszystkie decyzje są robocze i do potwierdzenia.

| Temat | Decyzja | Uzasadnienie |
| --- | --- | --- |
| Nazwy snów | Anamnesis (017), Nocturne (042), Liminal (086); sceny jako ich opis; „Reverie No. 1” nazwą kolekcji | Nazwy i numery są już na stronie i na Telegramie. Mapowanie na sceny jest naturalne (sekcja C). |
| Cena | Dyfuzor 249 zł, wkład 149 zł | Tak jest w sklepie i w Workerze. Dla ceny jedno miejsce prawdy: `js/app.js`, `checkout.html`, `index.html`, `katalog.html`, `PRODUCTS` w Workerze. Test w ankiecie przed premierą. |
| Refill | „Ok. 40 % taniej” | 149 zł wobec 249 zł; „30 %” było prawdziwe tylko przy cenie 219 zł. |
| Czcionki | Cabinet Grotesk, IBM Plex Mono, Zeyada | Tak wygląda strona; zmiana wymagałaby przebudowy. |
| Kolory | Dwa kolory plus ich neutralne tinty | CSS używa ok. 10 pochodnych szarości i błękitów obok #A8BACB i #525A65. |
| Język techniczny | Dane praktyczne tak (stężenie, metraż, czas, brak alkoholu); „masa molowa”, „formuła” nie | Zgodne z zasadą „precyzja w cieniu”. **Wymaga zmiany strony** (pola `MASA MOLOWA`, `PRÓG WYKRYWALNOŚCI`, `[FORMULA]`). |
| Newsletter | „Dziennik snów” co 2 tygodnie do premiery, potem „List” 4–5 razy w roku | 4–5 listów rocznie nie rozgrzeje listy 500 adresów w 90 dni. |
| Zwroty | Nie obiecujemy „zwrotu bez pytań” | Regulamin pozwala odrzucić zwrot otwartego lub użytego produktu; barierę „nie mogę powąchać” zdejmuje zestaw próbek (49 zł z kuponem). |
| Hasła | Idea: „Pamiętasz to, choć nigdy się nie wydarzyło”; hero: „Powietrze nie jest puste”; podpis EN: „A trace of a dream” | Trzy hasła są już w użyciu; potrzebna hierarchia. |
| Termin | Zapowiedź od 1 grudnia 2026, premiera na przełomie lutego i marca 2027 | W 2026 nie zdążymy przed szczytem prezentowym; Dzień Kobiet (8.03) jako pierwsze okno, Dzień Matki (26.05) jako drugie. |

### C. Sceny dla trzech zapachów (propozycja)

Mapowanie nazw ze strony na sny z koncepcji; ostatnie kolumny wypełniają puste pola `[TAGLINE]` i `[CHARAKTER]`. To szkice w głosie marki (konkretna godzina, przedmiot, krótki finał) do sprawdzenia na prototypach.

| Nr | Nazwa | Drzwi | Scena | Szkic `[TAGLINE]` | Kierunek (hipoteza) |
| --- | --- | --- | --- | --- | --- |
| 017 | Anamnesis (gr. przypominanie) | Wspomnienie | Pokój babci, w którym nigdy nie byłaś | „Jest 6:12. Na stole stoi filiżanka, której nie pamiętasz, choć znasz każde pęknięcie.” | pudrowy, mleczny, irys, białe piżmo |
| 042 | Nocturne | Sen | Szklarnia nocą: mokre liście, oddech na szkle | „Szyba jeszcze zaparowana. Ktoś przed chwilą wyszedł i zostawił po sobie liście.” | zielony, mineralny, figa, mech |
| 086 | Liminal (łac. próg) | Skojarzenie | Zgaszona świeca w teatrze po spektaklu | „Spektakl się skończył. Kurtyna jeszcze pamięta ciepło.” | ciepły, ambrowy, kadzidło, wosk pszczeli |

**Uwaga o „Archiwum snów”:** numeracja 017 / 042 / 086 i hasło „Archiwum 017—086” sugerują większą kolekcję. Dopóki istnieją trzy zapachy, tekst nie powinien twierdzić, że w archiwum jest ich siedemdziesiąt; wystarczy „archiwum, które dopiero zapisujemy”.

### D. Rachunki

1. **Lejek 3-miesięczny:** 500 adresów → ok. 50 zestawów próbek → przy 20 % konwersji ok. 10 dyfuzorów. Do tego ok. 25 zakupów bezpośrednich z listy (ok. 5 %) i polecenia: razem ok. 40. Pierwotny cel 100 dyfuzorów nie wynikał z tego lejka.
2. **Cena netto** (VAT 23 %): dyfuzor 249 zł brutto = ok. 202 zł netto; wkład 149 zł = ok. 121 zł; zestaw próbek 49 zł = ok. 40 zł. Marża na próbce po kosztach wysyłki i opakowania może być bliska zera — policzyć przed premierą.
3. **Próg darmowej wysyłki 300 zł** nie jest osiągany przy jednym dyfuzorze (249 zł), ale jest osiągany przy dyfuzorze i wkładzie (398 zł): prawdziwy argument do powtórnego zakupu.

### E. Dodatkowe ryzyka

| Ryzyko | Prawdopodobieństwo | Co robimy |
| --- | --- | --- |
| Twierdzenia „biodegradowalny”, „bez alkoholu”, „do 40 m²”, „10–14 tygodni” bez badań | Wysokie | Testy przed sprzedażą; ogólne hasła ekologiczne są w UE coraz ściślej regulowane (dyrektywa 2024/825) — **do weryfikacji z prawnikiem** |
| Placeholdery na stronie (`[TAGLINE]`, `[OPIS]`, `[FORMULA]`, NIP `000 000 00 00`) po starcie sprzedaży | Pewne, jeśli nie zostaną uzupełnione | Dopisać do listy kontrolnej przed publikacją (sprawdza to `scripts/check-site.mjs`) |
| Rozjazd cen między stroną a Workerem | Średnie | Jedno źródło prawdy; obecnie cena jest w pięciu miejscach |
| Jedna osoba obsługuje Instagram, sklep, newsletter i Personal Memory | Wysokie | Kolejność: lista → próbki → premiera → dopiero potem Personal Memory |
| Gmail i domena githubowa | Średnie | Własna domena i skrzynka (`vairem.pl` jest już w stopce) przed pierwszą kampanią |
| Telegram: automatyczny teaser po każdym `push` na `main` | Niskie | Wyłączyć albo zamienić na zapowiedzi premiery (zasada „jeden kanał główny”) |
| Licencja muzyki w trybie nocnym | Niskie | Sprawdzić `docs/muzyka-licencja.md` |

### F. Do potwierdzenia

1. Cena dyfuzora 249 zł i wkładu 149 zł.
2. Nazwy Anamnesis / Nocturne / Liminal jako nazwy produktów.
3. Czcionki ze strony.
4. Ukrycie pól technicznych („masa molowa”, „formuła”) na stronie.
5. „Dziennik snów” przed premierą i „List” po niej.
6. Personal Memory dopiero po premierze.
7. Termin: zapowiedź od 1 grudnia 2026, premiera na przełomie lutego i marca 2027.
8. Cele biznesowe (3 miesiące / 20 % powtórnych / UE w 12–18 miesięcy) — nadal robocze.
