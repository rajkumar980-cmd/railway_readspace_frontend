import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, MotionConfig } from 'framer-motion';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import PageTransition from './components/motion/PageTransition';
import LandingPage from './pages/LandingPage/LandingPage';
import Home from './pages/Home/Home';
import Categories from './pages/Categories/Categories';
import Popular from './pages/Popular/Popular';
import Latest from './pages/Latest/Latest';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import UserDashboard from './pages/UserDashboard/UserDashboard';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';

export default function App() {
  const location = useLocation();

  return (
    /*
      MotionConfig reducedMotion="user" — Framer Motion will automatically
      disable animations for users who prefer reduced motion at OS level.
    */
    <MotionConfig reducedMotion="user">
      <Navbar />
      {/*
        AnimatePresence mode="wait" — old page exits before new page enters.
        Routes keyed on pathname so React swaps components on navigation.
      */}
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          <Route path="/"           element={<PageTransition><LandingPage /></PageTransition>} />
          <Route path="/home"       element={<PageTransition><Home /></PageTransition>} />
          <Route path="/categories" element={<PageTransition><Categories /></PageTransition>} />
          <Route path="/popular"    element={<PageTransition><Popular /></PageTransition>} />
          <Route path="/latest"     element={<PageTransition><Latest /></PageTransition>} />
          <Route path="/login"      element={<PageTransition><Login /></PageTransition>} />
          <Route path="/signup"     element={<PageTransition><Signup /></PageTransition>} />
          <Route path="/dashboard"  element={<PageTransition><UserDashboard /></PageTransition>} />
          <Route path="/admin"      element={<PageTransition><AdminDashboard /></PageTransition>} />
          <Route path="*"           element={
            <PageTransition>
              <main style={{ textAlign: 'center', padding: '6rem 1rem' }}>
                <h2 style={{ fontSize: '3rem' }}>404</h2>
                <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>Page not found.</p>
              </main>
            </PageTransition>
          } />
        </Routes>
      </AnimatePresence>
      <Footer />
    </MotionConfig>
  );
}
