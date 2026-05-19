import { useState } from 'react'
import { Link } from 'react-router-dom'
import Background from '../components/Background'
import Nav from '../components/Nav'
import { supabase } from '../lib/supabase'
import emailjs from '@emailjs/browser'

emailjs.init('tuzgf0BVh8DMcd0l1')

const QUESTIONS = [
  { cat: '💆 Stress', q: 'Been upset because of something that happened unexpectedly', reversed: false },
  { cat: '💆 Control', q: 'Felt that you were unable to control the important things in your life', reversed: false },
  { cat: '💆 Overwhelm', q: 'Felt nervous and stressed', reversed: false },
  { cat: '💪 Coping', q: 'Felt confident about your ability to handle your personal problems', reversed: true },
  { cat: '💪 Coping', q: 'Felt that things were going your way', reversed: true },
  { cat: '💆 Overwhelm', q: 'Found that you could not cope with all the things that you had to do', reversed: false },
  { cat: '💪 Coping', q: 'Been able to control irritations in your life', reversed: true },
  { cat: '💆 Control', q: 'Felt that you were on top of things', reversed: true },
  { cat: '💆 Stress', q: 'Been angered because of things that were outside of your control', reversed: false },
  { cat: '💆 Overwhelm', q: 'Felt difficulties were piling up so high that you could not overcome them', reversed: false },
]

const FREQ_LABELS = ['Never', 'Almost Never', 'Sometimes', 'Fairly Often', 'Very Often']

const ALL_TIPS = [
  'Schedule 10-minute daily decompression blocks — no screens, no tasks',
  'Identify your top 3 stressors and address one per week systematically',
  'Practice box breathing (4-4-4-4) during high-pressure moments',
  'Set firm boundaries around work hours, especially in the evenings',
  'Add 20 minutes of moderate exercise daily — it directly lowers cortisol',
  'Connect with someone you trust weekly — social support is a stress buffer',
  'Delegate or eliminate one low-value task from your week',
  'Improve sleep hygiene: consistent schedule, dark room, no phone 30 min before bed',
]

function calcStress(answers) {
  let total = 0
  QUESTIONS.forEach((q, i) => { total += q.reversed ? (4 - (answers[i] ?? 0)) : (answers[i] ?? 0) })
  const pct = Math.round((total / 40) * 100)
  const level = total <= 13 ? 'Low Stress' : total <= 26 ? 'Moderate Stress' : 'High Stress'
  const color = total <= 13 ? '#63f5bc' : total <= 26 ? '#f59e63' : '#f563a0'
  return { total, pct, level, color }
}

