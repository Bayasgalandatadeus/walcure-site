import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Background from '../components/Background'
import Nav from '../components/Nav'
import { supabase } from '../lib/supabase'
import emailjs from '@emailjs/browser'

emailjs.init('tuzgf0BVh8DMcd0l1')

const QUESTIONS = [
  { category: '🔢 Numerical', type: 'sequence', q: 'What is the next number in this sequence?', sequence: [3, 6, 12, 24, '?'], options: ['36', '48', '40', '32'], correct: 1, explanation: 'Each number doubles: 3→6→12→24→48.', weight: 'numerical' },
  { category: '🔢 Numerical', type: 'sequence', q: 'Identify the missing number in the sequence:', sequence: [1, 4, 9, 16, '?'], options: ['20', '25', '36', '24'], correct: 1, explanation: 'These are perfect squares: 1²=1, 2²=4, 3²=9, 4²=16, 5²=25.', weight: 'numerical' },
  { category: '🔢 Numerical', type: 'word', q: 'A project team completes 40% of a task in 10 days. At the same rate, how many more days are needed to finish the remaining work?', options: ['10 days', '15 days', '20 days', '25 days'], correct: 1, explanation: '40% took 10 days → 60% needs 15 days.', weight: 'numerical' },
  { category: '🔷 Pattern', type: 'matrix', q: 'Which value completes the 3×3 matrix?', matrix: [2, 4, 8, 3, 9, 27, 4, 16, '?'], options: ['32', '48', '64', '36'], correct: 2, explanation: 'Each row: n, n², n³. Row 3: 4, 4²=16, 4³=64.', weight: 'pattern' },
  { category: '🔷 Pattern', type: 'sequence', q: 'What comes next in the series?', sequence: [2, 3, 5, 8, 13, '?'], options: ['18', '21', '20', '15'], correct: 1, explanation: 'Fibonacci pattern: each number = sum of previous two.', weight: 'pattern' },
  { category: '🔷 Pattern', type: 'word', q: 'If ◆◆◆ = 9, ◆◆◆◆ = 16, ◆◆◆◆◆ = 25 — what does ◆◆◆◆◆◆◆ equal?', options: ['42', '49', '56', '36'], correct: 1, explanation: 'n diamonds = n². So 7 diamonds = 7² = 49.', weight: 'pattern' },
  { category: '📖 Verbal', type: 'analogy', q: 'Complete the analogy:', analogy: { a: 'Architect', b: 'Blueprint', c: 'Composer', d: '?' }, options: ['Orchestra', 'Score', 'Instrument', 'Melody'], correct: 1, explanation: 'An Architect creates a Blueprint; a Composer creates a Score.', weight: 'verbal' },
  { category: '📖 Verbal', type: 'word', q: 'Choose the word that is most nearly OPPOSITE in meaning to "Pragmatic":', options: ['Practical', 'Idealistic', 'Efficient', 'Realistic'], correct: 1, explanation: 'Pragmatic = practical. Its opposite is Idealistic.', weight: 'verbal' },
  { category: '📖 Verbal', type: 'analogy', q: 'Complete the analogy:', analogy: { a: 'Microscope', b: 'Biology', c: 'Telescope', d: '?' }, options: ['Stars', 'Physics', 'Astronomy', 'Space'], correct: 2, explanation: 'A Microscope is a tool of Biology; a Telescope is a tool of Astronomy.', weight: 'verbal' },
  { category: '🧩 Logic', type: 'word', q: 'All engineers are problem-solvers. Some problem-solvers are also artists. Which conclusion is necessarily true?', options: ['All engineers are artists', 'Some engineers may be artists', 'No engineers are artists', 'All artists are engineers'], correct: 1, explanation: 'We can only conclude "some engineers may be artists" — not all or none.', weight: 'logic' },
  { category: '🧩 Logic', type: 'word', q: 'In a team of 5, A ranks higher than B. C ranks lower than D. E ranks between A and C. Who can definitively be ranked last?', options: ['B', 'C', 'B or C', 'Cannot determine'], correct: 3, explanation: 'Without knowing where D and B rank relative to each other, we cannot determine who is last.', weight: 'logic' },
  { category: '🧩 Logic', type: 'preference', q: 'Which environment energizes you the most at work?', options: ['🎨 Creative — designing original concepts', '📊 Analytical — working with data and systems', '🏛️ Strategic — leading people and vision', '🤝 Social — communicating and building relationships'], correct: null, weight: 'preference' },
]

