import { Link } from 'react-router-dom';
import BrandLogo from '../brand/BrandLogo';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <BrandLogo size="sm" variant="sidebar" />
          <p>An open educational resource hub for students, researchers and educators.</p>
        </div>

        <div className="footer__col">
          <h4>Resources</h4>
          <Link to="/categories">Textbooks</Link>
          <Link to="/categories">Research Papers</Link>
          <Link to="/categories">Study Guides</Link>
          <Link to="/categories">Tutorials</Link>
        </div>

        <div className="footer__col">
          <h4>Platform</h4>
          <Link to="/">Home</Link>
          <Link to="/popular">Popular</Link>
          <Link to="/latest">Latest</Link>
          <Link to="/dashboard">My Dashboard</Link>
        </div>

        <div className="footer__col">
          <h4>Account</h4>
          <Link to="/login">Login</Link>
          <Link to="/signup">Sign Up</Link>
          <Link to="/admin">Admin Panel</Link>
        </div>
      </div>

      <div className="footer__bottom">
        <span>© {new Date().getFullYear()} ReadSpace. All rights reserved.</span>
        <span>Built with React + Vite</span>
      </div>
    </footer>
  );
}
