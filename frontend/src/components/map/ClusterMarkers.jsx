import { Marker, Popup } from 'react-leaflet'
import { divIcon } from 'leaflet'

const CLUSTER_COLORS = [
  'var(--cluster-0)',
  'var(--cluster-1)',
  'var(--cluster-2)',
  'var(--cluster-3)',
  'var(--cluster-4)',
]

function makeIcon(color, seq) {
  return divIcon({
    className: '',
    html: `<div class="cluster-marker" style="background:${color}">${seq ?? ''}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  })
}

export default function ClusterMarkers({ orders = [], clusters = [] }) {
  if (clusters.length === 0) {
    return orders.map((o) => (
      <Marker key={o.id} position={[o.lat, o.lng]} icon={makeIcon('var(--text-muted)', '')}>
        <Popup>
          <strong>{o.customer_name}</strong><br />{o.address}
        </Popup>
      </Marker>
    ))
  }

  const orderCluster = {}
  clusters.forEach((c, ci) => {
    c.order_ids.forEach((oid) => { orderCluster[oid] = ci })
  })

  return orders.map((o) => {
    const ci = orderCluster[o.id] ?? 0
    const color = CLUSTER_COLORS[ci % CLUSTER_COLORS.length]
    return (
      <Marker key={o.id} position={[o.lat, o.lng]} icon={makeIcon(color, '')}>
        <Popup>
          <strong>{o.customer_name}</strong><br />{o.address}<br />
          <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>Cluster {ci + 1}</span>
        </Popup>
      </Marker>
    )
  })
}
