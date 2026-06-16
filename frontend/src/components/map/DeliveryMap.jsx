import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { divIcon } from 'leaflet'
import RoutePolyline from './RoutePolyline'
import ClusterMarkers from './ClusterMarkers'
import '../../styles/map.css'

const TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'

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
