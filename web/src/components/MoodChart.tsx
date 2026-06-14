"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface LogEntry { sentimentScore: number; createdAt: string; }

function scoreToColor(score: number): string {
  if (score > 0.25)  return "#22c55e";  // green — positive (matches SentimentChip)
  if (score >= -0.25) return "#95A5A6"; // grey — neutral
  return "#ef4444";                      // red — negative
}

function CustomDot(props: { cx?: number; cy?: number; payload?: { score: number } }) {
  const { cx = 0, cy = 0, payload } = props;
  const color = scoreToColor(payload?.score ?? 0);
  return (
    <g key={`dot-${cx}-${cy}`}>
      <circle cx={cx} cy={cy} r={5.5} fill={color} opacity={0.18} />
      <circle cx={cx} cy={cy} r={3} fill={color} />
    </g>
  );
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const v = payload[0].value;
  const color = scoreToColor(v);
  return (
    <div style={{ background: "var(--color-surface-elevated)", border: "1px solid var(--color-border-strong)", borderRadius: 12, padding: "8px 12px", fontSize: 12, boxShadow: "var(--shadow-popover)" }}>
      <p style={{ color: "var(--color-text-tertiary)", marginBottom: 4 }}>{label}</p>
      <p style={{ color, fontWeight: 700 }}>{v >= 0 ? "+" : ""}{v.toFixed(3)}</p>
    </div>
  );
}

export default function MoodChart({ logs }: { logs: LogEntry[] }) {
  if (logs.length < 2) {
    return <p className="text-xs text-[var(--color-text-tertiary)] text-center py-4">Grafik için en az 2 kayıt gerekli.</p>;
  }

  const data = [...logs].reverse().slice(-30).map((log) => ({
    score: log.sentimentScore,
    date: format(new Date(log.createdAt), "dd MMM", { locale: tr }),
  }));

  return (
    <div className="w-full" style={{ height: 190 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -28, bottom: 0 }}>
          <defs>
            <linearGradient id="scoreGradPosNeg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#26A6A0" stopOpacity={0.24} />
              <stop offset="95%" stopColor="#26A6A0" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-faint)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: "var(--color-text-faint)", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[-1, 1]}
            tick={{ fill: "var(--color-text-faint)", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            tickCount={5}
          />
          <ReferenceLine y={0} stroke="var(--color-border-subtle)" strokeDasharray="4 4" />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="score"
            stroke="#26A6A0"
            strokeWidth={2}
            fill="url(#scoreGradPosNeg)"
            dot={<CustomDot />}
            activeDot={{ r: 5, fill: "#26A6A0", stroke: "rgba(38,166,160,0.35)", strokeWidth: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
