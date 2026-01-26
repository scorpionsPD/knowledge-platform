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

type User = {
  id: string;
  displayName: string;
  email?: string;
  roles: string[];
};

type SessionInvite = {
  id: string;
  sessionId: string;
  email: string;
  name?: string;
  status: string;
  session?: { id: string; title: string };
};

type SessionFeedback = {
  id: string;
  sessionId: string;
  rating?: number;
  comment?: string;
  authorName?: string;
  authorEmail?: string;
  createdAt: string;
  session?: { id: string; title: string };
};

const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function Manage() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [invites, setInvites] = useState<SessionInvite[]>([]);
  const [feedback, setFeedback] = useState<SessionFeedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [userMessage, setUserMessage] = useState<string | null>(null);
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
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
  const [inviteForm, setInviteForm] = useState({
    sessionId: '',
    email: '',
    name: ''
  });

  const selectedExperts = useMemo(
    () => experts.filter((e) => form.invitedExpertIds.includes(e.id)),
    [experts, form.invitedExpertIds]
  );

  const fetchData = async () => {
    setLoading(true);
    setUserMessage(null);
    setInviteMessage(null);
    setFeedbackMessage(null);
    try {
      const [expertsRes, sessionsRes, usersRes, invitesRes, feedbackRes] = await Promise.all([
        fetch(`${apiBase}/api/experts`, { credentials: 'include' }),
        fetch(`${apiBase}/api/sessions`, { credentials: 'include' }),
        fetch(`${apiBase}/api/users`, { credentials: 'include' }),
        fetch(`${apiBase}/api/invites`, { credentials: 'include' }),
        fetch(`${apiBase}/api/feedback`, { credentials: 'include' })
      ]);
      if (expertsRes.ok) setExperts(await expertsRes.json());
      if (sessionsRes.ok) setSessions(await sessionsRes.json());
      if (usersRes.ok) {
        setUsers(await usersRes.json());
      } else if (usersRes.status === 401 || usersRes.status === 403) {
        setUsers([]);
        setUserMessage('User admin requires an admin role.');
      } else {
        setUsers([]);
        setUserMessage('Failed to load users.');
      }
      if (invitesRes.ok) {
        setInvites(await invitesRes.json());
      } else if (invitesRes.status === 401 || invitesRes.status === 403) {
        setInvites([]);
        setInviteMessage('Invites require an admin or editor role.');
      } else {
        setInvites([]);
        setInviteMessage('Failed to load invites.');
      }
      if (feedbackRes.ok) {
        setFeedback(await feedbackRes.json());
      } else if (feedbackRes.status === 401 || feedbackRes.status === 403) {
        setFeedback([]);
        setFeedbackMessage('Feedback requires an admin or editor role.');
      } else {
        setFeedback([]);
        setFeedbackMessage('Failed to load feedback.');
      }
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

  const handleRoleUpdate = async (userId: string, roles: string[]) => {
    setUserMessage(null);
    try {
      const res = await fetch(`${apiBase}/api/users/${userId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roles })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to update roles');
      }
      const updated = (await res.json()) as User;
      setUsers((prev) => prev.map((user) => (user.id === userId ? updated : user)));
      setUserMessage('Roles updated.');
    } catch (err: any) {
      setUserMessage(err.message || 'Error updating roles');
    }
  };

  const handleInviteSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setInviteMessage(null);
    try {
      const res = await fetch(`${apiBase}/api/invites`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: inviteForm.sessionId,
          email: inviteForm.email,
          name: inviteForm.name || undefined
        })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to create invite');
      }
      const created = (await res.json()) as SessionInvite;
      setInvites((prev) => [created, ...prev]);
      setInviteForm({ sessionId: '', email: '', name: '' });
      setInviteMessage('Invite created.');
    } catch (err: any) {
      setInviteMessage(err.message || 'Error creating invite');
    }
  };

  const handleInviteStatusUpdate = async (inviteId: string, status: string) => {
    setInviteMessage(null);
    try {
      const res = await fetch(`${apiBase}/api/invites/${inviteId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to update invite');
      }
      const updated = (await res.json()) as SessionInvite;
      setInvites((prev) => prev.map((invite) => (invite.id === inviteId ? updated : invite)));
      setInviteMessage('Invite updated.');
    } catch (err: any) {
      setInviteMessage(err.message || 'Error updating invite');
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

          <div className="stack">
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
            <div className="card">
              <h3>Users & roles</h3>
              <p className="muted">
                Admin-only. Assign roles that control who can create or edit sessions.
              </p>
              {userMessage && <p className="muted">{userMessage}</p>}
              <div className="list">
                {users.map((user) => (
                  <UserRoleEditor key={user.id} user={user} onSave={handleRoleUpdate} />
                ))}
                {users.length === 0 && !userMessage && (
                  <p className="muted">No users found yet.</p>
                )}
              </div>
            </div>
            <div className="card">
              <h3>Session invites</h3>
              <p className="muted">Invite participants and track RSVP status.</p>
              <form className="card" onSubmit={handleInviteSubmit}>
                <label>
                  Session
                  <select
                    value={inviteForm.sessionId}
                    onChange={(e) => setInviteForm({ ...inviteForm, sessionId: e.target.value })}
                    required
                  >
                    <option value="">Select a session</option>
                    {sessions.map((session) => (
                      <option key={session.id} value={session.id}>
                        {session.title}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Participant email
                  <input
                    type="email"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Participant name (optional)
                  <input
                    value={inviteForm.name}
                    onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                  />
                </label>
                <button className="btn primary" type="submit" disabled={loading}>
                  {loading ? 'Working...' : 'Create invite'}
                </button>
              </form>
              {inviteMessage && <p className="muted">{inviteMessage}</p>}
              <div className="list">
                {invites.map((invite) => (
                  <InviteEditor
                    key={invite.id}
                    invite={invite}
                    onSave={handleInviteStatusUpdate}
                  />
                ))}
                {invites.length === 0 && !inviteMessage && (
                  <p className="muted">No invites yet.</p>
                )}
              </div>
            </div>
            <div className="card">
              <h3>Session feedback</h3>
              <p className="muted">Review participant feedback submissions.</p>
              {feedbackMessage && <p className="muted">{feedbackMessage}</p>}
              <div className="list">
                {feedback.map((entry) => (
                  <FeedbackCard key={entry.id} entry={entry} />
                ))}
                {feedback.length === 0 && !feedbackMessage && (
                  <p className="muted">No feedback yet.</p>
                )}
              </div>
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

function UserRoleEditor({
  user,
  onSave
}: {
  user: User;
  onSave: (userId: string, roles: string[]) => Promise<void>;
}) {
  const [roles, setRoles] = useState<string[]>(user.roles);
  const [saving, setSaving] = useState(false);
  const roleOptions = ['admin', 'editor', 'member'];

  useEffect(() => {
    setRoles(user.roles);
  }, [user.roles]);

  return (
    <article className="report">
      <h4>{user.displayName}</h4>
      <p className="muted">{user.email || 'No email on file'}</p>
      <div className="tag-row">
        {roleOptions.map((role) => {
          const active = roles.includes(role);
          return (
            <button
              key={role}
              type="button"
              className={`btn ${active ? 'primary' : ''}`}
              onClick={() => {
                setRoles((prev) => (active ? prev.filter((r) => r !== role) : [...prev, role]));
              }}
            >
              {role}
            </button>
          );
        })}
      </div>
      <button
        className="btn primary"
        type="button"
        disabled={saving}
        onClick={async () => {
          setSaving(true);
          await onSave(user.id, roles);
          setSaving(false);
        }}
      >
        {saving ? 'Saving...' : 'Save roles'}
      </button>
    </article>
  );
}

function InviteEditor({
  invite,
  onSave
}: {
  invite: SessionInvite;
  onSave: (inviteId: string, status: string) => Promise<void>;
}) {
  const [status, setStatus] = useState(invite.status);
  const [saving, setSaving] = useState(false);
  const statusOptions = ['pending', 'sent', 'accepted', 'declined'];

  useEffect(() => {
    setStatus(invite.status);
  }, [invite.status]);

  return (
    <article className="report">
      <h4>{invite.name || invite.email}</h4>
      <p className="muted">{invite.email}</p>
      <p className="muted">{invite.session?.title || invite.sessionId}</p>
      <label>
        Status
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          {statusOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <button
        className="btn primary"
        type="button"
        disabled={saving}
        onClick={async () => {
          setSaving(true);
          await onSave(invite.id, status);
          setSaving(false);
        }}
      >
        {saving ? 'Saving...' : 'Save status'}
      </button>
    </article>
  );
}

function FeedbackCard({ entry }: { entry: SessionFeedback }) {
  return (
    <article className="report">
      <h4>{entry.session?.title || 'Session feedback'}</h4>
      <p className="muted">
        {entry.authorName || 'Anonymous'} {entry.authorEmail ? `(${entry.authorEmail})` : ''}
      </p>
      {typeof entry.rating === 'number' && <p className="muted">Rating: {entry.rating} / 5</p>}
      {entry.comment && <p className="muted">{entry.comment}</p>}
    </article>
  );
}
