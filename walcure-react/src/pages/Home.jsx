import { Link } from 'react-router-dom'
import Background from '../components/Background'
import Nav from '../components/Nav'

const ArrowIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
  </svg>
)

const tests = [
  {
    theme: 'green',
    href: '/iq-test',
    icon: '🧠',
    tag: 'Cognitive · 12 Questions',
    title: 'Career IQ Assessment',
    desc: 'Measure your logic, pattern recognition, verbal reasoning, and numerical ability — then get matched to high-growth career paths.',
    features: [
      'Internationally standardized scoring',
      'Detailed score breakdown by category',
      'Career path recommendation',
      'Results sent instantly by email',
    ],
  },
  {
    theme: 'purple',
    href: '/mbti-test',
    icon: '🔮',
    tag: 'Personality · 20 Questions',
    title: 'MBTI Personality Test',
    desc: 'Discover your Myers-Briggs personality type across four dimensions: Mind, Energy, Nature, and Tactics.',
    features: [
      'All 16 personality types covered',
      'Strengths & growth areas breakdown',
      'Compatible career environments',
      'Famous people with your type',
    ],
  },
  {
    theme: 'orange',
    href: '/career-test',
    icon: '🎯',
    tag: 'Career · 18 Questions',
    title: 'Career Discovery Test',
    desc: 'Based on the RIASEC model — identify your interests, values, and skills to find the career that fits you best.',
    features: [
      'RIASEC interest profile mapping',
      'Top 3 career field matches',
      'Work environment fit analysis',
      'Specific job title suggestions',
    ],
  },
  {
    theme: 'pink',
    href: '/stress-test',
    icon: '💆',
    tag: 'Wellness · 10 Questions',
    title: 'Stress & Burnout Check',
    desc: 'Evaluate your current stress levels, identify burnout risk factors, and get actionable recovery recommendations.',
    features: [
      'PSS-based stress measurement',
      'Burnout risk level assessment',
      'Personalized coping strategies',
      'Workplace wellbeing score',
    ],
  },
]

function TestCard({ test, index }) {
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', (e.clientX - rect.left) + 'px')
    e.currentTarget.style.setProperty('--my', (e.clientY - rect.top) + 'px')
  }

  return (
    <Link
      className={`test-card theme-${test.theme}`}
      to={test.href}
      onMouseMove={handleMouseMove}
      style={{ animationDelay: `${(index + 1) * 0.1}s` }}
    >
      <div className="card-icon-wrap">{test.icon}</div>
      <div className="card-tag">{test.tag}</div>
      <div className="card-title">{test.title}</div>
      <div className="card-desc">{test.desc}</div>
      <ul className="card-features">
        {test.features.map((f) => <li key={f}>{f}</li>)}
      </ul>
      <span className="card-cta">
        Start Test <ArrowIcon />
      </span>
    </Link>
  )
}

