import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export default function Topbar({ title, onMenuToggle }) {
  const { user, role, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header style={{
      height: '64px',
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 var(--s6)',
      flexShrink: 0,
      boxShadow: '0 2px 8px rgba(180,130,20,0.06)',
      position: 'sticky',
      top: 0,
      zIndex: 5,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Hamburger — mobile only */}
        <button
          className="show-mobile"
          onClick={onMenuToggle}
          style={{
            background: 'none', border: 'none',
            cursor: 'pointer', padding: '6px',
            display: 'flex', flexDirection: 'column',
            gap: '4px', borderRadius: 'var(--r-sm)',
          }}
          aria-label="Open menu"
        >
          {[0,1,2].map((i) => (
            <span key={i} style={{ display: 'block', width: '20px', height: '2px', background: 'var(--text-primary)', borderRadius: '2px' }} />
          ))}
        </button>

        <span style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 700, fontSize: '20px',
          color: 'var(--text-primary)',
        }}>{title}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* User info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontWeight: 500 }}>
            {user?.name}
          </span>
          <span style={{
            padding: '3px 10px',
            background: 'var(--grad-primary)',
            color: '#fff',
            borderRadius: '50px',
            fontSize: '11px',
            fontWeight: 700,
            fontFamily: 'var(--font-heading)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            boxShadow: '0 3px 8px rgba(255,159,28,0.28)',
          }}>
            {role}
          </span>
        </div>

        {/* Sign out */}
        <button
          onClick={handleLogout}
          style={{
            background: 'var(--surface-raised)',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--r-md)',
            padding: '6px 14px',
            color: 'var(--text-secondary)',
            fontSize: '13px',
            fontWeight: 600,
            fontFamily: 'var(--font)',
            cursor: 'pointer',
            transition: 'all 150ms',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--danger)'; e.currentTarget.style.color = 'var(--danger)' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
        >
          Sign out
        </button>
      </div>
    </header>
  )
}
