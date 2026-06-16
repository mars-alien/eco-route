import StatusBadge from './StatusBadge'
import Button from '../ui/Button'
import { useDeleteOrder } from '../../hooks/useOrders'

export default function OrderTable({ orders }) {
  const deleteOrder = useDeleteOrder()

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Customer</th>
          <th>Address</th>
          <th>Status</th>
          <th>Created</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {orders.map((o) => (
          <tr key={o.id}>
            <td style={{ fontWeight: 500 }}>{o.customer_name}</td>
            <td style={{ color: 'var(--text-secondary)' }}>{o.address}</td>
            <td><StatusBadge status={o.status} /></td>
            <td style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>
              {new Date(o.created_at).toLocaleDateString()}
            </td>
            <td>
              {o.status === 'PENDING' && (
                <Button
                  variant="danger"
                  style={{ fontSize: 'var(--text-xs)', padding: '2px var(--s3)' }}
                  disabled={deleteOrder.isPending}
                  onClick={() => deleteOrder.mutate(o.id)}
                >
                  Delete
                </Button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
