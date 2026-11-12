# Vairem — Strategia marki: uzupełnienie

Uzupełnia dokument „Vairem — Strategia marki" (12.11.2026) o to, co już wiadomo o Vairem ze strony i repozytorium (stan: commit `2b84e2b`, 12.11.2026). Każdy fakt poniżej pochodzi ze strony lub kodu; to, co jest moją propozycją, jest oznaczone jako **propozycja**.

---

## 1. Co już wiemy o Vairem (a czego nie ma w PDF-ie)

| Obszar | Stan na stronie | Wniosek dla strategii |
|---|---|---|
| Nazwa i źródło | Strona „O marce": VAIREM nawiązuje do fazy REM (Rapid Eye Movement). Podpis: „VAIREM — A trace of a dream." | Gotowa, prawdziwa historia nazwy. PDF jej nie używa, a pasuje do idei „sen / pamięć". |
| Głos założyciela | „O marce" pisane w 1. osobie liczby pojedynczej („interesuje mnie…"). Marka na styku „sztuki, designu i zapachu", przedmiot jako obiekt artystyczny. | Dwa rejestry: założyciel w 1. os. (o marce, Journal), produkt w 2. os. (sceny, karty). Nie mieszać. |
| Zapachy | 017 Anamnesis, 042 Nocturne, 086 Liminal — „Archiwum snów". Opisy `[TAGLINE]`, `[OPIS]`, `[CHARAKTER]`, `[FORMULA]` nadal puste. | Są nazwy i numery, brakuje scen. PDF ma sceny (sekcja 3a). |
| Dane produktu | Naczynie 200 ml, stężenie 0,8 %, dyfuzja pasywna bez ciepła, do 40 m², 10–14 tyg., szkło wielokrotnego użytku, nośnik biodegradowalny, bez alkoholu. | „Bez alkoholu" i „bez prądu" to realna, tania do powiedzenia przewaga. Wszystko wymaga potwierdzenia testami (PDF też tak mówi). |
| Cena i koszty | 249 zł za 200 ml (1,25 zł/ml), ceny z VAT. Wysyłka 9,99 zł, gratis od 300 zł (po rabacie). Kod `WITAJ10` (−10 %). | Cena jest w górnej części widełek z PDF-a (189–249 zł). Patrz sekcja 2 i 4. |
| Obsługa | Wysyłka 1–3 dni rob., zwrot 30 dni (ponad ustawowe 14), BLIK, karta, Apple/Google Pay, P24, faktura VAT na życzenie. | Gotowy „fundament dowodów" do messaging house. |
| Usługa | **Personal Memory** — autorska interpretacja snu/wspomnienia klienta: tekst, opis atmosfery i zapachowego charakteru, imię lub podpis, indywidualny tytuł; „na zamówienie". | Nie ma jej w PDF-ie, a jest najmocniejszym wcieleniem idei marki. Sekcja 3b. |
| Treści | **List** (newsletter, 4–5 wysyłek w roku, „bez ofert") oraz **Journal** (eseje z serii MATTER, np. „Czy metal pachnie?", 04.10.2026). | PDF zakłada „Dziennik snów" co 2 tygodnie. Patrz sekcja 2. |
| Doświadczenie strony | PL/EN, tryb dzień/noc z muzyką, animacje, strona na GitHub Pages. | EN „w tle" już istnieje. Tryb nocny to dosłowny „sen" — dobry nośnik marki. |
| Zaplecze | Stripe (jeszcze sandbox), Cloudflare Worker, synchronizacja z HubSpotem, automatyczny teaser na Telegram. | Sprzedaż jeszcze nie działa na żywo (lista kontrolna w `docs/uruchomienie-na-zywo.md`). |
| Dane firmy | Kontakt: vairem.office@gmail.com, Warszawa; w regulaminie i stopce nadal `[NIP]`, `[ADRES]`, `[DOMENA]`. | Do uzupełnienia przed sprzedażą. Adres na gmail osłabia „niszową markę" — propozycja: skrzynka na własnej domenie. |

---

## 2. Rozbieżności: strategia ↔ strona

