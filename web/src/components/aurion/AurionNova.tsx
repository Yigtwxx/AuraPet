interface Props { color: string; size?: number }

export default function AurionNova({ color, size = 200 }: Props) {
  return (
    <svg
      data-testid="aurion-nova"
      viewBox="0 0 200 200"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* soft halo */}
      <ellipse cx="100" cy="40" rx="32" ry="9" fill="none" stroke="white" strokeWidth="3" strokeOpacity={0.6} />
      <ellipse cx="100" cy="40" rx="38" ry="12" fill="none" stroke="white" strokeWidth="1.5" strokeOpacity={0.25} />

      {/* glowing tail with orb tip */}
      <path d="M128,152 C152,154 164,174 154,188" fill="none" stroke={color} strokeWidth="9" strokeLinecap="round" />
      <circle cx="154" cy="188" r="10"  fill={color} fillOpacity={0.6} />
      <circle cx="154" cy="188" r="5.5" fill="white" fillOpacity={0.5} />

      {/* large puff wings */}
      <ellipse cx="36"  cy="116" rx="22" ry="28" fill={color} fillOpacity={0.8} />
      <ellipse cx="164" cy="116" rx="22" ry="28" fill={color} fillOpacity={0.8} />
      {/* soft wing highlights */}
      <path d="M31,104 C25,112 24,124 29,134"   fill="none" stroke="white" strokeWidth="1.8" strokeOpacity={0.3} strokeLinecap="round" />
      <path d="M169,104 C175,112 176,124 171,134" fill="none" stroke="white" strokeWidth="1.8" strokeOpacity={0.3} strokeLinecap="round" />

      {/* rounded ears */}
      <ellipse cx="80"  cy="66" rx="13" ry="18" fill={color} />
      <ellipse cx="120" cy="66" rx="13" ry="18" fill={color} />

      {/* round chubby body */}
      <ellipse cx="100" cy="118" rx="48" ry="47" fill={color} />

      {/* inner ears */}
      <ellipse cx="80"  cy="68" rx="6" ry="9.5" fill="#FF8FA3" fillOpacity={0.4} />
      <ellipse cx="120" cy="68" rx="6" ry="9.5" fill="#FF8FA3" fillOpacity={0.4} />

      {/* floating sparkle stars */}
      <path d="M34,95 Q34,100 39,100 Q34,100 34,105 Q34,100 29,100 Q34,100 34,95 Z" fill="white" fillOpacity={0.55} />
      <path d="M166,103.5 Q166,108 170.5,108 Q166,108 166,112.5 Q166,108 161.5,108 Q166,108 166,103.5 Z" fill="white" fillOpacity={0.45} />
      <path d="M150,150 Q150,154 154,154 Q150,154 150,158 Q150,154 146,154 Q150,154 150,150 Z" fill="white" fillOpacity={0.4} />

      {/* belly sparkles */}
      <circle cx="100" cy="150" r="2.5" fill="white" fillOpacity={0.3}  />
      <circle cx="86"  cy="156" r="1.8" fill="white" fillOpacity={0.22} />
      <circle cx="114" cy="156" r="1.8" fill="white" fillOpacity={0.22} />

      {/* left eye (large & sparkly) */}
      <ellipse cx="83" cy="122" rx="13.5" ry="15.5" fill="white" />
      <ellipse cx="84" cy="124" rx="8"    ry="9.5"  fill="#1A1D24" />
      <circle  cx="88" cy="117" r="4"   fill="white" />
      <circle  cx="79" cy="129" r="1.9" fill="white" />

      {/* right eye (large & sparkly) */}
      <ellipse cx="117" cy="122" rx="13.5" ry="15.5" fill="white" />
      <ellipse cx="116" cy="124" rx="8"    ry="9.5"  fill="#1A1D24" />
      <circle  cx="112" cy="117" r="4"   fill="white" />
      <circle  cx="121" cy="129" r="1.9" fill="white" />

      {/* rosy cheeks */}
      <ellipse cx="66"  cy="137" rx="8" ry="5.5" fill="#FF8FA3" fillOpacity={0.4} />
      <ellipse cx="134" cy="137" rx="8" ry="5.5" fill="#FF8FA3" fillOpacity={0.4} />

      {/* smile */}
      <path d="M91,140 Q100,150 109,140" fill="none" stroke="#1A1D24" strokeWidth="2.8" strokeLinecap="round" />
    </svg>
  );
}
