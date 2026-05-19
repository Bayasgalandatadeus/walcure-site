import { useState } from 'react'
import { Link } from 'react-router-dom'
import Background from '../components/Background'
import Nav from '../components/Nav'
import { supabase } from '../lib/supabase'
import emailjs from '@emailjs/browser'

emailjs.init('tuzgf0BVh8DMcd0l1')

const QUESTIONS = [
  { type: 'R', cat: '🔧 Realistic', q: 'Build or repair things with your hands — furniture, cars, electronics' },
  { type: 'R', cat: '🔧 Realistic', q: 'Work outdoors in nature, farming, landscaping, or construction' },
  { type: 'R', cat: '🔧 Realistic', q: 'Operate tools, machines, or technical equipment' },
  { type: 'I', cat: '🔬 Investigative', q: 'Conduct scientific research or experiments in a lab' },
  { type: 'I', cat: '🔬 Investigative', q: 'Analyze data and find patterns in complex information' },
  { type: 'I', cat: '🔬 Investigative', q: 'Solve abstract mathematical or logic problems' },
  { type: 'A', cat: '🎨 Artistic', q: 'Create original art, music, writing, or design' },
  { type: 'A', cat: '🎨 Artistic', q: 'Express ideas through creative formats like film, theater, or photography' },
  { type: 'A', cat: '🎨 Artistic', q: 'Work in an environment with creative freedom and self-expression' },
  { type: 'S', cat: '🤝 Social', q: 'Teach, mentor, or coach people toward their goals' },
  { type: 'S', cat: '🤝 Social', q: 'Counsel or support people through personal challenges' },
  { type: 'S', cat: '🤝 Social', q: 'Organize community events or volunteer programs' },
  { type: 'E', cat: '💼 Enterprising', q: 'Lead a team and drive projects to completion' },
  { type: 'E', cat: '💼 Enterprising', q: 'Negotiate deals, sell ideas, or persuade others' },
  { type: 'E', cat: '💼 Enterprising', q: 'Start your own business or take calculated risks' },
  { type: 'C', cat: '📊 Conventional', q: 'Organize files, data, or systems with precision' },
  { type: 'C', cat: '📊 Conventional', q: 'Follow clear procedures and established rules' },
  { type: 'C', cat: '📊 Conventional', q: 'Work with accounting, budgets, or financial records' },
]

const PROFILES = {
  R: { label: 'Realistic', emoji: '🔧' }, I: { label: 'Investigative', emoji: '🔬' },
  A: { label: 'Artistic', emoji: '🎨' }, S: { label: 'Social', emoji: '🤝' },
  E: { label: 'Enterprising', emoji: '💼' }, C: { label: 'Conventional', emoji: '📊' },
}

const CAREER_MATCHES = {
  RIA: ['Film Director', 'Industrial Designer', 'Landscape Architect'], RIS: ['Surgeon', 'Physical Therapist', 'Veterinarian'],
  RIC: ['Civil Engineer', 'Data Engineer', 'Systems Analyst'], IAR: ['Research Scientist', 'Biomedical Engineer', 'Astronomer'],
  IAS: ['Psychologist', 'UX Researcher', 'Anthropologist'], IAC: ['Financial Analyst', 'Actuary', 'Epidemiologist'],
  AIR: ['Graphic Designer', 'Architect', 'Game Designer'], AIS: ['Teacher', 'Art Therapist', 'Journalist'],
  AIC: ['Web Designer', 'Technical Writer', 'Editor'], SAI: ['School Counselor', 'Social Worker', 'HR Manager'],
  SAE: ['PR Manager', 'Event Planner', 'Brand Strategist'], SAC: ['Healthcare Admin', 'Non-profit Manager', 'Recruiter'],
  EAS: ['Marketing Director', 'Entrepreneur', 'Brand Manager'], EAR: ['Real Estate Developer', 'Construction Manager', 'Logistics Manager'],
  EAC: ['Financial Advisor', 'Business Consultant', 'Operations Manager'], CIE: ['Accountant', 'Data Scientist', 'Financial Planner'],
  CIS: ['Medical Records Analyst', 'Library Scientist', 'Office Manager'], CIR: ['Quality Engineer', 'Technical Inspector', 'IT Systems Manager'],
}

