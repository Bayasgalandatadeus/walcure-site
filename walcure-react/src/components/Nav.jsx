import { Link } from 'react-router-dom'

export default function Nav({ variant = 'home', accentGradient = 'linear-gradient(135deg, #63f5bc, #a78bfa)' }) {
  return (
    <nav>
      <Link className="logo" to="/">
        <div className="logo-mark" style={{ background: accentGradient }}>W</div>
        <span className="logo-text">WALCURE</span>
      </Link>

      {variant === 'home' && (
        <div className="nav-right">
          <Link className="nav-link" to="/spinner">Spinner 🎰</Link>
          <Link className="nav-link" to="/results">My Results</Link>
          <Link className="nav-link" to="/">About</Link>
          <Link className="nav-cta" to="/results">Check Results →</Link>
        </div>
      )}

      {variant === 'test' && (
        <div className="nav-right">
          <Link className="nav-link" to="/">← All Tests</Link>
          <Link className="nav-link" to="/results">My Results</Link>
        </div>
      )}

      {variant === 'results' && (
        <div className="nav-right">
          <Link className="nav-link" to="/">← All Tests</Link>
          <Link className="nav-link" to="/">Home</Link>
        </div>
      )}
    </nav>
  )
}
