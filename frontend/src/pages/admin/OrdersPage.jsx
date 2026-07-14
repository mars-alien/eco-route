import { useState } from 'react'
import { Link } from 'react-router-dom'
import ProtectedRoute from '../../components/layout/ProtectedRoute'
import { useOrders } from '../../hooks/useOrders'
import OrderTable from '../../components/orders/OrderTable'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'

const FILTERS = [
  { id: 'ALL',        label: 'All' },
  { id: 'PENDING',    label: 'Pending' },
  { id: 'ASSIGNED',   label: 'Assigned' },
  { id: 'IN_TRANSIT', label: 'In Transit' },
  { id: 'DELIVERED',  label: 'Delivered' },
]

function FilterTab({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '7px 16px',
        border: active ? '1.5px solid var(--accent)' : '1.5px solid transparent',
        borderRadius: '50px',
        background: active ? 'var(--accent-dim)' : 'transparent',
        color: active ? '#92600A' : 'var(--text-secondary)',
        fontSize: '13px',
        fontWeight: active ? 700 : 500,
        fontFamily: 'var(--font)',
        cursor: 'pointer',
        transition: 'all 150ms',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = '#FFF8E8' }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent' }}
    >
      {children}
    </button>
  )
}

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
          <Button variant="primary" style={{ fontSize: '14px' }}>＋ New Order</Button>
        </Link>
      </div>

      <div className="card animate-in" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Filter bar */}
        <div className="filter-tab-row" style={{
          display: 'flex',
          gap: 'var(--s2)',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          flexWrap: 'wrap',
          background: 'var(--surface-raised)',
        }}>
          {FILTERS.map((f) => (
            <FilterTab key={f.id} active={filter === f.id} onClick={() => setFilter(f.id)}>
              {f.label}
            </FilterTab>
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: '4px 0' }}>
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--s10)' }}>
              <Spinner />
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 'var(--s10)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
              No {filter === 'ALL' ? '' : filter.toLowerCase().replace('_', ' ')} orders found.
            </div>
          ) : (
            <div className="table-scroll-wrapper"><OrderTable orders={filtered} /></div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
