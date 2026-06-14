interface Props { color: string; size?: number }

export default function AurionAether({ color, size = 200 }: Props) {
  return (
    <svg
      data-testid="aurion-aether"
      viewBox="0 0 200 200"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* curled tail */}
      <path d="M130,152 C154,155 164,178 148,187 C139,191 129,181 133,172"
            fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" />

      {/* large puff wings */}
      <ellipse cx="42"  cy="120" rx="19" ry="24" fill={color} fillOpacity={0.8} />
      <ellipse cx="158" cy="120" rx="19" ry="24" fill={color} fillOpacity={0.8} />
      {/* soft wing highlights */}
      <path d="M38,110 C33,116 32,126 36,134"   fill="none" stroke="white" strokeWidth="1.6" strokeOpacity={0.3} strokeLinecap="round" />
      <path d="M162,110 C167,116 168,126 164,134" fill="none" stroke="white" strokeWidth="1.6" strokeOpacity={0.3} strokeLinecap="round" />

      {/* rounded ears */}
      <ellipse cx="80"  cy="68" rx="12" ry="17" fill={color} />
      <ellipse cx="120" cy="68" rx="12" ry="17" fill={color} />

      {/* round chubby body */}
      <ellipse cx="100" cy="118" rx="47" ry="46" fill={color} />

      {/* inner ears */}
      <ellipse cx="80"  cy="70" rx="5.5" ry="9" fill="#FF8FA3" fillOpacity={0.4} />
      <ellipse cx="120" cy="70" rx="5.5" ry="9" fill="#FF8FA3" fillOpacity={0.4} />

      {/* floating sparkle stars */}
      <path d="M36,93 Q36,98 41,98 Q36,98 36,103 Q36,98 31,98 Q36,98 36,93 Z" fill="white" fillOpacity={0.55} />
      <path d="M164,137.5 Q164,142 168.5,142 Q164,142 164,146.5 Q164,142 159.5,142 Q164,142 164,137.5 Z" fill="white" fillOpacity={0.45} />

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
