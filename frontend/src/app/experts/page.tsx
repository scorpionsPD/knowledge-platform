import Link from 'next/link';
import styles from './page.module.css';
import { Expert } from '@/types';

async function getExperts(): Promise<Expert[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/experts`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      throw new Error('Failed to fetch experts');
    }
    return res.json();
  } catch (error) {
    console.error('Error fetching experts:', error);
    return [];
  }
}

export default async function ExpertsPage() {
  const experts = await getExperts();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Expert Directory</h1>
        <p>Connect with leading experts across various domains</p>
      </div>

      {experts.length === 0 ? (
        <div className={styles['empty-state']}>
          <p>No experts available</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {experts.map((expert) => (
            <div key={expert.id} className={styles.card}>
              <div className={styles.avatar}>
                {expert.name.split(' ').map(n => n[0]).join('')}
              </div>
              <h3 className={styles.name}>{expert.name}</h3>
              <p className={styles.organization}>{expert.organisation}</p>
              
              <div className={styles.expertise}>
                {expert.expertise.slice(0, 4).map((skill, index) => (
                  <span key={index} className={styles.tag}>
                    {skill}
                  </span>
                ))}
                {expert.expertise.length > 4 && (
                  <span className={styles.tag}>+{expert.expertise.length - 4} more</span>
                )}
              </div>

              <div className={styles.actions}>
                <a href={`mailto:${expert.contactEmail}`} className={styles.emailButton}>
                  ✉️ Contact
                </a>
                {expert.linkedInProfile && (
                  <a 
                    href={expert.linkedInProfile} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.linkedinButton}
                  >
                    in LinkedIn
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
