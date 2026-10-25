// Wariant V do pliku Figma Make „Create packaging variants” (src/App.tsx).
// Używa istniejących w App.tsx: CosmicMoth, StarField, BLUE, GREY, WHITE, DARK.
// 1) Wklej funkcję Variant5 pod Variant4.
// 2) Dopisz obiekt z variantData na końcu tablicy variantData.

// ── WARIANT 5: Płaska etykieta dyfuzora trzcinowego (do nakleienia na butelkę) ──
function Variant5() {
  return (
    <svg viewBox="0 0 260 440" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <StarField width={260} height={440} count={40} seed={21} />

      {/* etykieta 60 × 90 mm, proporcja 2:3 */}
      <rect x="55" y="75" width="150" height="225" rx="2" fill={DARK} stroke={BLUE} strokeWidth="0.6" strokeOpacity="0.5" />
      <rect x="61" y="81" width="138" height="213" rx="1" fill="none" stroke={BLUE} strokeWidth="0.3" strokeOpacity="0.25" />

      {/* góra: numer kompozycji i typ produktu */}
      <text x="68" y="97" fontFamily="Inter,sans-serif" fontSize="5.5" fontWeight="300" letterSpacing="2.5" fill={BLUE} opacity="0.6">03</text>
      <text x="192" y="97" textAnchor="end" fontFamily="Inter,sans-serif" fontSize="5.5" fontWeight="300" letterSpacing="2.5" fill={BLUE} opacity="0.6">DYFUZOR DO WNĘTRZ</text>

      {/* motyl */}
      <CosmicMoth x={130} y={170} scale={1.0} opacity={0.9} primaryColor={BLUE} accentColor={BLUE} variant={5} />

      {/* nazwa marki */}
      <text x="130" y="232" textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="9" fontWeight="300" letterSpacing="7" fill={BLUE} opacity="0.85">VAIREM</text>
      <text x="130" y="246" textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="5.5" fontWeight="300" letterSpacing="3" fill={BLUE} opacity="0.55">CISZA PORANNA</text>

      {/* dół: pojemność, dyfuzja, składniki */}
      <line x1="68" y1="258" x2="192" y2="258" stroke={BLUE} strokeWidth="0.4" opacity="0.35" />
      <text x="68" y="270" fontFamily="Inter,sans-serif" fontSize="5.5" fontWeight="300" letterSpacing="2" fill={BLUE} opacity="0.65">200 ml</text>
      <text x="192" y="270" textAnchor="end" fontFamily="Inter,sans-serif" fontSize="5.5" fontWeight="300" letterSpacing="2" fill={BLUE} opacity="0.65">DYFUZJA PASYWNA</text>
      <text x="130" y="283" textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="4.8" fontWeight="300" letterSpacing="2" fill={BLUE} opacity="0.4">BEZ ALKOHOLU · NOŚNIK BIODEGRADOWALNY</text>
      <text x="130" y="293" textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="4.2" fontWeight="300" letterSpacing="1.5" fill={BLUE} opacity="0.3">POSTAW W POMIESZCZENIU. NIE PRZEWRACAĆ.</text>

      <ellipse cx="130" cy="304" rx="70" ry="5" fill={GREY} opacity="0.08" />
      <text x="130" y="428" textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="6.5" fontWeight="300" letterSpacing="4" fill={GREY} opacity="0.35">WARIANT V</text>
    </svg>
  );
}

// Dopisz na końcu tablicy variantData:
//
//   {
//     id: "V", name: "Etykieta dyfuzora", subtitle: "Etykieta 60 × 90 mm",
//     desc: "Płaska, ciemna etykieta do naklejenia na butelkę — motyl, nazwa, 200 ml, dyfuzja pasywna",
//     moth: "Wypełniony, Powder Blue na Midnight",
//     label: "Papierowa, czarna, 60 × 90 mm",
//     finish: "Matowy lakier + folia hot-stamp",
//     component: Variant5,
//   },
