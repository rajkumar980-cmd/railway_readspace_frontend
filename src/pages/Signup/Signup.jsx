import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion as Motion, useReducedMotion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import BrandLogo from '../../components/brand/BrandLogo';
import '../Login/Auth.css';

const cardVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.36, ease: 'easeOut' } },
};
const cardVariantsReduced = {};
const itemVariantsReduced = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.15 } },
};

export default function Signup() {
  const { signup, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const cv = prefersReduced ? cardVariantsReduced : cardVariants;
  const iv = prefersReduced ? itemVariantsReduced : itemVariants;

  const handleChange = e => {
    setError('');
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }

    setLoading(true);
    const result = await signup(form.name, form.email, form.password);
    setLoading(false);
    
    if (result.success) {
      setTimeout(() => {
        navigate('/dashboard');
      }, 100);
    } else {
      setError(result.error);
    }
  };

  const pwError = error && /password/i.test(error);

  return (
    <main className="auth-page">
      <Motion.div className="auth-card" variants={cv} initial="hidden" animate="visible">
        <Motion.div className="auth-card__logo" variants={iv}>
          <BrandLogo size="lg" />
        </Motion.div>
        <Motion.h1 className="auth-card__title" variants={iv}>Create Account</Motion.h1>
        <Motion.p className="auth-card__sub" variants={iv}>Join ReadSpace — it&apos;s free forever</Motion.p>

        {error && (
          <Motion.div
            className="auth-error"
            role="alert"
            aria-live="assertive"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
          >
            <span className="auth-error__icon" aria-hidden="true">⚠</span>
            {error}
          </Motion.div>
        )}

        <Motion.form className="auth-form" onSubmit={handleSubmit} noValidate variants={iv}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <input id="name" name="name" type="text" className="form-input" placeholder="Jane Smith" value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email address</label>
            <input id="email" name="email" type="email" className="form-input" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password" name="password" type="password"
              className={`form-input${pwError ? ' form-input--error' : ''}`}
              placeholder="Min. 6 characters"
              value={form.password} onChange={handleChange} required
              aria-invalid={pwError || undefined}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="confirm">Confirm Password</label>
            <input
              id="confirm" name="confirm" type="password"
              className={`form-input${pwError ? ' form-input--error' : ''}`}
              placeholder="Repeat password"
              value={form.confirm} onChange={handleChange} required
              aria-invalid={pwError || undefined}
            />
          </div>

          <button type="submit" className="btn btn--primary btn--full btn--lg" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </Motion.form>

        <Motion.p className="auth-card__footer" variants={iv}>
          Already have an account? <Link to="/login">Sign in</Link>
        </Motion.p>
      </Motion.div>
    </main>
  );
}
