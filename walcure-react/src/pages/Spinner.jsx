import { useState, useEffect, useRef, useCallback } from 'react'
import Background from '../components/Background'
import Nav from '../components/Nav'

const SLICE_COLORS = ['#63f5bc', '#a78bfa', '#f59e63', '#f563a0', '#4299e1', '#e8e8f0']
const TEXT_COLORS = ['#000', '#fff', '#000', '#fff', '#fff', '#000']

function drawWheel(ctx, choices, angle) {
  const canvas = ctx.canvas
  const cx = canvas.width / 2, cy = canvas.height / 2, r = cx - 4
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  const n = choices.length
  if (n < 2) return
  const arc = (2 * Math.PI) / n

  for (let i = 0; i < n; i++) {
    const start = angle + i * arc - Math.PI / 2
    const end = start + arc
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, start, end); ctx.closePath()
    ctx.fillStyle = SLICE_COLORS[i % SLICE_COLORS.length]; ctx.fill()
    ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.lineWidth = 1.5; ctx.stroke()

    ctx.save(); ctx.translate(cx, cy); ctx.rotate(start + arc / 2)
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle'
    const fontSize = Math.max(10, Math.min(16, 210 / n))
    ctx.font = `800 ${fontSize}px 'DM Sans', sans-serif`
    ctx.fillStyle = TEXT_COLORS[i % TEXT_COLORS.length]
    ctx.fillText(choices[i].toUpperCase(), r - 14, 0); ctx.restore()
  }

  ctx.beginPath(); ctx.arc(cx, cy, 20, 0, 2 * Math.PI)
  ctx.fillStyle = '#0a0a0f'; ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 2; ctx.stroke()
}

function easeOut(t) { return 1 - Math.pow(1 - t, 4) }

const DURATION = 5000

export default function Spinner() {
  const canvasRef = useRef(null)
  const [inputVal, setInputVal] = useState('Drink, Gym, Hike, Karaoke, Sleep, Code')
  const [choices, setChoices] = useState(['Drink', 'Gym', 'Hike', 'Karaoke', 'Sleep', 'Code'])
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState(null)
  const angleRef = useRef(0)
  const rafRef = useRef(null)
  const animDataRef = useRef({ from: 0, to: 0, start: null })

  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    drawWheel(ctx, choices, angleRef.current)
  }, [choices])

  useEffect(() => { redraw() }, [redraw])

  const updateWheel = () => {
    const vals = inputVal.split(',').map(s => s.trim()).filter(Boolean)
    if (vals.length < 2) { alert('Enter at least 2 choices!'); return }
    setChoices(vals)
  }

  const animate = useCallback((ts) => {
    const data = animDataRef.current
    if (!data.start) data.start = ts
    const t = Math.min((ts - data.start) / DURATION, 1)
    angleRef.current = data.from + (data.to - data.from) * easeOut(t)

    const canvas = canvasRef.current
    if (canvas) { const ctx = canvas.getContext('2d'); drawWheel(ctx, choices, angleRef.current) }

    if (t < 1) {
      rafRef.current = requestAnimationFrame(animate)
    } else {
      const n = choices.length, arc = (2 * Math.PI) / n
      const normalized = ((angleRef.current % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
      const idx = Math.floor(((2 * Math.PI - normalized) % (2 * Math.PI)) / arc) % n
      setResult(choices[idx])
      setSpinning(false)
    }
  }, [choices])

  const spinWheel = () => {
    if (spinning || choices.length < 2) return
    setSpinning(true)
    setResult(null)
    animDataRef.current = { from: angleRef.current, to: angleRef.current + 10 * 2 * Math.PI + Math.random() * 2 * Math.PI, start: null }
    rafRef.current = requestAnimationFrame(animate)
  }

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }, [])

  return (
    <>
      <Background />
      <Nav variant="home" />

      <main style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: '40px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 42, fontWeight: 800, marginBottom: 8 }}>Decision Spinner</h1>
          <p style={{ color: 'var(--muted)', fontSize: 16 }}>Custom decision maker for your daily tasks.</p>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: 24, borderRadius: 20, marginBottom: 36, width: '100%', maxWidth: 540 }}>
          <label style={{ display: 'block', fontSize: 11, color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, textAlign: 'left', marginBottom: 10 }}>Enter Choices (Separate with Commas)</label>
          <input type="text" value={inputVal} onChange={e => setInputVal(e.target.value)}
            placeholder="Choice 1, Choice 2, ..."
            style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', padding: 16, borderRadius: 12, fontFamily: 'inherit', fontSize: 15, outline: 'none', marginBottom: 14 }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          <button onClick={updateWheel}
            style={{ width: '100%', padding: 12, background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--accent)', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 13, transition: 'all 0.2s' }}>
            SYNC WHEEL DATA
          </button>
        </div>

        <div style={{ position: 'relative', width: 380, height: 380 }}>
          <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '14px solid transparent', borderRight: '14px solid transparent', borderTop: '28px solid var(--text)', zIndex: 10, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))' }} />
          <canvas ref={canvasRef} width={380} height={380} style={{ width: 380, height: 380, borderRadius: '50%', boxShadow: '0 25px 60px rgba(0,0,0,0.6)', display: 'block' }} />
        </div>

        <button onClick={spinWheel} disabled={spinning}
          style={{ marginTop: 36, padding: '20px 60px', background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 16, fontSize: 16, fontWeight: 800, cursor: spinning ? 'not-allowed' : 'pointer', transition: 'all 0.3s', boxShadow: '0 10px 40px rgba(99,245,188,0.3)', opacity: spinning ? 0.5 : 1 }}>
          {spinning ? 'Spinning...' : 'SPIN THE WHEEL'}
        </button>
      </main>

      {/* RESULT MODAL */}
      {result && (
        <>
          <div onClick={() => setResult(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 140 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: 'var(--surface)', border: '1px solid var(--accent)', padding: 48, borderRadius: 32, zIndex: 150, textAlign: 'center', minWidth: 320, animation: 'fadeUp 0.3s ease' }}>
            <div style={{ fontSize: 13, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 3, marginBottom: 12, fontWeight: 600 }}>Selected Choice</div>
            <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 48, fontWeight: 800, color: 'var(--accent)', marginBottom: 28 }}>{result}</div>
            <button onClick={() => setResult(null)}
              style={{ padding: '16px 36px', background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 14, cursor: 'pointer', fontWeight: 700 }}>
              Try Again
            </button>
          </div>
        </>
      )}
    </>
  )
}
