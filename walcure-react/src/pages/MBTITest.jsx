import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Background from '../components/Background'
import Nav from '../components/Nav'
import { supabase } from '../lib/supabase'
import emailjs from '@emailjs/browser'

emailjs.init('tuzgf0BVh8DMcd0l1')

const QUESTIONS = [
  { dim: '🧭 Mind', axis: 'EI', la: 'You enjoy being the center of attention', lb: 'You prefer to observe rather than participate', q: 'At social gatherings, you tend to...' },
  { dim: '🧭 Mind', axis: 'EI', la: 'Talk things through with others', lb: 'Think things through alone', q: 'When solving a complex problem, you prefer to...' },
  { dim: '🧭 Mind', axis: 'EI', la: 'Have a wide circle of acquaintances', lb: 'Have a small group of close friends', q: 'You prefer to...' },
  { dim: '🧭 Mind', axis: 'EI', la: 'Feel energized after socializing', lb: 'Feel drained after socializing', q: 'Large social events make you...' },
  { dim: '🧭 Mind', axis: 'EI', la: 'Speak first, think later', lb: 'Think first, speak carefully', q: 'In conversations, you tend to...' },
  { dim: '⚡ Energy', axis: 'SN', la: 'Focus on present facts and details', lb: 'Think about future possibilities', q: 'When approaching a task, you typically...' },
  { dim: '⚡ Energy', axis: 'SN', la: 'Trust experience and proven methods', lb: 'Trust your gut and innovate', q: 'When making decisions, you...' },
  { dim: '⚡ Energy', axis: 'SN', la: 'Prefer concrete, specific information', lb: 'Prefer abstract, conceptual ideas', q: 'You are more drawn to...' },
  { dim: '⚡ Energy', axis: 'SN', la: 'Notice details others miss', lb: 'See the big picture others miss', q: 'In your work, you tend to...' },
  { dim: '⚡ Energy', axis: 'SN', la: 'Build on what already works', lb: 'Reinvent and create new approaches', q: 'You prefer to...' },
  { dim: '🎯 Nature', axis: 'TF', la: 'Apply consistent logic regardless of feelings', lb: 'Consider how decisions affect people', q: 'When making choices, you prioritize...' },
  { dim: '🎯 Nature', axis: 'TF', la: 'Truth, even if it hurts', lb: 'Harmony, even if it requires tact', q: 'You believe it is more important to state...' },
  { dim: '🎯 Nature', axis: 'TF', la: 'Objective analysis', lb: 'Empathy and compassion', q: 'In conflicts, you lean toward...' },
  { dim: '🎯 Nature', axis: 'TF', la: 'Critique what could be improved', lb: 'Appreciate what has been done well', q: "Your default response to others' work is to..." },
  { dim: '🎯 Nature', axis: 'TF', la: 'Being competent and capable', lb: 'Being caring and supportive', q: 'It matters more to you to be seen as...' },
  { dim: '🗂️ Tactics', axis: 'JP', la: 'Have a clear plan before starting', lb: 'Figure things out as you go', q: 'When beginning a new project, you prefer to...' },
  { dim: '🗂️ Tactics', axis: 'JP', la: 'Deadlines are serious commitments', lb: 'Deadlines are flexible guidelines', q: 'You treat deadlines as...' },
  { dim: '🗂️ Tactics', axis: 'JP', la: 'Decide quickly and move forward', lb: 'Keep options open as long as possible', q: 'When facing a choice, you tend to...' },
  { dim: '🗂️ Tactics', axis: 'JP', la: 'A tidy, organized space', lb: 'A flexible, comfortable space', q: 'You work better in...' },
  { dim: '🗂️ Tactics', axis: 'JP', la: 'Stick to the plan even under pressure', lb: 'Adapt freely when circumstances change', q: 'You prefer to...' },
]