export default function StressTest() {
  const [screen, setScreen] = useState('intro')
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState([])
  const [stressResult, setStressResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')

  const q = QUESTIONS[currentIdx]

  const pickAnswer = (val) => {
    const newAnswers = [...answers]; newAnswers[currentIdx] = val; setAnswers(newAnswers)
    if (currentIdx + 1 < QUESTIONS.length) { setCurrentIdx(i => i + 1) }
    else { setStressResult(calcStress(newAnswers)); setScreen('lead') }
  }

  const goBack = () => { if (currentIdx > 0) setCurrentIdx(i => i - 1) }

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    const r = stressResult
    try { await supabase.from('career_tests').insert([{ name: userName, email: userEmail, iq_score: r?.pct, career_path: r?.level, test_type: 'stress' }]) } catch (_) {}
    try { await emailjs.send('service_qq96gby', 'template_f3jm56x', { name: userName, email: userEmail, iq_score: r?.pct + '% stress', career_path: r?.level }) } catch (_) {}
    setLoading(false); setScreen('result')
  }

  const r = stressResult
  const isHigh = r?.total > 26, isMid = r?.total > 13

  const stressLoad = answers.filter((_, i) => !QUESTIONS[i].reversed).reduce((a, b) => a + (b ?? 0), 0)
  const copingVal = answers.filter((_, i) => QUESTIONS[i].reversed).reduce((a, b) => a + (4 - (b ?? 0)), 0)
  const stressPct = Math.round((stressLoad / (7 * 4)) * 100)
  const copingPct = Math.round((copingVal / (3 * 4)) * 100)

  const tipCount = isHigh ? 6 : isMid ? 4 : 3
  const overviewMap = {
    'Low Stress': { title: "You're doing well 💚", body: "Your stress levels are within a healthy range. You appear to have good coping mechanisms and feel generally in control of your life. Keep maintaining your current routines and habits — they're clearly working." },
    'Moderate Stress': { title: 'Manageable, but worth watching ⚠️', body: "Your stress is at a moderate level — common in busy professional and personal lives. You're coping, but without attention, this can escalate to burnout. Now is a good time to build in more recovery habits." },
    'High Stress': { title: 'Action recommended 🔴', body: 'Your stress levels are elevated and may be affecting your wellbeing, productivity, and relationships. This pattern, if sustained, significantly increases burnout risk. Prioritizing recovery is essential.' },
  }

  return (
    <>
      <Background />
      <Nav variant="test" accentGradient="linear-gradient(135deg,#f563a0,#f59e63)" />
      <style>{`:root { --accent: #f563a0; --accent2: #f59e63; }`}</style>

      <main className="quiz-main">
        {/* INTRO */}
        {screen === 'intro' && (
          <div className="screen">
            <div className="badge" style={{ background: 'rgba(245,99,160,0.08)', borderColor: 'rgba(245,99,160,0.2)', color: '#f563a0' }}>
              <div className="badge-dot" style={{ background: '#f563a0' }} />Wellness · 10 Questions · ~3 min
            </div>
            <h1 style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 'clamp(40px,7vw,72px)', fontWeight: 800, letterSpacing: '-.04em', lineHeight: 1, marginBottom: 24 }}>
              How stressed<br /><span style={{ background: 'linear-gradient(135deg,#f563a0,#f59e63)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>are you really?</span>
            </h1>
            <p style={{ fontSize: 17, color: 'var(--muted)', lineHeight: 1.7, maxWidth: 520, marginBottom: 32, fontWeight: 300 }}>
              Based on the validated Perceived Stress Scale (PSS-10), this assessment measures your current stress load and burnout risk — then gives you actionable steps to recover.
            </p>
            <div style={{ background: 'rgba(245,99,160,.07)', border: '1px solid rgba(245,99,160,.15)', borderRadius: 14, padding: '16px 20px', fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 36 }}>
              <strong style={{ color: '#f563a0' }}>Note:</strong> This is a wellness tool for self-awareness, not a medical diagnosis. If you are experiencing a mental health crisis, please contact a qualified healthcare professional.
            </div>
            <button className="btn-primary" style={{ background: '#f563a0', color: '#fff' }} onClick={() => setScreen('quiz')}>
              Start Stress Check
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
                <div className="q-label" style={{ color: '#f563a0' }}>Question {currentIdx + 1} / {QUESTIONS.length}</div>
                <div className="progress-track"><div className="progress-fill" style={{ width: `${(currentIdx + 1) / QUESTIONS.length * 100}%`, background: 'linear-gradient(90deg,#f563a0,#f59e63)' }} /></div>
              </div>
              <div style={{ width: 80 }} />
            </div>
            <div className="q-cat">{q.cat}</div>
            <h2 className="q-text">{q.q}?</h2>
            <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 24 }}>In the last month, how often have you felt this way?</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8 }}>
              {FREQ_LABELS.map((label, i) => (
                <button key={i} onClick={() => pickAnswer(i)}
                  style={{ padding: '14px 6px', borderRadius: 12, border: `1.5px solid ${answers[currentIdx] === i ? '#f563a0' : 'var(--border)'}`, background: answers[currentIdx] === i ? 'rgba(245,99,160,.1)' : 'var(--surface)', cursor: 'pointer', transition: 'all .2s', fontSize: 11, fontWeight: 500, color: answers[currentIdx] === i ? '#f563a0' : 'var(--muted)', textAlign: 'center', lineHeight: 1.4, fontFamily: "'DM Sans',sans-serif" }}>{label}</button>
              ))}
            </div>
          </div>
        )}

        {/* LEAD */}
        {screen === 'lead' && r && (
          <div className="screen" style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
            <div className="badge" style={{ background: 'rgba(245,99,160,0.08)', borderColor: 'rgba(245,99,160,0.2)', color: '#f563a0' }}>
              <div className="badge-dot" style={{ background: '#f563a0' }} />Assessment Complete
            </div>
            <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 56, fontWeight: 800, lineHeight: 1, marginBottom: 8, color: r.color }}>{r.pct}%</div>
            <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 24 }}>{r.level} detected</div>
            <h2 className="screen-title">Get your full report.</h2>
            <p className="screen-sub">Enter your details to receive your complete stress analysis, burnout risk score, and personalized recovery plan.</p>
            <form onSubmit={handleSubmit}>
              <input className="form-input" type="text" placeholder="Your Full Name" required value={userName} onChange={e => setUserName(e.target.value)} />
              <input className="form-input" type="email" placeholder="Email Address" required value={userEmail} onChange={e => setUserEmail(e.target.value)} />
              <button className="submit-btn" type="submit" disabled={loading} style={{ background: '#f563a0', color: '#fff' }}>{loading ? 'Processing...' : 'Send My Wellness Report →'}</button>
            </form>
          </div>
        )}

        {/* RESULT */}
        {screen === 'result' && r && (
          <div className="screen" style={{ textAlign: 'center' }}>
            <StressDial pct={r.pct} color={r.color} />
            <div style={{ display: 'inline-block', padding: '10px 24px', borderRadius: 100, fontWeight: 700, fontSize: 16, marginBottom: 24, background: isHigh ? 'rgba(245,99,160,.15)' : isMid ? 'rgba(245,159,99,.15)' : 'rgba(99,245,188,.15)', color: r.color, border: `1px solid ${r.color}40` }}>{r.level}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              {[['Stress Load', stressPct, isHigh ? '#f563a0' : '#f59e63'], ['Coping Ability', copingPct, '#63f5bc']].map(([label, val, col]) => (
                <div key={label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 18 }}>
                  <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--muted)', marginBottom: 8, fontWeight: 600 }}>{label}</div>
                  <div style={{ height: 5, background: 'var(--surface2)', borderRadius: 100, overflow: 'hidden', marginBottom: 6 }}>
                    <div style={{ height: '100%', width: `${val}%`, borderRadius: 100, background: col, transition: 'width 1.2s ease .5s' }} />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 18 }}>{val}%</div>
                </div>
              ))}
            </div>
            {overviewMap[r.level] && (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 28, marginBottom: 16, textAlign: 'left' }}>
                <h3 style={{ fontWeight: 700, marginBottom: 12 }}>{overviewMap[r.level].title}</h3>
                <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7 }}>{overviewMap[r.level].body}</p>
              </div>
            )}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 28, marginBottom: 16, textAlign: 'left' }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Your Recovery Plan</h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {ALL_TIPS.slice(0, tipCount).map(tip => (
                  <li key={tip} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, fontSize: 14, color: 'var(--muted)', lineHeight: 1.5 }}>
                    <span style={{ color: '#f563a0', fontWeight: 700, flexShrink: 0 }}>→</span>{tip}
                  </li>
                ))}
              </ul>
            </div>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>Your full wellness report has been sent to your email.</p>
            <Link className="btn-ghost" to="/">Explore Other Tests</Link>
          </div>
        )}
      </main>
    </>
  )
}

function StressDial({ pct, color }) {
  const circ = 339, track = circ * 0.75
  const offset = track - (track * (pct / 100))
  return (
    <div style={{ width: 200, height: 200, margin: '0 auto 28px', position: 'relative' }}>
      <svg width="200" height="200" viewBox="0 0 200 200" style={{ transform: 'rotate(135deg)' }}>
        <circle fill="none" stroke="var(--surface2)" strokeWidth="14" strokeLinecap="round" cx="100" cy="100" r="54" strokeDasharray="339" strokeDashoffset="84.75" />
        <circle fill="none" stroke={color} strokeWidth="14" strokeLinecap="round" cx="100" cy="100" r="54" strokeDasharray={`${track} ${circ}`} strokeDashoffset={offset} style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(.4,0,.2,1) .3s' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 40, fontWeight: 800, lineHeight: 1, color }}>{pct}%</div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>Stress Score</div>
      </div>
    </div>
  )
}
