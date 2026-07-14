import ProtectedRoute from '../../components/layout/ProtectedRoute'
import { useOrders } from '../../hooks/useOrders'
import { useAvailableDrivers } from '../../hooks/useDrivers'
import { useRoutePlans } from '../../hooks/useRoutes'
import Spinner from '../../components/ui/Spinner'

const STAT_CONFIGS = [
  { key: 'total',   label: 'Total Orders',      icon: '📦', grad: 'linear-gradient(135deg,#FFE082,#FFC107)', iconBg: '#FFF3C4' },
  { key: 'pending', label: 'Pending Orders',     icon: '⏳', grad: 'linear-gradient(135deg,#FFBA74,#FF8C00)', iconBg: '#FFE8CC' },
  { key: 'drivers', label: 'Available Drivers',  icon: '🚗', grad: 'linear-gradient(135deg,#6EE2B4,#2F9E6E)', iconBg: '#D0F5E8' },
  { key: 'plans',   label: 'Route Plans',        icon: '🗺', grad: 'linear-gradient(135deg,#A5B4FC,#7C8CE0)', iconBg: '#E8ECFD' },
]

function GradientStatCard({ label, value, icon, grad, iconBg, loading }) {
  return (
    <div className="animate-in" style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r-lg)',
      padding: '24px',
      boxShadow: 'var(--shadow-stat)',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{
          width: '44px', height: '44px',
          borderRadius: '12px',
          background: iconBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '20px',
        }}>{icon}</div>
        <div style={{
          width: '8px', height: '8px',
          borderRadius: '50%',
          background: grad,
        }} />
      </div>
      <div>
        <div style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'var(--text-2xl)',
          fontWeight: 700,
          backgroundImage: grad,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          lineHeight: 1,
          marginBottom: '6px',
        }}>
          {loading ? '—' : (value ?? '—')}
        </div>
        <div style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'var(--text-xs)',
          fontWeight: 700,
          letterSpacing: '0.07em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
        }}>{label}</div>
      </div>
    </div>
  )
}

function DriverRow({ driver }) {
  const initial = driver.name?.[0]?.toUpperCase() ?? '?'
  const colors = ['#FF9F1C', '#2F9E6E', '#7C8CE0', '#D6455D']
  const bg = colors[driver.name?.charCodeAt(0) % colors.length] ?? '#FF9F1C'

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '10px 0',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <div style={{
        width: '36px', height: '36px', borderRadius: '50%',
        background: `linear-gradient(135deg,${bg}CC,${bg})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '15px',
        color: '#fff', flexShrink: 0,
        boxShadow: `0 3px 10px ${bg}44`,
      }}>{initial}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>{driver.name}</div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', textTransform: 'capitalize' }}>{driver.vehicle_type}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span className="online-dot" />
        <span style={{ fontSize: '11px', color: 'var(--success)', fontWeight: 600 }}>Online</span>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const orders = useOrders()
  const drivers = useAvailableDrivers()
  const plans = useRoutePlans()

  const pending = orders.data?.filter((o) => o.status === 'PENDING').length ?? 0

  const statValues = {
    total:   orders.data?.length,
    pending,
    drivers: drivers.data?.length,
    plans:   plans.data?.length,
  }

  return (
    <ProtectedRoute role="admin" title="Dashboard">
      {/* Stat tiles */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'var(--s4)',
        marginBottom: 'var(--s6)',
      }}>
        {STAT_CONFIGS.map((cfg) => (
          <GradientStatCard
            key={cfg.key}
            label={cfg.label}
            value={statValues[cfg.key]}
            icon={cfg.icon}
            grad={cfg.grad}
            iconBg={cfg.iconBg}
            loading={orders.isLoading || drivers.isLoading || plans.isLoading}
          />
        ))}
      </div>

      {/* Bottom cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--s4)' }}>
        {/* Recent Orders */}
        <div className="card animate-in">
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700, marginBottom: 'var(--s4)', color: 'var(--text-primary)' }}>
            Recent Orders
          </h2>
          {orders.isLoading ? <Spinner /> : (
            <table className="data-table">
              <thead>
                <tr><th>Customer</th><th>Status</th></tr>
              </thead>
              <tbody>
                {orders.data?.slice(0, 7).map((o) => {
                  const statusKey = o.status.toLowerCase().replace('_', '')
                  return (
                    <tr key={o.id}>
                      <td style={{ fontWeight: 500 }}>{o.customer_name}</td>
                      <td>
                        <span className={`status-badge ${statusKey}`}>
                          {o.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Available Drivers */}
        <div className="card animate-in">
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700, marginBottom: 'var(--s4)', color: 'var(--text-primary)' }}>
            Available Drivers
          </h2>
          {drivers.isLoading ? <Spinner /> : (
            <div>
              {drivers.data?.map((d) => <DriverRow key={d.id} driver={d} />)}
              {!drivers.data?.length && (
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>
                  No drivers available
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