const PROFILES = {
  INTJ: { name: 'The Architect', desc: 'Strategic, independent, and endlessly analytical. INTJs form complex strategies and execute them with precision. They are among the rarest types — confident in their ideas and relentlessly pursuing improvement.', famous: ['Elon Musk', 'Christopher Nolan', 'Nikola Tesla', 'Mark Zuckerberg'], careers: 'Systems engineering, strategic consulting, software architecture, academic research, entrepreneurship.', traits: [{ label: 'E↔I', val: 15, side: 'I' }, { label: 'S↔N', val: 80, side: 'N' }, { label: 'T↔F', val: 75, side: 'T' }, { label: 'J↔P', val: 80, side: 'J' }] },
  INTP: { name: 'The Logician', desc: 'Innovative inventors with an unquenchable thirst for knowledge. INTPs love patterns, theories, and logical consistency. They are endlessly curious and skeptical of conventional wisdom.', famous: ['Albert Einstein', 'Bill Gates', 'Larry Page', 'Socrates'], careers: 'Mathematics, computer science, philosophy, physics, software engineering.', traits: [{ label: 'E↔I', val: 15, side: 'I' }, { label: 'S↔N', val: 80, side: 'N' }, { label: 'T↔F', val: 80, side: 'T' }, { label: 'J↔P', val: 20, side: 'P' }] },
  ENTJ: { name: 'The Commander', desc: 'Bold, imaginative, and strong-willed leaders. ENTJs love a good challenge and are quick to organize and command. They excel at turning potential into action.', famous: ['Steve Jobs', 'Margaret Thatcher', 'Gordon Ramsay', 'Napoleon'], careers: 'Executive leadership, entrepreneurship, law, investment banking, management consulting.', traits: [{ label: 'E↔I', val: 85, side: 'E' }, { label: 'S↔N', val: 75, side: 'N' }, { label: 'T↔F', val: 78, side: 'T' }, { label: 'J↔P', val: 82, side: 'J' }] },
  ENTP: { name: 'The Debater', desc: "Smart, curious thinkers who love an intellectual challenge. ENTPs thrive on debate, innovation, and outsmarting conventional wisdom — always playing devil's advocate.", famous: ['Tom Hanks', 'Celine Dion', 'Barack Obama', 'Leonardo da Vinci'], careers: 'Entrepreneurship, law, political strategy, product management, creative direction.', traits: [{ label: 'E↔I', val: 82, side: 'E' }, { label: 'S↔N', val: 80, side: 'N' }, { label: 'T↔F', val: 72, side: 'T' }, { label: 'J↔P', val: 18, side: 'P' }] },
  INFJ: { name: 'The Advocate', desc: 'Creative nurturers with a powerful sense of purpose. INFJs are idealistic yet decisive, deeply private yet caring — the rarest of all types. They seek meaning in everything.', famous: ['Nelson Mandela', 'Oprah Winfrey', 'Taylor Swift', 'Dostoevsky'], careers: 'Psychology, counseling, writing, non-profit leadership, healthcare, social work.', traits: [{ label: 'E↔I', val: 14, side: 'I' }, { label: 'S↔N', val: 78, side: 'N' }, { label: 'T↔F', val: 22, side: 'F' }, { label: 'J↔P', val: 78, side: 'J' }] },
  INFP: { name: 'The Mediator', desc: 'Poetic, kind, and altruistic. INFPs are guided by principles and are always looking for ways to make the world a better place. Deeply idealistic, they seek beauty and meaning.', famous: ['J.R.R. Tolkien', 'Princess Diana', 'Frédéric Chopin', 'Audrey Hepburn'], careers: 'Writing, counseling, arts, education, social activism, UX research.', traits: [{ label: 'E↔I', val: 14, side: 'I' }, { label: 'S↔N', val: 78, side: 'N' }, { label: 'T↔F', val: 18, side: 'F' }, { label: 'J↔P', val: 22, side: 'P' }] },
  ENFJ: { name: 'The Protagonist', desc: 'Charismatic and inspiring leaders who captivate their audience. ENFJs are passionate, reliable, and altruistic — natural teachers who are born to lead and uplift others.', famous: ['Barack Obama', 'Oprah Winfrey', 'Martin Luther King Jr.', 'Jennifer Lawrence'], careers: 'Education, coaching, politics, HR leadership, public relations, organizational psychology.', traits: [{ label: 'E↔I', val: 84, side: 'E' }, { label: 'S↔N', val: 76, side: 'N' }, { label: 'T↔F', val: 18, side: 'F' }, { label: 'J↔P', val: 80, side: 'J' }] },
  ENFP: { name: 'The Campaigner', desc: 'Enthusiastic, creative, and free-spirited — ENFPs see life as full of possibilities. They are great at making connections, inspiring others, and diving into new ideas with infectious energy.', famous: ['Robin Williams', 'Walt Disney', 'Mark Twain', 'Ellen DeGeneres'], careers: 'Marketing, journalism, coaching, design, acting, social entrepreneurship.', traits: [{ label: 'E↔I', val: 82, side: 'E' }, { label: 'S↔N', val: 78, side: 'N' }, { label: 'T↔F', val: 16, side: 'F' }, { label: 'J↔P', val: 18, side: 'P' }] },
  ISTJ: { name: 'The Logistician', desc: 'Practical, fact-minded, and reliable. ISTJs are the backbone of many institutions — dependable, responsible, and thorough. They take duties seriously and follow through on commitments.', famous: ['Warren Buffett', 'Angela Merkel', 'George Washington', 'Natalie Portman'], careers: 'Accounting, law, military, project management, data analysis, engineering.', traits: [{ label: 'E↔I', val: 18, side: 'I' }, { label: 'S↔N', val: 78, side: 'S' }, { label: 'T↔F', val: 78, side: 'T' }, { label: 'J↔P', val: 82, side: 'J' }] },
  ISFJ: { name: 'The Defender', desc: 'Dedicated, warm protectors who are always ready to defend those they care about. ISFJs are patient, observant, and reliable — the true heart of any community or team.', famous: ['Mother Teresa', 'Kate Middleton', 'Vin Diesel', 'Beyoncé'], careers: 'Healthcare, education, social work, administration, customer relations, non-profits.', traits: [{ label: 'E↔I', val: 16, side: 'I' }, { label: 'S↔N', val: 80, side: 'S' }, { label: 'T↔F', val: 16, side: 'F' }, { label: 'J↔P', val: 80, side: 'J' }] },
  ESTJ: { name: 'The Executive', desc: 'Excellent administrators who are unsurpassed at managing tasks and people. ESTJs are organized, honest, dedicated, and willing to take charge — traditional leaders with a respect for order.', famous: ['Judge Judy', 'Henry Ford', 'Michelle Obama', 'Sonia Sotomayor'], careers: 'Business management, military, law enforcement, finance, operations, school administration.', traits: [{ label: 'E↔I', val: 82, side: 'E' }, { label: 'S↔N', val: 78, side: 'S' }, { label: 'T↔F', val: 80, side: 'T' }, { label: 'J↔P', val: 82, side: 'J' }] },
  ESFJ: { name: 'The Consul', desc: "Extraordinarily caring, social, and popular — ESFJs are the glue of social circles and workplaces alike. They are attentive to others' needs and take great pleasure in supporting their community.", famous: ['Taylor Swift', 'Bill Clinton', 'Jennifer Garner', 'Danny Glover'], careers: 'Healthcare, education, event planning, social work, sales, human resources.', traits: [{ label: 'E↔I', val: 84, side: 'E' }, { label: 'S↔N', val: 78, side: 'S' }, { label: 'T↔F', val: 16, side: 'F' }, { label: 'J↔P', val: 80, side: 'J' }] },
  ISTP: { name: 'The Virtuoso', desc: 'Bold, practical experimenters and masters of tools and trades. ISTPs are hands-on problem solvers who love to explore with logic and reason, especially in crisis situations.', famous: ['Clint Eastwood', 'Michael Jordan', 'Tom Cruise', 'Scarlett Johansson'], careers: 'Engineering, mechanics, forensics, programming, military, athletics, carpentry.', traits: [{ label: 'E↔I', val: 18, side: 'I' }, { label: 'S↔N', val: 76, side: 'S' }, { label: 'T↔F', val: 78, side: 'T' }, { label: 'J↔P', val: 18, side: 'P' }] },
  ISFP: { name: 'The Adventurer', desc: 'Flexible, charming artists who are always ready to explore and experience something new. ISFPs live in the present moment and relish every sensory experience around them.', famous: ['Michael Jackson', 'Lana Del Rey', 'Ryan Gosling', 'Frida Kahlo'], careers: 'Design, fine arts, music, culinary arts, nursing, fashion, photography.', traits: [{ label: 'E↔I', val: 16, side: 'I' }, { label: 'S↔N', val: 76, side: 'S' }, { label: 'T↔F', val: 18, side: 'F' }, { label: 'J↔P', val: 18, side: 'P' }] },
  ESTP: { name: 'The Entrepreneur', desc: 'Smart, energetic, and perceptive people who enjoy living on the edge. ESTPs are bold, dramatic, and action-oriented — always the first to take on a challenge and make things happen.', famous: ['Donald Trump', 'Madonna', 'Eddie Murphy', 'Jack Nicholson'], careers: 'Sales, entrepreneurship, marketing, emergency services, sports management, acting.', traits: [{ label: 'E↔I', val: 84, side: 'E' }, { label: 'S↔N', val: 78, side: 'S' }, { label: 'T↔F', val: 76, side: 'T' }, { label: 'J↔P', val: 20, side: 'P' }] },
  ESFP: { name: 'The Entertainer', desc: 'Spontaneous, energetic, and enthusiastic — ESFPs love life, people, and material comforts. They are born entertainers who love being in the spotlight and making every moment exciting.', famous: ['Adele', 'Miley Cyrus', 'Marilyn Monroe', 'Jamie Oliver'], careers: 'Entertainment, hospitality, event management, early childhood education, sales, coaching.', traits: [{ label: 'E↔I', val: 84, side: 'E' }, { label: 'S↔N', val: 78, side: 'S' }, { label: 'T↔F', val: 16, side: 'F' }, { label: 'J↔P', val: 18, side: 'P' }] },
}

