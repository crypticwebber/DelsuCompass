import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { isRouteErrorResponse, Link, useRouteError } from "react-router-dom";

export function RouteErrorPage(){
  const error=useRouteError();
  let message="This page hit a temporary problem. Your saved data has not been changed.";
  if(isRouteErrorResponse(error))message=error.status===404?"We couldn't find the page you requested.":error.statusText||message;
  else if(import.meta.env.DEV&&error instanceof Error)message=error.message;
  return <main className="grid min-h-[70vh] place-items-center px-5 py-12"><section className="w-full max-w-lg rounded-[2rem] border border-blue-100 bg-white p-8 text-center shadow-xl shadow-blue-900/5"><div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-amber-50 text-amber-700"><AlertTriangle className="h-6 w-6"/></div><h1 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950">That page couldn't finish loading</h1><p className="mt-2 text-sm leading-6 text-slate-500">{message}</p><div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row"><button onClick={()=>window.location.reload()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white"><RefreshCw className="h-4 w-4"/>Try again</button><Link to="/" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700"><Home className="h-4 w-4"/>Go home</Link></div></section></main>
}