| # | PDF | Strona | Rekomendacja |
|---|---|---|---|
| 1 | Sny: 01 Porcelana, 02 Szklarnia nocą, 03 Wosk i perła; kolekcja „Reverie No. 1" | 017 Anamnesis, 042 Nocturne, 086 Liminal | **Zostawić nazwy ze strony jako nazwy produktów, a sceny z PDF-a zrobić ich opisem.** Mapowanie jest naturalne (3a). „Reverie No. 1" może zostać nazwą kolekcji w kopiach i na pudełku. |
| 2 | Cena 219 zł (propozycja) | 249 zł wszędzie (strona + Worker) | Decyzja należy do Ciebie. 249 zł jest w widełkach, ale to dolny kraniec niszowego poziomu bez znanej marki. Test w ankiecie przed premierą (jest już w planie badań) i zmiana w jednym miejscu: `js/app.js`, `checkout.html`, `index.html`, `katalog.html` i `PRODUCTS` w Workerze. |
| 3 | Czcionki: Century Gothic + Calibri | Cabinet Grotesk, IBM Plex Mono, Space Grotesk, Zeyada | Strona jest dalej niż PDF od „lekko, dużo powietrza". **Zdecydować jedną rodzinę** i aktualizować dokument albo stronę. Do czasu decyzji PDF jest nieaktualny w tym punkcie. |
| 4 | Tylko dwa kolory: #A8BACB i #525A65 | Oba są w CSS, ale obok jest ok. 10 innych szarości/błękitów (#6C7C88, #8A93A0, #E6F2FB…) | Pochodne odcienie neutralne są OK; zapisać to jako zasadę („dwa kolory + ich tinty") zamiast „tylko dwa". |
| 5 | Nie mówimy „molekularny", „formuła", „laboratorium"; nie ujawniamy produkcji | Pola „MASA MOLOWA", „PRÓG WYKRYWALNOŚCI", `[FORMULA]`, link „Metoda", „STĘŻENIE 0,8 %" | Zdecydować: albo „precyzja w cieniu" (usunąć z wierzchu tabelę techniczną, zostawić „Metodę" jako dopisek), albo świadomie przyjąć język nauki. Obecnie strona jest w połowie drogi. |
| 6 | Newsletter „Dziennik snów" co 2 tygodnie | „List", 4–5 wysyłek rocznie, bez ofert | Przy celu 500 adresów w 90 dni 4–5 listów rocznie to za mało, by rozgrzać listę. **Propozycja:** przed premierą „Dziennik snów" co 2 tygodnie (krótkie sceny), po premierze „List" jako rzadki, długi format. |
| 7 | Premiera: „lutym–marcu lepiej niż pośpiech" | Sandbox, szablony prawne z lukami | Zgadza się ze stanem faktycznym. Propozycja terminu w sekcji 3g. |
| 8 | Zwrot: „łatwy zwrot" jako sposób na barierę „nie mogę powąchać" | Regulamin: zwrot otwartego/użytego produktu może zostać odrzucony | Zwrot nie rozwiąże bariery — rozwiązuje ją **zestaw próbek** (49 zł z kuponem). Nie obiecywać na stronie „zwrotu bez pytań". |
| 9 | Refill 149 zł „ok. 30 % taniej" | Strona nie ma refilla w ofercie (jest tylko pozycja w stopce „Naczynia i refill") | Przy 249 zł refill 149 zł to ok. **40 %** taniej, przy 219 zł — ok. 32 %. Argument „30 %" aktualny tylko przy cenie 219 zł. |
| 10 | Hasła: „Pamiętasz to, choć nigdy się nie wydarzyło" / „Scents of what you dreamt" | Hero: „Powietrze nie jest puste"; podpis EN: „A trace of a dream" | Trzy hasła w użyciu. Hierarchia w 3d. |

---

## 3. Luki, które uzupełniam

### 3a. Sceny dla trzech zapachów (propozycja)

Mapowanie nazw ze strony na sny z PDF-a; ostatnie kolumny wypełniają puste pola `[TAGLINE]` i `[CHARAKTER]`. To szkice w głosie z PDF-a (konkretna godzina, przedmiot, krótki finał) do sprawdzenia na prototypach.

