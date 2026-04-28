import { useNavigate } from 'react-router-dom';
import { Search, FolderOpen, Eye, ArrowDownToLine, Moon, Smartphone, ArrowRight } from 'lucide-react';
import ScrollReveal from '../../components/motion/ScrollReveal';
import './LandingPage.css';

const FEATURES = [
  { icon: <Search size={22} strokeWidth={1.75} aria-hidden="true" />, title: 'Smart Search', desc: 'Find resources instantly by title, author, or topic with full-text search and tag filtering.' },
  { icon: <FolderOpen size={22} strokeWidth={1.75} aria-hidden="true" />, title: 'Organised Categories', desc: 'Browse textbooks, research papers, study guides, and tutorials — neatly organised and filterable.' },
  { icon: <Eye size={22} strokeWidth={1.75} aria-hidden="true" />, title: 'Preview Before Download', desc: 'Review metadata, ratings, and descriptions in a dedicated modal before committing to a download.' },
  { icon: <ArrowDownToLine size={22} strokeWidth={1.75} aria-hidden="true" />, title: 'Instant Downloads', desc: 'Download any resource immediately — no paywalls, no subscriptions, no barriers whatsoever.' },
  { icon: <Moon size={22} strokeWidth={1.75} aria-hidden="true" />, title: 'Dark Mode Ready', desc: 'Study comfortably day or night with a carefully crafted theme that respects your system preference.' },
  { icon: <Smartphone size={22} strokeWidth={1.75} aria-hidden="true" />, title: 'Mobile Responsive', desc: 'Fully adaptive on all screen sizes — phones, tablets, and desktops — for learning anywhere.' },
];

const TESTIMONIALS = [
  {
    initial: 'A',
    quote: 'ReadSpace saved my final year project. I found everything I needed — from algorithms textbooks to the original Transformer paper — all in one place.',
    name: 'Ananya Sharma',
    role: 'Final Year CS Student',
  },
  {
    initial: 'P',
    quote: 'As a faculty member, I recommend ReadSpace to all my students. The quality of curated resources is exceptional and the interface is incredibly intuitive.',
    name: 'Prof. Priya Nair',
    role: 'Associate Professor, AIML Dept.',
  },
  {
    initial: 'R',
    quote: "I've downloaded over 40 resources and every one has been high quality. The dark mode and mobile experience are a massive bonus for late-night study sessions.",
    name: 'Rahul Verma',
    role: 'Research Scholar, Data Science',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <main className="landing">

      {/* ── Hero ── */}
      <section className="landing__hero landing__hero--full">
        <div className="landing__hero-shapes" aria-hidden>
          <span className="lh-shape lh-shape--1" />
          <span className="lh-shape lh-shape--2" />
          <span className="lh-shape lh-shape--3" />
        </div>

        <div className="container landing__hero-content">
          <div className="landing__hero-badge">
            Open Educational Resources
          </div>

          <h1 className="landing__hero-title">
            Access Educational Resources{' '}
            <span className="landing__hero-highlight">Freely</span>
          </h1>

          <p className="landing__hero-subtitle">
            ReadSpace is a professional open-access hub for students, researchers
            and educators. Browse curated textbooks, research papers, study guides and
            tutorials — all free, all in one place.
          </p>

          <div className="landing__hero-actions">
            <button
              className="btn btn--primary btn--lg landing__cta-primary"
              onClick={() => navigate('/home')}
            >
              Browse Library
            </button>
            <button
              className="btn btn--outline-white btn--lg"
              onClick={() => navigate('/signup')}
            >
              Create Free Account
            </button>
          </div>

          <div className="landing__hero-stats">
            <div className="landing__stat">
              <strong>12+</strong>
              <span>Curated Resources</span>
            </div>
            <div className="landing__stat-divider" aria-hidden />
            <div className="landing__stat">
              <strong>4</strong>
              <span>Subject Categories</span>
            </div>
            <div className="landing__stat-divider" aria-hidden />
            <div className="landing__stat">
              <strong>1M+</strong>
              <span>Total Downloads</span>
            </div>
            <div className="landing__stat-divider" aria-hidden />
            <div className="landing__stat">
              <strong>100%</strong>
              <span>Free Forever</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Why ReadSpace (Features) ── */}
      <section className="landing__features">
        <div className="container">
          <ScrollReveal variant="fade-up">
            <div className="landing__section-header">
              <h2 className="landing__section-title">Why ReadSpace?</h2>
              <p className="landing__section-sub">
                Built for students, researchers, and educators who believe knowledge
                should be accessible to everyone.
              </p>
            </div>
          </ScrollReveal>

          <div className="landing__features-grid">
            {FEATURES.map((f, i) => (
              <ScrollReveal key={f.title} variant="fade-up" delay={i * 60}>
                <div className="landing__feature-card">
                  <div className="landing__feature-icon">{f.icon}</div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="landing__how">
        <div className="container">
          <ScrollReveal variant="fade-up">
            <div className="landing__section-header">
              <h2 className="landing__section-title">How It Works</h2>
              <p className="landing__section-sub">
                Get started in minutes with our simple three-step process.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={80}>
            <div className="landing__steps">
              <div className="landing__step">
                <div className="landing__step-number">1</div>
                <h3>Search or Browse</h3>
                <p>Use the search bar or navigate by category to discover resources relevant to your field.</p>
              </div>
              <span className="landing__step-arrow" aria-hidden><ArrowRight size={20} strokeWidth={1.75} /></span>
              <div className="landing__step">
                <div className="landing__step-number">2</div>
                <h3>Preview &amp; Evaluate</h3>
                <p>Open the preview modal to review details, ratings, and descriptions before deciding.</p>
              </div>
              <span className="landing__step-arrow" aria-hidden><ArrowRight size={20} strokeWidth={1.75} /></span>
              <div className="landing__step">
                <div className="landing__step-number">3</div>
                <h3>Download Instantly</h3>
                <p>Click download and get your resource immediately — no barriers, no waiting.</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="landing__testimonials">
        <div className="container">
          <ScrollReveal variant="fade-up">
            <div className="landing__section-header">
              <h2 className="landing__section-title">What Our Users Say</h2>
              <p className="landing__section-sub">
                Trusted by students and researchers at institutions worldwide.
              </p>
            </div>
          </ScrollReveal>

          <div className="landing__testimonials-grid">
            {TESTIMONIALS.map((t, i) => (
              <ScrollReveal key={t.name} variant="fade-up" delay={i * 80}>
                <div className="landing__testimonial-card">
                  <div className="landing__testimonial-quote">"</div>
                  <p className="landing__testimonial-text">{t.quote}</p>
                  <div className="landing__testimonial-author">
                    <div className="landing__testimonial-avatar">{t.initial}</div>
                    <div>
                      <p className="landing__testimonial-name">{t.name}</p>
                      <p className="landing__testimonial-role">{t.role}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="landing__cta-banner">
        <div className="container">
          <ScrollReveal variant="fade-up">
            <div className="landing__cta-banner-inner">
              <div>
                <h2>Ready to start learning?</h2>
                <p>
                  Join thousands of students and researchers accessing quality
                  educational resources for free.
                </p>
              </div>
              <div className="landing__cta-banner-actions">
                <button
                  className="btn btn--primary btn--lg"
                  onClick={() => navigate('/home')}
                >
                  Browse Library
                </button>
                <button
                  className="btn btn--outline-white btn--lg"
                  onClick={() => navigate('/signup')}
                >
                  Create Free Account
                </button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

    </main>
  );
}
