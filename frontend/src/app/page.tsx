type Expert = {
  id?: string;
  name: string;
  title?: string;
};

type Session = {
  id?: string;
  title: string;
  description?: string;
  tags: string[];
  scheduledAt?: string;
  visibility: string;
  invitedExperts?: Expert[];
};

const fallbackSessions: Session[] = [
  {
    title: 'Zero Trust in Hybrid Clouds',
    description: 'Designing secure access for multi-cloud environments.',
    tags: ['Security', 'Architecture'],
    scheduledAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
    visibility: 'private',
    invitedExperts: [{ name: 'Alex Rivera' }]
  },
  {
    title: 'AI Safety for Mobile Clients',
    description: 'Mitigating prompt injection and misuse in on-device models.',
    tags: ['AI', 'Mobile'],
    scheduledAt: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString(),
    visibility: 'public',
    invitedExperts: [{ name: 'Priya Nair' }]
  },
  {
    title: 'Platform Observability Playbook',
    description: 'Patterns for telemetry, SLIs, and incident readiness.',
    tags: ['Platform', 'Reliability'],
    scheduledAt: new Date(Date.now() + 21 * 24 * 3600 * 1000).toISOString(),
    visibility: 'private',
    invitedExperts: [{ name: 'Guest TBD' }]
  }
];

async function getSessions(): Promise<Session[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  try {
    const res = await fetch(`${apiUrl}/api/sessions`, { next: { revalidate: 30 } });
    if (!res.ok) throw new Error(`Failed to fetch sessions: ${res.status}`);
    return res.json();
  } catch (err) {
    console.error('Falling back to demo sessions', err);
    return fallbackSessions;
  }
}

const features = [
  {
    title: 'Session creation & publishing',
    copy: 'Structured drafts, taggable topics, and templated outcomes to keep every exchange consistent.'
  },
  {
    title: 'Invite external experts',
    copy: 'Lightweight guest intake with bios, expertise tags, and optional NDAs for cross-company sessions.'
  },
  {
    title: 'Public or private visibility',
    copy: 'Run internal-only learning forums or publish a curated public stream with automated redaction.'
  },
  {
    title: 'Exportable reports',
    copy: 'One-click Markdown or PDF summaries with highlights, decisions, and follow-up owners.'
  }
];

const exportsList = [
  'Markdown report for async catch-up',
  'PDF handout for stakeholders',
  'CSV/JSON for analytics backfills'
];

export default async function Home() {
  const sessions = await getSessions();

  return (
    <main>
      <div className="shell">
        <header className="header">
          <div className="mark">
            <span>⎯⎯</span> Knowledge Exchange
          </div>
          <div className="pill">
            <span>MIT Licensed</span>
            <span>•</span>
            <span>Node + Next</span>
          </div>
        </header>

        <section className="hero">
          <div>
            <p className="pill">Open Enterprise Knowledge Exchange Platform</p>
            <h1>Run learning forums with the polish of a conference, minus the overhead.</h1>
            <p>
              Create and publish sessions, invite external experts, capture outcomes, and export reports
              that teams can actually reuse. OAuth/SSO-ready, database-backed, and deployable on day one.
            </p>
            <div className="cta-row">
              <a className="btn primary" href="#sessions">
                View sessions
              </a>
              <a className="btn" href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/sessions`}>
                View API routes
              </a>
              <a className="btn" href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/auth/login`}>
                Connect SSO
              </a>
            </div>
          </div>
          <div className="card">
            <h3>Session at a glance</h3>
            <p className="muted">
              Structured agenda, tags, and clear outcomes so attendees and stakeholders stay aligned.
            </p>
            <div className="tag-row">
              <span className="tag">Architecture</span>
              <span className="tag">Security</span>
              <span className="tag">AI Safety</span>
            </div>
            <div className="session-meta">
              <span>Public / Private</span>
              <span>Export → PDF · Markdown</span>
            </div>
          </div>
        </section>

        <div className="section-title">
          <h2>Core features</h2>
          <span className="badge">MVP ready</span>
        </div>
        <section className="grid">
          {features.map((feature) => (
            <article className="card" key={feature.title}>
              <h3>{feature.title}</h3>
              <p className="muted">{feature.copy}</p>
            </article>
          ))}
        </section>

        <div className="section-title" id="sessions">
          <h2>Upcoming sessions</h2>
          <span className="badge">Live demo data</span>
        </div>
        <section className="grid">
          {sessions.map((session) => (
            <article className="card" key={session.title}>
              <h3>{session.title}</h3>
              <div className="session-meta">
                <span>
                  {session.scheduledAt
                    ? new Date(session.scheduledAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric'
                      })
                    : 'TBD'}
                </span>
                <span>{session.visibility}</span>
              </div>
              <p className="muted">
                Experts:{' '}
                {session.invitedExperts?.length
                  ? session.invitedExperts.map((expert) => expert.name).join(', ')
                  : 'TBD'}
              </p>
              <div className="tag-row">
                {session.tags.map((tag) => (
                  <span className="tag" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </section>

        <div className="section-title">
          <h2>Reporting</h2>
          <span className="badge">Shareable outputs</span>
        </div>
        <section className="list">
          <div className="report">
            <h3>Export-ready</h3>
            <p className="muted">
              Capture summaries and outcomes, then ship them as Markdown or PDF so busy teams can catch
              up asynchronously.
            </p>
            <div className="tag-row">
              {exportsList.map((item) => (
                <span className="tag" key={item}>
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="report">
            <h3>Visibility controls</h3>
            <p className="muted">
              Toggle public/private for each session, redact sensitive notes, and share a clean public
              feed without exposing internal details.
            </p>
            <div className="session-meta">
              <span>OAuth / SSO ready</span>
              <span>RBAC friendly</span>
            </div>
          </div>
        </section>

        <footer className="footer">
          Built with Node.js, Express, Next.js, and PostgreSQL/SQLite readiness. MIT licensed.
        </footer>
      </div>
    </main>
  );
}
