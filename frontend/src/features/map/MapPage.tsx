import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Circle, CircleMarker, MapContainer, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import { Crosshair, LocateFixed, MapPin, Navigation, Search, ShieldCheck, Wifi, WifiOff } from "lucide-react";
import "leaflet/dist/leaflet.css";
import { locationApi } from "./location.api";
import { navigationApi } from "./navigation.api";
import type { CampusLocation, LivePosition, LocationCategory } from "./location.types";
import type { NavigationMode, NavigationRoute } from "./navigation.types";
import { NavigationPanel } from "./components/NavigationPanel";
import { RouteFit } from "./components/RouteFit";

const ABRAKA_CENTER: [number, number] = [5.7836, 6.1005];
const DELSU_SITE_III_REFERENCE: [number, number] = [5.79, 6.10472];

const categories: Record<LocationCategory, string> = {
  academic: "Academic",
  administrative: "Administrative",
  hostel: "Hostel",
  health: "Health",
  security: "Security",
  food: "Food",
  transport: "Transport",
  banking: "Banking",
  recreation: "Recreation",
  worship: "Worship",
  service: "Service",
  landmark: "Landmark",
  other: "Other",
};

function msg(error: unknown) {
  return (error as any)?.response?.data?.error?.message ?? "Unable to complete this request.";
}

function haversine(a: [number, number], b: [number, number]) {
  const radius = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLon = ((b[1] - a[1]) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a[0] * Math.PI) / 180) *
      Math.cos((b[0] * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function kmText(value: number) {
  return value < 1 ? `${Math.round(value * 1000)} m` : `${value.toFixed(1)} km`;
}

function MapFocus({ target }: { target: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo(target, 17, { duration: 0.8 });
  }, [target, map]);
  return null;
}

function MapLifecycle() {
  const map = useMap();
  useEffect(() => {
    const refresh = () => map.invalidateSize({ animate: false });
    const timer = window.setTimeout(refresh, 80);
    window.addEventListener("resize", refresh);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", refresh);
    };
  }, [map]);
  return null;
}

