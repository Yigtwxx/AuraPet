interface Props { color: string; size?: number }

export default function AurionSpark({ color, size = 200 }: Props) {
  return (
    <svg
      data-testid="aurion-spark"
      viewBox="0 0 200 200"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* tiny puff wings */}
      <ellipse cx="58"  cy="128" rx="12" ry="14" fill={color} fillOpacity={0.85} />
      <ellipse cx="142" cy="128" rx="12" ry="14" fill={color} fillOpacity={0.85} />

      {/* round chubby body */}
      <ellipse cx="100" cy="118" rx="44" ry="44" fill={color} />

      {/* spark antenna with glowing tip */}
      <path d="M100,78 C99,66 101,58 104,52" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" />
      <circle cx="104" cy="49" r="8" fill={color} />
      <circle cx="104" cy="49" r="4" fill="white" fillOpacity={0.6} />

      {/* belly sparkle */}
      <circle cx="100" cy="150" r="2.5" fill="white" fillOpacity={0.3} />

      {/* left eye */}
      <ellipse cx="83" cy="122" rx="12.5" ry="14.5" fill="white" />
      <ellipse cx="84" cy="124" rx="7.5"  ry="9"    fill="#1A1D24" />
      <circle  cx="88" cy="118" r="3.5" fill="white" />
      <circle  cx="80" cy="128" r="1.7" fill="white" />

      {/* right eye */}
      <ellipse cx="117" cy="122" rx="12.5" ry="14.5" fill="white" />
      <ellipse cx="116" cy="124" rx="7.5"  ry="9"    fill="#1A1D24" />
      <circle  cx="112" cy="118" r="3.5" fill="white" />
      <circle  cx="120" cy="128" r="1.7" fill="white" />

      {/* rosy cheeks */}
      <ellipse cx="67"  cy="136" rx="7.5" ry="5" fill="#FF8FA3" fillOpacity={0.4} />
      <ellipse cx="133" cy="136" rx="7.5" ry="5" fill="#FF8FA3" fillOpacity={0.4} />

      {/* smile */}
      <path d="M92,140 Q100,148 108,140" fill="none" stroke="#1A1D24" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
