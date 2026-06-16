const CLASS_MAP = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  IN_TRANSIT: 'transit',
  DELIVERED: 'delivered',
}

export default function StatusBadge({ status }) {
  return (
    <span className={`status-badge ${CLASS_MAP[status] || 'pending'}`}>
      {status?.replace('_', ' ')}
    </span>
  )
}
