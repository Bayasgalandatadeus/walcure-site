import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Background from '../components/Background'
import Nav from '../components/Nav'
import { supabase } from '../lib/supabase'

function formatDate(ts) {
  if (!ts) return 'Unknown date'
  return new Date(ts).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}
function getIQTier(score) {
  if (score >= 130) return 'Gifted'
  if (score >= 120) return 'Superior'
  if (score >= 110) return 'High Average'
  if (score >= 100) return 'Average'
  return 'Developing'
}
function getIQPercent(score) { return Math.min(100, Math.max(5, ((score - 70) / 78) * 100)) }

const TYPE_MAP = {
  iq: { label: '🧠 IQ Assessment', cls: 'type-iq' },
  mbti: { label: '🔮 MBTI Personality', cls: 'type-mbti' },
  career: { label: '🎯 Career Discovery', cls: 'type-career' },
  stress: { label: '💆 Stress Check', cls: 'type-stress' },
}

function ResultCard({ row }) {
  const testType = row.test_type || 'iq'
  const t = TYPE_MAP[testType] || TYPE_MAP.iq
  const tier = getIQTier(row.iq_score)
  const pct = getIQPercent(row.iq_score)

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 32, transition: 'border-color .2s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(99,245,188,0.2)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, gap: 16 }}>
        <div>
          <span className={`test-type-badge ${t.cls}`}>{t.label}</span>
          <div style={{ marginTop: 10, fontSize: 16, fontWeight: 600 }}>
            {row.name || 'Anonymous'}
            {testType === 'iq' && <span style={{ display: 'inline-block', padding: '4px 10px', background: 'rgba(99,245,188,0.1)', borderRadius: 6, fontSize: 11, fontWeight: 600, color: 'var(--accent)', marginLeft: 8, verticalAlign: 'middle' }}>{tier}</span>}
          </div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)', flexShrink: 0 }}>{formatDate(row.created_at)}</div>
      </div>

      {testType === 'iq' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 20 }}>
            {[['IQ Score', row.iq_score || '—', 'var(--accent)'], ['Percentile', row.iq_score ? Math.round(pct) + '%' : '—', 'var(--accent2)'], ['Category', tier, 'var(--accent3)']].map(([label, val, color]) => (
              <div key={label} style={{ background: 'var(--surface2)', borderRadius: 14, padding: 16 }}>
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--muted)', marginBottom: 8 }}>{label}</div>
                <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: label === 'Category' ? 15 : 24, fontWeight: 800, color, lineHeight: 1 }}>{val}</div>
              </div>
            ))}
          </div>
          {row.iq_score && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>
                <span>Score Range</span><span>{row.iq_score} / 148</span>
              </div>
              <div style={{ height: 6, background: 'var(--surface2)', borderRadius: 100, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,var(--accent),var(--accent2))', borderRadius: 100, transition: 'width 1s cubic-bezier(.4,0,.2,1)' }} />
              </div>
            </div>
          )}
        </>
      )}

      {testType === 'mbti' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 52, fontWeight: 800, background: 'linear-gradient(135deg,var(--accent2),var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: 1 }}>{row.mbti_code || '????'}</div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Personality Type</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{row.career_path || '—'}</div>
          </div>
        </div>
      )}

      {testType === 'career' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div style={{ background: 'var(--surface2)', borderRadius: 14, padding: 16, gridColumn: 'span 2' }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--muted)', marginBottom: 8 }}>RIASEC Code</div>
            <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 28, fontWeight: 800, color: 'var(--accent)', letterSpacing: '.05em', lineHeight: 1 }}>{row.iq_score || '—'}</div>
          </div>
          <div style={{ background: 'var(--surface2)', borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--muted)', marginBottom: 8 }}>Top Match</div>
            <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 800, color: 'var(--accent2)', lineHeight: 1.3 }}>{row.career_path || '—'}</div>
          </div>
        </div>
      )}

      {testType === 'stress' && (() => {
        const sp = row.iq_score || 0
        const sc = sp > 65 ? 'var(--accent4)' : sp > 35 ? 'var(--accent3)' : 'var(--accent)'
        return (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 16 }}>
              {[['Stress Score', sp + '%', sc], ['Risk Level', row.career_path || '—', sc], ['Status', sp <= 35 ? 'Healthy' : sp <= 65 ? 'Monitor' : 'Action needed', 'var(--accent2)']].map(([label, val, color]) => (
                <div key={label} style={{ background: 'var(--surface2)', borderRadius: 14, padding: 16 }}>
                  <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--muted)', marginBottom: 8 }}>{label}</div>
                  <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: label === 'Status' ? 14 : 24, fontWeight: 800, color, lineHeight: 1 }}>{val}</div>
                </div>
              ))}
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>
                <span>Stress Level</span><span>{sp}%</span>
              </div>
              <div style={{ height: 6, background: 'var(--surface2)', borderRadius: 100, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${sp}%`, background: `linear-gradient(90deg,var(--accent),${sc})`, borderRadius: 100, transition: 'width 1s cubic-bezier(.4,0,.2,1)' }} />
              </div>
            </div>
          </>
        )
      })()}

      {testType !== 'mbti' && testType !== 'stress' && row.career_path && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 600 }}>
            {testType === 'stress' ? 'Stress Level' : 'Recommended Career Path'}
          </div>
          <div style={{ display: 'inline-block', padding: '10px 20px', background: 'linear-gradient(135deg,rgba(99,245,188,.15),rgba(167,139,250,.15))', border: '1px solid rgba(99,245,188,.2)', borderRadius: 100, fontWeight: 700, fontSize: 15, color: 'var(--accent)' }}>{row.career_path}</div>
        </div>
      )}

      <Link to={`/${testType}-test`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 4, padding: '12px 22px', border: '1.5px solid var(--border)', color: 'var(--muted)', borderRadius: 12, fontSize: 13, fontWeight: 500, textDecoration: 'none', transition: 'all .2s' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)' }}>
        Retake this test →
      </Link>
    </div>
  )
}

export default function Results() {
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState(searchParams.get('email') || '')
  const [state, setState] = useState('idle') // idle | loading | results | empty | error
  const [rows, setRows] = useState([])

  const lookup = async () => {
    if (!email || !email.includes('@')) return
    setState('loading')
    try {
      const { data, error } = await supabase.from('career_tests').select('*').eq('email', email).order('created_at', { ascending: false })
      if (error) throw error
      if (!data || data.length === 0) { setState('empty') }
      else { setRows(data); setState('results') }
    } catch { setState('error') }
  }

  useEffect(() => { if (searchParams.get('email')) lookup() }, [])

  return (
    <>
      <Background />
      <Nav variant="results" />

      <main style={{ position: 'relative', zIndex: 1, maxWidth: 760, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div className="badge"><div className="badge-dot" />Results Lookup</div>
          <h1 style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 'clamp(36px,6vw,60px)', fontWeight: 800, letterSpacing: '-.03em', marginBottom: 16, lineHeight: 1.05 }}>Your Test Results</h1>
          <p style={{ fontSize: 16, color: 'var(--muted)', lineHeight: 1.7 }}>Enter the email you used during any assessment to retrieve your full results.</p>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 24, padding: 36, marginBottom: 32 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--muted)', letterSpacing: '.04em', marginBottom: 12 }}>Email address used during assessment</label>
          <div style={{ display: 'flex', gap: 12 }}>
            <input style={{ flex: 1, padding: '16px 20px', background: 'var(--surface2)', border: '1.5px solid var(--border)', borderRadius: 14, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", fontSize: 15, outline: 'none' }}
              type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
              onKeyDown={e => e.key === 'Enter' && lookup()}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            <button onClick={lookup} disabled={state === 'loading'}
              style={{ padding: '16px 28px', background: 'var(--accent)', color: '#000', fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 15, border: 'none', borderRadius: 14, cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 8, transition: 'all .2s' }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              Search
            </button>
          </div>
        </div>

        {state === 'loading' && (
          <div style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', border: '3px solid var(--surface2)', borderTopColor: 'var(--accent)', animation: 'spin .8s linear infinite', margin: '0 auto 20px' }} />
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Searching your results...</div>
            <div style={{ fontSize: 14, color: 'var(--muted)' }}>Looking up assessments linked to your email.</div>
          </div>
        )}

        {state === 'empty' && (
          <div style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>No results found</div>
            <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 24 }}>No assessments found for <strong style={{ color: 'var(--text)' }}>{email}</strong>.<br />Make sure you entered the exact email used during the test.</div>
            <Link to="/" className="btn-primary" style={{ display: 'inline-flex' }}>Take an Assessment →</Link>
          </div>
        )}

        {state === 'error' && (
          <div style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Something went wrong</div>
            <div style={{ fontSize: 14, color: 'var(--muted)' }}>Could not connect to the database. Please try again.</div>
          </div>
        )}

        {state === 'results' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {rows.map((row, i) => <ResultCard key={i} row={row} />)}
            </div>
            <div style={{ marginTop: 40, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 36, textAlign: 'center' }}>
              <h3 style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 22, fontWeight: 800, marginBottom: 10 }}>Want to explore more?</h3>
              <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 20 }}>Try one of our other assessments — each reveals a different dimension of your professional profile.</p>
              <Link className="btn-primary" to="/">View All Assessments →</Link>
            </div>
          </>
        )}
      </main>

      <style>{`
        .test-type-badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 100px; font-size: 12px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; }
        .type-iq { background: rgba(99,245,188,.1); color: var(--accent); }
        .type-mbti { background: rgba(167,139,250,.1); color: var(--accent2); }
        .type-career { background: rgba(245,159,99,.1); color: var(--accent3); }
        .type-stress { background: rgba(245,99,160,.1); color: var(--accent4); }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  )
}
