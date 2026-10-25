// Etykieta „Ważka” do pliku Figma Make „Create packaging variants” (src/App.tsx).
// Używa istniejących w App.tsx: StarField, BLUE, GREY, WHITE, DARK.
// 1) Wklej CosmicDragonfly i Variant6 pod Variant4 (lub Variant5).
// 2) Dopisz obiekt z końca tego pliku na koniec tablicy variantData.

// ── Kosmiczna ważka — skrzydła jako mgławica / gwiazdozbiór (ten sam język co CosmicMoth) ──
function CosmicDragonfly({
  x = 0,
  y = 0,
  scale = 1,
  opacity = 1,
  primaryColor = GREY,
  accentColor = BLUE,
  variant = 0,
}: {
  x?: number;
  y?: number;
  scale?: number;
  opacity?: number;
  primaryColor?: string;
  accentColor?: string;
  variant?: number;
}) {
  const id = `cd-${variant}-${Math.round(x)}-${Math.round(y)}`;
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`} opacity={opacity}>
      <defs>
        <linearGradient id={`wg-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={primaryColor} stopOpacity="0.16" />
          <stop offset="100%" stopColor={accentColor} stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id={`wg2-${id}`} x1="1" y1="0" x2="0" y2="0">
          <stop offset="0%" stopColor={primaryColor} stopOpacity="0.16" />
          <stop offset="100%" stopColor={accentColor} stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* === LEWE SKRZYDŁA === */}
      {/* górne */}
      <path
        d="M-3,-6 C-24,-24 -62,-34 -92,-22 C-100,-18 -98,-10 -88,-8 C-62,-2 -30,0 -3,-2Z"
        fill={`url(#wg-${id})`}
        stroke={primaryColor}
        strokeWidth="0.6"
        strokeOpacity="0.5"
      />
      {/* dolne */}
      <path
        d="M-3,2 C-26,6 -60,16 -86,30 C-94,35 -90,41 -80,39 C-54,34 -26,18 -3,6Z"
        fill={`url(#wg-${id})`}
        stroke={primaryColor}
        strokeWidth="0.6"
        strokeOpacity="0.45"
      />
      {/* żyłki */}
      <line x1="-3" y1="-4" x2="-90" y2="-20" stroke={primaryColor} strokeWidth="0.3" strokeOpacity="0.3" />
      <line x1="-3" y1="-3" x2="-70" y2="-24" stroke={primaryColor} strokeWidth="0.25" strokeOpacity="0.2" />
      <line x1="-3" y1="-2" x2="-86" y2="-8" stroke={primaryColor} strokeWidth="0.25" strokeOpacity="0.2" />
      <line x1="-3" y1="4" x2="-84" y2="34" stroke={primaryColor} strokeWidth="0.3" strokeOpacity="0.28" />
      <line x1="-3" y1="3" x2="-60" y2="30" stroke={primaryColor} strokeWidth="0.25" strokeOpacity="0.2" />
      {/* gwiazdy i gwiazdozbiór w skrzydle */}
      <circle cx="-34" cy="-14" r="1.3" fill={accentColor} opacity="0.7" />
      <circle cx="-58" cy="-20" r="0.9" fill={accentColor} opacity="0.55" />
      <circle cx="-84" cy="-17" r="1.1" fill={accentColor} opacity="0.6" />
      <circle cx="-48" cy="-6" r="0.7" fill={WHITE} opacity="0.55" />
      <circle cx="-40" cy="14" r="1.0" fill={accentColor} opacity="0.55" />
      <circle cx="-70" cy="30" r="0.8" fill={accentColor} opacity="0.45" />
      <circle cx="-56" cy="22" r="0.6" fill={WHITE} opacity="0.5" />
      <line x1="-34" y1="-14" x2="-58" y2="-20" stroke={accentColor} strokeWidth="0.3" strokeOpacity="0.35" />
      <line x1="-58" y1="-20" x2="-84" y2="-17" stroke={accentColor} strokeWidth="0.3" strokeOpacity="0.3" />
      <line x1="-40" y1="14" x2="-56" y2="22" stroke={accentColor} strokeWidth="0.3" strokeOpacity="0.3" />
      <line x1="-56" y1="22" x2="-70" y2="30" stroke={accentColor} strokeWidth="0.3" strokeOpacity="0.28" />

      {/* === PRAWE SKRZYDŁA (lustro) === */}
      <path
        d="M3,-6 C24,-24 62,-34 92,-22 C100,-18 98,-10 88,-8 C62,-2 30,0 3,-2Z"
        fill={`url(#wg2-${id})`}
        stroke={primaryColor}
        strokeWidth="0.6"
        strokeOpacity="0.5"
      />
      <path
        d="M3,2 C26,6 60,16 86,30 C94,35 90,41 80,39 C54,34 26,18 3,6Z"
        fill={`url(#wg2-${id})`}
        stroke={primaryColor}
        strokeWidth="0.6"
        strokeOpacity="0.45"
      />
      <line x1="3" y1="-4" x2="90" y2="-20" stroke={primaryColor} strokeWidth="0.3" strokeOpacity="0.3" />
      <line x1="3" y1="-3" x2="70" y2="-24" stroke={primaryColor} strokeWidth="0.25" strokeOpacity="0.2" />
      <line x1="3" y1="-2" x2="86" y2="-8" stroke={primaryColor} strokeWidth="0.25" strokeOpacity="0.2" />
      <line x1="3" y1="4" x2="84" y2="34" stroke={primaryColor} strokeWidth="0.3" strokeOpacity="0.28" />
      <line x1="3" y1="3" x2="60" y2="30" stroke={primaryColor} strokeWidth="0.25" strokeOpacity="0.2" />
      <circle cx="34" cy="-14" r="1.3" fill={accentColor} opacity="0.65" />
      <circle cx="58" cy="-20" r="0.9" fill={accentColor} opacity="0.5" />
      <circle cx="84" cy="-17" r="1.1" fill={accentColor} opacity="0.55" />
      <circle cx="48" cy="-6" r="0.7" fill={WHITE} opacity="0.5" />
      <circle cx="40" cy="14" r="1.0" fill={accentColor} opacity="0.5" />
      <circle cx="70" cy="30" r="0.8" fill={accentColor} opacity="0.4" />
      <circle cx="56" cy="22" r="0.6" fill={WHITE} opacity="0.45" />
      <line x1="34" y1="-14" x2="58" y2="-20" stroke={accentColor} strokeWidth="0.3" strokeOpacity="0.35" />
      <line x1="58" y1="-20" x2="84" y2="-17" stroke={accentColor} strokeWidth="0.3" strokeOpacity="0.3" />
      <line x1="40" y1="14" x2="56" y2="22" stroke={accentColor} strokeWidth="0.3" strokeOpacity="0.3" />
      <line x1="56" y1="22" x2="70" y2="30" stroke={accentColor} strokeWidth="0.3" strokeOpacity="0.28" />

      {/* === CIAŁO: smukłe, długie odwłoki === */}
      <ellipse cx="0" cy="48" rx="2" ry="46" fill={primaryColor} opacity="0.7" />
      {[10, 20, 30, 40, 50, 60, 70, 80].map((yy, i) => (
        <line key={i} x1="-1.8" y1={yy} x2="1.8" y2={yy} stroke={accentColor} strokeWidth="0.3" opacity="0.3" />
      ))}
      {/* tułów */}
      <ellipse cx="0" cy="-1" rx="4" ry="8" fill={primaryColor} opacity="0.75" />
      {/* głowa */}
      <circle cx="0" cy="-13" r="4" fill={primaryColor} opacity="0.65" />
      {/* duże oczy złożone */}
      <circle cx="-3" cy="-14" r="2.2" fill={accentColor} opacity="0.7" />
      <circle cx="3" cy="-14" r="2.2" fill={accentColor} opacity="0.7" />
      <circle cx="-3.6" cy="-14.6" r="0.6" fill={WHITE} opacity="0.6" />
      <circle cx="3.6" cy="-14.6" r="0.6" fill={WHITE} opacity="0.6" />

      {/* środek: planeta i pierścień orbitalny */}
      <circle cx="0" cy="-1" r="2" fill={accentColor} opacity="0.35" />
      <circle cx="0" cy="-1" r="6" fill="none" stroke={accentColor} strokeWidth="0.4" opacity="0.25" strokeDasharray="1.5,2" />
    </g>
  );
}

