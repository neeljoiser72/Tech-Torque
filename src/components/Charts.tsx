import { useEffect, useState } from 'react';

interface DataPoint {
  label: string;
  value: number;
}

interface LineChartProps {
  data: DataPoint[];
  height?: number;
  color?: string;
  max?: number;
  min?: number;
}

export function LineChart({ data, height = 200, color = '#2f8a80', max, min = 0 }: LineChartProps) {
  const [width, setWidth] = useState(600);
  const padding = { top: 20, right: 20, bottom: 30, left: 35 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxVal = max ?? Math.max(...data.map((d) => d.value), 1);
  const minVal = min;
  const range = maxVal - minVal || 1;

  const points = data.map((d, i) => {
    const x = padding.left + (i / Math.max(data.length - 1, 1)) * chartWidth;
    const y = padding.top + chartHeight - ((d.value - minVal) / range) * chartHeight;
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1]?.x ?? 0} ${padding.top + chartHeight} L ${points[0]?.x ?? 0} ${padding.top + chartHeight} Z`;

  const yTicks = 4;
  const tickValues = Array.from({ length: yTicks + 1 }, (_, i) => minVal + (range * i) / yTicks);

  return (
    <div className="w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        style={{ height }}
        ref={(el) => {
          if (el) setWidth(el.clientWidth || 600);
        }}
      >
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {tickValues.map((tick, i) => {
          const y = padding.top + chartHeight - ((tick - minVal) / range) * chartHeight;
          return (
            <g key={i}>
              <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
              <text x={padding.left - 8} y={y + 4} textAnchor="end" className="fill-neutral-400 text-[10px]">
                {tick.toFixed(0)}
              </text>
            </g>
          );
        })}

        {data.length > 1 && <path d={areaPath} fill="url(#areaGradient)" />}
        {data.length > 1 && <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}

        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill="white" stroke={color} strokeWidth="2" />
            <text x={p.x} y={height - 8} textAnchor="middle" className="fill-neutral-400 text-[10px]">
              {p.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

interface BarChartProps {
  data: DataPoint[];
  height?: number;
  color?: string;
}

export function BarChart({ data, height = 200, color = '#2f8a80' }: BarChartProps) {
  const [width, setWidth] = useState(600);
  const padding = { top: 20, right: 20, bottom: 30, left: 35 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const barWidth = chartWidth / data.length;

  return (
    <div className="w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        style={{ height }}
        ref={(el) => {
          if (el) setWidth(el.clientWidth || 600);
        }}
      >
        {[0, 0.25, 0.5, 0.75, 1].map((f, i) => {
          const y = padding.top + chartHeight - f * chartHeight;
          return (
            <g key={i}>
              <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
              <text x={padding.left - 8} y={y + 4} textAnchor="end" className="fill-neutral-400 text-[10px]">
                {(f * maxVal).toFixed(0)}
              </text>
            </g>
          );
        })}
        {data.map((d, i) => {
          const barHeight = (d.value / maxVal) * chartHeight;
          const x = padding.left + i * barWidth + barWidth * 0.15;
          const y = padding.top + chartHeight - barHeight;
          const w = barWidth * 0.7;
          return (
            <g key={i}>
              <rect x={x} y={y} width={w} height={barHeight} rx="6" fill={color} opacity={0.85} />
              <text x={x + w / 2} y={height - 8} textAnchor="middle" className="fill-neutral-400 text-[10px]">
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
