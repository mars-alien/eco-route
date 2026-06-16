import { useState } from 'react'
import { Link } from 'react-router-dom'
import ProtectedRoute from '../../components/layout/ProtectedRoute'
import { useOrders } from '../../hooks/useOrders'
import OrderTable from '../../components/orders/OrderTable'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'

const FILTERS = ['ALL', 'PENDING', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED']

export default function OrdersPage() {
  const { data: orders, isLoading } = useOrders()
  const [filter, setFilter] = useState('ALL')

  const filtered = filter === 'ALL'
    ? orders ?? []
    : (orders ?? []).filter((o) => o.status === filter)

  return (
    <ProtectedRoute role="admin" title="Orders">
      <div className="page-header">
        <h1 className="page-title">Orders</h1>
        <Link to="/admin/orders/create">
          <Button variant="primary">+ New Order</Button>
        </Link>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: 'var(--s2)', marginBottom: 'var(--s4)', borderBottom: '1px solid var(--border)', paddingBottom: 'var(--s4)' }}>
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                background: filter === f ? 'var(--accent-dim)' : 'transparent',
                color: filter === f ? 'var(--accent)' : 'var(--text-secondary)',
                border: filter === f ? '1px solid var(--accent)' : '1px solid transparent',
                borderRadius: 'var(--r-sm)',
                padding: '2px var(--s3)',
                fontSize: 'var(--text-xs)',
                fontWeight: 500,
                cursor: 'pointer',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--s10)' }}>
            <Spinner />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState message="No orders found." />
        ) : (
          <OrderTable orders={filtered} />
        )}
      </div>
    </ProtectedRoute>
  )
}
