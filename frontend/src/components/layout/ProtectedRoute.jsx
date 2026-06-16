import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function ProtectedRoute({ children, role: requiredRole, title, mapLayout = false }) {
  const { token, role } = useAuthStore()

  if (!token) return <Navigate to="/login" replace />
  if (requiredRole && role !== requiredRole) {
    return <Navigate to={role === 'admin' ? '/admin/dashboard' : '/driver/dashboard'} replace />
  }

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar title={title} />
        <main style={{
          flex: 1,
          overflow: mapLayout ? 'hidden' : 'auto',
          padding: mapLayout ? '0' : 'var(--s6)',
        }}>
          {children}
        </main>
      </div>
    </div>
  )
}
