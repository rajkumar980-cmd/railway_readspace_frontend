/**
 * RatingsContext — global shared store for resource reviews & ratings.
 *
 * Persists to localStorage so reviews survive page refreshes.
 * Both FeedbackForm (student) and AdminDashboard (admin) consume this.
 *
 * Shape of stored data:
 *   reviewsByResource: { [resourceId]: Review[] }
 *
 * Review shape:
 *   { id, resourceId, name, initials, rating, text, date, color, isNew? }
 */
import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';

/* ── Seed reviews that appear by default in every resource ── */
const SEED_REVIEWS = [
  {
    id: 'seed-1',
    name: 'Priya Nair',
    initials: 'PN',
    rating: 5,
    text: 'Absolutely essential for any CS student. Covers every topic in depth with clear examples and worked problems. My go-to reference.',
    date: 'Feb 2026',
    color: '#8b5cf6',
  },
  {
    id: 'seed-2',
    name: 'Rahul Verma',
    initials: 'RV',
    rating: 4,
    text: 'The explanations are incredibly thorough. I especially appreciated the complexity analysis sections. Worth every page.',
    date: 'Jan 2026',
    color: '#10b981',
  },
  {
    id: 'seed-3',
    name: 'Ananya Sharma',
    initials: 'AS',
    rating: 4,
    text: 'Very comprehensive. Some sections could use more visual diagrams, but overall one of the best resources available.',
    date: 'Dec 2025',
    color: '#f59e0b',
  },
];

/* ── Context ── */
const RatingsContext = createContext(null);

export function RatingsProvider({ children }) {
  const [reviewsByResource, setReviewsByResource] = useState({});
  const { token } = useAuth();

  /* Fetch reviews when needed or on init */
  const fetchReviews = useCallback(async (resourceId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/reviews/resource/${resourceId}`);
      if (response.ok) {
        const data = await response.json();
        setReviewsByResource(prev => ({ ...prev, [resourceId]: data }));
      }
    } catch (e) {
      console.error("Failed to fetch reviews", e);
    }
  }, []);

  /* Add a new review for a resource */
  const addReview = useCallback(async (resourceId, review) => {
    try {
      const response = await fetch('http://localhost:8080/api/reviews', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(review)
      });
      if (response.ok) {
        const savedReview = await response.json();
        setReviewsByResource(prev => {
          const existing = prev[resourceId] ?? [];
          return { ...prev, [resourceId]: [savedReview, ...existing] };
        });
        return { success: true };
      }
    } catch (e) {
      console.error("Failed to add review", e);
    }
    return { success: false };
  }, [token]);

  /* Get all reviews for a resource (seed + user-submitted) */
  const getReviews = useCallback((resourceId) => {
    const userReviews = reviewsByResource[resourceId] ?? [];
    // Convert backend Review format to frontend format if needed
    const formattedUserReviews = userReviews.map(r => ({
      id: r.id,
      name: r.userName || 'User',
      initials: r.userName ? r.userName.substring(0,2).toUpperCase() : 'US',
      rating: r.rating,
      text: r.comment,
      date: new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      color: '#1a56db'
    }));
    return [...formattedUserReviews, ...SEED_REVIEWS];
  }, [reviewsByResource]);

  /* Compute average rating for a resource, blending seed + user reviews */
  const getAvgRating = useCallback((resourceId, baseRating) => {
    const userReviews = reviewsByResource[resourceId] ?? [];
    if (userReviews.length === 0) return baseRating;
    const allRatings = [
      ...userReviews.map(r => r.rating),
      ...SEED_REVIEWS.map(r => r.rating),
      baseRating,
    ];
    const avg = allRatings.reduce((s, r) => s + r, 0) / allRatings.length;
    return Math.round(avg * 10) / 10;
  }, [reviewsByResource]);

  /* Count of user-submitted reviews for a resource */
  const getUserReviewCount = useCallback((resourceId) => {
    return (reviewsByResource[resourceId] ?? []).length;
  }, [reviewsByResource]);

  /* All user-submitted reviews across all resources (flat list, newest first) */
  const getAllUserReviews = useCallback(() => {
    return Object.entries(reviewsByResource).flatMap(([resourceId, reviews]) =>
      reviews.map(r => ({
        id: r.id,
        resourceId: Number(resourceId),
        name: r.userName,
        rating: r.rating,
        text: r.comment,
        date: r.createdAt
      }))
    ).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [reviewsByResource]);

  /* Delete a single review (admin moderation) */
  const deleteReview = useCallback((resourceId, reviewId) => {
    // Potentially call DELETE API here
    setReviewsByResource(prev => {
      const existing = prev[resourceId] ?? [];
      return { ...prev, [resourceId]: existing.filter(r => r.id !== reviewId) };
    });
  }, []);

  /* Global stats for admin dashboard */
  const globalStats = useMemo(() => {
    const allUserReviews = Object.values(reviewsByResource).flat();
    const totalUserReviews = allUserReviews.length;
    const avgRating = totalUserReviews > 0
      ? (allUserReviews.reduce((s, r) => s + r.rating, 0) / totalUserReviews).toFixed(1)
      : null;
    return { totalUserReviews, avgRating };
  }, [reviewsByResource]);

  return (
    <RatingsContext.Provider value={{
      addReview,
      getReviews,
      getAvgRating,
      getUserReviewCount,
      getAllUserReviews,
      deleteReview,
      globalStats,
      fetchReviews
    }}>
      {children}
    </RatingsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useRatings() {
  const ctx = useContext(RatingsContext);
  if (!ctx) throw new Error('useRatings must be inside RatingsProvider');
  return ctx;
}
