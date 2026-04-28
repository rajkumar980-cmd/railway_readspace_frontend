import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';

/**
 * MainLayout – shared shell (Navbar + Outlet + Footer).
 * Wrap routes with this to avoid repeating Navbar/Footer per page.
 */
export default function MainLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}
