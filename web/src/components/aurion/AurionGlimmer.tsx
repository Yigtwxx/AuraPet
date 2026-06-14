interface Props { color: string; size?: number }

export default function AurionGlimmer({ color, size = 200 }: Props) {
  return (
    <svg
      data-testid="aurion-glimmer"
      viewBox="0 0 200 200"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* curled tail */}
      <path d="M126,154 C148,156 157,177 142,185 C133,189 124,180 128,171"
            fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" />

      {/* puff wings */}
      <ellipse cx="47"  cy="122" rx="17" ry="22" fill={color} fillOpacity={0.82} />
      <ellipse cx="153" cy="122" rx="17" ry="22" fill={color} fillOpacity={0.82} />
      {/* soft wing highlights */}
      <path d="M44,114 C40,118 39,126 42,132"  fill="none" stroke="white" strokeWidth="1.5" strokeOpacity={0.3} strokeLinecap="round" />
      <path d="M156,114 C160,118 161,126 158,132" fill="none" stroke="white" strokeWidth="1.5" strokeOpacity={0.3} strokeLinecap="round" />

      {/* round chubby body */}
      <ellipse cx="100" cy="118" rx="46" ry="46" fill={color} />

      {/* tall spark antenna with glowing tip */}
      <path d="M100,74 C99,58 101,46 106,40" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" />
      <circle cx="106" cy="37" r="9"   fill={color} />
      <circle cx="106" cy="37" r="4.5" fill="white" fillOpacity={0.6} />
      <circle cx="114" cy="30" r="2"   fill="white" fillOpacity={0.7} />

      {/* belly sparkles */}
      <circle cx="100" cy="150" r="2.5" fill="white" fillOpacity={0.3}  />
      <circle cx="86"  cy="156" r="1.8" fill="white" fillOpacity={0.22} />
      <circle cx="114" cy="156" r="1.8" fill="white" fillOpacity={0.22} />

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