export default function Home() {
  return (
    <>
      <Background o3 />
      <Nav variant="home" />

      {/* HERO */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-badge">
            <div className="badge-dot" />4 Professional Assessments
          </div>
          <h1>
            Unlock your <span className="g1">true potential.</span>{' '}
            <span className="g2">Find your path.</span>
          </h1>
          <p className="hero-sub">
            Scientifically-calibrated assessments that map your cognitive strengths, personality,
            and career potential in under 10 minutes.
          </p>
          <div className="hero-ctas">
            <a href="#assessments" className="nav-cta" style={{ padding: '16px 32px', fontSize: '15px' }}>
              Browse Assessments
            </a>
            <Link to="/spinner" className="btn-lucky">Can't decide? 🎰</Link>
          </div>
          <div className="hero-stats">
            <div>
              <div className="stat-num">4<em>+</em></div>
              <div className="stat-label">Assessment types</div>
            </div>
            <div>
              <div className="stat-num">8<em>min</em></div>
              <div className="stat-label">Average time</div>
            </div>
            <div>
              <div className="stat-num">100<em>%</em></div>
              <div className="stat-label">Free to take</div>
            </div>
          </div>
        </div>
      </section>

      {/* TEST CARDS */}
      <section className="section" id="assessments">
        <div className="section-head">
          <div className="section-label">Choose Your Assessment</div>
          <div className="section-title">What do you want to <span>discover?</span></div>
        </div>
        <div className="tests-grid">
          {tests.map((t, i) => <TestCard key={t.href} test={t} index={i} />)}
        </div>
      </section>

      {/* FEATURES */}
      <section className="section">
        <div className="feature-strip">
          {[
            { icon: '🔒', title: 'Private & Secure', desc: 'Your data is encrypted and never shared. Only you can access your results.' },
            { icon: '⚡', title: 'Instant Results', desc: 'Get your full report emailed to you the moment you complete the assessment.' },
            { icon: '📊', title: 'Science-Backed', desc: 'Questions designed using validated psychometric frameworks and cognitive models.' },
          ].map(({ icon, title, desc }) => (
            <div className="feature-item" key={title}>
              <div className="feature-icon">{icon}</div>
              <div>
                <h4>{title}</h4>
                <p>{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* RESULTS CTA */}
        <div className="results-cta">
          <div>
            <h3>Already took a test?</h3>
            <p>Enter your email to retrieve your full results, score breakdown, and career report from any previous assessment.</p>
          </div>
          <Link className="btn-outline" to="/results">
            Look Up My Results <ArrowIcon />
          </Link>
        </div>
      </section>

      <footer>
        <div className="footer-logo">
          <div className="logo-mark" style={{ width: 30, height: 30, fontSize: 14, borderRadius: 8 }}>W</div>
          <span style={{ fontWeight: 700, fontSize: 15 }}>WALCURE</span>
        </div>
        <p>© 2026 Walcure. All assessments are for informational purposes.</p>
      </footer>

      <style>{`
        .hero { position: relative; z-index: 1; max-width: 1200px; margin: 0 auto; padding: 80px 48px 64px; text-align: center; }
        .hero-inner { max-width: 560px; margin: 0 auto; }
        .hero-badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 18px; background: rgba(99,245,188,0.08); border: 1px solid rgba(99,245,188,0.2); border-radius: 100px; font-size: 12px; font-weight: 500; letter-spacing: .1em; text-transform: uppercase; color: var(--accent); margin-bottom: 36px; }
        .hero h1 { font-family: 'DM Sans', sans-serif; font-size: 52px; font-weight: 700; line-height: 1.2; letter-spacing: -0.01em; margin-bottom: 24px; }
        .hero h1 .g1 { background: linear-gradient(135deg, var(--accent), var(--accent2)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .hero h1 .g2 { color: var(--muted); }
        .hero-sub { font-size: 16px; color: var(--muted); max-width: 500px; margin: 0 auto 32px; line-height: 1.75; font-weight: 300; }
        .hero-ctas { display: flex; justify-content: center; gap: 16px; margin-bottom: 48px; }
        .btn-lucky { display: inline-flex; align-items: center; gap: 10px; padding: 16px 32px; background: var(--surface2); border: 1px solid var(--border); color: var(--text); border-radius: 14px; font-weight: 700; text-decoration: none; transition: all 0.2s; }
        .btn-lucky:hover { border-color: var(--accent2); background: rgba(167,139,250,0.05); transform: translateY(-2px); }
        .hero-stats { display: flex; justify-content: center; gap: 48px; margin-bottom: 48px; }
        .stat-num { font-family: 'DM Sans', sans-serif; font-size: 30px; font-weight: 700; color: var(--text); line-height: 1; }
        .stat-num em { color: var(--accent); font-style: normal; }
        .stat-label { font-size: 13px; color: var(--muted); margin-top: 6px; }

        .section { position: relative; z-index: 1; max-width: 1200px; margin: 0 auto; padding: 0 48px 80px; }
        .section-head { margin-bottom: 48px; }
        .section-label { font-size: 11px; font-weight: 600; letter-spacing: .15em; text-transform: uppercase; color: var(--accent); margin-bottom: 12px; }
        .section-title { font-family: 'DM Sans', sans-serif; font-size: 32px; font-weight: 700; letter-spacing: -0.01em; line-height: 1.2; }
        .section-title span { color: var(--muted); }

        .tests-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 20px; }
        .test-card { position: relative; background: var(--surface); border: 1px solid var(--border); border-radius: 24px; padding: 36px; overflow: hidden; cursor: pointer; transition: all .3s cubic-bezier(.4,0,.2,1); text-decoration: none; display: block; animation: fadeUp .6s ease both; }
        .test-card::before { content:''; position: absolute; inset: 0; opacity: 0; transition: opacity .3s; background: radial-gradient(600px at var(--mx,50%) var(--my,50%), rgba(99,245,188,.06), transparent 60%); }
        .test-card:hover { border-color: rgba(99,245,188,.25); transform: translateY(-4px); box-shadow: 0 24px 60px rgba(0,0,0,.4); }
        .test-card:hover::before { opacity: 1; }
        .card-icon-wrap { width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 26px; margin-bottom: 24px; }
        .card-tag { display: inline-block; padding: 4px 12px; border-radius: 100px; font-size: 11px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; margin-bottom: 16px; }
        .card-title { font-family: 'DM Sans', sans-serif; font-size: 18px; font-weight: 700; letter-spacing: -0.01em; margin-bottom: 12px; color: var(--text); }
        .card-desc { font-size: 14px; color: var(--muted); line-height: 1.65; margin-bottom: 28px; }
        .card-features { list-style: none; margin-bottom: 32px; }
        .card-features li { font-size: 13px; color: var(--muted); padding: 6px 0; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid var(--border); }
        .card-features li:last-child { border: none; }
        .card-features li::before { content:''; width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
        .card-cta { display: inline-flex; align-items: center; gap: 8px; padding: 14px 24px; border-radius: 12px; font-weight: 700; font-size: 14px; transition: all .2s; text-decoration: none; }
        .card-cta svg { transition: transform .2s; }
        .card-cta:hover svg { transform: translateX(4px); }

        .theme-green .card-icon-wrap { background: rgba(99,245,188,.1); }
        .theme-green .card-tag { background: rgba(99,245,188,.1); color: var(--accent); }
        .theme-green .card-features li::before { background: var(--accent); }
        .theme-green .card-cta { background: var(--accent); color: #000; }
        .theme-green .card-cta:hover { box-shadow: 0 12px 40px rgba(99,245,188,.3); }

        .theme-purple .card-icon-wrap { background: rgba(167,139,250,.1); }
        .theme-purple .card-tag { background: rgba(167,139,250,.1); color: var(--accent2); }
        .theme-purple .card-features li::before { background: var(--accent2); }
        .theme-purple .card-cta { background: var(--accent2); color: #fff; }
        .theme-purple .card-cta:hover { box-shadow: 0 12px 40px rgba(167,139,250,.3); }

        .theme-orange .card-icon-wrap { background: rgba(245,159,99,.1); }
        .theme-orange .card-tag { background: rgba(245,159,99,.1); color: var(--accent3); }
        .theme-orange .card-features li::before { background: var(--accent3); }
        .theme-orange .card-cta { background: var(--accent3); color: #000; }
        .theme-orange .card-cta:hover { box-shadow: 0 12px 40px rgba(245,159,99,.3); }

        .theme-pink .card-icon-wrap { background: rgba(245,99,160,.1); }
        .theme-pink .card-tag { background: rgba(245,99,160,.1); color: var(--accent4); }
        .theme-pink .card-features li::before { background: var(--accent4); }
        .theme-pink .card-cta { background: var(--accent4); color: #fff; }
        .theme-pink .card-cta:hover { box-shadow: 0 12px 40px rgba(245,99,160,.3); }

        .feature-strip { display: grid; grid-template-columns: repeat(3,1fr); gap: 1px; background: var(--border); border: 1px solid var(--border); border-radius: 20px; overflow: hidden; margin-bottom: 80px; }
        .feature-item { background: var(--surface); padding: 32px 28px; display: flex; align-items: flex-start; gap: 16px; }
        .feature-icon { font-size: 24px; flex-shrink: 0; margin-top: 2px; }
        .feature-item h4 { font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 700; margin-bottom: 6px; }
        .feature-item p { font-size: 13px; color: var(--muted); line-height: 1.55; }

        .results-cta { background: var(--surface); border: 1px solid var(--border); border-radius: 24px; padding: 56px; display: flex; align-items: center; justify-content: space-between; gap: 32px; margin-bottom: 80px; }
        .results-cta h3 { font-family: 'DM Sans', sans-serif; font-size: 28px; font-weight: 700; letter-spacing: -0.01em; margin-bottom: 12px; }
        .results-cta p { font-size: 15px; color: var(--muted); line-height: 1.6; max-width: 480px; }
        .btn-outline { display: inline-flex; align-items: center; gap: 10px; padding: 16px 32px; border: 1.5px solid var(--accent); color: var(--accent); border-radius: 14px; font-weight: 700; font-size: 15px; text-decoration: none; transition: all .2s; white-space: nowrap; }
        .btn-outline:hover { background: var(--accent); color: #000; box-shadow: 0 12px 40px rgba(99,245,188,.25); }

        .footer-logo { display: flex; align-items: center; gap: 10px; }

        @media(max-width:768px) {
          .tests-grid { grid-template-columns: 1fr; }
          .hero-stats { gap: 32px; }
          .hero-ctas { flex-direction: column; align-items: center; }
          .results-cta { flex-direction: column; text-align: center; padding: 36px 24px; }
          .feature-strip { grid-template-columns: 1fr; }
        }
        @media(max-width:540px) {
          .hero h1 { font-size: 40px; }
          .section, .hero { padding-left: 20px; padding-right: 20px; }
        }
      `}</style>
    </>
  )
}
