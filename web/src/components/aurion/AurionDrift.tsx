interface Props { color: string; size?: number }

export default function AurionDrift({ color, size = 200 }: Props) {
  return (
    <svg
      data-testid="aurion-drift"
      viewBox="0 0 200 200"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* little curled tail */}
      <path d="M122,154 C142,156 150,174 136,181 C128,185 120,177 124,169"
            fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" />

      {/* puff wings */}
      <ellipse cx="52"  cy="126" rx="15" ry="18" fill={color} fillOpacity={0.85} />
      <ellipse cx="148" cy="126" rx="15" ry="18" fill={color} fillOpacity={0.85} />

      {/* round chubby body */}
      <ellipse cx="100" cy="118" rx="45" ry="45" fill={color} />

      {/* spark antenna with glowing tip */}
      <path d="M100,76 C99,62 101,52 105,46" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" />
      <circle cx="105" cy="43" r="8" fill={color} />
      <circle cx="105" cy="43" r="4" fill="white" fillOpacity={0.6} />

      {/* belly sparkles */}
      <circle cx="100" cy="150" r="2.5" fill="white" fillOpacity={0.3}  />
      <circle cx="86"  cy="156" r="1.8" fill="white" fillOpacity={0.22} />

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
