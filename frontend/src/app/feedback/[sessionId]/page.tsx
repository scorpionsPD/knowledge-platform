'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';
import { Session } from '@/types';

export default function FeedbackPage({ params }: { params: { sessionId: string } }) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchSession();
  }, []);

  const fetchSession = async () => {
    try {
      const res = await fetch(`http://localhost:4000/api/sessions/${params.sessionId}`);
      if (res.ok) {
        const data = await res.json();
        setSession(data);
      }
    } catch (error) {
      console.error('Error fetching session:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('http://localhost:4000/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          sessionId: params.sessionId,
          rating,
          comment: comment.trim() || undefined,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push(`/sessions/${params.sessionId}`);
        }, 2000);
      } else {
        const error = await res.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className={styles.container}>
        <div className={styles.successMessage}>
          <div className={styles.successIcon}>✓</div>
          <h2>Thank you for your feedback!</h2>
          <p>Your feedback helps us improve future sessions.</p>
          <p>Redirecting you back...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Link href={`/sessions/${params.sessionId}`} className={styles.back}>
        ← Back to Session
      </Link>

      <div className={styles.formCard}>
        <h1>Share Your Feedback</h1>
        
        {session && (
          <div className={styles.sessionInfo}>
            <h3>{session.title}</h3>
            <p>{new Date(session.scheduledAt).toLocaleDateString()}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>How would you rate this session? *</label>
            <div className={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={styles.star}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                >
                  <span className={star <= (hoveredRating || rating) ? styles.filled : styles.empty}>
                    ★
                  </span>
                </button>
              ))}
            </div>
            <div className={styles.ratingText}>
              {rating > 0 && (
                <span>
                  {rating === 1 && 'Poor'}
                  {rating === 2 && 'Fair'}
                  {rating === 3 && 'Good'}
                  {rating === 4 && 'Very Good'}
                  {rating === 5 && 'Excellent'}
                </span>
              )}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Additional Comments (optional)</label>
            <textarea
              rows={6}
              placeholder="What did you learn? How can we improve?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className={styles.textarea}
            />
          </div>

          <button
            type="submit"
            disabled={rating === 0 || submitting}
            className={styles.submitButton}
          >
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      </div>
    </div>
  );
}
