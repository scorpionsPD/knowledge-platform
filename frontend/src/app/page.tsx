import Link from 'next/link';
import styles from './page.module.css';
import SessionCard from './components/SessionCard';
import { Session } from '@/types';

async function getSessions(): Promise<Session[]> {
  try {
    const res = await fetch('http://localhost:4000/api/sessions', {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.slice(0, 3); // Get first 3 sessions
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return [];
  }
}

export default async function Home() {
  const sessions = await getSessions();

  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>
            Enterprise Knowledge
            <br />
            <span className={styles.gradient}>Management Platform</span>
          </h1>
          <p className={styles.subtitle}>
            Facilitate expert-led learning sessions with advanced role-based access control,
            OAuth integration, and comprehensive security features.
          </p>
          <div className={styles.cta}>
            <Link href="/sessions" className={styles.primaryButton}>
              Browse Sessions →
            </Link>
            <Link href="/experts" className={styles.secondaryButton}>
              View Experts
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.features}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Key Features</h2>
          <div className={styles.featuresGrid}>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>🔐</div>
              <h3>Advanced RBAC</h3>
              <p>Three-tier role system with fine-grained permissions</p>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>📅</div>
              <h3>Session Management</h3>
              <p>Create, schedule, and manage knowledge sessions</p>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>👥</div>
              <h3>Expert Network</h3>
              <p>Connect with leading experts across domains</p>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>⭐</div>
              <h3>Feedback System</h3>
              <p>Collect and analyze session feedback</p>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>🔒</div>
              <h3>Enterprise Security</h3>
              <p>Rate limiting, input sanitization, CSRF protection</p>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>📊</div>
              <h3>Analytics</h3>
              <p>Track participation and outcomes</p>
            </div>
          </div>
        </div>
      </section>

      {sessions.length > 0 && (
        <section className={styles.recentSessions}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Upcoming Sessions</h2>
              <Link href="/sessions" className={styles.viewAll}>
                View All Sessions →
              </Link>
            </div>
            <div className={styles.sessionsGrid}>
              {sessions.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className={styles.techStack}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Built With Modern Tech</h2>
          <div className={styles.techGrid}>
            <div className={styles.tech}>
              <strong>Frontend</strong>
              <span>Next.js 14, TypeScript, React</span>
            </div>
            <div className={styles.tech}>
              <strong>Backend</strong>
              <span>Express.js, Node.js, Prisma ORM</span>
            </div>
            <div className={styles.tech}>
              <strong>Database</strong>
              <span>PostgreSQL 14+</span>
            </div>
            <div className={styles.tech}>
              <strong>Security</strong>
              <span>OAuth2, RBAC, Rate Limiting</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
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
              <a className="btn" href="/manage">
                Manage sessions
              </a>
              <InstallCTA />
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
