interface BackgroundSceneProps {
  /** 'xMidYMin slice' (default) anchors to the top — right for tall scrolling pages.
   *  'xMidYMid slice' centers it — right for a single fixed-height screen. */
  preserveAspectRatio?: 'xMidYMin slice' | 'xMidYMid slice';
}

export default function BackgroundScene({ preserveAspectRatio = 'xMidYMin slice' }: BackgroundSceneProps) {
  return (
    <svg
      viewBox="0 0 1440 2400"
      preserveAspectRatio={preserveAspectRatio}
      className="w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="1440" height="2400" fill="#F7F1E1" />
      <path d="M0 260 Q 220 190 460 250 T 940 240 T 1440 260 V 420 H 0 Z" fill="#EFE7D2" />
      <path d="M0 360 Q 260 300 520 350 T 1000 340 T 1440 360 V 480 H 0 Z" fill="#EDE2C4" />
      <g fill="#FBF8F1" opacity="0.85">
        <ellipse cx="180" cy="140" rx="52" ry="22" />
        <ellipse cx="220" cy="130" rx="38" ry="18" />
        <ellipse cx="1220" cy="90" rx="58" ry="24" />
        <ellipse cx="760" cy="60" rx="44" ry="18" />
      </g>
      <g opacity="0.5">
        {[[120, 420], [1310, 450], [60, 1000], [1370, 1050], [180, 1650], [1290, 1700]].map(([x, y], i) => (
          <g key={i} transform={`translate(${x} ${y})`}>
            <rect x="-4" y="18" width="8" height="24" rx="3" fill="#6B4A2E" />
            <polygon points="0,-30 20,20 -20,20" fill="#2A6E3E" />
          </g>
        ))}
      </g>
      <path
        d="M -60 300 C 300 500, 200 700, 600 850 S 1200 1100, 900 1400 S 200 1700, 500 2000 S 1300 2250, 1100 2400"
        fill="none"
        stroke="#B98F4B"
        strokeWidth="6"
        strokeDasharray="2 22"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}