| Nr | Nazwa | Drzwi (z PDF) | Scena | Szkic `[TAGLINE]` | Kierunek (hipoteza) |
|---|---|---|---|---|---|
| 017 | Anamnesis (gr. przypominanie) | Wspomnienie | Pokój babci, w którym nigdy nie byłeś | „Jest 6:12. Na stole stoi filiżanka, której nie pamiętasz, choć znasz każde pęknięcie." | pudrowy, mleczny, irys, białe piżmo |
| 042 | Nocturne | Sen | Szklarnia nocą: mokre liście, oddech na szkle | „Szyba jeszcze zaparowana. Ktoś przed chwilą wyszedł i zostawił po sobie liście." | zielony, mineralny, figa, mech |
| 086 | Liminal (łac. próg) | Skojarzenie | Zgaszona świeca w teatrze po spektaklu | „Spektakl się skończył. Kurtyna jeszcze pamięta ciepło." | ciepły, ambrowy, kadzidło, wosk pszczeli |

Mapowanie działa też koncepcyjnie: Anamnesis = wspomnienie, Nocturne = sen, Liminal = próg między jawą a snem, czyli „zapach jako próg" z hasła w PDF-ie.

### 3b. Personal Memory jako czwarty filar

PDF mówi: *„Przywracać ludziom obrazy, których nie umieją nazwać"*. Personal Memory robi dokładnie to, tylko na zamówienie. Propozycje:

