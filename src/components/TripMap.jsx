import "leaflet/dist/leaflet.css";
import { CircleMarker, MapContainer, Polyline, Popup, TileLayer } from "react-leaflet";

function toPoint(stop) {
  const lat = Number(stop?.latitude ?? stop?.lat);
  const lon = Number(stop?.longitude ?? stop?.lon);

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return null;
  }

  return [lat, lon];
}

export default function TripMap({ trip, day }) {
  const routePoints = (day?.stops || []).map(toPoint).filter(Boolean);
  const center =
    routePoints[0] ||
    (trip?.center?.lat && trip?.center?.lon
      ? [Number(trip.center.lat), Number(trip.center.lon)]
      : [20.5937, 78.9629]);
  const nearby = (trip?.nearby || []).slice(0, 10).filter((place) => place.lat && place.lon);

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <MapContainer center={center} zoom={routePoints.length ? 13 : 5} className="h-[360px] w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {routePoints.length > 1 ? (
          <Polyline positions={routePoints} pathOptions={{ color: "#2563eb", weight: 4 }} />
        ) : null}
        {(day?.stops || []).map((stop, index) => {
          const point = toPoint(stop);
          if (!point) return null;

          return (
            <CircleMarker
              key={`${stop.name}-${index}`}
              center={point}
              pathOptions={{ color: "#1d4ed8", fillColor: "#2563eb", fillOpacity: 0.9 }}
              radius={8}
            >
              <Popup>
                <strong>
                  {index + 1}. {stop.name}
                </strong>
                <br />
                {stop.time}
              </Popup>
            </CircleMarker>
          );
        })}
        {nearby.map((place) => (
          <CircleMarker
            key={place.id || place.name}
            center={[Number(place.lat), Number(place.lon)]}
            pathOptions={{ color: "#64748b", fillColor: "#94a3b8", fillOpacity: 0.45 }}
            radius={5}
          >
            <Popup>
              <strong>{place.name}</strong>
              <br />
              {place.category}
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
