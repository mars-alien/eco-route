import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import Button from '../ui/Button'

export default function Topbar({ title }) {
  const { user, role, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header style={{
      height: '56px',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 var(--s6)',
    }}>
      <span style={{ fontWeight: 500, fontSize: 'var(--text-md)' }}>{title}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s4)' }}>
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
          {user?.name}
          <span style={{
            marginLeft: 'var(--s2)',
            padding: '1px var(--s2)',
            background: 'var(--accent-dim)',
            color: 'var(--accent)',
            borderRadius: 'var(--r-sm)',
            fontSize: 'var(--text-xs)',
            fontWeight: 500,
            textTransform: 'uppercase',
          }}>
            {role}
          </span>
        </span>
        <Button variant="ghost" onClick={handleLogout} style={{ fontSize: 'var(--text-sm)', padding: 'var(--s1) var(--s3)' }}>
          Sign out
        </Button>
      </div>
    </header>
  )
}
