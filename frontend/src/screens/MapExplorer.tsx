import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import type { Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import witsCampusRaw from '../mapdata/wits-campus.geojson?raw';

const witsCampus = JSON.parse(witsCampusRaw);

const WITS_BOUNDS: [[number, number], [number, number]] = [
  [-26.194, 28.019],
  [-26.184, 28.034],
];

const WITS_MAX_BOUNDS: [[number, number], [number, number]] = [
  [-26.195, 28.018],
  [-26.183, 28.035],
];

export default function MapExplorer() {
  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.fitBounds(WITS_BOUNDS);

      setTimeout(() => {
        mapRef.current?.invalidateSize();
      }, 0);
    }
  }, []);

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <MapContainer
        bounds={WITS_BOUNDS}
        maxBounds={WITS_MAX_BOUNDS}
        maxBoundsViscosity={1.0}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <GeoJSON data={witsCampus} />
      </MapContainer>
    </div>
  );
}