const DESCRIPTIONS = {
  R: 'You are hands-on, practical, and enjoy working with tools, machines, or the outdoors. You solve problems through direct action and physical engagement.',
  I: 'You are curious, analytical, and driven by a need to understand how things work. You thrive in research, data, and scientific thinking.',
  A: 'You are creative, expressive, and value originality. You thrive when you can bring imagination to your work and communicate through art or design.',
  S: 'You are empathetic, collaborative, and find meaning in helping others grow. You excel in teaching, counseling, and community-building roles.',
  E: 'You are ambitious, persuasive, and energized by leadership challenges. You thrive in business, sales, and high-impact decision-making environments.',
  C: 'You are organized, detail-oriented, and reliable. You excel when working within structured systems that value accuracy and consistency.',
}

const ENV_DESCS = {
  R: 'Workshop, field sites, outdoor environments, labs with equipment',
  I: 'Research institutions, tech companies, universities, think tanks',
  A: 'Studios, agencies, startups, media companies, creative collectives',
  S: 'Schools, hospitals, non-profits, community organizations, HR departments',
  E: 'Boardrooms, startups, consulting firms, sales floors, government',
  C: 'Corporate offices, financial institutions, government agencies, logistics firms',
}

function calcResults(answers) {
  const scores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }
  QUESTIONS.forEach((q, i) => { scores[q.type] += (answers[i] || 3) })
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])
  return sorted.slice(0, 3).map(x => x[0])
}