// ── WARIANT: Płaska etykieta dyfuzora „Ważka” (60 × 90 mm) ──
function Variant6() {
  return (
    <svg viewBox="0 0 260 440" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <StarField width={260} height={440} count={40} seed={33} />

      {/* etykieta 60 × 90 mm, proporcja 2:3 */}
      <rect x="55" y="75" width="150" height="225" rx="2" fill={DARK} stroke={BLUE} strokeWidth="0.6" strokeOpacity="0.5" />
      <rect x="61" y="81" width="138" height="213" rx="1" fill="none" stroke={BLUE} strokeWidth="0.3" strokeOpacity="0.25" />

      {/* góra */}
      <text x="68" y="97" fontFamily="Inter,sans-serif" fontSize="5.5" fontWeight="300" letterSpacing="2" fill={BLUE} opacity="0.6">WAŻKA</text>
      <text x="192" y="97" textAnchor="end" fontFamily="Inter,sans-serif" fontSize="5.5" fontWeight="300" letterSpacing="1.2" fill={BLUE} opacity="0.6">DYFUZOR</text>

      {/* ważka */}
      <CosmicDragonfly x={130} y={148} scale={0.66} opacity={0.9} primaryColor={BLUE} accentColor={BLUE} variant={6} />

      {/* nazwa marki */}
      <text x="130" y="232" textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="9" fontWeight="300" letterSpacing="7" fill={BLUE} opacity="0.85">VAIREM</text>
      <text x="130" y="246" textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="5.5" fontWeight="300" letterSpacing="3" fill={BLUE} opacity="0.55">LEKKOŚĆ NAD WODĄ</text>

      {/* dół */}
      <line x1="68" y1="258" x2="192" y2="258" stroke={BLUE} strokeWidth="0.4" opacity="0.35" />
      <text x="68" y="270" fontFamily="Inter,sans-serif" fontSize="5.5" fontWeight="300" letterSpacing="2" fill={BLUE} opacity="0.65">200 ml</text>
      <text x="192" y="270" textAnchor="end" fontFamily="Inter,sans-serif" fontSize="5.5" fontWeight="300" letterSpacing="2" fill={BLUE} opacity="0.65">DYFUZJA PASYWNA</text>
      <text x="130" y="281" textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="4.2" fontWeight="300" letterSpacing="1" fill={BLUE} opacity="0.4">BEZ ALKOHOLU · NOŚNIK BIODEGRADOWALNY</text>
      <text x="130" y="288" textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="3.8" fontWeight="300" letterSpacing="0.8" fill={BLUE} opacity="0.35">POSTAW W POMIESZCZENIU. NIE PRZEWRACAĆ.</text>

      <ellipse cx="130" cy="304" rx="70" ry="5" fill={GREY} opacity="0.08" />
      <text x="130" y="428" textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="6.5" fontWeight="300" letterSpacing="4" fill={GREY} opacity="0.35">WARIANT — WAŻKA</text>
    </svg>
  );
}

// Dopisz na końcu tablicy variantData (zmień id na kolejny, np. "V" albo "VI"):
//
//   {
//     id: "VI", name: "Etykieta Ważka", subtitle: "Etykieta 60 × 90 mm",
//     desc: "Płaska, ciemna etykieta dyfuzora — kosmiczna ważka, nazwa, 200 ml, dyfuzja pasywna",
//     moth: "Ważka: wypełniona, Powder Blue na Midnight",
//     label: "Papierowa, czarna, 60 × 90 mm",
//     finish: "Matowy lakier + folia hot-stamp",
//     component: Variant6,
//   },
