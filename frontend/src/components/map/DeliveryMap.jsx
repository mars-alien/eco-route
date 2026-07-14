import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { divIcon } from 'leaflet'
import RoutePolyline from './RoutePolyline'
import ClusterMarkers from './ClusterMarkers'
import { TILE_URL, ATTRIBUTION } from '../../api/mapConfig'
import '../../styles/map.css'

export default function DeliveryMap({
  orders = [],
  clusters = [],
  routes = [],
  center = [12.9716, 77.5946],
  zoom = 12,
}) {
  return (
    <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
      <TileLayer url={TILE_URL} attribution={ATTRIBUTION} />
      <ClusterMarkers orders={orders} clusters={clusters} />
      {routes.map((route, i) => (
        <RoutePolyline key={route.driver_id || i} route={route} colorIndex={i} />
      ))}
    </MapContainer>
  )
}