export default function CareerTest() {
  const [screen, setScreen] = useState('intro')
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState([])
  const [top3, setTop3] = useState([])
  const [loading, setLoading] = useState(false)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')

  const q = QUESTIONS[currentIdx]
  const finalCode = top3.join('')

  const pickAnswer = (val) => {
    const newAnswers = [...answers]; newAnswers[currentIdx] = val; setAnswers(newAnswers)
    if (currentIdx + 1 < QUESTIONS.length) { setCurrentIdx(i => i + 1) }
    else { setTop3(calcResults(newAnswers)); setScreen('lead') }
  }

  const goBack = () => { if (currentIdx > 0) setCurrentIdx(i => i - 1) }

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    const matches = CAREER_MATCHES[finalCode] || ['Strategic Consultant']
    try { await supabase.from('career_tests').insert([{ name: userName, email: userEmail, iq_score: null, career_path: matches[0], test_type: 'career' }]) } catch (_) {}
    try { await emailjs.send('service_qq96gby', 'template_f3jm56x', { name: userName, email: userEmail, iq_score: finalCode, career_path: matches[0] }) } catch (_) {}
    setLoading(false); setScreen('result')
  }

  const matches = CAREER_MATCHES[finalCode] || ['Strategic Consultant', 'Business Analyst', 'Project Manager']

  return (
    <>
      <Background />
      <Nav variant="test" accentGradient="linear-gradient(135deg,#f59e63,#f563a0)" />
      <style>{`:root { --accent: #f59e63; --accent2: #f563a0; }`}</style>

      <main className="quiz-main">
        {/* INTRO */}
        {screen === 'intro' && (
          <div className="screen">
            <div className="badge" style={{ background: 'rgba(245,159,99,0.08)', borderColor: 'rgba(245,159,99,0.2)', color: '#f59e63' }}>
              <div className="badge-dot" style={{ background: '#f59e63' }} />Career · RIASEC · 18 Questions
            </div>
            <h1 style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 'clamp(40px,7vw,72px)', fontWeight: 800, letterSpacing: '-.04em', lineHeight: 1, marginBottom: 24 }}>
              Find your<br /><span style={{ background: 'linear-gradient(135deg,#f59e63,#f563a0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>ideal career.</span>
            </h1>
            <p style={{ fontSize: 17, color: 'var(--muted)', lineHeight: 1.7, maxWidth: 520, marginBottom: 32, fontWeight: 300 }}>
              The RIASEC model identifies six interest types that predict career satisfaction. Discover which combination fits you best.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 36 }}>
              {[['🔧','Realistic','#f59e63','rgba(245,159,99,.1)'],['🔬','Investigative','#63f5bc','rgba(99,245,188,.1)'],['🎨','Artistic','#a78bfa','rgba(167,139,250,.1)'],['🤝','Social','#f563a0','rgba(245,99,160,.1)'],['💼','Enterprising','#f5f563','rgba(245,245,99,.1)'],['📊','Conventional','#63bcf5','rgba(99,188,245,.1)']].map(([e,l,c,bg]) => (
                <span key={l} style={{ padding: '8px 16px', borderRadius: 12, fontSize: 13, fontWeight: 600, background: bg, color: c }}>{e} {l}</span>
              ))}
            </div>
            <button className="btn-primary" style={{ background: '#f59e63', color: '#000' }} onClick={() => setScreen('quiz')}>
              Start Career Test
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </button>
          </div>
        )}

        {/* QUIZ */}
        {screen === 'quiz' && (
          <div className="screen">
            <div className="quiz-header">
              <button className={`back-btn${currentIdx === 0 ? ' invisible' : ''}`} onClick={goBack}>
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                Back
              </button>
              <div>
                <div className="q-label" style={{ color: '#f59e63' }}>Question {currentIdx + 1} / {QUESTIONS.length}</div>
                <div className="progress-track"><div className="progress-fill" style={{ width: `${(currentIdx + 1) / QUESTIONS.length * 100}%`, background: 'linear-gradient(90deg,#f59e63,#f563a0)' }} /></div>
              </div>
              <div style={{ width: 80 }} />
            </div>
            <div className="q-cat">{q.cat}</div>
            <h2 className="q-text">{q.q}</h2>
            <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 24, lineHeight: 1.6 }}>Rate how much this activity interests you:</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>Not at all</span>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>Very much</span>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
              {[1,2,3,4,5].map(v => (
                <button key={v} onClick={() => pickAnswer(v)}
                  style={{ flex: 1, padding: '16px 6px', borderRadius: 12, border: `1.5px solid ${answers[currentIdx] === v ? '#f59e63' : 'var(--border)'}`, background: answers[currentIdx] === v ? 'rgba(245,159,99,.1)' : 'var(--surface)', cursor: 'pointer', transition: 'all .2s', fontSize: 12, fontWeight: 700, color: answers[currentIdx] === v ? '#f59e63' : 'var(--muted)', fontFamily: "'DM Sans',sans-serif" }}>{v}</button>
              ))}
            </div>
          </div>
        )}

        {/* LEAD */}
        {screen === 'lead' && (
          <div className="screen" style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
            <div className="badge" style={{ background: 'rgba(245,159,99,0.08)', borderColor: 'rgba(245,159,99,0.2)', color: '#f59e63' }}>
              <div className="badge-dot" style={{ background: '#f59e63' }} />Profile Ready
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
              {top3.map((t, i) => <span key={t} style={{ padding: '8px 20px', borderRadius: 100, fontWeight: 700, fontSize: 18 - i * 2, background: `rgba(245,159,99,${0.15 - i * .04})`, color: '#f59e63' }}>{PROFILES[t].emoji} {PROFILES[t].label}</span>)}
            </div>
            <h2 className="screen-title">Your career code is ready.</h2>
            <p className="screen-sub">Enter your details to receive your full RIASEC profile, top career matches, and personalized roadmap.</p>
            <form onSubmit={handleSubmit}>
              <input className="form-input" type="text" placeholder="Your Full Name" required value={userName} onChange={e => setUserName(e.target.value)} />
              <input className="form-input" type="email" placeholder="Email Address" required value={userEmail} onChange={e => setUserEmail(e.target.value)} />
              <button className="submit-btn" type="submit" disabled={loading} style={{ background: '#f59e63', color: '#000' }}>{loading ? 'Processing...' : 'Unlock My Career Report →'}</button>
            </form>
          </div>
        )}

        {/* RESULT */}
        {screen === 'result' && (
          <div className="screen" style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 'clamp(56px,10vw,96px)', fontWeight: 800, letterSpacing: '-.02em', marginBottom: 8, background: 'linear-gradient(135deg,#f59e63,#f563a0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: 1 }}>{finalCode}</div>
            <div style={{ fontSize: 18, color: 'var(--muted)', marginBottom: 32 }}>{top3.map(t => PROFILES[t].label).join(' · ')} Type</div>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, marginBottom: 20, textAlign: 'left' }}>
              <h3 style={{ fontWeight: 700, marginBottom: 12 }}>Your Career Personality</h3>
              <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7 }}>{top3.map(t => DESCRIPTIONS[t]).join(' ')}</p>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--muted)', textAlign: 'left', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '.08em' }}>Top Career Matches</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16, textAlign: 'left' }}>
              {matches.map((c, i) => (
                <div key={c} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 20 }}>
                  <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em', color: '#f59e63', fontWeight: 600, marginBottom: 6 }}>#{i + 1} Match</div>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>{c}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.55 }}>Based on your {finalCode} profile.</div>
                </div>
              ))}
            </div>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, marginBottom: 16, textAlign: 'left' }}>
              <h3 style={{ fontWeight: 700, marginBottom: 12 }}>Ideal Work Environment</h3>
              <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7 }}>{top3.map(t => ENV_DESCS[t]).join(' ')}</p>
            </div>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12, marginTop: 8 }}>Your full report has been sent to your email.</p>
            <Link className="btn-ghost" to="/">Explore Other Tests</Link>
          </div>
        )}
      </main>
    </>
  )
}
