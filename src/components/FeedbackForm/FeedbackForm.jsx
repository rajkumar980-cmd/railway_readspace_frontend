import { useState, useEffect, useRef, useCallback } from 'react';
import { motion as Motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, Star, CheckCircle, Download, MessageSquare, User } from 'lucide-react';
import { useRatings } from '../../context/RatingsContext';
import { useAuth } from '../../context/AuthContext';
import './FeedbackForm.css';

/* ── Focus trap helper ────────────────────────────────────────── */
function getFocusable(el) {
  return Array.from(
    el.querySelectorAll(
      'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])'
    )
  );
}

/* ── Seed reviews (shown in the modal before any user reviews) ───
   The canonical source of seeds lives in RatingsContext.           */
const SEED_REVIEWS = [
  {
    id: 'seed-1',
    name: 'Priya Nair',
    initials: 'PN',
    rating: 5,
    text: 'Absolutely essential for any CS student. Covers every algorithm in depth with clear pseudocode and worked examples. My go-to reference throughout my degree.',
    date: 'Feb 2026',
    color: '#8b5cf6',
  },
  {
    id: 'seed-2',
    name: 'Rahul Verma',
    initials: 'RV',
    rating: 5,
    text: 'The explanations are incredibly thorough. I especially appreciated the complexity analysis sections. Worth every page.',
    date: 'Jan 2026',
    color: '#10b981',
  },
  {
    id: 'seed-3',
    name: 'Ananya Sharma',
    initials: 'AS',
    rating: 4,
    text: 'Very comprehensive. Some sections could use more visual diagrams, but overall this is one of the best algorithm books available.',
    date: 'Dec 2025',
    color: '#f59e0b',
  },
];

/* ── Reusable RatingStars ─────────────────────────────────────── */
/**
 * @param {object}   props
 * @param {number}   props.value        current rating (0–5)
 * @param {Function} [props.onChange]   if provided, stars are interactive
 * @param {number}   [props.size]       icon size (default 20)
 * @param {string}   [props.className]
 */
export function RatingStars({ value, onChange, size = 20, className = '' }) {
  const [hovered, setHovered] = useState(0);
  const interactive = typeof onChange === 'function';
  const display = interactive ? (hovered || value) : value;

  return (
    <div
      className={`rs-stars ${interactive ? 'rs-stars--interactive' : ''} ${className}`}
      role={interactive ? 'group' : undefined}
      aria-label={interactive ? 'Select rating' : `Rating: ${value} out of 5`}
      onMouseLeave={() => interactive && setHovered(0)}
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= display;
        const halfFilled = !filled && n - 0.5 <= display;
        return interactive ? (
          <button
            key={n}
            type="button"
            className={`rs-star-btn ${filled ? 'rs-star-btn--filled' : ''}`}
            onClick={() => onChange(n)}
            onMouseEnter={() => setHovered(n)}
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
            aria-pressed={n <= value}
          >
            <Star
              size={size}
              strokeWidth={1.75}
              fill={filled ? 'currentColor' : 'none'}
              aria-hidden="true"
            />
          </button>
        ) : (
          <span
            key={n}
            className={`rs-star ${filled ? 'rs-star--filled' : halfFilled ? 'rs-star--half' : ''}`}
          >
            <Star
              size={size}
              strokeWidth={1.75}
              fill={filled ? 'currentColor' : 'none'}
              aria-hidden="true"
            />
          </span>
        );
      })}
    </div>
  );
}

