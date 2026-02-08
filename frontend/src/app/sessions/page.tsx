import styles from './page.module.css';
import { Session } from '@/types';
import SessionsClient from './SessionsClient';

async function getSessions(): Promise<Session[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/sessions`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      throw new Error('Failed to fetch sessions');
    }
    return res.json();
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return [];
  }
}

export default async function SessionsPage() {
  const sessions = await getSessions();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Knowledge Sessions</h1>
        <p>Discover upcoming expert-led sessions and workshops</p>
      </div>

      {sessions.length === 0 ? (
        <div className={styles['empty-state']}>
          <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>No sessions available</p>
          <p style={{ fontSize: '0.875rem' }}>Check back later for upcoming knowledge sharing sessions</p>
        </div>
      ) : (
        <SessionsClient sessions={sessions} />
      )}
    </div>
  );
}