const LETTERS = ['A', 'B', 'C', 'D']
const PATHS = {
  0: { path: 'Creative Director', desc: 'Your visual-spatial and creative cognition is exceptional. You excel at translating complex ideas into compelling experiences and leading design-driven teams.' },
  1: { path: 'Data Scientist', desc: 'Your analytical and pattern-recognition abilities are top-tier. You thrive in data-rich environments, finding signal in noise and building predictive systems.' },
  2: { path: 'Operations CEO', desc: 'Your logical and strategic reasoning places you in the top tier of systems thinkers. You are built to lead organizations, align resources, and execute at scale.' },
  3: { path: 'PR Strategist', desc: 'Your verbal reasoning and social cognition are your superpowers. You excel at crafting narratives, managing perception, and building influential relationships.' },
}
const TIERS = [{ min: 130, label: 'Gifted — Top 2%' }, { min: 120, label: 'Superior Intelligence' }, { min: 110, label: 'High Average' }, { min: 100, label: 'Average — Solid Foundation' }, { min: 0, label: 'Developing — Keep Going' }]

function SequenceVisual({ sequence }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
      {sequence.map((n, i) => (
        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 56, height: 56, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 20, background: n === '?' ? 'rgba(99,245,188,0.15)' : 'var(--surface2)', color: n === '?' ? 'var(--accent)' : 'var(--text)', border: n === '?' ? '1.5px solid rgba(99,245,188,0.3)' : 'none' }}>{n}</div>
          {i < sequence.length - 1 && <span style={{ color: 'var(--muted)', fontSize: 18 }}>→</span>}
        </span>
      ))}
    </div>
  )
}

function MatrixVisual({ matrix }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 3, width: 180, marginBottom: 28, background: 'var(--surface2)', borderRadius: 12, overflow: 'hidden', padding: 3 }}>
      {matrix.map((v, i) => (
        <div key={i} style={{ aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', background: v === '?' ? 'var(--surface2)' : 'var(--surface)', borderRadius: 8, fontWeight: 700, fontSize: v === '?' ? 20 : 24, color: v === '?' ? 'rgba(99,245,188,0.4)' : 'var(--accent)', border: v === '?' ? '2px dashed rgba(99,245,188,0.3)' : 'none' }}>{v}</div>
      ))}
    </div>
  )
}

function AnalogyVisual({ analogy }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface2)', borderRadius: 12, padding: '12px 20px', fontWeight: 700 }}>
        <span>{analogy.a}</span><span style={{ color: 'var(--accent)', fontSize: 20, fontWeight: 800 }}>:</span><span>{analogy.b}</span>
      </div>
      <span style={{ color: 'var(--muted)', fontSize: 20 }}>∷</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(99,245,188,0.1)', border: '2px dashed rgba(99,245,188,0.4)', borderRadius: 12, padding: '12px 20px', fontWeight: 700, color: 'var(--accent)' }}>
        <span>{analogy.c}</span><span style={{ fontSize: 20, fontWeight: 800 }}>:</span><span>?</span>
      </div>
    </div>
  )
}

function TimerRing({ timeLeft }) {
  const pct = timeLeft / 30
  const circumference = 126
  const offset = circumference * (1 - pct)
  const color = timeLeft <= 10 ? '#f87171' : 'var(--accent)'
  return (
    <div style={{ width: 48, height: 48, position: 'relative' }}>
      <svg width="48" height="48" viewBox="0 0 48 48" style={{ transform: 'rotate(-90deg)' }}>
        <circle fill="none" stroke="var(--surface2)" strokeWidth="3" cx="24" cy="24" r="20" />
        <circle fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeDasharray="126" strokeDashoffset={offset} cx="24" cy="24" r="20" style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color }}>{timeLeft}</div>
    </div>
  )
}

