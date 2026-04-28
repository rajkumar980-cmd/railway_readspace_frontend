import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import BrandLogo from '../brand/BrandLogo';
import { Sun, Moon, User } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
      <div className="container navbar__inner">
        {/* Logo */}
        <Link to="/" className="navbar__logo" onClick={closeMenu} aria-label="ReadSpace — home">
          <BrandLogo size="md" />
        </Link>

        {/* Theme toggle */}
        <button
          className="navbar__theme-toggle"
          onClick={toggle}
          aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          title={theme === 'light' ? 'Dark mode' : 'Light mode'}
        >
          {theme === 'light' ? <Moon size={18} aria-hidden="true" /> : <Sun size={18} aria-hidden="true" />}
        </button>

        {/* Desktop nav links */}
        <ul className="navbar__links">
          <li><NavLink to="/home" className={({ isActive }) => isActive ? 'active' : ''}>Home</NavLink></li>
          <li><NavLink to="/categories" className={({ isActive }) => isActive ? 'active' : ''}>Categories</NavLink></li>
          <li><NavLink to="/popular" className={({ isActive }) => isActive ? 'active' : ''}>Popular</NavLink></li>
          <li><NavLink to="/latest" className={({ isActive }) => isActive ? 'active' : ''}>Latest</NavLink></li>
        </ul>

        {/* Auth buttons or user menu */}
        <div className="navbar__auth">
          {user ? (
            <div className="navbar__user">
              <Link
                to={user.role === 'admin' ? '/admin' : '/dashboard'}
                className="navbar__user-name"
                onClick={closeMenu}
              >
                <User size={15} aria-hidden="true" style={{ flexShrink: 0 }} /> {user.name}
              </Link>
              <button className="btn btn--outline btn--sm" onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn--ghost btn--sm" onClick={closeMenu}>Login</Link>
              <Link to="/signup" className="btn btn--primary btn--sm" onClick={closeMenu}>Sign Up</Link>
            </>
          )}
        </div>

        {/* Hamburger */}
        <button
          className={`navbar__hamburger${menuOpen ? ' open' : ''}`}
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile menu */}
      <div className={`navbar__mobile${menuOpen ? ' open' : ''}`}>
        <NavLink to="/home" onClick={closeMenu}>Home</NavLink>
        <NavLink to="/categories" onClick={closeMenu}>Categories</NavLink>
        <NavLink to="/popular" onClick={closeMenu}>Popular</NavLink>
        <NavLink to="/latest" onClick={closeMenu}>Latest</NavLink>
        {user ? (
          <>
            <NavLink to={user.role === 'admin' ? '/admin' : '/dashboard'} onClick={closeMenu}>
              {user.role === 'admin' ? 'Admin Panel' : 'My Dashboard'}
            </NavLink>
            <button className="btn btn--outline btn--sm" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn--ghost btn--sm" onClick={closeMenu}>Login</Link>
            <Link to="/signup" className="btn btn--primary btn--sm" onClick={closeMenu}>Sign Up</Link>
          </>
        )}
        <button
          className="navbar__theme-toggle navbar__theme-toggle--mobile"
          onClick={toggle}
          aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'light' ? <Moon size={18} aria-hidden="true" /> : <Sun size={18} aria-hidden="true" />}
          <span>{theme === 'light' ? 'Dark mode' : 'Light mode'}</span>
        </button>
      </div>
    </nav>
  );
}