export function MapPage() {
  const [params] = useSearchParams();
  const initialQuery = params.get("q") ?? "";
  const requestedId = params.get("id");

  const [search, setSearch] = useState(initialQuery);
  const [category, setCategory] = useState("");
  const [selected, setSelected] = useState<CampusLocation | null>(null);
  const [focus, setFocus] = useState<[number, number] | null>(null);
  const [live, setLive] = useState<LivePosition | null>(null);
  const [geoError, setGeoError] = useState("");
  const [tracking, setTracking] = useState(false);
  const [mode, setMode] = useState<NavigationMode>("walking");
  const [route, setRoute] = useState<NavigationRoute | null>(null);
  const [navigationActive, setNavigationActive] = useState(false);
  const [pendingDirections, setPendingDirections] = useState(false);
  const [tileError, setTileError] = useState(false);

  const watch = useRef<number | null>(null);
  const lastRouted = useRef<[number, number] | null>(null);

  const query = useQuery({
    queryKey: ["locations", category, search],
    queryFn: () => locationApi.list({ category: category || undefined, search: search || undefined }),
  });

  const routeMutation = useMutation({
    mutationFn: ({
      start,
      destination,
      mode: travelMode,
    }: {
      start: { latitude: number; longitude: number };
      destination: { latitude: number; longitude: number };
      mode: NavigationMode;
    }) => navigationApi.directions(start, destination, travelMode),
    onSuccess: (data) => {
      setRoute(data);
      setGeoError("");
    },
  });

  const stop = useCallback(() => {
    if (watch.current !== null) navigator.geolocation.clearWatch(watch.current);
    watch.current = null;
    setTracking(false);
    setPendingDirections(false);
  }, []);

  const start = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError("This browser does not support live location.");
      return;
    }

    if (!window.isSecureContext && window.location.hostname !== "localhost") {
      setGeoError("Live location requires HTTPS. Open the deployed DELSU Compass site using https:// and try again.");
      return;
    }

    if (watch.current !== null) return;

    setGeoError("");
    setTracking(true);
    watch.current = navigator.geolocation.watchPosition(
      (position) => {
        const next: LivePosition = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: position.timestamp,
        };
        setLive(next);
        if (!navigationActive) setFocus([next.latitude, next.longitude]);
      },
      (error) => {
        const message =
          error.code === 1
            ? "Location permission was denied. Allow location access for DELSU Compass in your browser settings and try again."
            : error.code === 2
              ? "Your device could not determine a location. Turn on GPS/location services and try again."
              : "Location lookup timed out. Move to an area with a clearer GPS/network signal and try again.";
        setGeoError(message);
        if (watch.current !== null) navigator.geolocation.clearWatch(watch.current);
        watch.current = null;
        setTracking(false);
        setPendingDirections(false);
      },
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 15000 },
    );
  }, [navigationActive]);

  useEffect(() => () => {
    if (watch.current !== null) navigator.geolocation.clearWatch(watch.current);
  }, []);

  const rows = query.data ?? [];
  const me = live ? ([live.latitude, live.longitude] as [number, number]) : null;

  useEffect(() => {
    if (!requestedId || selected || !rows.length) return;
    const match = rows.find((item) => item._id === requestedId);
    if (match) {
      setSelected(match);
      setFocus([match.latitude, match.longitude]);
    }
  }, [requestedId, rows, selected]);

  const nearest = useMemo(
    () =>
      me
        ? [...rows]
            .map((item) => ({ item, distance: haversine(me, [item.latitude, item.longitude]) }))
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 5)
        : [],
    [rows, me],
  );

  const requestRoute = useCallback(
    (location: CampusLocation, position: LivePosition, travelMode: NavigationMode) => {
      routeMutation.mutate({
        start: { latitude: position.latitude, longitude: position.longitude },
        destination: { latitude: location.latitude, longitude: location.longitude },
        mode: travelMode,
      });
      lastRouted.current = [position.latitude, position.longitude];
    },
    [routeMutation],
  );

  useEffect(() => {
    if (!pendingDirections || !selected || !live) return;
    setPendingDirections(false);
    requestRoute(selected, live, mode);
  }, [pendingDirections, selected, live, mode, requestRoute]);

  useEffect(() => {
    if (!navigationActive || !selected || !live) return;
    const last = lastRouted.current;
    if (!last || haversine(last, [live.latitude, live.longitude]) >= 0.04) {
      requestRoute(selected, live, mode);
    }
  }, [navigationActive, selected, live, mode, requestRoute]);

  useEffect(() => {
    if (selected && live && !navigationActive) setRoute(null);
  }, [selected?._id, mode]);

  const beginDirections = () => {
    if (!selected) return;
    if (!live) {
      setPendingDirections(true);
      setGeoError("Getting your current location so Compass can calculate the route…");
      start();
      return;
    }
    requestRoute(selected, live, mode);
  };

  const startNavigation = () => {
    if (!route || !selected || !live) return;
    setNavigationActive(true);
    if (watch.current === null) start();
    setTracking(true);
    setFocus(null);
  };

  const endNavigation = () => {
    setNavigationActive(false);
    setRoute(null);
    lastRouted.current = null;
  };

  const selectLocation = (item: CampusLocation) => {
    setSelected(item);
    setFocus([item.latitude, item.longitude]);
    setRoute(null);
    setNavigationActive(false);
    setPendingDirections(false);
    lastRouted.current = null;
  };

  return (
    <div className="min-w-0 space-y-5 overflow-x-hidden">
      <section className="rounded-3xl bg-slate-950 p-5 text-white sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-black uppercase tracking-[.2em] text-blue-300">Compass Map</p>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />Live map
              </span>
            </div>
            <h1 className="mt-3 text-2xl font-black sm:text-3xl">Navigate DELSU and Abraka from one place.</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Explore verified Compass locations on OpenStreetMap, use your device GPS, and calculate walking, cycling or driving routes with OpenRouteService.
            </p>
          </div>
          <button
            onClick={tracking ? stop : start}
            className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-2xl bg-blue-400 px-4 py-3 text-sm font-black text-slate-950 sm:w-auto"
          >
            <LocateFixed className="h-4 w-4" />
            {tracking ? "Stop live location" : "Show my live location"}
          </button>
        </div>
        {geoError && (
          <div className="mt-4 break-words rounded-2xl bg-blue-400/10 px-4 py-3 text-sm font-bold text-blue-100">
            {geoError}
          </div>
        )}
      </section>

      <div className="grid min-w-0 gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="min-w-0 space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-4">
            <div className="relative">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search campus or Abraka places"
                className="w-full min-w-0 rounded-2xl border border-slate-200 py-3 pl-10 pr-4 text-sm"
              />
            </div>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="mt-3 w-full min-w-0 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold"
            >
              <option value="">All location types</option>
              {Object.entries(categories).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <button
              onClick={() => setFocus(ABRAKA_CENTER)}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-700"
            >
              <Crosshair className="h-4 w-4" />Re-center on Abraka
            </button>
          </div>

          {live && (
            <div className="rounded-3xl border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-center gap-2 text-sm font-black text-blue-900">
                <Navigation className="h-4 w-4" />Live position active
              </div>
              <p className="mt-2 text-xs leading-5 text-blue-800">
                Accuracy ±{Math.round(live.accuracy)} m · updated {new Date(live.timestamp).toLocaleTimeString()}
              </p>
            </div>
          )}

          {selected && (
            <NavigationPanel
              destination={selected}
              mode={mode}
              setMode={setMode}
              route={route}
              loading={routeMutation.isPending || pendingDirections}
              error={routeMutation.error ? msg(routeMutation.error) : ""}
              active={navigationActive}
              onStart={route ? startNavigation : beginDirections}
              onStop={endNavigation}
            />
          )}

          <div className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
            {query.isLoading && <p className="rounded-2xl bg-white p-4 text-sm text-slate-500">Loading verified locations…</p>}
            {query.error && <p className="break-words rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{msg(query.error)}</p>}
            {!query.isLoading && !query.error && rows.length === 0 && (
              <div className="rounded-2xl border border-dashed bg-white p-5 text-sm leading-6 text-slate-500">
                No verified locations match this filter yet. The base map is still live; administrators can add verified DELSU and Abraka destinations from Map Administration.
              </div>
            )}
            {rows.map((item) => (
              <button
                key={item._id}
                onClick={() => selectLocation(item)}
                className={`w-full min-w-0 rounded-2xl border p-4 text-left transition ${selected?._id === item._id ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300"}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="break-words font-black text-slate-950">{item.name}</p>
                    <p className="mt-1 break-words text-xs font-bold text-slate-500">
                      {categories[item.category]} · {item.area}{item.campusSite ? ` · ${item.campusSite}` : ""}
                    </p>
                  </div>
                  {item.isVerified && <ShieldCheck className="h-4 w-4 shrink-0 text-blue-600" />}
                </div>
                {me && <p className="mt-2 text-xs font-black text-blue-700">{kmText(haversine(me, [item.latitude, item.longitude]))} straight-line distance</p>}
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-black text-slate-700">
                  <MapPin className="h-3.5 w-3.5" />Select for directions
                </span>
              </button>
            ))}
          </div>

          {nearest.length > 0 && (
            <div className="rounded-3xl border border-slate-200 bg-white p-4">
              <h2 className="text-sm font-black">Nearest saved places</h2>
              <div className="mt-3 space-y-2">
                {nearest.map(({ item, distance }) => (
                  <button key={item._id} onClick={() => selectLocation(item)} className="flex w-full min-w-0 items-center justify-between gap-3 text-left text-xs">
                    <span className="min-w-0 truncate font-bold text-slate-700">{item.name}</span>
                    <span className="shrink-0 text-slate-400">{kmText(distance)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>

        <section className="min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3 text-xs">
            <span className="inline-flex items-center gap-2 font-bold text-slate-600">
              {tileError ? <WifiOff className="h-4 w-4 text-red-500" /> : <Wifi className="h-4 w-4 text-emerald-600" />}
              {tileError ? "Map tiles are having trouble loading" : "OpenStreetMap connected"}
            </span>
            <span className="font-semibold text-slate-400">Abraka · DELSU</span>
          </div>
          <div className="h-[52vh] min-h-[360px] w-full sm:h-[64vh] sm:min-h-[500px] xl:h-[70vh]">
            <MapContainer
              center={ABRAKA_CENTER}
              zoom={14}
              minZoom={11}
              maxZoom={19}
              scrollWheelZoom
              zoomControl
              className="h-full w-full"
            >
              <MapLifecycle />
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                eventHandlers={{
                  load: () => setTileError(false),
                  tileerror: () => setTileError(true),
                }}
              />
              <MapFocus target={navigationActive ? null : focus} />
              <CircleMarker center={DELSU_SITE_III_REFERENCE} radius={8} pathOptions={{ weight: 3 }}>
                <Popup><strong>DELSU Site III reference area</strong><br />Use verified Compass markers for individual destinations.</Popup>
              </CircleMarker>
              {rows.map((item) => (
                <CircleMarker
                  key={item._id}
                  center={[item.latitude, item.longitude]}
                  radius={selected?._id === item._id ? 10 : 7}
                  pathOptions={{ weight: 3 }}
                  eventHandlers={{ click: () => selectLocation(item) }}
                >
                  <Popup>
                    <strong>{item.name}</strong><br />
                    {categories[item.category]} · {item.area}
                    {item.description ? <><br />{item.description}</> : null}
                  </Popup>
                </CircleMarker>
              ))}
              {route && (
                <>
                  <Polyline positions={route.geometry} pathOptions={{ weight: 6, opacity: 0.85 }} />
                  <RouteFit geometry={route.geometry} />
                </>
              )}
              {live && (
                <>
                  <Circle center={[live.latitude, live.longitude]} radius={live.accuracy} pathOptions={{ weight: 1, fillOpacity: 0.08 }} />
                  <CircleMarker center={[live.latitude, live.longitude]} radius={9} pathOptions={{ weight: 4, fillOpacity: 1 }}>
                    <Popup><strong>Your live location</strong><br />Accuracy ±{Math.round(live.accuracy)} m</Popup>
                  </CircleMarker>
                </>
              )}
            </MapContainer>
          </div>
        </section>
      </div>

      <div className="rounded-2xl bg-slate-100 p-4 text-xs leading-5 text-slate-600">
        <strong>Navigation & privacy:</strong> your live GPS position remains session-only in the browser. DELSU Compass sends only the start and destination coordinates to its backend when you request a route. Continuous location history is not stored. Live location requires browser permission and HTTPS outside localhost.
      </div>
    </div>
  );
}
