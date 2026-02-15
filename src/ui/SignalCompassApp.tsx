import Link from 'next/link';

const subScores = [
  { label: 'Inflation', score: 58, trend: '+2' },
  { label: 'Policy', score: 46, trend: '-1' },
  { label: 'Liquidity', score: 39, trend: '-3' },
  { label: 'Growth', score: 62, trend: '+1' },
  { label: 'Volatility', score: 44, trend: '-2' },
];

const drivers = [
  'Treasury yields eased after softer inflation print.',
  'Credit spreads widened slightly in high-yield segment.',
  'USD stayed firm while equity breadth remained mixed.',
];

const playbook = [
  'Stay balanced; avoid oversized directional bets.',
  'Trim weak high-beta names, keep quality duration hedges.',
  'Watch next CPI and labor data before increasing risk.',
];

export function SignalCompassApp() {
  return (
    <main className="sc-root">
      <section className="sc-hero">
        <p className="sc-kicker">Signal Compass</p>
        <h1>From macro noise to clear risk posture.</h1>
        <p className="sc-sub">Know your regime, understand the drivers, and act with confidence.</p>
        <div className="sc-hero-actions">
          <button type="button" className="sc-btn sc-btn-primary">View today’s regime</button>
          <Link href="/" className="sc-btn sc-btn-ghost">Back to Loose</Link>
        </div>
      </section>

      <section className="sc-grid">
        <article className="sc-card sc-card-hero">
          <p className="sc-label">Current Regime</p>
          <h2>Neutral</h2>
          <p className="sc-meta">Score 54/100 · Confidence Medium · Updated 2m ago</p>
        </article>

        <article className="sc-card">
          <p className="sc-label">What changed</p>
          <ul>
            {drivers.map((driver) => (
              <li key={driver}>{driver}</li>
            ))}
          </ul>
        </article>

        <article className="sc-card">
          <p className="sc-label">Playbook</p>
          <ul>
            {playbook.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="sc-subscores">
        {subScores.map((metric) => (
          <article key={metric.label} className="sc-subcard">
            <span>{metric.label}</span>
            <strong>{metric.score}</strong>
            <em>{metric.trend}</em>
          </article>
        ))}
      </section>
    </main>
  );
}
