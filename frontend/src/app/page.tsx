import Link from 'next/link';
import styles from './page.module.css';
import SessionCard from './components/SessionCard';
import { Session } from '@/types';

async function getRecentSessions(): Promise<Session[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000'}/api/sessions`, {
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
