'use client';

import { useMemo, useState } from 'react';

import SessionCard from '../components/SessionCard';
import styles from './page.module.css';
import { Session } from '../types';

type Props = {
  sessions: Session[];
};

export default function SessionsClient({ sessions }: Props) {
  const [query, setQuery] = useState('');
  const [visibility, setVisibility] = useState('all');
  const [tag, setTag] = useState('all');

  const tags = useMemo(() => {
    const values = new Set<string>();
    sessions.forEach((session) => {
      session.tags?.forEach((value) => values.add(value));
    });
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }, [sessions]);

  const filteredSessions = useMemo(() => {
    const lowerQuery = query.trim().toLowerCase();
    return sessions.filter((session) => {
      if (visibility !== 'all' && session.visibility !== visibility) return false;
      if (tag !== 'all' && !session.tags?.includes(tag)) return false;
      if (!lowerQuery) return true;
      return (
        session.title.toLowerCase().includes(lowerQuery) ||
        session.description.toLowerCase().includes(lowerQuery)
      );
    });
  }, [query, sessions, tag, visibility]);

  return (
    <>
      <div className={styles.filters}>
        <div className={styles['filter-row']}>
          <div className={styles['filter-group']}>
            <label htmlFor="session-search">Search sessions</label>
            <input
              id="session-search"
              type="search"
              placeholder="Search by title or description"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div className={styles['filter-group']}>
            <label htmlFor="session-visibility">Visibility</label>
            <select
              id="session-visibility"
              value={visibility}
              onChange={(event) => setVisibility(event.target.value)}
            >
              <option value="all">All</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>
          <div className={styles['filter-group']}>
            <label htmlFor="session-tag">Tag</label>
            <select id="session-tag" value={tag} onChange={(event) => setTag(event.target.value)}>
              <option value="all">All tags</option>
              {tags.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredSessions.length === 0 ? (
        <div className={styles['empty-state']}>
          <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>No sessions match your filters</p>
          <p style={{ fontSize: '0.875rem' }}>Try adjusting the search or filters</p>
        </div>
      ) : (
        <div className={styles['sessions-grid']}>
          {filteredSessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      )}
    </>
  );
}
