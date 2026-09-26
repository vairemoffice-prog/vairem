(() => {
  'use strict';

  const PRODUCTS = [
    { nr: '017', name: 'Before It Dries', formula: '[FORMULA]', mw: '[MW]', weeks: '[WEEKS]', price: 0, intensity: 0 },
    { nr: '042', name: 'Within', formula: '[FORMULA]', mw: '[MW]', weeks: '[WEEKS]', price: 0, intensity: 0 },
    { nr: '086', name: 'Afterlight', formula: '[FORMULA]', mw: '[MW]', weeks: '[WEEKS]', price: 0, intensity: 0 }
  ];

  const productByNr = nr => PRODUCTS.find(p => p.nr === nr);

  const formatPrice = price => (price === 0 ? '[PRICE]' : `${price} zł`);

  // ---------- i18n ----------

  const CHARACTER_I18N = {
    pl: { '017': '[CHARAKTER]', '042': '[CHARAKTER]', '086': '[CHARAKTER]' },
    en: { '017': '[CHARACTER]', '042': '[CHARACTER]', '086': '[CHARACTER]' },
    es: { '017': '[CARÁCTER]', '042': '[CARÁCTER]', '086': '[CARÁCTER]' },
    uk: { '017': '[ХАРАКТЕР]', '042': '[ХАРАКТЕР]', '086': '[ХАРАКТЕР]' },
    fr: { '017': '[CARACTÈRE]', '042': '[CARACTÈRE]', '086': '[CARACTÈRE]' }
  };

  const I18N = {
    pl: {
      'nav.indeks': 'INDEKS', 'nav.metoda': 'METODA', 'nav.list': 'LIST', 'nav.menu': 'MENU', 'menu.produkty': 'KATALOG',
      'theme.day': 'DZIEŃ', 'theme.night': 'NOC', 'cart.label': 'KOSZYK',
      'tabbar.label': 'WARIANT HERO', 'tab.tablica': '02 · TABLICA', 'tab.wykres': '03 · WYKRES',
      'hero1.eyebrow': 'MOLEKULARNY ZAPACH DO WNĘTRZ · TRZY ZWIĄZKI',
      'hero1.title': 'Powietrze<br>nie jest<br>puste',
      'hero1.lede': 'Jedna molekuła zapachowa naraz, nierozcieńczona opowieścią. Bez nuty głowy, bez wytrącania, bez klasycznej piramidy — czysta forma zapachu, uwalniana powoli do powietrza.<br><br>To, czego nie widać, zmienia to, co czujesz. Nie możesz zobaczyć.<br>Możesz tylko sprawdzić, czy do Ciebie pasuje.<br>Przymierzysz?',
      'cta.wybierz': 'WYBIERZ ZWIĄZEK →', 'cta.metoda_dyfuzji': 'METODA DYFUZJI',
      'stat.zwiazkow': 'ZWIĄZKÓW W INDEKSIE', 'stat.stezenie': 'STĘŻENIE', 'stat.pojemnosc': 'POJEMNOŚĆ',
      'stat.czas': 'CZAS TRWANIA', 'stat.czas_value': '10–14 tyg.',
      'hero2.eyebrow': 'TABLICA ZWIĄZKÓW · 017—086',
      'hero2.title': 'Trzy cząsteczki. Żadnych kompozycji.',
      'hero2.lede': 'Wybierasz związek, nie perfumę. Każde naczynie zawiera jedną molekułę, nazwaną na etykiecie wraz ze wzorem.',
      'cta.pelny_indeks': 'PEŁNY INDEKS →', 'upcoming.copy': 'W badaniu.<br>Cztery razy w roku.', 'cta.zapisz': 'ZAPISZ SIĘ →',
      'hero3.eyebrow': 'KRZYWA UWALNIANIA · POMIAR WŁASNY · 40 M²',
      'hero3.title': 'Zapach jako<br>funkcja czasu.',
      'hero3.lede': 'Dyfuzja pasywna w temperaturze pomieszczenia. Molekuła opuszcza nośnik w tempie, jakiego żąda wnętrze — cieplejsze pomieszczenia czytają po prostu głośniej.',
      'cta.metoda': 'METODA', 'wykres.intensywnosc': 'INTENSYWNOŚĆ / TYDZIEŃ',
      'metric.prog': 'PRÓG', 'metric.zasieg': 'ZASIĘG', 'metric.cena': 'CENA',
      'indeks.title': 'Indeks', 'indeks.note': 'TRZY ZWIĄZKI · PO 200 ML · CENA ZA NACZYNIE',
      'th.nr': 'NR', 'th.zwiazek': 'ZWIĄZEK', 'th.wzor': 'WZÓR', 'th.mw': 'M [G/MOL]',
      'th.charakter': 'CHARAKTER', 'th.intensywnosc': 'INTENSYWNOŚĆ', 'th.tyg': 'TYG.', 'th.cena': 'CENA',
      'index.foot1': 'INTENSYWNOŚĆ MIERZONA PRZY 0,8% W NEUTRALNYM NOŚNIKU, 22 °C',
      'index.foot2': 'DOSTAWA 1–3 DNI ROBOCZE · PL / EU',
      'karta.image_tag': 'ZDJĘCIE PRODUKTU — NACZYNIE, 4:5',
      'karta.thumb.etykieta': 'ETYKIETA', 'karta.thumb.nosnik': 'NOŚNIK', 'karta.thumb.wnetrze': 'WNĘTRZE', 'karta.thumb.detal': 'DETAL',
      'karta.eyebrow_tpl': nr => `${nr} · [TAGLINE]`, 'karta.title': '[TYTUŁ]',
      'karta.lede': '[OPIS]', 'karta.prev': 'Poprzedni produkt', 'karta.next': 'Następny produkt',
      'spec.stezenie': 'STĘŻENIE', 'spec.stezenie_value': '0,8 % w neutralnym nośniku',
      'spec.dyfuzja': 'DYFUZJA', 'spec.dyfuzja_value': 'pasywna, bez ciepła',
      'spec.wielkosc': 'WIELKOŚĆ WNĘTRZA', 'spec.wielkosc_value': 'do 40 m²',
      'spec.czas': 'CZAS TRWANIA', 'spec.czas_value': 'dwanaście tygodni',
      'spec.masa': 'MASA MOLOWA', 'spec.prog': 'PRÓG WYKRYWALNOŚCI',
      'karta.shipping': 'Wysyłka 1–3 dni robocze · zwrot 30 dni', 'cta.do_koszyka': 'DO KOSZYKA',
      'badge.szklo': 'SZKŁO WIELOKROTNEGO UŻYTKU', 'badge.nosnik': 'NOŚNIK BIODEGRADOWALNY', 'badge.alkohol': 'BEZ ALKOHOLU',
      'metoda.title': 'Trzy decyzje i nic więcej.', 'metoda.note': 'METODA · DYFUZJA PASYWNA',
      'metoda1.title': 'Jeden związek',
      'metoda1.copy': 'Nie akord, nie kompozycja. Każde naczynie zawiera jedną molekułę zapachową, nazwaną na etykiecie wraz ze wzorem, żebyś mógł się nauczyć, co naprawdę lubisz.',
      'metoda1.caption': '1 SKŁADNIK / 5 MIEJSC',
      'metoda2.title': 'Bez ciepła',
      'metoda2.copy': 'Dyfuzja pasywna w temperaturze pomieszczenia. Molekuła opuszcza nośnik w tempie, jakiego żąda wnętrze — cieplejsze pomieszczenia czytają po prostu głośniej.',
      'metoda3.title': 'Dwanaście tygodni',
      'metoda3.copy': 'Potem się kończy. Naczynia są szklane i do wielokrotnego napełniania, nośnik biodegradowalny. Nic nie jest pachnące, jeśli nie musi być.',
      'metoda3.caption': 'TYDZIEŃ 01 → 12',
      'list.eyebrow': 'VAIREM.PL/LIST · 4–5 WYSYŁEK W ROKU',
      'list.title': 'List, kiedy dochodzi nowa molekuła.',
      'list.lede': 'Jeden związek wyjaśniony wprost, z powodem, dla którego zajęło to chwilę. Bez ofert, bez odliczania.',
      'list.placeholder': 'vairem.office@gmail.com', 'cta.zapisz_plain': 'ZAPISZ SIĘ',
      'list.note': 'BEZ OFERT. WYPISUJESZ SIĘ JEDNYM KLIKNIĘCIEM.',
      'archive.next': 'NAJBLIŻSZY LIST', 'archive.next_value': '[NASTĘPNY]',
      'archive.last': 'OSTATNI', 'archive.last_value': '086 · Afterlight — [OPIS]',
      'archive.archive': 'ARCHIWUM', 'archive.archive_value': '017—086 · pełne noty',
      'footer.address': 'MOLEKULARNY ZAPACH DO WNĘTRZ<br>WARSZAWA · PL<br>NIP 000 000 00 00',
      'footer.pelny_indeks': 'Pełny indeks →', 'footer.marka': 'MARKA',
      'footer.metoda': 'Metoda', 'footer.list': 'List', 'footer.refill': 'Naczynia i refill',
      'footer.obsluga': 'POMOC', 'footer.kontakt': 'Kontakt', 'footer.wysylka': 'Wysyłka i zwroty', 'footer.regulamin': 'Regulamin',
      'footer.moje_konto': 'MOJE KONTO', 'footer.zamowienia': 'Twoje zamówienia', 'footer.ustawienia_konta': 'Ustawienia konta',
      'footer.platnosc_dostawa': 'PŁATNOŚĆ I DOSTAWA', 'footer.formy_platnosci': 'Formy płatności', 'footer.czas_koszty_dostawy': 'Czas i koszty dostawy', 'footer.czas_realizacji': 'Czas realizacji zamówienia',
      'footer.informacje': 'INFORMACJE', 'footer.polityka_prywatnosci': 'Polityka prywatności',
      'footer.o_nas': 'O NAS', 'footer.blog': 'Blog', 'footer.o_firmie': 'O firmie',
      'footer.vat': 'CENY W PLN, ZAWIERAJĄ VAT',
      'cart.close': 'ZAMKNIJ ✕', 'cart.shipping': 'WYSYŁKA', 'cart.total': 'DO ZAPŁATY',
      'cta.checkout': 'PRZEJDŹ DO PŁATNOŚCI →', 'cart.note': 'ZWROT 30 DNI · SZKŁO DO REFILLU',
      'cart.title_tpl': n => `KOSZYK · ${n} POZ.`,
      'cart.empty': 'KOSZYK PUSTY — WYBIERZ ZWIĄZEK Z INDEKSU.', 'cart.remove': 'USUŃ',
      'newsletter.subscribed': 'ZAPISANO ✓', 'newsletter.thanks': 'DZIĘKUJEMY — POTWIERDŹ LINK W POCZCIE.',
      'tile.weeks_suffix': 'TYG.', 'add_btn': 'DODAJ',
      'cookie.title': 'PLIKI COOKIE',
      'cookie.text': 'Używamy plików cookie, żeby zapamiętać Twój język, motyw i zawartość koszyka oraz zrozumieć, jak korzystasz ze strony. Bez zgody podstawowe funkcje nadal działają.',
      'cookie.accept': 'AKCEPTUJ', 'cookie.reject': 'ODRZUĆ',
      'promo.eyebrow': 'OFERTA NA START',
      'promo.title': '&minus;10% na<br>pierwsze zamówienie',
      'promo.text': 'Nowi w VAIREM dostają jednorazowy kod rabatowy. Wpisz go w podsumowaniu zamówienia — zniżka naliczy się automatycznie.',
      'promo.copy': 'KOPIUJ', 'promo.copied': 'SKOPIOWANO', 'promo.dismiss': 'Nie, dziękuję'
    },
    en: {
      'nav.indeks': 'INDEX', 'nav.metoda': 'METHOD', 'nav.list': 'LETTER', 'nav.menu': 'MENU', 'menu.produkty': 'CATALOG',
      'theme.day': 'DAY', 'theme.night': 'NIGHT', 'cart.label': 'CART',
      'tabbar.label': 'HERO VARIANT', 'tab.tablica': '02 · BOARD', 'tab.wykres': '03 · CHART',
      'hero1.eyebrow': 'MOLECULAR HOME FRAGRANCE · THREE COMPOUNDS',
      'hero1.title': 'Air<br>is not<br>empty',
      'hero1.lede': 'One fragrance molecule at a time, undiluted by a story. No top note, no drydown, no garden in Grasse — one compound released passively for twelve weeks.',
      'cta.wybierz': 'CHOOSE A COMPOUND →', 'cta.metoda_dyfuzji': 'DIFFUSION METHOD',
      'stat.zwiazkow': 'COMPOUNDS IN THE INDEX', 'stat.stezenie': 'CONCENTRATION', 'stat.pojemnosc': 'VOLUME',
      'stat.czas': 'DURATION', 'stat.czas_value': '10–14 wks',
      'hero2.eyebrow': 'COMPOUND BOARD · 017—086',
      'hero2.title': 'Three molecules. No compositions.',
      'hero2.lede': 'You choose a compound, not a perfume. Each vessel holds a single molecule, named on the label along with its formula.',
      'cta.pelny_indeks': 'FULL INDEX →', 'upcoming.copy': 'In research.<br>Four times a year.', 'cta.zapisz': 'SUBSCRIBE →',
      'hero3.eyebrow': 'RELEASE CURVE · OWN MEASUREMENT · 40 M²',
      'hero3.title': 'Scent as<br>a function of time.',
      'hero3.lede': 'Passive diffusion at room temperature. The molecule leaves the carrier at the rate the room demands — warmer rooms simply read louder.',
      'cta.metoda': 'METHOD', 'wykres.intensywnosc': 'INTENSITY / WEEK',
      'metric.prog': 'THRESHOLD', 'metric.zasieg': 'RANGE', 'metric.cena': 'PRICE',
      'indeks.title': 'Index', 'indeks.note': 'THREE COMPOUNDS · 200 ML EACH · PRICE PER VESSEL',
      'th.nr': 'NO.', 'th.zwiazek': 'COMPOUND', 'th.wzor': 'FORMULA', 'th.mw': 'M [G/MOL]',
      'th.charakter': 'CHARACTER', 'th.intensywnosc': 'INTENSITY', 'th.tyg': 'WKS', 'th.cena': 'PRICE',
      'index.foot1': 'INTENSITY MEASURED AT 0.8% IN NEUTRAL CARRIER, 22 °C',
      'index.foot2': 'DELIVERY 1–3 BUSINESS DAYS · PL / EU',
      'karta.image_tag': 'PRODUCT PHOTO — VESSEL, 4:5',
      'karta.thumb.etykieta': 'LABEL', 'karta.thumb.nosnik': 'CARRIER', 'karta.thumb.wnetrze': 'INTERIOR', 'karta.thumb.detal': 'DETAIL',
      'karta.eyebrow_tpl': nr => `${nr} · [TAGLINE]`, 'karta.title': '[TITLE]',
      'karta.lede': '[DESCRIPTION]', 'karta.prev': 'Previous product', 'karta.next': 'Next product',
      'spec.stezenie': 'CONCENTRATION', 'spec.stezenie_value': '0.8% in neutral carrier',
      'spec.dyfuzja': 'DIFFUSION', 'spec.dyfuzja_value': 'passive, no heat',
      'spec.wielkosc': 'ROOM SIZE', 'spec.wielkosc_value': 'up to 40 m²',
      'spec.czas': 'DURATION', 'spec.czas_value': 'twelve weeks',
      'spec.masa': 'MOLAR MASS', 'spec.prog': 'DETECTION THRESHOLD',
      'karta.shipping': 'Ships in 1–3 business days · 30-day returns', 'cta.do_koszyka': 'ADD TO CART',
      'badge.szklo': 'REUSABLE GLASS', 'badge.nosnik': 'BIODEGRADABLE CARRIER', 'badge.alkohol': 'ALCOHOL-FREE',
      'metoda.title': 'Three decisions and nothing else.', 'metoda.note': 'METHOD · PASSIVE DIFFUSION',
      'metoda1.title': 'One compound',
      'metoda1.copy': 'Not an accord, not a composition. Each vessel holds a single fragrance molecule, named on the label along with its formula, so you can learn what you actually like.',
      'metoda1.caption': '1 INGREDIENT / 5 PLACES',
      'metoda2.title': 'No heat',
      'metoda2.copy': 'Passive diffusion at room temperature. The molecule leaves the carrier at the rate the room demands — warmer rooms simply read louder.',
      'metoda3.title': 'Twelve weeks',
      'metoda3.copy': "Then it ends. Vessels are glass and refillable, carrier biodegradable. Nothing is fragrant if it doesn't have to be.",
      'metoda3.caption': 'WEEK 01 → 12',
      'list.eyebrow': 'VAIREM.PL/LIST · 4–5 MAILINGS A YEAR',
      'list.title': 'A letter, when a new molecule arrives.',
      'list.lede': 'One compound explained plainly, with the reason it took a while. No offers, no countdowns.',
      'list.placeholder': 'vairem.office@gmail.com', 'cta.zapisz_plain': 'SUBSCRIBE',
      'list.note': 'NO OFFERS. UNSUBSCRIBE WITH ONE CLICK.',
      'archive.next': 'NEXT LETTER', 'archive.next_value': '[NEXT]',
      'archive.last': 'LAST', 'archive.last_value': '086 · Afterlight — [DESCRIPTION]',
      'archive.archive': 'ARCHIVE', 'archive.archive_value': '017—086 · full notes',
      'footer.address': 'MOLECULAR HOME FRAGRANCE<br>WARSAW · PL<br>VAT 000 000 00 00',
      'footer.pelny_indeks': 'Full index →', 'footer.marka': 'BRAND',
      'footer.metoda': 'Method', 'footer.list': 'Letter', 'footer.refill': 'Vessels & refills',
      'footer.obsluga': 'SUPPORT', 'footer.kontakt': 'Contact', 'footer.wysylka': 'Shipping & returns', 'footer.regulamin': 'Terms',
      'footer.vat': 'PRICES IN PLN, VAT INCLUDED',
      'cart.close': 'CLOSE ✕', 'cart.shipping': 'SHIPPING', 'cart.total': 'TOTAL DUE',
      'cta.checkout': 'PROCEED TO PAYMENT →', 'cart.note': '30-DAY RETURNS · REFILLABLE GLASS',
      'cart.title_tpl': n => `CART · ${n} ITEMS`,
      'cart.empty': 'CART EMPTY — CHOOSE A COMPOUND FROM THE INDEX.', 'cart.remove': 'REMOVE',
      'newsletter.subscribed': 'SUBSCRIBED ✓', 'newsletter.thanks': 'THANK YOU — CONFIRM THE LINK IN YOUR INBOX.',
      'tile.weeks_suffix': 'WKS', 'add_btn': 'ADD',
      'cookie.title': 'COOKIES',
      'cookie.text': 'We use cookies to remember your language, theme and cart contents, and to understand how you use the site. Basic functions still work without consent.',
      'cookie.accept': 'ACCEPT', 'cookie.reject': 'DECLINE',
      'promo.eyebrow': 'WELCOME OFFER',
      'promo.title': '10% off<br>your first order',
      'promo.text': 'New to VAIREM? Take a one-time discount code with you. Enter it at checkout summary — the discount applies automatically.',
      'promo.copy': 'COPY', 'promo.copied': 'COPIED', 'promo.dismiss': 'No, thanks'
    },
    es: {
      'nav.indeks': 'ÍNDICE', 'nav.metoda': 'MÉTODO', 'nav.list': 'CARTA', 'nav.menu': 'MENÚ', 'menu.produkty': 'CATÁLOGO',
      'theme.day': 'DÍA', 'theme.night': 'NOCHE', 'cart.label': 'CARRITO',
      'tabbar.label': 'VARIANTE HERO', 'tab.tablica': '02 · TABLERO', 'tab.wykres': '03 · GRÁFICO',
      'hero1.eyebrow': 'FRAGANCIA MOLECULAR PARA EL HOGAR · TRES COMPUESTOS',
      'hero1.title': 'El aire<br>no está<br>vacío',
      'hero1.lede': 'Una molécula olfativa a la vez, sin diluir en una historia. Sin salida de cabeza, sin decantación, sin jardín en Grasse — un compuesto liberado pasivamente durante doce semanas.',
      'cta.wybierz': 'ELIGE UN COMPUESTO →', 'cta.metoda_dyfuzji': 'MÉTODO DE DIFUSIÓN',
      'stat.zwiazkow': 'COMPUESTOS EN EL ÍNDICE', 'stat.stezenie': 'CONCENTRACIÓN', 'stat.pojemnosc': 'VOLUMEN',
      'stat.czas': 'DURACIÓN', 'stat.czas_value': '10–14 sem.',
      'hero2.eyebrow': 'TABLERO DE COMPUESTOS · 017—086',
      'hero2.title': 'Tres moléculas. Ninguna composición.',
      'hero2.lede': 'Eliges un compuesto, no un perfume. Cada frasco contiene una sola molécula, indicada en la etiqueta junto con su fórmula.',
      'cta.pelny_indeks': 'ÍNDICE COMPLETO →', 'upcoming.copy': 'En estudio.<br>Cuatro veces al año.', 'cta.zapisz': 'SUSCRIBIRSE →',
      'hero3.eyebrow': 'CURVA DE LIBERACIÓN · MEDICIÓN PROPIA · 40 M²',
      'hero3.title': 'El aroma como<br>función del tiempo.',
      'hero3.lede': 'Difusión pasiva a temperatura ambiente. La molécula abandona el soporte al ritmo que exige la habitación — las habitaciones más cálidas simplemente suenan más fuerte.',
      'cta.metoda': 'MÉTODO', 'wykres.intensywnosc': 'INTENSIDAD / SEMANA',
      'metric.prog': 'UMBRAL', 'metric.zasieg': 'ALCANCE', 'metric.cena': 'PRECIO',
      'indeks.title': 'Índice', 'indeks.note': 'TRES COMPUESTOS · 200 ML CADA UNO · PRECIO POR FRASCO',
      'th.nr': 'N.º', 'th.zwiazek': 'COMPUESTO', 'th.wzor': 'FÓRMULA', 'th.mw': 'M [G/MOL]',
      'th.charakter': 'CARÁCTER', 'th.intensywnosc': 'INTENSIDAD', 'th.tyg': 'SEM.', 'th.cena': 'PRECIO',
      'index.foot1': 'INTENSIDAD MEDIDA AL 0,8% EN SOPORTE NEUTRO, 22 °C',
      'index.foot2': 'ENTREGA EN 1–3 DÍAS LABORABLES · PL / UE',
      'karta.image_tag': 'FOTO DEL PRODUCTO — FRASCO, 4:5',
      'karta.thumb.etykieta': 'ETIQUETA', 'karta.thumb.nosnik': 'SOPORTE', 'karta.thumb.wnetrze': 'INTERIOR', 'karta.thumb.detal': 'DETALLE',
      'karta.eyebrow_tpl': nr => `${nr} · [ESLOGAN]`, 'karta.title': '[TÍTULO]',
      'karta.lede': '[DESCRIPCIÓN]', 'karta.prev': 'Producto anterior', 'karta.next': 'Producto siguiente',
      'spec.stezenie': 'CONCENTRACIÓN', 'spec.stezenie_value': '0,8 % en soporte neutro',
      'spec.dyfuzja': 'DIFUSIÓN', 'spec.dyfuzja_value': 'pasiva, sin calor',
      'spec.wielkosc': 'TAMAÑO DE LA HABITACIÓN', 'spec.wielkosc_value': 'hasta 40 m²',
      'spec.czas': 'DURACIÓN', 'spec.czas_value': 'doce semanas',
      'spec.masa': 'MASA MOLAR', 'spec.prog': 'UMBRAL DE DETECCIÓN',
      'karta.shipping': 'Envío en 1–3 días laborables · devolución 30 días', 'cta.do_koszyka': 'AÑADIR AL CARRITO',
      'badge.szklo': 'VIDRIO REUTILIZABLE', 'badge.nosnik': 'SOPORTE BIODEGRADABLE', 'badge.alkohol': 'SIN ALCOHOL',
      'metoda.title': 'Tres decisiones y nada más.', 'metoda.note': 'MÉTODO · DIFUSIÓN PASIVA',
      'metoda1.title': 'Un compuesto',
      'metoda1.copy': 'Ni un acorde, ni una composición. Cada frasco contiene una sola molécula olfativa, indicada en la etiqueta junto con su fórmula, para que aprendas lo que realmente te gusta.',
      'metoda1.caption': '1 INGREDIENTE / 5 LUGARES',
      'metoda2.title': 'Sin calor',
      'metoda2.copy': 'Difusión pasiva a temperatura ambiente. La molécula abandona el soporte al ritmo que exige la habitación — las habitaciones más cálidas simplemente suenan más fuerte.',
      'metoda3.title': 'Doce semanas',
      'metoda3.copy': 'Luego se acaba. Los frascos son de vidrio y recargables, el soporte biodegradable. Nada es aromático si no tiene que serlo.',
      'metoda3.caption': 'SEMANA 01 → 12',
      'list.eyebrow': 'VAIREM.PL/LIST · 4–5 ENVÍOS AL AÑO',
      'list.title': 'Una carta, cuando llega una nueva molécula.',
      'list.lede': 'Un compuesto explicado con claridad, con el motivo por el que llevó su tiempo. Sin ofertas, sin cuentas atrás.',
      'list.placeholder': 'vairem.office@gmail.com', 'cta.zapisz_plain': 'SUSCRIBIRSE',
      'list.note': 'SIN OFERTAS. TE DAS DE BAJA CON UN CLIC.',
      'archive.next': 'PRÓXIMA CARTA', 'archive.next_value': '[SIGUIENTE]',
      'archive.last': 'ÚLTIMA', 'archive.last_value': '086 · Afterlight — [DESCRIPCIÓN]',
      'archive.archive': 'ARCHIVO', 'archive.archive_value': '017—086 · notas completas',
      'footer.address': 'FRAGANCIA MOLECULAR PARA EL HOGAR<br>VARSOVIA · PL<br>NIF 000 000 00 00',
      'footer.pelny_indeks': 'Índice completo →', 'footer.marka': 'MARCA',
      'footer.metoda': 'Método', 'footer.list': 'Carta', 'footer.refill': 'Frascos y recambios',
      'footer.obsluga': 'ATENCIÓN AL CLIENTE', 'footer.kontakt': 'Contacto', 'footer.wysylka': 'Envíos y devoluciones', 'footer.regulamin': 'Términos',
      'footer.vat': 'PRECIOS EN PLN, IVA INCLUIDO',
      'cart.close': 'CERRAR ✕', 'cart.shipping': 'ENVÍO', 'cart.total': 'TOTAL A PAGAR',
      'cta.checkout': 'PROCEDER AL PAGO →', 'cart.note': 'DEVOLUCIÓN 30 DÍAS · VIDRIO RECARGABLE',
      'cart.title_tpl': n => `CARRITO · ${n} UDS.`,
      'cart.empty': 'CARRITO VACÍO — ELIGE UN COMPUESTO DEL ÍNDICE.', 'cart.remove': 'QUITAR',
      'newsletter.subscribed': 'SUSCRITO ✓', 'newsletter.thanks': 'GRACIAS — CONFIRMA EL ENLACE EN TU CORREO.',
      'tile.weeks_suffix': 'SEM.', 'add_btn': 'AÑADIR',
      'cookie.title': 'COOKIES',
      'cookie.text': 'Usamos cookies para recordar tu idioma, tema y el contenido del carrito, y para entender cómo usas el sitio. Las funciones básicas siguen funcionando sin tu consentimiento.',
      'cookie.accept': 'ACEPTAR', 'cookie.reject': 'RECHAZAR',
      'promo.eyebrow': 'OFERTA DE BIENVENIDA',
      'promo.title': '10% de descuento<br>en tu primer pedido',
      'promo.text': '¿Nuevo en VAIREM? Llévate un código de descuento de un solo uso. Introdúcelo en el resumen del pedido — el descuento se aplica automáticamente.',
      'promo.copy': 'COPIAR', 'promo.copied': 'COPIADO', 'promo.dismiss': 'No, gracias'
    },
    uk: {
      'nav.indeks': 'ІНДЕКС', 'nav.metoda': 'МЕТОД', 'nav.list': 'ЛИСТ', 'nav.menu': 'МЕНЮ', 'menu.produkty': 'КАТАЛОГ',
      'theme.day': 'ДЕНЬ', 'theme.night': 'НІЧ', 'cart.label': 'КОШИК',
      'tabbar.label': 'ВАРІАНТ HERO', 'tab.tablica': '02 · ТАБЛИЦЯ', 'tab.wykres': '03 · ГРАФІК',
      'hero1.eyebrow': 'МОЛЕКУЛЯРНИЙ АРОМАТ ДЛЯ ДОМУ · ТРИ СПОЛУКИ',
      'hero1.title': 'Повітря<br>не<br>порожнє',
      'hero1.lede': 'Одна ароматична молекула за раз, не розбавлена історією. Без нот верху, без осаду, без саду в Грасі — одна сполука пасивно вивільняється протягом дванадцяти тижнів.',
      'cta.wybierz': 'ОБЕРИ СПОЛУКУ →', 'cta.metoda_dyfuzji': 'МЕТОД ДИФУЗІЇ',
      'stat.zwiazkow': "СПОЛУК В ІНДЕКСІ", 'stat.stezenie': 'КОНЦЕНТРАЦІЯ', 'stat.pojemnosc': "ОБ'ЄМ",
      'stat.czas': 'ТРИВАЛІСТЬ', 'stat.czas_value': '10–14 тиж.',
      'hero2.eyebrow': 'ТАБЛИЦЯ СПОЛУК · 017—086',
      'hero2.title': 'Три молекули. Жодних композицій.',
      'hero2.lede': "Ти обираєш сполуку, а не парфум. Кожна посудина містить одну молекулу, названу на етикетці разом із формулою.",
      'cta.pelny_indeks': 'ПОВНИЙ ІНДЕКС →', 'upcoming.copy': 'У дослідженні.<br>Чотири рази на рік.', 'cta.zapisz': 'ПІДПИСАТИСЯ →',
      'hero3.eyebrow': 'КРИВА ВИВІЛЬНЕННЯ · ВЛАСНИЙ ВИМІР · 40 М²',
      'hero3.title': 'Аромат як<br>функція часу.',
      'hero3.lede': 'Пасивна дифузія за кімнатної температури. Молекула залишає носій у темпі, якого вимагає приміщення — тепліші кімнати просто звучать голосніше.',
      'cta.metoda': 'МЕТОД', 'wykres.intensywnosc': 'ІНТЕНСИВНІСТЬ / ТИЖДЕНЬ',
      'metric.prog': 'ПОРІГ', 'metric.zasieg': 'ОХОПЛЕННЯ', 'metric.cena': 'ЦІНА',
      'indeks.title': 'Індекс', 'indeks.note': 'ТРИ СПОЛУКИ · ПО 200 МЛ · ЦІНА ЗА ПОСУДИНУ',
      'th.nr': '№', 'th.zwiazek': 'СПОЛУКА', 'th.wzor': 'ФОРМУЛА', 'th.mw': 'M [Г/МОЛЬ]',
      'th.charakter': 'ХАРАКТЕР', 'th.intensywnosc': 'ІНТЕНСИВНІСТЬ', 'th.tyg': 'ТИЖ.', 'th.cena': 'ЦІНА',
      'index.foot1': 'ІНТЕНСИВНІСТЬ ВИМІРЯНА ПРИ 0,8% У НЕЙТРАЛЬНОМУ НОСІЇ, 22 °C',
      'index.foot2': 'ДОСТАВКА 1–3 РОБОЧІ ДНІ · PL / ЄС',
      'karta.image_tag': "ФОТО ПРОДУКТУ — ПОСУДИНА, 4:5",
      'karta.thumb.etykieta': 'ЕТИКЕТКА', 'karta.thumb.nosnik': 'НОСІЙ', 'karta.thumb.wnetrze': "ІНТЕР'ЄР", 'karta.thumb.detal': 'ДЕТАЛЬ',
      'karta.eyebrow_tpl': nr => `${nr} · [СЛОГАН]`, 'karta.title': '[НАЗВА]',
      'karta.lede': '[ОПИС]', 'karta.prev': 'Попередній продукт', 'karta.next': 'Наступний продукт',
      'spec.stezenie': 'КОНЦЕНТРАЦІЯ', 'spec.stezenie_value': 'у нейтральному носії 0,8 %',
      'spec.dyfuzja': 'ДИФУЗІЯ', 'spec.dyfuzja_value': 'пасивна, без тепла',
      'spec.wielkosc': 'РОЗМІР ПРИМІЩЕННЯ', 'spec.wielkosc_value': 'до 40 м²',
      'spec.czas': 'ТРИВАЛІСТЬ', 'spec.czas_value': 'дванадцять тижнів',
      'spec.masa': 'МОЛЯРНА МАСА', 'spec.prog': 'ПОРІГ ВИЯВЛЕННЯ',
      'karta.shipping': 'Доставка 1–3 робочі дні · повернення 30 днів', 'cta.do_koszyka': 'ДО КОШИКА',
      'badge.szklo': 'СКЛО БАГАТОРАЗОВОГО ВИКОРИСТАННЯ', 'badge.nosnik': 'БІОРОЗКЛАДНИЙ НОСІЙ', 'badge.alkohol': 'БЕЗ АЛКОГОЛЮ',
      'metoda.title': 'Три рішення і нічого більше.', 'metoda.note': 'МЕТОД · ПАСИВНА ДИФУЗІЯ',
      'metoda1.title': 'Одна сполука',
      'metoda1.copy': 'Не акорд, не композиція. Кожна посудина містить одну ароматичну молекулу, названу на етикетці разом із формулою, щоб ти міг зрозуміти, що тобі справді подобається.',
      'metoda1.caption': '1 КОМПОНЕНТ / 5 МІСЦЬ',
      'metoda2.title': 'Без тепла',
      'metoda2.copy': 'Пасивна дифузія за кімнатної температури. Молекула залишає носій у темпі, якого вимагає приміщення — тепліші кімнати просто звучать голосніше.',
      'metoda3.title': 'Дванадцять тижнів',
      'metoda3.copy': 'Потім усе закінчується. Посудини скляні й придатні для повторного наповнення, носій біорозкладний. Ніщо не пахне, якщо в цьому немає потреби.',
      'metoda3.caption': 'ТИЖДЕНЬ 01 → 12',
      'list.eyebrow': 'VAIREM.PL/LIST · 4–5 РОЗСИЛОК НА РІК',
      'list.title': "Лист, коли з'являється нова молекула.",
      'list.lede': 'Одна сполука, пояснена прямо, з причиною, чому це зайняло час. Без пропозицій, без відліку.',
      'list.placeholder': 'vairem.office@gmail.com', 'cta.zapisz_plain': 'ПІДПИСАТИСЯ',
      'list.note': 'БЕЗ ПРОПОЗИЦІЙ. ВІДПИСКА ОДНИМ КЛІКОМ.',
      'archive.next': 'НАЙБЛИЖЧИЙ ЛИСТ', 'archive.next_value': '[НАСТУПНИЙ]',
      'archive.last': 'ОСТАННІЙ', 'archive.last_value': '086 · Afterlight — [ОПИС]',
      'archive.archive': 'АРХІВ', 'archive.archive_value': '017—086 · повні нотатки',
      'footer.address': "МОЛЕКУЛЯРНИЙ АРОМАТ ДЛЯ ДОМУ<br>ВАРШАВА · PL<br>НІП 000 000 00 00",
      'footer.pelny_indeks': 'Повний індекс →', 'footer.marka': 'БРЕНД',
      'footer.metoda': 'Метод', 'footer.list': 'Лист', 'footer.refill': 'Посудини й дозаправка',
      'footer.obsluga': 'ПІДТРИМКА', 'footer.kontakt': 'Контакти', 'footer.wysylka': 'Доставка і повернення', 'footer.regulamin': 'Умови',
      'footer.vat': 'ЦІНИ В PLN, З ПДВ',
      'cart.close': 'ЗАКРИТИ ✕', 'cart.shipping': 'ДОСТАВКА', 'cart.total': 'ДО СПЛАТИ',
      'cta.checkout': 'ПЕРЕЙТИ ДО ОПЛАТИ →', 'cart.note': 'ПОВЕРНЕННЯ 30 ДНІВ · СКЛО ДЛЯ ДОЗАПРАВКИ',
      'cart.title_tpl': n => `КОШИК · ${n} ПОЗ.`,
      'cart.empty': 'КОШИК ПОРОЖНІЙ — ОБЕРИ СПОЛУКУ З ІНДЕКСУ.', 'cart.remove': 'ВИДАЛИТИ',
      'newsletter.subscribed': 'ПІДПИСАНО ✓', 'newsletter.thanks': 'ДЯКУЄМО — ПІДТВЕРДЬ ПОСИЛАННЯ В ПОШТІ.',
      'tile.weeks_suffix': 'ТИЖ.', 'add_btn': 'ДОДАТИ',
      'cookie.title': 'ФАЙЛИ COOKIE',
      'cookie.text': "Ми використовуємо файли cookie, щоб запам'ятати вашу мову, тему й вміст кошика, а також зрозуміти, як ви користуєтесь сайтом. Основні функції працюють і без згоди.",
      'cookie.accept': 'ПРИЙНЯТИ', 'cookie.reject': 'ВІДХИЛИТИ',
      'promo.eyebrow': 'ПРИВІТАЛЬНА ПРОПОЗИЦІЯ',
      'promo.title': 'Знижка 10%<br>на перше замовлення',
      'promo.text': 'Новачок у VAIREM? Отримай одноразовий промокод. Введи його в підсумку замовлення — знижка застосується автоматично.',
      'promo.copy': 'КОПІЮВАТИ', 'promo.copied': 'СКОПІЙОВАНО', 'promo.dismiss': 'Ні, дякую'
    },
    fr: {
      'nav.indeks': 'INDEX', 'nav.metoda': 'MÉTHODE', 'nav.list': 'LETTRE', 'nav.menu': 'MENU', 'menu.produkty': 'CATALOGUE',
      'theme.day': 'JOUR', 'theme.night': 'NUIT', 'cart.label': 'PANIER',
      'tabbar.label': 'VARIANTE HERO', 'tab.tablica': '02 · TABLEAU', 'tab.wykres': '03 · GRAPHIQUE',
      'hero1.eyebrow': "PARFUM MOLÉCULAIRE D'INTÉRIEUR · TROIS COMPOSÉS",
      'hero1.title': "L'air<br>n'est pas<br>vide",
      'hero1.lede': "Une molécule olfactive à la fois, non diluée par une histoire. Pas de note de tête, pas de décantation, pas de jardin à Grasse — un composé diffusé passivement pendant douze semaines.",
      'cta.wybierz': 'CHOISIR UN COMPOSÉ →', 'cta.metoda_dyfuzji': 'MÉTHODE DE DIFFUSION',
      'stat.zwiazkow': "COMPOSÉS DANS L'INDEX", 'stat.stezenie': 'CONCENTRATION', 'stat.pojemnosc': 'VOLUME',
      'stat.czas': 'DURÉE', 'stat.czas_value': '10–14 sem.',
      'hero2.eyebrow': 'TABLEAU DES COMPOSÉS · 017—086',
      'hero2.title': 'Trois molécules. Aucune composition.',
      'hero2.lede': "Vous choisissez un composé, pas un parfum. Chaque flacon contient une seule molécule, nommée sur l'étiquette avec sa formule.",
      'cta.pelny_indeks': 'INDEX COMPLET →', 'upcoming.copy': "À l'étude.<br>Quatre fois par an.", 'cta.zapisz': "S'ABONNER →",
      'hero3.eyebrow': 'COURBE DE DIFFUSION · MESURE MAISON · 40 M²',
      'hero3.title': 'Le parfum comme<br>fonction du temps.',
      'hero3.lede': "Diffusion passive à température ambiante. La molécule quitte le support au rythme que demande la pièce — les pièces plus chaudes se font simplement entendre plus fort.",
      'cta.metoda': 'MÉTHODE', 'wykres.intensywnosc': 'INTENSITÉ / SEMAINE',
      'metric.prog': 'SEUIL', 'metric.zasieg': 'PORTÉE', 'metric.cena': 'PRIX',
      'indeks.title': 'Index', 'indeks.note': 'TROIS COMPOSÉS · 200 ML CHACUN · PRIX PAR FLACON',
      'th.nr': 'N°', 'th.zwiazek': 'COMPOSÉ', 'th.wzor': 'FORMULE', 'th.mw': 'M [G/MOL]',
      'th.charakter': 'CARACTÈRE', 'th.intensywnosc': 'INTENSITÉ', 'th.tyg': 'SEM.', 'th.cena': 'PRIX',
      'index.foot1': 'INTENSITÉ MESURÉE À 0,8 % DANS UN SUPPORT NEUTRE, 22 °C',
      'index.foot2': 'LIVRAISON 1–3 JOURS OUVRÉS · PL / UE',
      'karta.image_tag': 'PHOTO PRODUIT — FLACON, 4:5',
      'karta.thumb.etykieta': 'ÉTIQUETTE', 'karta.thumb.nosnik': 'SUPPORT', 'karta.thumb.wnetrze': 'INTÉRIEUR', 'karta.thumb.detal': 'DÉTAIL',
      'karta.eyebrow_tpl': nr => `${nr} · [SLOGAN]`, 'karta.title': '[TITRE]',
      'karta.lede': '[DESCRIPTION]', 'karta.prev': 'Produit précédent', 'karta.next': 'Produit suivant',
      'spec.stezenie': 'CONCENTRATION', 'spec.stezenie_value': 'dans un support neutre 0,8 %',
      'spec.dyfuzja': 'DIFFUSION', 'spec.dyfuzja_value': 'passive, sans chaleur',
      'spec.wielkosc': 'TAILLE DE LA PIÈCE', 'spec.wielkosc_value': "jusqu'à 40 m²",
      'spec.czas': 'DURÉE', 'spec.czas_value': 'douze semaines',
      'spec.masa': 'MASSE MOLAIRE', 'spec.prog': 'SEUIL DE DÉTECTION',
      'karta.shipping': 'Livraison en 1–3 jours ouvrés · retour sous 30 jours', 'cta.do_koszyka': 'AJOUTER AU PANIER',
      'badge.szklo': 'VERRE RÉUTILISABLE', 'badge.nosnik': 'SUPPORT BIODÉGRADABLE', 'badge.alkohol': 'SANS ALCOOL',
      'metoda.title': 'Trois décisions, rien de plus.', 'metoda.note': 'MÉTHODE · DIFFUSION PASSIVE',
      'metoda1.title': 'Un seul composé',
      'metoda1.copy': "Ni accord, ni composition. Chaque flacon contient une seule molécule olfactive, nommée sur l'étiquette avec sa formule, pour que vous appreniez ce que vous aimez vraiment.",
      'metoda1.caption': '1 INGRÉDIENT / 5 LIEUX',
      'metoda2.title': 'Sans chaleur',
      'metoda2.copy': "Diffusion passive à température ambiante. La molécule quitte le support au rythme que demande la pièce — les pièces plus chaudes se font simplement entendre plus fort.",
      'metoda3.title': 'Douze semaines',
      'metoda3.copy': "Puis cela s'arrête. Les flacons sont en verre et rechargeables, le support biodégradable. Rien n'est parfumé si ce n'est pas nécessaire.",
      'metoda3.caption': 'SEMAINE 01 → 12',
      'list.eyebrow': 'VAIREM.PL/LIST · 4 À 5 ENVOIS PAR AN',
      'list.title': "Une lettre, à l'arrivée d'une nouvelle molécule.",
      'list.lede': "Un composé expliqué simplement, avec la raison pour laquelle cela a pris du temps. Pas d'offres, pas de compte à rebours.",
      'list.placeholder': 'vairem.office@gmail.com', 'cta.zapisz_plain': "S'ABONNER",
      'list.note': "PAS D'OFFRES. DÉSABONNEMENT EN UN CLIC.",
      'archive.next': 'PROCHAINE LETTRE', 'archive.next_value': '[SUIVANT]',
      'archive.last': 'DERNIÈRE', 'archive.last_value': '086 · Afterlight — [DESCRIPTION]',
      'archive.archive': 'ARCHIVES', 'archive.archive_value': '017—086 · notes complètes',
      'footer.address': "PARFUM MOLÉCULAIRE D'INTÉRIEUR<br>VARSOVIE · PL<br>TVA 000 000 00 00",
      'footer.pelny_indeks': 'Index complet →', 'footer.marka': 'MARQUE',
      'footer.metoda': 'Méthode', 'footer.list': 'Lettre', 'footer.refill': 'Flacons et recharges',
      'footer.obsluga': 'SERVICE CLIENT', 'footer.kontakt': 'Contact', 'footer.wysylka': 'Livraison et retours', 'footer.regulamin': 'Conditions',
      'footer.vat': 'PRIX EN PLN, TVA INCLUSE',
      'cart.close': 'FERMER ✕', 'cart.shipping': 'LIVRAISON', 'cart.total': 'TOTAL À PAYER',
      'cta.checkout': 'PROCÉDER AU PAIEMENT →', 'cart.note': 'RETOUR 30 JOURS · VERRE RECHARGEABLE',
      'cart.title_tpl': n => `PANIER · ${n} ART.`,
      'cart.empty': "PANIER VIDE — CHOISISSEZ UN COMPOSÉ DANS L'INDEX.", 'cart.remove': 'RETIRER',
      'newsletter.subscribed': 'ABONNÉ ✓', 'newsletter.thanks': 'MERCI — CONFIRMEZ LE LIEN DANS VOTRE BOÎTE MAIL.',
      'tile.weeks_suffix': 'SEM.', 'add_btn': 'AJOUTER',
      'cookie.title': 'COOKIES',
      'cookie.text': 'Nous utilisons des cookies pour mémoriser votre langue, votre thème et le contenu de votre panier, et pour comprendre comment vous utilisez le site. Les fonctions de base restent disponibles sans consentement.',
      'cookie.accept': 'ACCEPTER', 'cookie.reject': 'REFUSER',
      'promo.eyebrow': "OFFRE DE BIENVENUE",
      'promo.title': '10% de réduction<br>sur votre première commande',
      'promo.text': "Nouveau chez VAIREM ? Profitez d'un code de réduction à usage unique. Saisissez-le dans le récapitulatif de commande — la réduction s'applique automatiquement.",
      'promo.copy': 'COPIER', 'promo.copied': 'COPIÉ', 'promo.dismiss': 'Non merci'
    }
  };

  const LANGS = ['pl', 'en', 'es', 'uk', 'fr'];
  let currentLang = 'pl';

  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function t(key) {
    const dict = I18N[currentLang] || I18N.pl;
    const v = dict[key] !== undefined ? dict[key] : I18N.pl[key];
    return v === undefined ? key : v;
  }

  function characterFor(nr) {
    const dict = CHARACTER_I18N[currentLang] || CHARACTER_I18N.pl;
    return dict[nr] || CHARACTER_I18N.pl[nr] || '';
  }

  // ---------- hero visual: floating molecules that flee the cursor ----------

  function initMoleculeField(canvas) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const DOT_COLOR_NIGHT = '#5B6572';
    const DOT_COLOR_DAY = '#525A65';
    const currentDotColor = () => (
      document.documentElement.getAttribute('data-theme') === 'night' ? DOT_COLOR_NIGHT : DOT_COLOR_DAY
    );

    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const COUNT = 420;
    const REPEL_RADIUS = 100;
    const REPEL_STRENGTH = 3200;
    const FRICTION = 0.95;
    const DRIFT = 0.3;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let particles = [];
    let pointer = null;
    let rafId = null;

    function rand(min, max) { return min + Math.random() * (max - min); }

    function makeParticle() {
      const depth = Math.random();
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: rand(-DRIFT, DRIFT),
        vy: rand(-DRIFT, DRIFT),
        driftAngle: rand(0, Math.PI * 2),
        depth,
        r: 0.9 + depth * 1.7,
        alpha: 0.35 + depth * 0.55
      };
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (particles.length === 0 && width > 0 && height > 0) {
        particles = Array.from({ length: COUNT }, makeParticle);
      } else {
        particles.forEach(p => {
          p.x = Math.min(p.x, width);
          p.y = Math.min(p.y, height);
        });
      }
    }

    function drawParticle(p) {
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    function step() {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = currentDotColor();

      particles.forEach(p => {
        p.driftAngle += 0.02;
        p.vx += Math.cos(p.driftAngle) * 0.016;
        p.vy += Math.sin(p.driftAngle * 1.3) * 0.016;

        if (pointer) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const dist = Math.hypot(dx, dy) || 1;
          if (dist < REPEL_RADIUS) {
            const force = ((REPEL_RADIUS - dist) / REPEL_RADIUS) * REPEL_STRENGTH;
            p.vx += (dx / dist) * force * 0.00035;
            p.vy += (dy / dist) * force * 0.00035;
          }
        }

        p.vx *= FRICTION;
        p.vy *= FRICTION;
        p.x += p.vx;
        p.y += p.vy;

        const margin = 16;
        if (p.x < -margin) p.x = width + margin;
        if (p.x > width + margin) p.x = -margin;
        if (p.y < -margin) p.y = height + margin;
        if (p.y > height + margin) p.y = -margin;

        drawParticle(p);
      });

      rafId = requestAnimationFrame(step);
    }

    function drawStatic() {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = currentDotColor();
      particles.forEach(drawParticle);
    }

    window.addEventListener('pointermove', e => {
      const rect = canvas.getBoundingClientRect();
      pointer = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    });

    const ro = ('ResizeObserver' in window) ? new ResizeObserver(() => resize()) : null;
    if (ro) ro.observe(canvas.parentElement);
    else window.addEventListener('resize', resize);

    resize();

    if (reduceMotion) {
      drawStatic();
    } else {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden && rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        } else if (!document.hidden && !rafId) {
          rafId = requestAnimationFrame(step);
        }
      });
      rafId = requestAnimationFrame(step);
    }
  }

  // ---------- text reveal (fade + rise in as it enters view) ----------

  const REVEAL_SELECTOR = [
    '.brand', '.main-nav a', '.cart-btn',
    '.eyebrow', '.hero-lede', '.hero-ctas',
    '.section-title', '.karta-title', '.list-title',
    '.stat', '.hero-strip-cell',
    '.section-note', '.index-row--body', '.index-foot > span',
    '.karta-image-tag', '.karta-brand', '.karta-name', '.karta-thumb',
    '.karta-lede', '.spec', '.buy-box', '.karta-badges',
    '.metoda-card',
    '.list-lede', '.list-form', '.list-note', '.archive-item',
    '.footer-grid > div', '.footer-bottom > span',
    '.cart-drawer-head > div', '.cart-item', '.cart-empty', '.cart-total-row', '.cart-drawer-note'
  ].join(', ');

  const revealObserver = ('IntersectionObserver' in window)
    ? new IntersectionObserver(entries => {
      entries.forEach(entry => {
        entry.target.classList.toggle('is-visible', entry.isIntersecting);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' })
    : null;

  // Splits an element's own text (plain text + <br> only) into per-letter
  // spans so it can dissolve in/out letter by letter. Elements that contain
  // other markup (buttons, images, nested tags) are left untouched and fall
  // back to the whole-block fade instead.
  function wrapChars(el) {
    const nodes = Array.from(el.childNodes);
    const isLeaf = nodes.length > 0 && nodes.every(n =>
      n.nodeType === Node.TEXT_NODE || (n.nodeType === Node.ELEMENT_NODE && n.tagName === 'BR')
    );
    if (!isLeaf) return false;

    let i = 0;
    const frag = document.createDocumentFragment();
    nodes.forEach(node => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        frag.appendChild(document.createElement('br'));
        return;
      }
      node.textContent.split(/(\s+)/).forEach(chunk => {
        if (chunk === '') return;
        if (/^\s+$/.test(chunk)) {
          frag.appendChild(document.createTextNode(chunk));
          return;
        }
        const wordSpan = document.createElement('span');
        wordSpan.className = 'word';
        Array.from(chunk).forEach(ch => {
          const charSpan = document.createElement('span');
          charSpan.className = 'char';
          charSpan.style.setProperty('--i', i++);
          charSpan.textContent = ch;
          wordSpan.appendChild(charSpan);
        });
        frag.appendChild(wordSpan);
      });
    });
    el.innerHTML = '';
    el.appendChild(frag);
    return true;
  }

  // Same per-letter split as wrapChars(), but also wraps each <br>-delimited
  // line in its own block so flexbox (not text-align) centers it — the only
  // way a line wider than the viewport still overflows evenly on both sides
  // instead of hanging off just the right edge.
  function buildHeroTitleLines(el) {
    const nodes = Array.from(el.childNodes);
    let i = 0;
    const linesFrag = document.createDocumentFragment();
    let line = document.createElement('span');
    line.className = 'hero-title-line';
    function flushLine() {
      linesFrag.appendChild(line);
      line = document.createElement('span');
      line.className = 'hero-title-line';
    }
    nodes.forEach(node => {
      if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'BR') {
        flushLine();
        return;
      }
      if (node.nodeType !== Node.TEXT_NODE) return;
      node.textContent.split(/(\s+)/).forEach(chunk => {
        if (chunk === '') return;
        if (/^\s+$/.test(chunk)) {
          line.appendChild(document.createTextNode(chunk));
          return;
        }
        const wordSpan = document.createElement('span');
        wordSpan.className = 'word';
        Array.from(chunk).forEach(ch => {
          const charSpan = document.createElement('span');
          charSpan.className = 'char';
          charSpan.style.setProperty('--i', i++);
          charSpan.textContent = ch;
          wordSpan.appendChild(charSpan);
        });
        line.appendChild(wordSpan);
      });
    });
    flushLine();
    el.innerHTML = '';
    el.appendChild(linesFrag);
  }

  function renderHeroTitleKinetic() {
    document.querySelectorAll('.hero-type .hero-title').forEach(el => {
      buildHeroTitleLines(el);
      el.classList.add('reveal-chars');
      if (!el.dataset.revealObserved) {
        el.dataset.revealObserved = '1';
        if (revealObserver) revealObserver.observe(el);
        else el.classList.add('is-visible');
      }
    });
  }

  function applyReveal(root = document) {
    const groupIndex = new Map();
    root.querySelectorAll(REVEAL_SELECTOR).forEach(el => {
      if (!el.dataset.revealMode) {
        const isChars = wrapChars(el);
        el.dataset.revealMode = isChars ? 'chars' : 'block';
        el.classList.add(isChars ? 'reveal-chars' : 'reveal');
      } else if (el.dataset.revealMode === 'chars') {
        wrapChars(el);
      }

      const parent = el.parentElement;
      const n = groupIndex.get(parent) || 0;
      groupIndex.set(parent, n + 1);
      const delay = Math.min(n * 50, 300);
      if (el.dataset.revealMode === 'chars') {
        el.style.setProperty('--group-delay', delay + 'ms');
      } else {
        el.style.transitionDelay = delay + 'ms';
      }

      if (!el.dataset.revealObserved) {
        el.dataset.revealObserved = '1';
        if (revealObserver) revealObserver.observe(el);
        else el.classList.add('is-visible');
      }
    });
  }

  const CART_STORAGE_KEY = 'vairem-cart';

  function loadCart() {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (raw === null) return [];
      const parsed = JSON.parse(raw);
      const cart = Array.isArray(parsed) ? parsed : [];
      return cart.filter(item => productByNr(item.nr));
    } catch (e) {
      return [];
    }
  }

  function saveCart() {
    try { localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.cart)); } catch (e) {}
  }

  const state = {
    cart: loadCart(),
    cartOpen: false,
    heroQty: 1,
    subscribed: false,
    kartaIndex: 0
  };

  function initHoverOpen(toggleEl, drawerEl, setOpen) {
    let closeTimer = null;
    function openNow() {
      window.clearTimeout(closeTimer);
      setOpen(true);
    }
    function closeSoon() {
      window.clearTimeout(closeTimer);
      closeTimer = window.setTimeout(() => setOpen(false), 200);
    }
    toggleEl.addEventListener('mouseenter', openNow);
    toggleEl.addEventListener('mouseleave', closeSoon);
    drawerEl.addEventListener('mouseenter', openNow);
    drawerEl.addEventListener('mouseleave', closeSoon);
  }

  function initCartHover() {
    if (!window.matchMedia || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    initHoverOpen(document.getElementById('cart-toggle'), document.querySelector('.cart-drawer'), toggleCart);
  }

  // ---------- one-time render of static-per-load lists ----------

  function renderHeroDatasheetRows() {
    const el = document.getElementById('hero-datasheet-rows');
    el.innerHTML = PRODUCTS.map(p => `
      <a href="#indeks" class="hero-strip-cell">
        <div class="cell-nr mono">${p.nr}</div>
        <div class="cell-formula mono">${p.formula}</div>
        <div class="cell-name">${p.name}</div>
      </a>
    `).join('');
  }

  function renderIndexRows() {
    const el = document.getElementById('index-rows');
    el.innerHTML = PRODUCTS.map(p => `
      <div class="index-row index-row--body" data-nr="${p.nr}">
        <div class="cell-nr mono">${p.nr}</div>
        <div class="cell-name">${p.name}</div>
        <div class="cell-formula mono">${p.formula}</div>
        <div class="cell-mw mono ta-r">${p.mw}</div>
        <div class="cell-character">${characterFor(p.nr)}</div>
        <div>
          <div class="intensity-track"><div class="intensity-fill" data-width="${p.intensity}%"></div></div>
        </div>
        <div class="cell-weeks mono ta-r">${p.weeks}</div>
        <div class="cell-price mono ta-r">${formatPrice(p.price)}</div>
        <div class="index-add-cell">
          <button type="button" class="index-add-btn mono" data-add="${p.nr}">${t('add_btn')}</button>
        </div>
      </div>
    `).join('');
  }

  const intensityObserver = ('IntersectionObserver' in window)
    ? new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.width = entry.target.dataset.width;
          intensityObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' })
    : null;

  function applyIntensityBars() {
    document.querySelectorAll('.intensity-fill').forEach(el => {
      if (intensityObserver) intensityObserver.observe(el);
      else el.style.width = el.dataset.width;
    });
  }

  // ---------- karta carousel ----------
  // A looping slider: the photo card physically slides sideways between
  // products, with a duplicated first/last slide at each end so stepping
  // past the last (or before the first) product keeps sliding the same
  // direction instead of snapping backwards; once that step's transition
  // ends, the track is silently reset onto the matching real slide.

  const KARTA_AUTOPLAY_MS = 5500;
  let kartaTimer = null;
  let kartaPos = 1; // 0 = clone of last, 1..n = real slides, n+1 = clone of first

  function renderKartaSlides() {
    const el = document.getElementById('karta-slides');
    const slide = p => `
      <div class="karta-slide" data-nr="${p.nr}">
        <img class="karta-photo" data-src="assets/products/${p.nr}.jpg" alt="${p.name}">
        <div class="karta-image-top mono"><span>${p.formula} · ${p.nr}</span><span>200 ML</span></div>
        <div class="karta-image-bottom">
          <div class="karta-image-tag mono" data-i18n="karta.image_tag">${t('karta.image_tag')}</div>
          <div class="karta-brand">VAIREM</div>
          <div class="karta-name">${p.name}</div>
        </div>
      </div>
    `;
    el.innerHTML = slide(PRODUCTS[PRODUCTS.length - 1]) + PRODUCTS.map(slide).join('') + slide(PRODUCTS[0]);
    initProductPhotos(el);
    kartaPos = state.kartaIndex + 1;
    el.style.transition = 'none';
    el.style.transform = `translateX(-${kartaPos * 100}%)`;
    void el.offsetWidth;
    el.style.transition = '';
  }

  function renderKartaDots() {
    const el = document.getElementById('karta-dots');
    el.innerHTML = PRODUCTS.map((p, i) => `
      <button type="button" class="karta-dot" data-index="${i}" role="tab" aria-label="${p.nr} ${p.name}"></button>
    `).join('');
  }

  function updateKartaChrome() {
    const p = PRODUCTS[state.kartaIndex];
    document.getElementById('karta-eyebrow').textContent = t('karta.eyebrow_tpl')(p.nr);
    document.getElementById('karta-prev').setAttribute('aria-label', t('karta.prev'));
    document.getElementById('karta-next').setAttribute('aria-label', t('karta.next'));
    document.querySelectorAll('#karta-dots .karta-dot').forEach((dot, i) => {
      dot.classList.toggle('is-active', i === state.kartaIndex);
      dot.setAttribute('aria-selected', i === state.kartaIndex ? 'true' : 'false');
    });
  }

  function moveKartaTo(pos) {
    const n = PRODUCTS.length;
    kartaPos = pos;
    state.kartaIndex = ((pos - 1) % n + n) % n;
    document.getElementById('karta-slides').style.transform = `translateX(-${kartaPos * 100}%)`;
    updateKartaChrome();
  }

  function snapKartaPos() {
    const n = PRODUCTS.length;
    if (kartaPos !== 0 && kartaPos !== n + 1) return;
    kartaPos = kartaPos === 0 ? n : 1;
    const track = document.getElementById('karta-slides');
    track.style.transition = 'none';
    track.style.transform = `translateX(-${kartaPos * 100}%)`;
    void track.offsetWidth;
    track.style.transition = '';
  }

  function stepKarta(dir) {
    moveKartaTo(kartaPos + dir);
    if (prefersReducedMotion) snapKartaPos();
  }

  function jumpKartaTo(index) {
    moveKartaTo(index + 1);
  }

  function stopKartaAutoplay() {
    if (kartaTimer) { window.clearInterval(kartaTimer); kartaTimer = null; }
  }

  function startKartaAutoplay() {
    stopKartaAutoplay();
    if (prefersReducedMotion || document.hidden) return;
    kartaTimer = window.setInterval(() => stepKarta(1), KARTA_AUTOPLAY_MS);
  }

  function userKartaNav(fn) {
    fn();
    startKartaAutoplay();
  }

  // ---------- cart ----------

  function addToCart(nr, qty) {
    const existing = state.cart.find(i => i.nr === nr);
    if (existing) existing.qty += qty;
    else state.cart.push({ nr, qty });
    state.cartOpen = true;
    saveCart();
    renderCart();
  }

  function removeFromCart(nr) {
    state.cart = state.cart.filter(i => i.nr !== nr);
    saveCart();
    renderCart();
  }

  function cartCount() {
    return state.cart.reduce((sum, i) => sum + i.qty, 0);
  }

  function cartTotal() {
    return state.cart.reduce((sum, i) => {
      const p = productByNr(i.nr);
      return p ? sum + p.price * i.qty : sum;
    }, 0);
  }

  function toggleCart(open) {
    state.cartOpen = typeof open === 'boolean' ? open : !state.cartOpen;
    renderCart();
  }

  function renderCart() {
    const count = cartCount();
    document.getElementById('cart-badge').textContent = String(count);
    document.getElementById('cart-drawer-title').textContent = t('cart.title_tpl')(count);
    document.getElementById('cart-total').textContent = formatPrice(cartTotal());

    const itemsEl = document.getElementById('cart-items');
    const knownItems = state.cart.filter(item => productByNr(item.nr));
    if (knownItems.length === 0) {
      itemsEl.innerHTML = `<div class="cart-empty mono">${t('cart.empty')}</div>`;
    } else {
      itemsEl.innerHTML = knownItems.map(item => {
        const p = productByNr(item.nr);
        return `
          <div class="cart-item" data-nr="${p.nr}">
            <div class="cart-item-swatch"></div>
            <div>
              <div class="cart-item-meta mono">${p.nr} · ${p.formula}</div>
              <div class="cart-item-name">${p.name}</div>
              <div class="cart-item-qty mono">200 ml · ${item.qty} ×</div>
              <button type="button" class="cart-item-remove mono" data-remove="${p.nr}">${t('cart.remove')}</button>
            </div>
            <div class="cart-item-price mono">${formatPrice(p.price * item.qty)}</div>
          </div>
        `;
      }).join('');
    }

    const overlay = document.getElementById('cart-overlay');
    overlay.hidden = !state.cartOpen;

    document.getElementById('cart-checkout').disabled = state.cart.length === 0;

    applyReveal(itemsEl);
  }

  // ---------- product card qty stepper ----------

  function setHeroQty(qty) {
    state.heroQty = Math.max(1, qty);
    document.getElementById('qty-value').textContent = String(state.heroQty);
  }

  // ---------- optional media slots (video/photos), no-op until the files exist ----------

  function initHeroVideo() {
    const video = document.querySelector('.hero-video');
    if (!video || !video.dataset.src) return;
    video.addEventListener('loadeddata', () => {
      video.classList.add('is-loaded');
      video.play().catch(() => {});
    });
    video.src = video.dataset.src;
    video.load();
  }

  function initProductPhotos(root = document) {
    root.querySelectorAll('.karta-photo[data-src]').forEach(img => {
      const probe = new Image();
      probe.onload = () => {
        img.src = img.dataset.src;
        img.classList.add('is-loaded');
      };
      probe.src = img.dataset.src;
    });
  }

  // ---------- hero kinetic type (oversized title, scroll-driven deform/parallax) ----------
  // The title's ghost echoes (.hero-title--echo-1/2) start from a static
  // offset baked into CSS. With motion allowed, this drives that offset
  // further from the same baseline as scroll progress through the hero
  // grows, so there's no jump when the loop takes over; the real title and
  // the hero background layer get their own, different parallax rates.

  function initHeroKineticType() {
    const heroRegion = document.getElementById('hero-region');
    const heroType = document.getElementById('hero-type');
    if (!heroRegion || !heroType || prefersReducedMotion) return;

    const echo1 = heroType.querySelector('.hero-title--echo-1');
    const echo2 = heroType.querySelector('.hero-title--echo-2');
    const realTitle = heroType.querySelector('.hero-title:not(.hero-title--echo)');
    const heroBgLayer = heroRegion.querySelector('.hero-bg');

    let rafId = null;

    function update() {
      const rect = heroRegion.getBoundingClientRect();
      const total = rect.height || 1;
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      const progress = scrolled / total;
      const shift = progress * 34;

      if (echo1) {
        echo1.style.transform =
          `translate(${(-6 - shift * 0.6).toFixed(1)}px, ${(4 + shift * 0.3).toFixed(1)}px) scaleY(${(1.04 + progress * 0.9).toFixed(3)})`;
      }
      if (echo2) {
        echo2.style.transform =
          `translate(${(10 + shift).toFixed(1)}px, ${(-6 - shift * 0.4).toFixed(1)}px) scaleY(${(1.12 + progress * 1.6).toFixed(3)})`;
      }
      if (realTitle) {
        realTitle.style.transform = `translateY(${(progress * -46).toFixed(1)}px) scale(${(1 - progress * 0.12).toFixed(3)})`;
      }
      heroType.style.opacity = (1 - progress * 0.85).toFixed(3);
      if (heroBgLayer) {
        heroBgLayer.style.transform = `translateX(-50%) translateY(${(progress * 60).toFixed(1)}px)`;
      }

      rafId = requestAnimationFrame(update);
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden && rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      } else if (!document.hidden && !rafId) {
        rafId = requestAnimationFrame(update);
      }
    });
    rafId = requestAnimationFrame(update);
  }

  // ---------- background photo: parallax drift with scroll ----------
  // A real parallax drift — --bg-parallax-y tracks raw scroll pixels at
  // a fraction of scroll speed (capped), so the background visibly lags
  // behind the foreground content rather than moving 1:1 with it. The
  // flowers/birds stay just as visible at the bottom as at the top (no
  // fade) — only their position drifts. A plain CSS custom property
  // since body::after (a fixed pseudo-element) can't read scroll
  // directly.
  function initBackgroundScrollFade() {
    if (prefersReducedMotion) return;
    const root = document.documentElement;
    const PARALLAX_FACTOR = 0.22;
    const PARALLAX_MAX_PX = 42;
    let ticking = false;

    function update() {
      const scrollY = window.scrollY;
      const parallaxY = Math.min(scrollY * PARALLAX_FACTOR, PARALLAX_MAX_PX);
      root.style.setProperty('--bg-parallax-y', parallaxY.toFixed(1) + 'px');
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });

    update();
  }

  // ---------- vertical section nav (scrollspy) ----------

  function initSideIndex() {
    const nav = document.querySelector('.side-index');
    if (!nav || !('IntersectionObserver' in window)) return;

    const links = Array.from(nav.querySelectorAll('a[data-target]'));
    const sections = links
      .map(a => document.getElementById(a.dataset.target))
      .filter(Boolean);
    if (!sections.length) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const link = nav.querySelector(`a[data-target="${entry.target.id}"]`);
        if (link) link.classList.toggle('is-active', entry.isIntersecting);
      });
    }, { rootMargin: '-45% 0px -45% 0px' });

    sections.forEach(section => observer.observe(section));
  }

  // ---------- day / night theme ----------

  function refreshThemeLabel() {
    const btn = document.getElementById('theme-toggle');
    const isNight = document.documentElement.getAttribute('data-theme') === 'night';
    btn.textContent = isNight ? t('theme.night') : t('theme.day');
  }

  function initThemeToggle() {
    const btn = document.getElementById('theme-toggle');
    const root = document.documentElement;

    function apply(theme) {
      if (theme === 'night') {
        root.setAttribute('data-theme', 'night');
      } else {
        root.removeAttribute('data-theme');
      }
      btn.textContent = theme === 'night' ? t('theme.night') : t('theme.day');
      try { localStorage.setItem('vairem-theme', theme); } catch (e) {}
    }

    let saved = 'day';
    try { saved = localStorage.getItem('vairem-theme') || 'day'; } catch (e) {}
    apply(saved);

    btn.addEventListener('click', () => {
      const current = root.getAttribute('data-theme') === 'night' ? 'night' : 'day';
      apply(current === 'night' ? 'day' : 'night');
    });
  }

  // ---------- newsletter ----------

  function subscribe(email) {
    if (!email) return;
    state.subscribed = true;
    const btn = document.getElementById('newsletter-submit');
    const note = document.getElementById('newsletter-note');
    btn.textContent = t('newsletter.subscribed');
    note.textContent = t('newsletter.thanks');
  }

  // ---------- language switcher ----------

  function applyI18n(root = document) {
    root.querySelectorAll('[data-i18n]').forEach(el => {
      el.textContent = t(el.dataset.i18n);
    });
    root.querySelectorAll('[data-i18n-html]').forEach(el => {
      el.innerHTML = t(el.dataset.i18nHtml);
    });
    root.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      el.setAttribute('placeholder', t(el.dataset.i18nPlaceholder));
    });
  }

  function refreshDynamicContent() {
    renderIndexRows();
    updateKartaChrome();
    renderCart();
    renderHeroTitleKinetic();
    applyReveal();
    applyIntensityBars();
    refreshThemeLabel();
  }

  function setLanguage(lang) {
    if (!LANGS.includes(lang)) return;
    currentLang = lang;
    document.documentElement.lang = lang;
    try { localStorage.setItem('vairem-lang', lang); } catch (e) {}

    applyI18n();
    refreshDynamicContent();

    const toggle = document.getElementById('lang-toggle');
    if (toggle) toggle.textContent = lang.toUpperCase();
    document.querySelectorAll('.lang-option').forEach(btn => {
      btn.classList.toggle('is-active', btn.dataset.lang === lang);
    });
  }

  function initLangSwitcher() {
    const wrap = document.getElementById('lang-switcher');
    const toggle = document.getElementById('lang-toggle');
    const menu = document.getElementById('lang-menu');
    if (!wrap || !toggle || !menu) return;

    function closeMenu() {
      menu.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
    }
    function openMenu() {
      menu.hidden = false;
      toggle.setAttribute('aria-expanded', 'true');
    }

    toggle.addEventListener('click', e => {
      e.stopPropagation();
      if (menu.hidden) openMenu(); else closeMenu();
    });

    menu.addEventListener('click', e => {
      const btn = e.target.closest('.lang-option');
      if (!btn) return;
      setLanguage(btn.dataset.lang);
      closeMenu();
    });

    document.addEventListener('click', e => {
      if (!wrap.contains(e.target)) closeMenu();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeMenu();
    });

    let saved = 'pl';
    try { saved = localStorage.getItem('vairem-lang') || 'pl'; } catch (e) {}
    setLanguage(LANGS.includes(saved) ? saved : 'pl');
  }

  // ---------- cookie consent ----------

  function initCookieBanner() {
    const banner = document.getElementById('cookie-banner');
    if (!banner) return;

    let saved = null;
    try { saved = localStorage.getItem('vairem-cookie-consent'); } catch (e) {}

    function hide() {
      banner.classList.remove('is-visible');
      window.setTimeout(() => { banner.hidden = true; }, 420);
    }

    function decide(choice) {
      try { localStorage.setItem('vairem-cookie-consent', choice); } catch (e) {}
      hide();
    }

    document.getElementById('cookie-accept').addEventListener('click', () => decide('accepted'));
    document.getElementById('cookie-reject').addEventListener('click', () => decide('rejected'));

    if (!saved) {
      banner.hidden = false;
      window.setTimeout(() => banner.classList.add('is-visible'), 500);
    }
  }

  // ---------- first-order discount popup ----------

  function initPromoPopup() {
    const overlay = document.getElementById('promo-overlay');
    if (!overlay) return;

    let alreadyShown = false;
    try { alreadyShown = localStorage.getItem('vairem-promo-shown') === '1'; } catch (e) {}
    if (alreadyShown) return;

    function hide() {
      overlay.classList.remove('is-visible');
      window.setTimeout(() => { overlay.hidden = true; }, 320);
    }

    function show() {
      try { localStorage.setItem('vairem-promo-shown', '1'); } catch (e) {}
      overlay.hidden = false;
      window.setTimeout(() => overlay.classList.add('is-visible'), 20);
    }

    document.getElementById('promo-close').addEventListener('click', hide);
    document.getElementById('promo-dismiss').addEventListener('click', hide);
    document.getElementById('promo-scrim').addEventListener('click', hide);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && overlay.classList.contains('is-visible')) hide();
    });

    document.getElementById('promo-copy').addEventListener('click', () => {
      const code = document.getElementById('promo-code').textContent.trim();
      const btn = document.getElementById('promo-copy');
      const done = () => {
        btn.textContent = t('promo.copied');
        btn.classList.add('is-copied');
        window.setTimeout(() => {
          btn.textContent = t('promo.copy');
          btn.classList.remove('is-copied');
        }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).then(done, done);
      } else {
        done();
      }
    });

    window.setTimeout(show, 6000);
  }

  // ---------- wire up ----------

  function init() {
    saveCart();
    renderHeroDatasheetRows();
    renderIndexRows();
    renderKartaSlides();
    renderKartaDots();
    updateKartaChrome();
    renderCart();
    renderHeroTitleKinetic();
    applyReveal();
    applyIntensityBars();
    initMoleculeField(document.getElementById('molecule-canvas'));
    initMoleculeField(document.getElementById('molecule-canvas-top'));
    initThemeToggle();
    initLangSwitcher();
    initCookieBanner();
    initPromoPopup();
    initSideIndex();
    initHeroVideo();
    initProductPhotos();
    initHeroKineticType();
    initBackgroundScrollFade();

    document.getElementById('index-rows').addEventListener('click', e => {
      const btn = e.target.closest('[data-add]');
      if (!btn) return;
      addToCart(btn.dataset.add, 1);
    });

    document.getElementById('qty-dec').addEventListener('click', () => setHeroQty(state.heroQty - 1));
    document.getElementById('qty-inc').addEventListener('click', () => setHeroQty(state.heroQty + 1));
    document.getElementById('add-hero').addEventListener('click', () => addToCart(PRODUCTS[state.kartaIndex].nr, state.heroQty));

    document.getElementById('karta-slides').addEventListener('transitionend', e => {
      if (e.target === e.currentTarget && e.propertyName === 'transform') snapKartaPos();
    });

    document.getElementById('karta-prev').addEventListener('click', () => userKartaNav(() => stepKarta(-1)));
    document.getElementById('karta-next').addEventListener('click', () => userKartaNav(() => stepKarta(1)));
    document.getElementById('karta-dots').addEventListener('click', e => {
      const btn = e.target.closest('[data-index]');
      if (!btn) return;
      userKartaNav(() => jumpKartaTo(Number(btn.dataset.index)));
    });

    document.querySelectorAll('[data-karta-index]').forEach(a => {
      a.addEventListener('click', () => userKartaNav(() => jumpKartaTo(Number(a.dataset.kartaIndex))));
    });

    const kartaImage = document.getElementById('karta-image');
    kartaImage.addEventListener('mouseenter', stopKartaAutoplay);
    kartaImage.addEventListener('mouseleave', startKartaAutoplay);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopKartaAutoplay(); else startKartaAutoplay();
    });
    startKartaAutoplay();

    document.getElementById('cart-toggle').addEventListener('click', () => toggleCart(true));
    document.getElementById('cart-close').addEventListener('click', () => toggleCart(false));
    document.getElementById('cart-scrim').addEventListener('click', () => toggleCart(false));

    initCartHover();

    document.getElementById('cart-items').addEventListener('click', e => {
      const btn = e.target.closest('[data-remove]');
      if (!btn) return;
      removeFromCart(btn.dataset.remove);
    });

    document.getElementById('cart-checkout').addEventListener('click', () => {
      if (state.cart.length === 0) return;
      window.location.href = 'checkout.html';
    });

    document.getElementById('newsletter-form').addEventListener('submit', e => {
      e.preventDefault();
      const input = document.getElementById('newsletter-email');
      subscribe(input.value.trim());
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && state.cartOpen) toggleCart(false);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
