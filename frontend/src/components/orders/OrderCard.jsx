import StatusBadge from './StatusBadge'

export default function OrderCard({ order }) {
  return (
    <div className="card" style={{ marginBottom: 'var(--s3)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontWeight: 500 }}>{order.customer_name}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--s1)' }}>
            {order.address}
          </div>
        </div>
        <StatusBadge status={order.status} />
      </div>
    </div>
  )
}
