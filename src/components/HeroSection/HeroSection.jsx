import { useNavigate } from 'react-router-dom';
import { BookMarked, Library, TrendingUp } from 'lucide-react';
import './HeroSection.css';

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="hero">
      <div className="hero__bg-shape hero__bg-shape--1" aria-hidden />
      <div className="hero__bg-shape hero__bg-shape--2" aria-hidden />

      <div className="container hero__content">
        <div className="hero__badge"><BookMarked size={14} aria-hidden="true" style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} />Open Educational Resources</div>

        <h1 className="hero__title">
          Knowledge is <span className="hero__title-accent">Free</span> for Everyone
        </h1>

        <p className="hero__subtitle">
          Browse thousands of textbooks, research papers, study guides, and
          tutorials — all curated, previewed and available for instant download.
        </p>

        <div className="hero__actions">
          <button
            className="btn btn--primary btn--lg"
            onClick={() => navigate('/categories')}
          >
            <Library size={17} aria-hidden="true" /> Browse Library
          </button>
          <button
            className="btn btn--outline btn--lg"
            onClick={() => navigate('/popular')}
          >
            <TrendingUp size={17} aria-hidden="true" /> Popular Resources
          </button>
        </div>

        <div className="hero__stats">
          <div className="hero__stat">
            <strong>12+</strong>
            <span>Resources</span>
          </div>
          <div className="hero__stat">
            <strong>4</strong>
            <span>Categories</span>
          </div>
          <div className="hero__stat">
            <strong>1M+</strong>
            <span>Downloads</span>
          </div>
          <div className="hero__stat">
            <strong>Free</strong>
            <span>Always</span>
          </div>
        </div>
      </div>
    </section>
  );
}
