import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { CircleMarker, MapContainer, Polyline, Popup, TileLayer, useMap } from "react-leaflet";

/**
 * Makes the map behave the way a trackpad user expects.
 *
 * Leaflet's `scrollWheelZoom` captures every wheel event over the map, so a
 * two-finger scroll meant to move the page zooms the map and the page stays
 * put. Wheel zoom is disabled on the container instead, and this restores zoom
 * for the gesture that actually means zoom: a pinch, which browsers deliver as
 * a wheel event with `ctrlKey` set. Pinch on a real touchscreen is unaffected —
 * that's Leaflet's `touchZoom`, which stays on.
 */

function PinchToZoom() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();

    // Zoom is applied 1:1 with the gesture — no easing, no tweening. The
    // trackpad already emits a smooth stream of events, so the gesture itself
    // is the animation; interpolating on top of it only adds lag and fights
    // Leaflet's own transitions. Deltas are accumulated and flushed once per
    // frame so a burst of events costs one reprojection instead of several.
    let pendingLevels = 0;
    let anchor = null;
    let frame = null;

    const flush = () => {
      frame = null;
      if (pendingLevels === 0) return;

      const target = map.getZoom() + pendingLevels;
      pendingLevels = 0;

      const clamped = Math.min(map.getMaxZoom(), Math.max(map.getMinZoom(), target));

      // animate: false — Leaflet's zoom animation would queue behind each
      // update and smear the gesture. We want the map exactly where the
      // fingers are, this frame.
      map.setZoomAround(anchor, clamped, { animate: false });
    };

    const onWheel = (event) => {
      // Plain two-finger scroll: let the page have it.
      if (!event.ctrlKey) return;

      // Pinch: this one is ours, so stop the browser page-zooming too.
      event.preventDefault();

      // deltaY units differ by device: 0 = pixels, 1 = lines, 2 = pages.
      const unitScale = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 100 : 1;

      // Browsers encode a pinch as scale = exp(-deltaY / 100). Zoom levels are
      // base-2, so log2 of that scale converts the gesture directly into zoom
      // levels — the result tracks how far the fingers moved, not how many
      // events the trackpad happened to emit.
      pendingLevels += -(event.deltaY * unitScale) / (100 * Math.LN2);
      anchor = map.mouseEventToContainerPoint(event);

      if (frame === null) frame = window.requestAnimationFrame(flush);
    };

    // passive: false — preventDefault on wheel is ignored in a passive listener.
    container.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", onWheel);
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, [map]);

  return null;
}

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
    // `isolate` keeps Leaflet's own z-indexes (400-1000) inside this box.
    // Without it the map painted over the sticky z-30 header on scroll.
    <div className="isolate overflow-hidden rounded-lg border border-slate-200">
      <MapContainer
        center={center}
        zoom={routePoints.length ? 13 : 5}
        className="h-[360px] w-full"
        scrollWheelZoom={false}
        // 0 = allow fractional zoom levels. Leaflet's default of 1 snaps to
        // whole numbers, which rounds a pinch's small increments to nothing.
        zoomSnap={0}
      >
        <PinchToZoom />
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
