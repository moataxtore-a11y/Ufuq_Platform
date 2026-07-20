export default function ScorePill({ score, maxScore, className }) {
  if (typeof score !== 'number') return <span className={className || 'text-slate-500'}>-</span>

  const max = typeof maxScore === 'number' ? maxScore : null
  const pct = max && max > 0 ? (score / max) * 100 : null

  const tone = pct == null ? 'neutral' : pct < 50 ? 'bad' : pct < 75 ? 'mid' : 'good'

  const cls =
    tone === 'bad'
      ? 'border-red-200 bg-red-50 text-red-700'
      : tone === 'mid'
        ? 'border-brand/20 bg-brand/10 text-brand-700'
        : tone === 'good'
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
          : 'border-black/5 bg-slate-50 text-slate-700'

  return (
    <span
      className={(className ? className + ' ' : '') + `inline-flex items-center rounded-full border px-2 py-1 text-xs font-semibold tabular-nums ${cls}`}
    >
      {score}
      {max != null ? ` / ${max}` : ''}
    </span>
  )
}
