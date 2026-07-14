import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function ProtectedRoute({ children, role: requiredRole, title, mapLayout = false }) {
  const { token, role } = useAuthStore()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  if (!token) return <Navigate to="/login" replace />
  if (requiredRole && role !== requiredRole) {
    return <Navigate to={role === 'admin' ? '/admin/dashboard' : '/driver/dashboard'} replace />
  }

  return (
    <div style={{ display: 'flex', height: '100%', position: 'relative' }}>
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Mobile scrim */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(60,40,0,0.35)',
            zIndex: 999,
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <Topbar title={title} onMenuToggle={() => setMobileOpen((o) => !o)} />
        <main style={{
          flex: 1,
          overflow: mapLayout ? 'hidden' : 'auto',
          padding: mapLayout ? '0' : 'var(--s6)',
          background: mapLayout ? 'transparent' : 'transparent',
        }}>
          {children}
        </main>
      </div>
    </div>
  )
}
