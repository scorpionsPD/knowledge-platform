import { notFound } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';
import { Session } from '../../types';

async function getSession(id: string): Promise<Session | null> {
  try {
    const res = await fetch(`http://localhost:4000/api/sessions/${id}`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error('Failed to fetch session');
    }
    return res.json();
  } catch (error) {
    console.error('Error fetching session:', error);
    return null;
  }
}

export default async function SessionDetailPage({ params }: { params: { id: string } }) {
  const session = await getSession(params.id);

  if (!session) {
    notFound();
  }

  const scheduledDate = new Date(session.scheduledAt);
  const formattedDate = scheduledDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = scheduledDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={styles.container}>
      <Link href="/sessions" className={styles.back}>
        ← Back to Sessions
      </Link>

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{session.title}</h1>
          <div className={styles.meta}>
            <span>📅 {formattedDate} at {formattedTime}</span>
            <span>🏢 {session.hostOrganisation}</span>
            <span className={`${styles.badge} ${styles[session.visibility]}`}>
              {session.visibility}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <section className={styles.section}>
          <h2>About This Session</h2>
          <p className={styles.description}>{session.description}</p>
          
          {session.summary && (
            <>
              <h3>Summary</h3>
              <p>{session.summary}</p>
            </>
          )}

          {session.format && (
            <div className={styles.info}>
              <strong>Format:</strong> {session.format}
            </div>
          )}

          {session.location && (
            <div className={styles.info}>
              <strong>Location:</strong> {session.location}
            </div>
          )}
        </section>

        {session.tags && session.tags.length > 0 && (
          <section className={styles.section}>
            <h2>Topics</h2>
            <div className={styles.tags}>
              {session.tags.map((tag, index) => (
                <span key={index} className={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>
          </section>
        )}

        {session.invitedExperts && session.invitedExperts.length > 0 && (
          <section className={styles.section}>
            <h2>Featured Experts</h2>
            <div className={styles.experts}>
              {session.invitedExperts.map((expert) => (
                <div key={expert.id} className={styles.expert}>
                  <div className={styles.expertAvatar}>
                    {expert.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className={styles.expertInfo}>
                    <h3>{expert.name}</h3>
                    <p>{expert.organisation}</p>
                    <div className={styles.expertise}>
                      {expert.expertise.slice(0, 3).map((skill, index) => (
                        <span key={index} className={styles.skillTag}>
                          {skill}
                        </span>
                      ))}
                    </div>
                    {expert.linkedInProfile && (
                      <a 
                        href={expert.linkedInProfile} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={styles.linkedin}
                      >
                        LinkedIn →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {session.outcomes && session.outcomes.length > 0 && (
          <section className={styles.section}>
            <h2>Expected Outcomes</h2>
            <ul className={styles.outcomes}>
              {session.outcomes.map((outcome, index) => (
                <li key={index}>{outcome}</li>
              ))}
            </ul>
          </section>
        )}

        <section className={styles.section}>
          <Link href={`/feedback/${session.id}`} className={styles.feedbackButton}>
            Share Your Feedback
          </Link>
        </section>
      </div>
    </div>
  );
}
