import { Bike, Car, Footprints, Navigation, Route, X } from "lucide-react";
import type { CampusLocation } from "../location.types";
import type { NavigationMode, NavigationRoute } from "../navigation.types";

function distanceText(value: number) {
  return value < 1000 ? `${Math.max(1, Math.round(value))} m` : `${(value / 1000).toFixed(1)} km`;
}
function durationText(seconds: number) {
  const minutes = Math.max(1, Math.round(seconds / 60));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60), remainder = minutes % 60;
  return `${hours} hr${remainder ? ` ${remainder} min` : ""}`;
}

const modes: Array<{ value: NavigationMode; label: string; icon: typeof Footprints }> = [
  { value: "walking", label: "Walk", icon: Footprints },
  { value: "driving", label: "Drive", icon: Car },
  { value: "cycling", label: "Cycle", icon: Bike },
];

export function NavigationPanel({
  destination,
  mode,
  setMode,
  route,
  loading,
  error,
  active,
  onStart,
  onStop,
}: {
  destination: CampusLocation;
  mode: NavigationMode;
  setMode: (mode: NavigationMode) => void;
  route: NavigationRoute | null;
  loading: boolean;
  error: string;
  active: boolean;
  onStart: () => void;
  onStop: () => void;
}) {
  const next = route?.steps[0];
  return <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div><p className="text-xs font-black uppercase tracking-[.16em] text-blue-700">Directions</p><h2 className="mt-1 font-black text-slate-950">{destination.name}</h2><p className="mt-1 text-xs text-slate-500">{destination.area}{destination.campusSite ? ` · ${destination.campusSite}` : ""}</p></div>
      {active && <button onClick={onStop} title="End navigation" className="rounded-xl bg-slate-100 p-2 text-slate-600"><X className="h-4 w-4"/></button>}
    </div>
    <div className="mt-4 grid grid-cols-3 gap-2">{modes.map(item => {const Icon=item.icon;return <button key={item.value} disabled={active} onClick={()=>setMode(item.value)} className={`rounded-2xl border px-2 py-3 text-xs font-black ${mode===item.value?"border-blue-400 bg-blue-50 text-blue-800":"border-slate-200 text-slate-600"}`}><Icon className="mx-auto mb-1 h-4 w-4"/>{item.label}</button>})}</div>
    {loading && <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">Calculating the best route…</div>}
    {error && <div className="mt-4 rounded-2xl bg-red-50 p-4 text-xs font-bold leading-5 text-red-700">{error}</div>}
    {route && !loading && <>
      <div className="mt-4 grid grid-cols-2 gap-2"><div className="rounded-2xl bg-slate-950 p-3 text-white"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">ETA</p><p className="mt-1 text-lg font-black">{durationText(route.durationSeconds)}</p></div><div className="rounded-2xl bg-slate-100 p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Distance</p><p className="mt-1 text-lg font-black text-slate-950">{distanceText(route.distanceMeters)}</p></div></div>
      {active && next && <div className="mt-3 rounded-2xl bg-blue-600 p-4 text-white"><div className="flex gap-3"><Navigation className="mt-0.5 h-5 w-5 shrink-0"/><div><p className="text-xs font-bold text-blue-100">Next instruction</p><p className="mt-1 text-sm font-black leading-5">{next.instruction}</p><p className="mt-1 text-xs text-blue-100">{distanceText(next.distanceMeters)}</p></div></div></div>}
      {!active && <button onClick={onStart} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-500 px-4 py-3 text-sm font-black text-slate-950"><Navigation className="h-4 w-4"/>Start navigation</button>}
      <details className="mt-3"><summary className="cursor-pointer text-xs font-black text-slate-700">View turn-by-turn steps</summary><ol className="mt-3 space-y-3 border-l border-slate-200 pl-4">{route.steps.map((step,index)=><li key={`${step.instruction}-${index}`} className="text-xs"><div className="flex gap-2"><Route className="h-4 w-4 shrink-0 text-slate-400"/><div><p className="font-bold leading-5 text-slate-700">{step.instruction}</p><p className="text-slate-400">{distanceText(step.distanceMeters)}</p></div></div></li>)}</ol></details>
    </>}
  </div>;
}
