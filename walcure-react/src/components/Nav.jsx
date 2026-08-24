import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Nav({ variant = 'home', accentGradient = 'linear-gradient(135deg, #63f5bc, #a78bfa)' }) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <nav>
      <Link className="logo" to="/" onClick={close}>
        <div className="logo-mark" style={{ background: accentGradient }}>W</div>
        <span className="logo-text">WALCURE</span>
      </Link>

      <button
        className={`nav-toggle${open ? ' open' : ''}`}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span />
        <span />
        <span />
      </button>

      {variant === 'home' && (
        <div className={`nav-right${open ? ' open' : ''}`}>
          <Link className="nav-link" to="/spinner" onClick={close}>Spinner 🎰</Link>
          <Link className="nav-link" to="/results" onClick={close}>My Results</Link>
          <Link className="nav-link" to="/" onClick={close}>About</Link>
          <Link className="nav-cta" to="/results" onClick={close}>Check Results →</Link>
        </div>
      )}

      {variant === 'test' && (
        <div className={`nav-right${open ? ' open' : ''}`}>
          <Link className="nav-link" to="/" onClick={close}>← All Tests</Link>
          <Link className="nav-link" to="/results" onClick={close}>My Results</Link>
        </div>
      )}

      {variant === 'results' && (
        <div className={`nav-right${open ? ' open' : ''}`}>
          <Link className="nav-link" to="/" onClick={close}>← All Tests</Link>
          <Link className="nav-link" to="/" onClick={close}>Home</Link>
        </div>
      )}
    </nav>
  )
}
