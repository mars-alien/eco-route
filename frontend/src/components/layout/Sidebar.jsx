import { NavLink } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

const ADMIN_LINKS = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: '⬡' },
  { to: '/admin/orders',    label: 'Orders',    icon: '📦' },
  { to: '/admin/optimize',  label: 'Optimizer', icon: '🗺' },
]
const DRIVER_LINKS = [
  { to: '/driver/dashboard', label: 'Dashboard', icon: '⬡' },
  { to: '/driver/route',     label: 'My Route',  icon: '🗺' },
]

export default function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onMobileClose }) {
  const role = useAuthStore((s) => s.role)
  const links = role === 'admin' ? ADMIN_LINKS : DRIVER_LINKS

  const sidebarStyle = {
    width: collapsed ? '74px' : '240px',
    minWidth: collapsed ? '74px' : '240px',
    background: 'var(--sidebar-bg)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    transition: 'width 220ms ease, min-width 220ms ease',
    overflow: 'hidden',
    height: '100%',
    boxShadow: 'var(--shadow-sidebar)',
    position: 'relative',
    zIndex: 10,
    flexShrink: 0,
  }

  const mobileSidebarStyle = {
    ...sidebarStyle,
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100%',
    width: '240px',
    minWidth: '240px',
    zIndex: 1000,
    transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
    transition: 'transform 240ms ease',
    boxShadow: mobileOpen ? '4px 0 32px rgba(120,80,0,0.18)' : 'none',
  }

  const content = (isMobile) => (
    <>
      {/* Logo header */}
      <div style={{
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--s4)',
        gap: '12px',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: 'var(--grad-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '18px', flexShrink: 0,
          boxShadow: '0 4px 12px rgba(255,159,28,0.30)',
        }}>🌿</div>
        {(!collapsed || isMobile) && (
          <span style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 700, fontSize: '20px',
            color: 'var(--text-primary)',
            whiteSpace: 'nowrap',
            letterSpacing: '0.01em',
          }}>
            EcoRoute
          </span>
        )}
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, padding: '12px 10px' }}>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={isMobile ? onMobileClose : undefined}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              marginBottom: '4px',
              color: isActive ? 'var(--nav-active-text)' : 'var(--text-secondary)',
              background: isActive ? 'var(--nav-active-bg)' : 'transparent',
              textDecoration: 'none',
              fontSize: '15px',
              fontWeight: isActive ? 700 : 500,
              fontFamily: 'var(--font)',
              borderRadius: 'var(--r-md)',
              transition: 'all 160ms ease',
              whiteSpace: 'nowrap',
              boxShadow: isActive ? '0 2px 8px rgba(255,180,0,0.18)' : 'none',
            })}
          >
            <span style={{ flexShrink: 0, fontSize: '16px', width: '20px', textAlign: 'center' }}>
              {link.icon}
            </span>
            {(!collapsed || isMobile) && link.label}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle (desktop only) */}
      {!isMobile && (
        <button
          onClick={onToggleCollapse}
          style={{
            background: 'none',
            border: 'none',
            borderTop: '1px solid var(--border)',
            color: 'var(--text-muted)',
            padding: '14px var(--s4)',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 600,
            fontFamily: 'var(--font)',
            textAlign: 'left',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'color 150ms',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <span style={{ fontSize: '14px' }}>{collapsed ? '→' : '←'}</span>
          {!collapsed && 'Collapse'}
        </button>
      )}
    </>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hide-mobile" style={sidebarStyle}>
        {content(false)}
      </aside>

      {/* Mobile sidebar */}
      <aside className="show-mobile" style={{ ...mobileSidebarStyle, display: 'flex', flexDirection: 'column' }}>
        {content(true)}
      </aside>
    </>
  )
}
