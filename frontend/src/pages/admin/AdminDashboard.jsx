import ProtectedRoute from '../../components/layout/ProtectedRoute'
import { useOrders } from '../../hooks/useOrders'
import { useAvailableDrivers } from '../../hooks/useDrivers'
import { useRoutePlans } from '../../hooks/useRoutes'
import Spinner from '../../components/ui/Spinner'

function StatCard({ label, value, accent }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={accent ? { color: 'var(--accent)' } : {}}>
        {value ?? '—'}
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const orders = useOrders()
  const drivers = useAvailableDrivers()
  const plans = useRoutePlans()

  const pending = orders.data?.filter((o) => o.status === 'PENDING').length ?? 0
  const today = new Date().toDateString()
  const todayPlans = plans.data?.length ?? 0

  return (
    <ProtectedRoute role="admin" title="Dashboard">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--s4)', marginBottom: 'var(--s6)' }}>
        <StatCard label="Total Orders" value={orders.isLoading ? '…' : orders.data?.length} />
        <StatCard label="Pending Orders" value={orders.isLoading ? '…' : pending} />
        <StatCard label="Available Drivers" value={drivers.isLoading ? '…' : drivers.data?.length} accent />
        <StatCard label="Route Plans" value={plans.isLoading ? '…' : todayPlans} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s4)' }}>
        <div className="card">
          <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 600, marginBottom: 'var(--s4)' }}>Recent Orders</h2>
          {orders.isLoading ? <Spinner /> : (
            <table className="data-table">
              <thead>
                <tr><th>Customer</th><th>Status</th></tr>
              </thead>
              <tbody>
                {orders.data?.slice(0, 6).map((o) => (
                  <tr key={o.id}>
                    <td>{o.customer_name}</td>
                    <td>
                      <span className={`status-badge ${o.status.toLowerCase().replace('_', '')}`}>
                        {o.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 600, marginBottom: 'var(--s4)' }}>Available Drivers</h2>
          {drivers.isLoading ? <Spinner /> : (
            <table className="data-table">
              <thead>
                <tr><th>Name</th><th>Vehicle</th></tr>
              </thead>
              <tbody>
                {drivers.data?.map((d) => (
                  <tr key={d.id}>
                    <td>{d.name}</td>
                    <td style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>
                      {d.vehicle_type}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
