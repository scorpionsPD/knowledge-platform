'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { Session, Expert } from '@/types';

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduledAt: '',
    visibility: 'public' as 'public' | 'private',
    tags: '',
    hostOrganisation: '',
    invitedExperts: [] as string[],
    summary: '',
    format: '',
    location: '',
  });

  useEffect(() => {
    fetchSessions();
    fetchExperts();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/sessions');
      const data = await res.json();
      setSessions(data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExperts = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/experts');
      const data = await res.json();
      setExperts(data);
    } catch (error) {
      console.error('Error fetching experts:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const sessionData = {
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
    };

    try {
      const res = await fetch('http://localhost:4000/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData),
        credentials: 'include',
      });

      if (res.ok) {
        setShowForm(false);
        fetchSessions();
        // Reset form
        setFormData({
          title: '',
          description: '',
          scheduledAt: '',
          visibility: 'public',
          tags: '',
          hostOrganisation: '',
          invitedExperts: [],
          summary: '',
          format: '',
          location: '',
        });
      } else {
        const error = await res.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error creating session:', error);
      alert('Failed to create session');
    }
  };

  const toggleExpert = (expertId: string) => {
    setFormData(prev => ({
      ...prev,
      invitedExperts: prev.invitedExperts.includes(expertId)
        ? prev.invitedExperts.filter(id => id !== expertId)
        : [...prev.invitedExperts, expertId]
    }));
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Manage Sessions</h1>
        <button onClick={() => setShowForm(!showForm)} className={styles.createButton}>
          {showForm ? 'Cancel' : '+ Create Session'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className={styles.form}>
          <h2>Create New Session</h2>
          
          <div className={styles.formGroup}>
            <label>Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Description *</label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Scheduled Date & Time *</label>
              <input
                type="datetime-local"
                required
                value={formData.scheduledAt}
                onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Visibility *</label>
              <select
                value={formData.visibility}
                onChange={(e) => setFormData({ ...formData, visibility: e.target.value as 'public' | 'private' })}
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Host Organisation *</label>
            <input
              type="text"
              required
              value={formData.hostOrganisation}
              onChange={(e) => setFormData({ ...formData, hostOrganisation: e.target.value })}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Tags (comma-separated)</label>
            <input
              type="text"
              placeholder="DevOps, Cloud, Security"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Format</label>
            <input
              type="text"
              placeholder="Workshop, Webinar, Hands-on"
              value={formData.format}
              onChange={(e) => setFormData({ ...formData, format: e.target.value })}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Location</label>
            <input
              type="text"
              placeholder="Room 101, Zoom, etc."
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Invited Experts</label>
            <div className={styles.expertList}>
              {experts.map(expert => (
                <label key={expert.id} className={styles.expertCheckbox}>
                  <input
                    type="checkbox"
                    checked={formData.invitedExperts.includes(expert.id)}
                    onChange={() => toggleExpert(expert.id)}
                  />
                  <span>{expert.name} - {expert.organisation}</span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.formActions}>
            <button type="submit" className={styles.submitButton}>
              Create Session
            </button>
            <button type="button" onClick={() => setShowForm(false)} className={styles.cancelButton}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className={styles.sessionsList}>
        <h2>Existing Sessions ({sessions.length})</h2>
        {sessions.map(session => (
          <div key={session.id} className={styles.sessionItem}>
            <div>
              <h3>{session.title}</h3>
              <p>{new Date(session.scheduledAt).toLocaleString()}</p>
              <p className={styles.meta}>
                {session.hostOrganisation} • {session.visibility} • {session.invitedExperts?.length || 0} experts
              </p>
            </div>
            <Link href={`/sessions/${session.id}`} className={styles.viewButton}>
              View
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
