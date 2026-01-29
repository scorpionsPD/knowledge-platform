import Link from 'next/link';
import styles from './SessionCard.module.css';
import { Session } from '@/types';

interface SessionCardProps {
  session: Session;
}

export default function SessionCard({ session }: SessionCardProps) {
  const scheduledDate = new Date(session.scheduledAt);
  const formattedDate = scheduledDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = scheduledDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={styles['session-card']}>
      <div className={styles['session-header']}>
        <div>
          <h3 className={styles['session-title']}>{session.title}</h3>
          <div className={styles['session-meta']}>
            <span>
              📅 {formattedDate} at {formattedTime}
            </span>
            <span>🏢 {session.hostOrganisation}</span>
          </div>
        </div>
        <span className={`${styles['visibility-badge']} ${styles[session.visibility]}`}>
          {session.visibility}
        </span>
      </div>

      <p className={styles['session-description']}>
        {session.description.length > 200
          ? `${session.description.substring(0, 200)}...`
          : session.description}
      </p>

      {session.tags && session.tags.length > 0 && (
        <div className={styles['session-tags']}>
          {session.tags.map((tag, index) => (
            <span key={index} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {session.invitedExperts && session.invitedExperts.length > 0 && (
          <div className={styles['session-experts']}>
            <span>👥 With:</span>
            {session.invitedExperts.slice(0, 3).map((expert) => (
              <span key={expert.id} className={styles['expert-avatar']} title={expert.name}>
                {expert.name.charAt(0)}
              </span>
            ))}
            {session.invitedExperts.length > 3 && (
              <span>+{session.invitedExperts.length - 3} more</span>
            )}
          </div>
        )}
        <Link href={`/sessions/${session.id}`} className={styles['view-button']}>
          View Details →
        </Link>
      </div>
    </div>
  );
}
