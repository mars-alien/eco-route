import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'

const ADMIN_LINKS = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: '▦' },
  { to: '/admin/orders',    label: 'Orders',    icon: '📦' },
  { to: '/admin/optimize',  label: 'Optimizer', icon: '🗺' },
]

const DRIVER_LINKS = [
  { to: '/driver/dashboard', label: 'Dashboard', icon: '▦' },
  { to: '/driver/route',     label: 'My Route',  icon: '🗺' },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const role = useAuthStore((s) => s.role)
  const links = role === 'admin' ? ADMIN_LINKS : DRIVER_LINKS

  return (
    <aside style={{
      width: collapsed ? '56px' : '220px',
      minWidth: collapsed ? '56px' : '220px',
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 200ms ease, min-width 200ms ease',
      overflow: 'hidden',
      height: '100%',
    }}>
      <div style={{
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        padding: 'var(--s4)',
        borderBottom: '1px solid var(--border)',
        gap: 'var(--s3)',
      }}>
        <span style={{ fontSize: '18px', flexShrink: 0 }}>🌿</span>
        {!collapsed && (
          <span style={{ fontWeight: 600, fontSize: 'var(--text-md)', whiteSpace: 'nowrap' }}>
            EcoRoute
          </span>
        )}
      </div>

      <nav style={{ flex: 1, padding: 'var(--s3) 0' }}>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--s3)',
              padding: 'var(--s2) var(--s4)',
              color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
              background: isActive ? 'var(--accent-dim)' : 'transparent',
              textDecoration: 'none',
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
              borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
              transition: 'all 120ms ease',
              whiteSpace: 'nowrap',
            })}
          >
            <span style={{ flexShrink: 0, fontSize: '15px' }}>{link.icon}</span>
            {!collapsed && link.label}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={() => setCollapsed((c) => !c)}
        style={{
          background: 'none',
          border: 'none',
          borderTop: '1px solid var(--border)',
          color: 'var(--text-muted)',
          padding: 'var(--s3) var(--s4)',
          cursor: 'pointer',
          fontSize: '12px',
          textAlign: 'left',
          whiteSpace: 'nowrap',
        }}
      >
        {collapsed ? '▶' : '◀ Collapse'}
      </button>
    </aside>
  )
}