/* ── Reusable ReviewItem ──────────────────────────────────────── */
export function ReviewItem({ review, isNew }) {
  return (
    <Motion.div
      className="rm-review"
      initial={isNew ? { opacity: 0, y: 12 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      layout
    >
      <div className="rm-review__header">
        <div className="rm-review__avatar" style={{ background: review.color }}>
          {review.initials}
        </div>
        <div className="rm-review__meta">
          <p className="rm-review__name">{review.name}</p>
          <div className="rm-review__rating-row">
            <RatingStars value={review.rating} size={13} />
            <span className="rm-review__date">{review.date}</span>
          </div>
        </div>
      </div>
      <p className="rm-review__text">{review.text}</p>
    </Motion.div>
  );
}

/* ── Rating label helper ──────────────────────────────────────── */
const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];

/* ── Main FeedbackForm ────────────────────────────────────────── */
export default function FeedbackForm({ resource, onClose }) {
  const prefersReduced = useReducedMotion();
  const modalRef = useRef(null);
  const firstFocusRef = useRef(null);

  // ── Ratings context: shared store persisted to backend ──
  const { getReviews, getAvgRating, addReview, fetchReviews } = useRatings();
  const { user } = useAuth();

  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [touched, setTouched] = useState({ rating: false, message: false });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Derive reviews and stats from shared context
  const reviews = getReviews(resource.id);
  const avgRating = getAvgRating(resource.id, resource.rating).toFixed(1);
  const totalReviews = reviews.length;

  useEffect(() => {
    fetchReviews(resource.id);
  }, [fetchReviews, resource.id]);

  /* Validation */
  const ratingError = touched.rating && rating === 0 ? 'Please select a star rating.' : '';
  const messageError = touched.message && message.trim().length < 10
    ? 'Review must be at least 10 characters.' : '';
  const isValid = rating > 0 && message.trim().length >= 10;

  /* Focus trap + ESC */
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key === 'Tab' && modalRef.current) {
      const focusable = getFocusable(modalRef.current);
      if (!focusable.length) { e.preventDefault(); return; }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    // Defer focus to avoid conflicts with animation
    const t = setTimeout(() => firstFocusRef.current?.focus(), 80);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ rating: true, message: true });
    if (!isValid) return;

    setLoading(true);

    const newReview = {
      resourceId: resource.id,
      userEmail: user?.email || 'anonymous',
      userName: user?.name || 'Anonymous User',
      rating,
      comment: message.trim(),
    };

    const result = await addReview(resource.id, newReview);
    setLoading(false);
    if (result.success) {
      setSubmitted(true);
    }
  };

  if (!resource) return null;

  /* Animation variants */
  const overlayV = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: prefersReduced ? 0.01 : 0.22 } },
    exit: { opacity: 0, transition: { duration: prefersReduced ? 0.01 : 0.18 } },
  };
  const modalV = {
    hidden: { opacity: 0, scale: prefersReduced ? 1 : 0.96, y: prefersReduced ? 0 : 12 },
    visible: {
      opacity: 1, scale: 1, y: 0,
      transition: { duration: prefersReduced ? 0.01 : 0.26, ease: [0.22, 1, 0.36, 1] },
    },
    exit: {
      opacity: 0, scale: prefersReduced ? 1 : 0.97, y: prefersReduced ? 0 : -8,
      transition: { duration: prefersReduced ? 0.01 : 0.18, ease: 'easeIn' },
    },
  };

  return (
    <Motion.div
      className="rm-overlay"
      variants={overlayV}
      initial="hidden"
      animate="visible"
      exit="exit"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="rm-title"
    >
      <Motion.div
        className="rm-modal"
        variants={modalV}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={e => e.stopPropagation()}
        ref={modalRef}
        tabIndex={-1}
      >
        {/* Close button */}
        <button
          ref={firstFocusRef}
          className="rm-close"
          onClick={onClose}
          aria-label="Close rating modal"
        >
          <X size={16} strokeWidth={2.5} aria-hidden="true" />
        </button>

        <div className="rm-scroll">

          {/* ── Section 1: Resource Identity ── */}
          <div className="rm-resource-header">
            <div className="rm-resource-thumb-wrap">
              <img
                src={resource.thumbnail}
                alt={resource.title}
                className="rm-resource-thumb"
                loading="lazy"
              />
            </div>
            <div className="rm-resource-info">
              <span className="rm-resource-category">{resource.categoryLabel}</span>
              <h2 className="rm-resource-title" id="rm-title">{resource.title}</h2>
              <p className="rm-resource-author">by {resource.author}</p>
            </div>
          </div>

          {/* ── Section 2: Average Rating Summary ── */}
          <div className="rm-avg-block">
            <div className="rm-avg-score">
              <span className="rm-avg-number">{avgRating}</span>
              <div className="rm-avg-right">
                <RatingStars value={parseFloat(avgRating)} size={18} />
                <p className="rm-avg-meta">
                  {totalReviews} review{totalReviews !== 1 ? 's' : ''} &nbsp;·&nbsp;
                  <Download size={12} aria-hidden="true" style={{ display: 'inline', verticalAlign: 'middle' }} />&nbsp;
                  {resource.downloads.toLocaleString()} downloads
                </p>
              </div>
            </div>
          </div>

          {/* ── Divider ── */}
          <div className="rm-divider" />

          {/* ── Section 3 & 4: Write a Review ── */}
          <AnimatePresence mode="wait">
            {submitted ? (
              <Motion.div
                key="success"
                className="rm-success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } }}
              >
                <div className="rm-success-icon">
                  <CheckCircle size={40} strokeWidth={1.5} aria-hidden="true" />
                </div>
                <h3>Thank you for your review!</h3>
                <p>Your rating has been submitted and is now visible below.</p>
                <button
                  className="btn btn--primary"
                  onClick={() => { setSubmitted(false); setRating(0); setMessage(''); setTouched({ rating: false, message: false }); }}
                >
                  Write Another
                </button>
              </Motion.div>
            ) : (
              <Motion.section
                key="form"
                className="rm-form-section"
                initial={false}
              >
                <h3 className="rm-section-heading">
                  <MessageSquare size={15} aria-hidden="true" />
                  Write a Review
                </h3>

                <form onSubmit={handleSubmit} noValidate>
                  {/* Star selector */}
                  <div className="rm-form-group">
                    <label className="rm-form-label">
                      Your Rating <span className="rm-required" aria-hidden="true">*</span>
                    </label>
                    <div className="rm-star-input-row">
                      <RatingStars
                        value={rating}
                        onChange={(n) => { setRating(n); setTouched(t => ({ ...t, rating: true })); }}
                        size={28}
                      />
                      {rating > 0 && (
                        <Motion.span
                          className="rm-rating-label"
                          key={rating}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.18 }}
                        >
                          {RATING_LABELS[rating]}
                        </Motion.span>
                      )}
                    </div>
                    {ratingError && (
                      <span className="rm-field-error" role="alert">{ratingError}</span>
                    )}
                  </div>

                  {/* Textarea */}
                  <div className="rm-form-group">
                    <label className="rm-form-label" htmlFor="rm-review-text">
                      Your Review <span className="rm-required" aria-hidden="true">*</span>
                    </label>
                    <textarea
                      id="rm-review-text"
                      className={`rm-textarea ${messageError ? 'rm-textarea--error' : ''}`}
                      placeholder="What did you find helpful? How would you improve it?"
                      value={message}
                      onChange={e => { setMessage(e.target.value); setTouched(t => ({ ...t, message: true })); }}
                      rows={4}
                      aria-invalid={!!messageError}
                      aria-describedby={messageError ? 'rm-text-error' : undefined}
                      onBlur={() => setTouched(t => ({ ...t, message: true }))}
                    />
                    <div className="rm-textarea-footer">
                      {messageError
                        ? <span id="rm-text-error" className="rm-field-error" role="alert">{messageError}</span>
                        : <span className="rm-char-hint">{message.length} / 500</span>
                      }
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    className={`btn btn--primary rm-submit ${!isValid ? 'rm-submit--muted' : ''}`}
                    disabled={loading}
                    aria-busy={loading}
                  >
                    {loading
                      ? <><span className="rm-spinner" aria-hidden="true" /> Submitting…</>
                      : <>Submit Review</>
                    }
                  </button>
                </form>
              </Motion.section>
            )}
          </AnimatePresence>

          {/* ── Divider ── */}
          <div className="rm-divider" />

          {/* ── Section 5: User Reviews List ── */}
          <section className="rm-reviews-section">
            <h3 className="rm-section-heading">
              <User size={15} aria-hidden="true" />
              Community Reviews
              <span className="rm-reviews-count">{totalReviews}</span>
            </h3>

            {reviews.length === 0 ? (
              <div className="rm-empty">
                <Star size={32} strokeWidth={1.25} aria-hidden="true" />
                <p>No ratings yet.<br />Be the first to rate this resource.</p>
              </div>
            ) : (
              <div className="rm-reviews-list">
                <AnimatePresence initial={false}>
                  {reviews.map(review => (
                    <ReviewItem key={review.id} review={review} isNew={review.isNew} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </section>

        </div>{/* /rm-scroll */}
      </Motion.div>
    </Motion.div>
  );
}