function calculateMBTI(answers) {
  let EI = 0, SN = 0, TF = 0, JP = 0
  QUESTIONS.forEach((q, i) => {
    const score = (answers[i] || 3) - 3
    if (q.axis === 'EI') EI += score
    else if (q.axis === 'SN') SN += score
    else if (q.axis === 'TF') TF += score
    else if (q.axis === 'JP') JP += score
  })
  return (EI > 0 ? 'I' : 'E') + (SN > 0 ? 'N' : 'S') + (TF > 0 ? 'F' : 'T') + (JP > 0 ? 'P' : 'J')
}

export default function MBTITest() {
  const navigate = useNavigate()
  const [screen, setScreen] = useState('intro')
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState([])
  const [mbtiType, setMbtiType] = useState('')
  const [loading, setLoading] = useState(false)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')

  const q = QUESTIONS[currentIdx]

  const pickAnswer = (val) => {
    const newAnswers = [...answers]
    newAnswers[currentIdx] = val
    setAnswers(newAnswers)
    if (currentIdx + 1 < QUESTIONS.length) {
      setCurrentIdx(i => i + 1)
    } else {
      const type = calculateMBTI(newAnswers)
      setMbtiType(type)
      setScreen('lead')
    }
  }

  const goBack = () => { if (currentIdx > 0) setCurrentIdx(i => i - 1) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const p = PROFILES[mbtiType] || {}
    try { await supabase.from('career_tests').insert([{ name: userName, email: userEmail, iq_score: null, career_path: p.name || mbtiType, test_type: 'mbti', mbti_code: mbtiType }]) } catch (_) {}
    try { await emailjs.send('service_qq96gby', 'template_f3jm56x', { name: userName, email: userEmail, iq_score: mbtiType, career_path: p.name || '' }) } catch (_) {}
    setLoading(false)
    setScreen('result')
  }

  const profile = PROFILES[mbtiType] || PROFILES.INTJ

  return (
    <>
      <Background />
      <Nav variant="test" accentGradient="linear-gradient(135deg,#a78bfa,#63f5bc)" />
      <style>{`:root { --accent: #a78bfa; --accent2: #63f5bc; }`}</style>

      <main className="quiz-main">
        {/* INTRO */}
        {screen === 'intro' && (
          <div className="screen">
            <div className="badge" style={{ background: 'rgba(167,139,250,0.08)', borderColor: 'rgba(167,139,250,0.2)' }}>
              <div className="badge-dot" />Personality · 20 Questions
            </div>
            <h1 style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 'clamp(40px,7vw,72px)', fontWeight: 800, letterSpacing: '-.04em', lineHeight: 1, marginBottom: 24 }}>
              Discover your<br /><span style={{ background: 'linear-gradient(135deg,#a78bfa,#63f5bc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>personality type.</span>
            </h1>
            <p style={{ fontSize: 17, color: 'var(--muted)', lineHeight: 1.7, maxWidth: 520, marginBottom: 40, fontWeight: 300 }}>
              The Myers-Briggs Type Indicator reveals how you perceive the world and make decisions — across four key dimensions.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 40 }}>
              {[['E','I','Extraversion vs Introversion','How you direct and receive energy — from the outer or inner world.'],['S','N','Sensing vs Intuition','How you take in information — concrete facts or patterns and possibilities.'],['T','F','Thinking vs Feeling','How you make decisions — logical analysis or people and values.'],['J','P','Judging vs Perceiving','How you deal with the world — structured planning or flexible spontaneity.']].map(([a,b,title,desc]) => (
                <div key={title} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 20 }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    {[a,b].map(t => <span key={t} style={{ padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: 'rgba(167,139,250,0.12)', color: '#a78bfa' }}>{t}</span>)}
                  </div>
                  <h4 style={{ fontWeight: 700, marginBottom: 6, fontSize: 14 }}>{title}</h4>
                  <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{desc}</p>
                </div>
              ))}
            </div>
            <button className="btn-primary" style={{ background: '#a78bfa', color: '#fff' }} onClick={() => setScreen('quiz')}>
              Start Personality Test
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
                <div className="q-label" style={{ color: '#a78bfa' }}>Question {currentIdx + 1} / {QUESTIONS.length}</div>
                <div className="progress-track"><div className="progress-fill" style={{ width: `${(currentIdx + 1) / QUESTIONS.length * 100}%`, background: 'linear-gradient(90deg,#a78bfa,#63f5bc)' }} /></div>
              </div>
              <div style={{ width: 80 }} />
            </div>
            <div className="q-cat">{q.dim}</div>
            <h2 className="q-text">{q.q}</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>{q.la}</span>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>{q.lb}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              {[1, 2, 3, 4, 5].map(v => (
                <button key={v} onClick={() => pickAnswer(v)}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#a78bfa'; e.currentTarget.style.background = 'rgba(167,139,250,0.1)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = answers[currentIdx] === v ? '#a78bfa' : 'var(--border)'; e.currentTarget.style.background = answers[currentIdx] === v ? 'rgba(167,139,250,0.12)' : 'var(--surface)' }}
                  style={{ flex: 1, maxWidth: 80, aspectRatio: '1', borderRadius: 14, border: `1.5px solid ${answers[currentIdx] === v ? '#a78bfa' : 'var(--border)'}`, background: answers[currentIdx] === v ? 'rgba(167,139,250,0.12)' : 'var(--surface)', cursor: 'pointer', transition: 'all .2s', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, color: answers[currentIdx] === v ? '#a78bfa' : 'var(--muted)' }}>
                  <div style={{ borderRadius: '50%', background: 'currentColor', width: [8,12,16,12,8][v-1], height: [8,12,16,12,8][v-1], opacity: v === 3 ? 0.4 : 1 }} />
                  <span style={{ fontSize: 11, fontWeight: 600 }}>{v === 1 ? 'A' : v === 5 ? 'B' : v}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* LEAD */}
        {screen === 'lead' && (
          <div className="screen" style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
            <div className="badge" style={{ background: 'rgba(167,139,250,0.08)', borderColor: 'rgba(167,139,250,0.2)' }}>
              <div className="badge-dot" />Type Identified
            </div>
            <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 64, fontWeight: 800, letterSpacing: '-.02em', marginBottom: 8, background: 'linear-gradient(135deg,#a78bfa,#63f5bc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{mbtiType}</div>
            <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 24 }}>{profile.name}</div>
            <h2 className="screen-title">Almost there.</h2>
            <p className="screen-sub">Enter your details to unlock your full personality report, career matches, and famous people with your type.</p>
            <form onSubmit={handleSubmit}>
              <input className="form-input" type="text" placeholder="Your Full Name" required value={userName} onChange={e => setUserName(e.target.value)} style={{ borderColor: 'var(--border)' }} />
              <input className="form-input" type="email" placeholder="Email Address" required value={userEmail} onChange={e => setUserEmail(e.target.value)} style={{ borderColor: 'var(--border)' }} />
              <button className="submit-btn" type="submit" disabled={loading} style={{ background: '#a78bfa', color: '#fff' }}>{loading ? 'Processing...' : 'Unlock My Personality Report →'}</button>
            </form>
          </div>
        )}

        {/* RESULT */}
        {screen === 'result' && (
          <div className="screen" style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 'clamp(64px,12vw,120px)', fontWeight: 800, letterSpacing: '-.04em', lineHeight: 1, marginBottom: 8, background: 'linear-gradient(135deg,#a78bfa,#63f5bc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{mbtiType}</div>
            <div style={{ fontSize: 20, fontWeight: 500, color: 'var(--muted)', marginBottom: 32 }}>{profile.name}</div>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 32, marginBottom: 20, textAlign: 'left' }}>
              <h3 style={{ fontWeight: 700, marginBottom: 12 }}>Your Personality Overview</h3>
              <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7 }}>{profile.desc}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 20 }}>
              {profile.traits.map(t => (
                <div key={t.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 20 }}>
                  <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.08em', color: '#a78bfa', marginBottom: 6, fontWeight: 600 }}>{t.label}</div>
                  <div style={{ height: 4, background: 'var(--surface2)', borderRadius: 100, overflow: 'hidden', marginBottom: 8 }}>
                    <div style={{ height: '100%', width: `${t.val}%`, borderRadius: 100, background: 'linear-gradient(90deg,#a78bfa,#63f5bc)', transition: 'width 1s ease .5s' }} />
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>Strong {t.side} tendency</div>
                </div>
              ))}
            </div>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 32, marginBottom: 16, textAlign: 'left' }}>
              <h3 style={{ fontWeight: 700, marginBottom: 12 }}>Famous People With Your Type</h3>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {profile.famous.map(f => <span key={f} style={{ padding: '5px 14px', background: 'rgba(167,139,250,.1)', borderRadius: 100, fontSize: 12, color: '#a78bfa', fontWeight: 500 }}>{f}</span>)}
              </div>
            </div>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 32, marginBottom: 20, textAlign: 'left' }}>
              <h3 style={{ fontWeight: 700, marginBottom: 12 }}>Ideal Career Environments</h3>
              <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7 }}>{profile.careers}</p>
            </div>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>Your full report has been sent to your email.</p>
            <Link className="btn-ghost" to="/">Explore Other Tests</Link>
          </div>
        )}
      </main>
    </>
  )
}
