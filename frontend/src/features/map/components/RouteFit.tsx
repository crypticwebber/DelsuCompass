import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { latLngBounds } from "leaflet";

export function RouteFit({ geometry }: { geometry: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (geometry.length > 1) map.fitBounds(latLngBounds(geometry), { padding: [36, 36] });
  }, [geometry, map]);
  return null;
}