- **Rola:** wysoka marża, wysoki prestiż, najlepszy materiał do komunikacji (autentyczne sny klientów).
- **Połączenie z lejkiem:** ankieta z PDF-a („opisz swój najdziwniejszy sen") może być furtką do tej usługi.
- **Do rozstrzygnięcia:** cena, czas realizacji, liczba zleceń na miesiąc (praca ręczna jednej osoby), zasady prywatności. Publikacja snu klienta tylko za pisemną zgodą — PDF już to zakłada w planie premiery.
- **Ograniczenie:** to usługa pracochłonna; wprowadzać dopiero po starcie sprzedaży dyfuzora, żeby nie rozproszyć jedynego kanału i jedynego budżetu.

### 3c. „Archiwum snów" jako ramę świata

Numeracja 017 / 042 / 086 i hasło „Archiwum 017—086" tworzy wrażenie istniejącej kolekcji. To mocne narzędzie dla wartości „Unikalność ponad powtarzalność" i dla karty „Twój flakon nie ma bliźniaka". **Uwaga:** dopóki istnieją trzy zapachy, tekst nie powinien twierdzić, że w archiwum jest ich 70 (marka zapowiada „Precyzję" i „Odpowiedzialność za materię"). Wystarczy sformułowanie „archiwum, które dopiero zapisujemy".

### 3d. Hierarchia haseł (propozycja)

| Poziom | Hasło | Gdzie |
|---|---|---|
| Idea / dach (PL) | Pamiętasz to, choć nigdy się nie wydarzyło. | opakowanie, newsletter, karta-opowieść |
| Wejście na stronę | Powietrze nie jest puste. | hero |
| Podpis (EN) | A trace of a dream. | stopka, bio, wersja EN |
| Do testu w ankiecie | Scents of what you dreamt / Zapach, który zostaje po śnie / Dom pamięta twoje sny | ankieta z PDF-a |

### 3e. Kanały, których PDF nie ujmuje

| Kanał | Co jest na stronie | Rola |
|---|---|---|
| Journal (MATTER) | Esej „Czy metal pachnie?" — długi, rzetelny, ciekawy | SEO, Pinterest, „precyzja w cieniu". Wystarczy jeden esej na miesiąc. |
| Strona z trybem nocnym | Dzień/noc + muzyka | „Sen" w praktyce: zaprosić do wejścia w tryb nocny w komunikacji. **Do sprawdzenia:** licencja muzyki (`docs/muzyka-licencja.md`). |
| Telegram | Automatyczny teaser po każdym `push` na `main` | Tani, ale powtarzalny. Przy zasadzie „jeden kanał główny" lepiej wyłączyć lub ręcznie przejść na zapowiedzi premiery. |

### 3f. Okazje prezentowe w Polsce

Persona „Szukająca prezentu" potrzebuje dat. Jeśli premiera wypadnie w lutym–marcu: **Walentynki (14.02)** i **Dzień Kobiet (8.03)** jako pierwsze okna, **Dzień Matki (26.05)** jako drugie; sezon świąteczny (listopad–grudzień) jako docelowy dla zestawu prezentowego w drugim roku.

### 3g. Propozycja terminów (do potwierdzenia)

| Etap | Data | Uwagi |
|---|---|---|
| Dni 1–30: zapowiedź | od 1 grudnia 2026 | rozmowy (15–20), ankieta, profil, lista |
| Dni 31–60: odsłona | styczeń 2027 | sceny trzech snów, próbki do twórców |
| Dni 61–90: premiera | przełom lutego i marca 2027 | zbieżna z Dniem Kobiet; Walentynki raczej poza zasięgiem |
| Przed premierą | styczeń–luty | Stripe na żywo, dane firmy, regulamin, etykieta CLP |

---

## 4. Poprawki liczb w PDF-ie

1. **KPI „100 dyfuzorów w 3 miesiące" nie wynika z lejka w tym samym dokumencie.** 500 adresów → 50 zestawów próbek → 20 % konwersji próbka → dyfuzor = **ok. 10 dyfuzorów**. Żeby dojść do 100, potrzeba np. 500 adresów × ok. 20 % kupujących od razu lub kilkakrotnie większej listy. Albo obniżyć cel (np. 30–50 w 3 mies.), albo podnieść cel listy, albo dodać drugą ścieżkę (bezpośredni zakup z listy).
2. **Cena netto:** 249 zł brutto = ok. 202 zł netto (VAT 23 %); 219 zł = ok. 178 zł; refill 149 zł = ok. 121 zł. Przy zestawie próbek 49 zł brutto (ok. 40 zł netto) wraz z wysyłką i opakowaniem marża na próbce może być bliska zera — policzyć przed premierą.
3. **Próg darmowej wysyłki 300 zł** nie jest osiągany przy jednym dyfuzorze (249 zł), a jest osiągany przy dyfuzorze + refillu (398 zł). To naturalny, prawdziwy argument do powtórnego zakupu.

---

## 5. Dodatkowe ryzyka

| Ryzyko | Prawdopodobieństwo | Co robimy |
|---|---|---|
| Oświadczenia „biodegradowalny", „bez alkoholu", „do 40 m²", „10–14 tygodni" bez badań | Wysokie | Przed sprzedażą testy i ewentualna konsultacja prawna; ogólne hasła ekologiczne są w UE coraz ściślej regulowane (dyrektywa o wzmocnieniu pozycji konsumentów, 2024/825). **Do weryfikacji z prawnikiem.** |
| Placeholdery na stronie (`[TAGLINE]`, `[OPIS]`, `[FORMULA]`, NIP `000 000 00 00`) po starcie sprzedaży | Pewne, jeśli nie zostaną uzupełnione | Dopisać do listy kontrolnej przed publikacją. Sprawdza to `scripts/check-site.mjs`. |
| Rozjazd cen między stroną a Workerem | Średnie | Jedno źródło prawdy (np. jeden plik z cenami). Obecnie cena jest w pięciu miejscach. |
| Jedna osoba obsługuje: Instagram, sklep, newsletter, Personal Memory | Wysokie | Kolejność: lista → próbki → premiera → dopiero wtedy Personal Memory. |
| Pozycja marki na gmailu i githubowej domenie | Średnie | Własna domena i skrzynka (`vairem.pl` pojawia się już w stopce) przed pierwszą kampanią. |

---

## 6. Do potwierdzenia przez Ciebie

1. Cena dyfuzora: 219 zł (PDF) czy 249 zł (strona)? A refill 149 zł?
2. Nazwy snów: zostają **Anamnesis / Nocturne / Liminal**, a „Porcelana / Szklarnia nocą / Wosk i perła" stają się scenami?
3. Czcionki: Century Gothic + Calibri (PDF) czy rodzina ze strony?
4. „Metoda" i parametry techniczne na wierzchu strony: zostają, czy chowamy zgodnie z zasadą „precyzja w cieniu"?
5. Newsletter: „Dziennik snów" co 2 tygodnie przed premierą, a „List" po premierze?
6. Personal Memory: czy wchodzi do pierwszych 90 dni, czy dopiero po premierze?
7. Termin premiery: luty–marzec 2027?
8. Cele biznesowe (3 mies. / 20 % powtórnych / UE w 12–18 mies.) — nadal robocze?
