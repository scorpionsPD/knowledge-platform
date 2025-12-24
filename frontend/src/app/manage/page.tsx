'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';

type Expert = {
  id: string;
  name: string;
  title?: string;
};

type Session = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  scheduledAt?: string;
  visibility: string;
  invitedExperts: Expert[];
  summary?: string;
  outcomes?: string[];
};

const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function Manage() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    tags: 'Architecture, Security',
    scheduledAt: '',
    visibility: 'private',
    hostOrganisation: 'Acme Corp',
    invitedExpertIds: [] as string[],
    summary: '',
    outcomes: ''
  });

  const selectedExperts = useMemo(
    () => experts.filter((e) => form.invitedExpertIds.includes(e.id)),
    [experts, form.invitedExpertIds]
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const [expertsRes, sessionsRes] = await Promise.all([
        fetch(`${apiBase}/api/experts`, { credentials: 'include' }),
        fetch(`${apiBase}/api/sessions`, { credentials: 'include' })
      ]);
      if (expertsRes.ok) setExperts(await expertsRes.json());
      if (sessionsRes.ok) setSessions(await sessionsRes.json());
    } catch (err) {
      console.error(err);
      setMessage('Failed to load data (are you logged in?)');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage(null);
    const payload = {
      title: form.title,
      description: form.description,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      scheduledAt: form.scheduledAt || new Date().toISOString(),
      visibility: form.visibility,
      hostOrganisation: form.hostOrganisation,
      invitedExperts: form.invitedExpertIds,
      summary: form.summary || undefined,
      outcomes: form.outcomes
        .split('\n')
        .map((t) => t.trim())
        .filter(Boolean)
    };
    try {
      const res = await fetch(`${apiBase}/api/sessions`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to create session');
      }
      setMessage('Session created');
      setForm((prev) => ({
        ...prev,
        title: '',
        description: '',
        invitedExpertIds: [],
        summary: '',
        outcomes: ''
      }));
      await fetchData();
    } catch (err: any) {
      setMessage(err.message || 'Error creating session');
    }
  };

  const handleUpdate = async (sessionId: string, summary: string, outcomes: string) => {
    setMessage(null);
    const payload = {
      summary: summary || undefined,
      outcomes: outcomes
        .split('\n')
        .map((t) => t.trim())
        .filter(Boolean)
    };
    try {
      const res = await fetch(`${apiBase}/api/sessions/${sessionId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to update session');
      }
      setMessage('Session updated');
      await fetchData();
    } catch (err: any) {
      setMessage(err.message || 'Error updating session');
    }
  };

  return (
    <main>
      <div className="shell">
        <header className="header">
          <div className="mark">
            <span>⎯⎯</span> Manage Sessions
          </div>
          <div className="pill">Authenticated actions require OAuth login or AUTH_DISABLED=true</div>
        </header>

        <section className="hero">
          <div>
            <h1>Create a knowledge session</h1>
            <p className="muted">
              Posts to the backend with credentials; ensure you are logged in (OAuth) or running the
              API with `AUTH_DISABLED=true`.
            </p>
            <form className="card" onSubmit={handleSubmit}>
              <label>
                Title
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </label>
              <label>
                Description
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                />
              </label>
              <label>
                Tags (comma separated)
                <input
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                />
              </label>
              <label>
                Scheduled at
                <input
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                />
              </label>
              <label>
                Visibility
                <select
                  value={form.visibility}
                  onChange={(e) => setForm({ ...form, visibility: e.target.value })}
                >
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                </select>
              </label>
              <label>
                Host organisation
                <input
                  value={form.hostOrganisation}
                  onChange={(e) => setForm({ ...form, hostOrganisation: e.target.value })}
                />
              </label>
              <label>
                Invite experts
                <div className="tag-row">
                  {experts.map((expert) => {
                    const active = form.invitedExpertIds.includes(expert.id);
                    return (
                      <button
                        key={expert.id}
                        type="button"
                        className={`btn ${active ? 'primary' : ''}`}
                        onClick={() => {
                          setForm((prev) => {
                            const nextIds = active
                              ? prev.invitedExpertIds.filter((id) => id !== expert.id)
                              : [...prev.invitedExpertIds, expert.id];
                            return { ...prev, invitedExpertIds: nextIds };
                          });
                        }}
                      >
                        {expert.name}
                      </button>
                    );
                  })}
                </div>
              </label>
              <label>
                Summary (optional)
                <textarea
                  value={form.summary}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                />
              </label>
              <label>
                Outcomes (one per line)
                <textarea
                  value={form.outcomes}
                  onChange={(e) => setForm({ ...form, outcomes: e.target.value })}
                />
              </label>
              <button className="btn primary" type="submit" disabled={loading}>
                {loading ? 'Working...' : 'Create session'}
              </button>
              {selectedExperts.length > 0 && (
                <p className="muted">
                  Inviting: {selectedExperts.map((e) => e.name).join(', ')}
                </p>
              )}
            </form>
            {message && <p className="muted">{message}</p>}
          </div>

          <div className="card">
            <h3>Existing sessions</h3>
            <p className="muted">
              Update summaries/outcomes by calling authenticated PUT endpoints with credentials.
            </p>
            <div className="list">
              {sessions.map((session) => (
                <SessionEditor key={session.id} session={session} onSave={handleUpdate} />
              ))}
              {sessions.length === 0 && <p className="muted">No sessions yet.</p>}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function SessionEditor({
  session,
  onSave
}: {
  session: Session;
  onSave: (sessionId: string, summary: string, outcomes: string) => Promise<void>;
}) {
  const [summary, setSummary] = useState(session.summary ?? '');
  const [outcomes, setOutcomes] = useState((session.outcomes || []).join('\n'));
  const [saving, setSaving] = useState(false);

  return (
    <article className="report">
      <h4>{session.title}</h4>
      <p className="muted">{session.description}</p>
      <p className="muted">
        Experts: {session.invitedExperts.map((e) => e.name).join(', ') || 'TBD'}
      </p>
      <label>
        Summary
        <textarea value={summary} onChange={(e) => setSummary(e.target.value)} />
      </label>
      <label>
        Outcomes (one per line)
        <textarea value={outcomes} onChange={(e) => setOutcomes(e.target.value)} />
      </label>
      <button
        className="btn primary"
        type="button"
        disabled={saving}
        onClick={async () => {
          setSaving(true);
          await onSave(session.id, summary, outcomes);
          setSaving(false);
        }}
      >
        {saving ? 'Saving...' : 'Save changes'}
      </button>
    </article>
  );
}
