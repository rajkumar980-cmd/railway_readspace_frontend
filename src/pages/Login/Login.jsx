import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion as Motion, useReducedMotion } from 'framer-motion';
import { GraduationCap, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import BrandLogo from '../../components/brand/BrandLogo';
import './Auth.css';

/* Stagger container — children animate in sequence */
const cardVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

/* Each staggered child */
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.38, ease: 'easeOut' } },
};

/* Reduced-motion overrides */
const cardVariantsReduced = {};
const itemVariantsReduced = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.15 } },
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('student'); // 'student' or 'admin'
  const prefersReduced = useReducedMotion();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
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

    if (!form.email || !form.password) {
      setError('Email and password are required');
      return;
    }

    setLoading(true);
    const result = await login(form.email, form.password);
    setLoading(false);
    
    if (result.success) {
      // Small timeout to ensure context state is propagated
      setTimeout(() => {
        navigate(form.email.includes('admin') || result.user?.role === 'admin' ? '/admin' : '/dashboard');
      }, 100);
    } else {
      setError(result.error);
    }
  };

  return (
    <main className="auth-page">
      <Motion.div
        className="auth-card"
        variants={cv}
        initial="hidden"
        animate="visible"
      >
        <Motion.div className="auth-card__logo" variants={iv}>
          <BrandLogo size="lg" />
        </Motion.div>
        <Motion.h1 className="auth-card__title" variants={iv}>
          {mode === 'admin' ? 'Admin Access' : 'Welcome back'}
        </Motion.h1>
        <Motion.p className="auth-card__sub" variants={iv}>
          {mode === 'admin' ? 'Sign in to the administration panel' : 'Sign in to your student account'}
        </Motion.p>

        {/* Role Selector */}
        <Motion.div className="auth-role-selector" variants={iv}>
          <button
            type="button"
            className={`auth-role-btn ${mode === 'student' ? 'auth-role-btn--active' : ''}`}
            onClick={() => setMode('student')}
          >
            <GraduationCap size={18} />
            Student
          </button>
          <button
            type="button"
            className={`auth-role-btn ${mode === 'admin' ? 'auth-role-btn--active' : ''}`}
            onClick={() => setMode('admin')}
          >
            <ShieldCheck size={18} />
            Admin
          </button>
        </Motion.div>

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
            <label className="form-label" htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              className={`form-input${error ? ' form-input--error' : ''}`}
              placeholder={mode === 'admin' ? 'admin@readspace.com' : 'you@example.com'}
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
              aria-invalid={!!error}
              aria-describedby={error ? 'login-error' : undefined}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className={`form-input${error ? ' form-input--error' : ''}`}
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
              aria-invalid={!!error}
              aria-describedby={error ? 'login-error' : undefined}
            />
          </div>

          <button type="submit" className="btn btn--primary btn--full btn--lg" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </Motion.form>

        <Motion.p className="auth-card__footer" variants={iv}>
          Don't have an account? <Link to="/signup">Create one</Link>
        </Motion.p>
      </Motion.div>
    </main>
  );
}
