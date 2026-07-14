import { Polyline, Marker, Popup } from 'react-leaflet'
import { divIcon } from 'leaflet'

const CLUSTER_COLORS = ['var(--cluster-0)', 'var(--cluster-1)', 'var(--cluster-2)', 'var(--cluster-3)', 'var(--cluster-4)']

function seqIcon(seq, color) {
  return divIcon({
    className: '',
    html: `<div class="cluster-marker" style="background:${color};font-size:10px">${seq}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  })
}

export default function RoutePolyline({ route, colorIndex = 0 }) {
  const color = CLUSTER_COLORS[colorIndex % CLUSTER_COLORS.length]
  const positions = route.stops.map((s) => [s.lat, s.lng])

  return (
    <>
      <Polyline positions={positions} color={color} weight={2.5} opacity={0.75} dashArray="6 4" />
      {route.stops.map((stop) => (
        <Marker
          key={stop.order_id}
          position={[stop.lat, stop.lng]}
          icon={seqIcon(stop.sequence, color)}
        >
          <Popup>
            <strong>Stop #{stop.sequence}</strong><br />
            {stop.address}<br />
            <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>
              ETA: {stop.eta_minutes} min — {route.driver_name}
            </span>
          </Popup>
        </Marker>
      ))}
    </>
  )
}