export default function IQTest() {
  const navigate = useNavigate()
  const [screen, setScreen] = useState('intro')
  const [currentIdx, setCurrentIdx] = useState(0)
  const [userAnswers, setUserAnswers] = useState([])
  const [categoryScores, setCategoryScores] = useState({ numerical: 0, pattern: 0, verbal: 0, logic: 0 })
  const [answered, setAnswered] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  const [showFeedback, setShowFeedback] = useState(null) // null | {correct, explanation}
  const [showNext, setShowNext] = useState(false)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const timerRef = useRef(null)

  const q = QUESTIONS[currentIdx]

  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
  }, [])

  const handleTimeout = useCallback(() => {
    clearTimer()
    setAnswered(true)
    setUserAnswers(prev => { const a = [...prev]; a[currentIdx] = -1; return a })
    setShowFeedback({ isCorrect: false, explanation: q.explanation })
    setShowNext(true)
  }, [clearTimer, currentIdx, q])

  useEffect(() => {
    if (screen !== 'quiz') return
    clearTimer()
    setAnswered(userAnswers[currentIdx] !== undefined)
    setShowFeedback(null)
    setShowNext(userAnswers[currentIdx] !== undefined)
    setTimeLeft(30)

    if (q.correct !== null && userAnswers[currentIdx] === undefined) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { handleTimeout(); return 0 }
          return t - 1
        })
      }, 1000)
    }
    return () => clearTimer()
  }, [screen, currentIdx])

  const handleChoice = (index) => {
    if (answered) return
    clearTimer()
    setAnswered(true)
    setUserAnswers(prev => { const a = [...prev]; a[currentIdx] = index; return a })
    const isCorrect = q.correct !== null && index === q.correct
    if (isCorrect && q.weight !== 'preference') {
      setCategoryScores(prev => ({ ...prev, [q.weight]: prev[q.weight] + 1 }))
    }
    setShowFeedback({ isCorrect: q.correct === null ? null : isCorrect, explanation: q.explanation })
    setShowNext(true)
  }

  const nextQuestion = () => {
    clearTimer()
    if (currentIdx + 1 < QUESTIONS.length) {
      setCurrentIdx(i => i + 1)
    } else {
      computeResults()
      setScreen('lead')
    }
  }

  const goBack = () => {
    if (currentIdx > 0) { clearTimer(); setCurrentIdx(i => i - 1) }
  }

  const computeResults = () => {
    const total = QUESTIONS.filter(q => q.correct !== null).length
    const correct = Object.values(categoryScores).reduce((a, b) => a + b, 0)
    const iq = Math.round(80 + (correct / total) * 68)
    const prefAnswer = userAnswers[QUESTIONS.length - 1] ?? 1
    const chosen = PATHS[prefAnswer] || PATHS[1]
    const tier = TIERS.find(t => iq >= t.min)?.label || TIERS[4].label
    const catQ = { numerical: 3, pattern: 3, verbal: 3, logic: 2 }
    setResults({ iq, path: chosen.path, desc: chosen.desc, tier, correct, total, catScores: { ...categoryScores }, catQ })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    computeResults()
    try { await supabase.from('career_tests').insert([{ name: userName, email: userEmail, iq_score: results?.iq, career_path: results?.path }]) } catch (_) {}
    try { await emailjs.send('service_qq96gby', 'template_f3jm56x', { name: userName, email: userEmail, iq_score: results?.iq, career_path: results?.path }) } catch (_) {}
    setLoading(false)
    setScreen('result')
  }

  const optionState = (i) => {
    if (!answered) return ''
    if (q.correct === null) return userAnswers[currentIdx] === i ? 'selected' : ''
    if (i === q.correct) return 'correct'
    if (i === userAnswers[currentIdx] && userAnswers[currentIdx] !== q.correct) return 'wrong'
    return ''
  }

  return (
    <>
      <Background />
      <Nav variant="test" />
      <style>{`
        @media (max-width: 640px) {
          .intro-features { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <main className="quiz-main">
        {/* ── INTRO ── */}
        {screen === 'intro' && (
          <div className="screen">
            <div className="badge"><div className="badge-dot" />Cognitive Assessment v2.0</div>
            <h1 style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 'clamp(36px,6vw,52px)', fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.2, marginBottom: 24 }}>
              Discover your <span style={{ color: 'var(--accent)' }}>cognitive edge.</span>{' '}
              <span style={{ color: 'var(--muted)' }}>Find your path.</span>
            </h1>
            <p style={{ fontSize: 18, color: 'var(--muted)', lineHeight: 1.7, maxWidth: 520, marginBottom: 48, fontWeight: 300 }}>
              12 scientifically-calibrated questions across logic, pattern recognition, verbal reasoning, and spatial thinking — mapped to high-growth careers.
            </p>
            <div style={{ display: 'flex', gap: 40, marginBottom: 48 }}>
              {[['12', 'Q', 'Questions'], ['8', 'min', 'Average time'], ['4', '+', 'Career paths']].map(([n, u, l]) => (
                <div key={l}>
                  <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 28, fontWeight: 700, lineHeight: 1 }}>{n}<span style={{ color: 'var(--accent)' }}>{u}</span></div>
                  <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>{l}</div>
                </div>
              ))}
            </div>
            <button className="btn-primary" onClick={() => setScreen('quiz')}>
              Begin Assessment
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </button>
            <div className="intro-features" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginTop: 60 }}>
              {[['🧠','Cognitive Mapping','Questions designed by cognitive scientists to reveal your thinking patterns.'],['🎯','Career Match','Your results are matched against 20+ real-world high-growth career profiles.'],['📊','Instant Report','Receive a detailed breakdown with your IQ score and personalized roadmap.']].map(([icon,title,desc]) => (
                <div key={title} style={{ padding: 24, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16 }}>
                  <div style={{ fontSize: 24, marginBottom: 12 }}>{icon}</div>
                  <h4 style={{ fontWeight: 700, marginBottom: 6 }}>{title}</h4>
                  <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── QUIZ ── */}
        {screen === 'quiz' && (
          <div className="screen">
            <div className="quiz-header">
              <button className={`back-btn${currentIdx === 0 ? ' invisible' : ''}`} onClick={goBack}>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                Back
              </button>
              <div>
                <div className="q-label">Question {currentIdx + 1} / {QUESTIONS.length}</div>
                <div className="progress-track"><div className="progress-fill" style={{ width: `${(currentIdx + 1) / QUESTIONS.length * 100}%` }} /></div>
              </div>
              {q.correct !== null
                ? <TimerRing timeLeft={answered ? 0 : timeLeft} />
                : <div style={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: 'var(--muted)' }}>∞</div>
              }
            </div>

            <div className="q-cat">{q.category}</div>

            {q.type === 'sequence' && <SequenceVisual sequence={q.sequence} />}
            {q.type === 'matrix' && <MatrixVisual matrix={q.matrix} />}
            {q.type === 'analogy' && <AnalogyVisual analogy={q.analogy} />}

            <h2 className="q-text">{q.q}</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {q.options.map((opt, i) => {
                const state = optionState(i)
                return (
                  <button key={i} onClick={() => handleChoice(i)} disabled={answered}
                    onMouseEnter={e => { if (!answered) { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'rgba(99,245,188,0.07)' } }}
                    onMouseLeave={e => { if (!answered) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface)' } }}
                    style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 16, padding: '20px 24px', background: state === 'correct' ? 'rgba(99,245,188,0.12)' : state === 'wrong' ? 'rgba(248,113,113,0.08)' : state === 'selected' ? 'rgba(99,245,188,0.08)' : 'var(--surface)', border: `1.5px solid ${state === 'correct' ? 'var(--accent)' : state === 'wrong' ? '#f87171' : state === 'selected' ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 16, cursor: answered ? 'default' : 'pointer', textAlign: 'left', transition: 'all 0.2s', fontFamily: "'DM Sans',sans-serif" }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 14, fontWeight: 700, background: state === 'correct' ? 'var(--accent)' : state === 'wrong' ? '#f87171' : 'var(--surface2)', color: state === 'correct' ? '#000' : state === 'wrong' ? '#fff' : 'var(--muted)', transition: 'all 0.2s' }}>{LETTERS[i]}</div>
                    <span style={{ fontSize: 15, fontWeight: 500, color: state === 'selected' ? 'var(--accent)' : 'var(--text)', lineHeight: 1.4 }}>{opt}</span>
                  </button>
                )
              })}
            </div>

            {showFeedback && showFeedback.isCorrect !== null && (
              <div style={{ marginTop: 20, padding: '16px 20px', borderRadius: 12, background: showFeedback.isCorrect ? 'rgba(99,245,188,0.1)' : 'rgba(248,113,113,0.08)', border: `1px solid ${showFeedback.isCorrect ? 'rgba(99,245,188,0.2)' : 'rgba(248,113,113,0.2)'}`, color: showFeedback.isCorrect ? 'var(--accent)' : '#f87171', fontSize: 14, fontWeight: 500, lineHeight: 1.5, animation: 'fadeUp 0.3s ease' }}>
                {showFeedback.isCorrect ? '✓ Correct! ' : '✗ Not quite. '}{showFeedback.explanation}
              </div>
            )}

            {showNext && (
              <button onClick={nextQuestion} style={{ marginTop: 28, padding: '16px 32px', background: 'var(--accent)', color: '#000', fontWeight: 700, fontSize: 15, border: 'none', borderRadius: 12, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'all 0.2s', fontFamily: "'DM Sans',sans-serif" }}>
                {currentIdx + 1 < QUESTIONS.length ? 'Next Question' : 'See Results'}
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </button>
            )}
          </div>
        )}

        {/* ── LEAD ── */}
        {screen === 'lead' && (
          <div className="screen" style={{ maxWidth: 520, margin: '0 auto' }}>
            <div className="badge"><div className="badge-dot" />Assessment Complete</div>
            <h2 className="screen-title">Almost there.</h2>
            <p className="screen-sub">Your cognitive profile is ready. Enter your details to unlock your full IQ score, career path analysis, and personalized report.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
              {[['Raw Score', results?.iq || '—'], ['Correct Answers', results ? `${results.correct}/${results.total}` : '—']].map(([label, val]) => (
                <div key={label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 20 }}>
                  <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginBottom: 8 }}>{label}</div>
                  <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 28, fontWeight: 700, color: 'var(--accent)' }}>{val}</div>
                </div>
              ))}
            </div>
            <form onSubmit={handleSubmit}>
              <input className="form-input" type="text" placeholder="Your Full Name" required value={userName} onChange={e => setUserName(e.target.value)} />
              <input className="form-input" type="email" placeholder="Work Email Address" required value={userEmail} onChange={e => setUserEmail(e.target.value)} />
              <button className="submit-btn" type="submit" disabled={loading}>{loading ? 'Processing...' : 'Unlock My Results →'}</button>
            </form>
          </div>
        )}

        {/* ── RESULT ── */}
        {screen === 'result' && results && (
          <div className="screen" style={{ textAlign: 'center' }}>
            <ResultRing iq={results.iq} />
            <div style={{ display: 'inline-block', padding: '8px 24px', background: 'rgba(99,245,188,0.1)', border: '1px solid rgba(99,245,188,0.3)', borderRadius: 100, fontSize: 13, fontWeight: 600, letterSpacing: '.05em', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 16 }}>{results.tier}</div>
            <h2 style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 30, fontWeight: 700, letterSpacing: '-0.01em', marginBottom: 8 }}>Your Career Path</h2>
            <div style={{ display: 'inline-block', padding: '14px 32px', background: 'linear-gradient(135deg,var(--accent),var(--accent2))', color: '#000', fontWeight: 700, fontSize: 18, borderRadius: 100, marginBottom: 24 }}>{results.path}</div>
            <p style={{ fontSize: 16, color: 'var(--muted)', maxWidth: 480, margin: '0 auto 40px', lineHeight: 1.7 }}>{results.desc}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 48 }}>
              {[['🔢','Numerical',`${results.catScores.numerical}/${results.catQ.numerical}`],['🔷','Pattern',`${results.catScores.pattern}/${results.catQ.pattern}`],['📖','Verbal',`${results.catScores.verbal}/${results.catQ.verbal}`],['🧩','Logic',`${results.catScores.logic}/${results.catQ.logic}`]].map(([icon,label,val]) => (
                <div key={label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 12px' }}>
                  <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 18, fontWeight: 700 }}>{val}</div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 24 }}>A detailed report has been sent to your email.</p>
            <button className="btn-ghost" onClick={() => navigate('/')}>Take Another Assessment</button>
          </div>
        )}
      </main>
    </>
  )
}

function ResultRing({ iq }) {
  const pct = (iq - 80) / 68
  const circ = 565
  const offset = circ - circ * Math.min(pct, 1)
  return (
    <div style={{ width: 200, height: 200, margin: '0 auto 40px', position: 'relative' }}>
      <svg width="200" height="200" viewBox="0 0 200 200" style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#63f5bc" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
        <circle fill="none" stroke="var(--surface2)" strokeWidth="8" cx="100" cy="100" r="90" />
        <circle fill="none" stroke="url(#scoreGrad)" strokeWidth="8" strokeLinecap="round" strokeDasharray="565" strokeDashoffset={offset} cx="100" cy="100" r="90" style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 52, fontWeight: 700, color: 'var(--accent)', lineHeight: 1 }}>{iq}</div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>IQ Score</div>
      </div>
    </div>
  )
}
