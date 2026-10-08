import { useState } from 'react';
import { num } from '../utils';

const COLORS = ['var(--primary)', '#18b6a4', '#f5a524', '#a855f7', '#ef6a8a', '#8ea3d8'];

/** مخطط خطي/مساحة لعدة سلاسل */
export function LineChart({ data, series, height = 260 }) {
  const [hi, setHi] = useState(null);
  const W = 900, H = height, pl = 8, pr = 8, pt = 14, pb = 28;
  const max = Math.max(1, ...data.flatMap((d) => series.map((s) => d[s.key]))) * 1.12;
  const x = (i) => pl + (i / Math.max(1, data.length - 1)) * (W - pl - pr);
  const y = (v) => pt + (1 - v / max) * (H - pt - pb);
  const path = (k) => data.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d[k]).toFixed(1)}`).join(' ');
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(max * f));
  const step = Math.ceil(data.length / 7);
  const move = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const f = (e.clientX - r.left) / r.width; // الرسم LTR دائماً
    setHi(Math.min(data.length - 1, Math.max(0, Math.round(f * (data.length - 1)))));
  };
  return (
    <div className="chart" dir="ltr">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label="مخطط الزيارات" onMouseMove={move} onMouseLeave={() => setHi(null)} style={{ height }}>
        {ticks.map((t) => (<g key={t}><line x1={pl} x2={W - pr} y1={y(t)} y2={y(t)} className="grid" /></g>))}
        {series.map((s, k) => k === 0 && (
          <path key="area" d={`${path(s.key)} L${x(data.length - 1)},${H - pb} L${x(0)},${H - pb} Z`} fill={COLORS[0]} opacity="0.1" />
        ))}
        {series.map((s, k) => (<path key={s.key} d={path(s.key)} fill="none" stroke={COLORS[k]} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />))}
        {hi != null && <line x1={x(hi)} x2={x(hi)} y1={pt} y2={H - pb} className="cursor" />}
        {hi != null && series.map((s, k) => (<circle key={s.key} cx={x(hi)} cy={y(data[hi][s.key])} r="4.5" fill={COLORS[k]} stroke="var(--card)" strokeWidth="2" />))}
      </svg>
      <div className="chart-x">{data.map((d, i) => (i % step === 0 ? <span key={d.date} style={{ left: `${(x(i) / W) * 100}%` }}>{d.date.slice(5)}</span> : null))}</div>
      {hi != null && (
        <div className="tip" style={{ left: `${(x(hi) / W) * 100}%` }}>
          <b>{data[hi].date}</b>
          {series.map((s, k) => (<span key={s.key}><i style={{ background: COLORS[k] }} />{s.label}: {num(data[hi][s.key])}</span>))}
        </div>
      )}
      <div className="legend">{series.map((s, k) => (<span key={s.key}><i style={{ background: COLORS[k] }} />{s.label}</span>))}</div>
    </div>
  );
}

/** قائمة أشرطة أفقية */
export function BarList({ items, total, unit = '' }) {
  const max = Math.max(1, ...items.map((i) => i.value ?? i.views));
  const sum = total ?? items.reduce((a, i) => a + (i.value ?? i.views), 0);
  return (
    <ul className="bars">
      {items.map((it, i) => {
        const v = it.value ?? it.views;
        return (
          <li key={it.path || it.name || it.title}>
            <div className="bars-row"><span>{it.title || it.name}{it.path && <small dir="ltr">{it.path}</small>}</span><b>{num(v)}{unit} <em>{sum ? Math.round((v / sum) * 100) : 0}%</em></b></div>
            <div className="bar"><i style={{ width: `${(v / max) * 100}%`, background: COLORS[i % COLORS.length] }} /></div>
          </li>
        );
      })}
    </ul>
  );
}

/** دائرة نسب */
export function Donut({ items, label }) {
  const total = items.reduce((a, i) => a + i.value, 0) || 1;
  const R = 54, C = 2 * Math.PI * R;
  let acc = 0;
  return (
    <div className="donut">
      <svg viewBox="0 0 140 140" role="img" aria-label={label}>
        <circle cx="70" cy="70" r={R} fill="none" stroke="var(--soft)" strokeWidth="16" />
        {items.map((it, i) => {
          const len = (it.value / total) * C;
          const el = <circle key={it.name} cx="70" cy="70" r={R} fill="none" stroke={COLORS[i % COLORS.length]} strokeWidth="16" strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-acc} transform="rotate(-90 70 70)" />;
          acc += len; return el;
        })}
        <text x="70" y="75" textAnchor="middle" className="donut-n">{num(total)}</text>
      </svg>
      <ul className="legend-col">{items.map((it, i) => (<li key={it.name}><i style={{ background: COLORS[i % COLORS.length] }} />{it.name}<b>{Math.round((it.value / total) * 100)}%</b></li>))}</ul>
    </div>
  );
}

/** أعمدة الساعات */
export function Hours({ data }) {
  const max = Math.max(1, ...data);
  return (
    <div className="hours" dir="ltr">
      {data.map((v, h) => (<div key={h} className="hour" title={`${h}:00 — ${v}`}><i style={{ height: `${(v / max) * 100}%` }} /><span>{h % 3 === 0 ? h : ''}</span></div>))}
    </div>
  );
}

export function Stat({ icon, label, value, delta, hint }) {
  return (
    <div className="stat-card">
      <span className="stat-label">{label}</span>
      <strong>{value}</strong>
      {delta != null && <em className={delta >= 0 ? 'up' : 'down'}>{delta >= 0 ? '▲' : '▼'} {Math.abs(delta)}% عن الفترة السابقة</em>}
      {hint && <small>{hint}</small>}
    </div>
  );
}
