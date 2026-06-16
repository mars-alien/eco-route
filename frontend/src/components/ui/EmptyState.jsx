export default function EmptyState({ message = 'No data available.', icon = '📭' }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 'var(--s3)',
      padding: 'var(--s10)',
      color: 'var(--text-muted)',
    }}>
      <span style={{ fontSize: '2rem' }}>{icon}</span>
      <p style={{ fontSize: 'var(--text-sm)' }}>{message}</p>
    </div>
  )
}
