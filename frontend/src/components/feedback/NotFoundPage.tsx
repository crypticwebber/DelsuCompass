import { Link } from "react-router-dom";
export function NotFoundPage(){return <main className="grid min-h-screen place-items-center bg-slate-50 px-6"><div className="text-center"><p className="text-sm font-semibold text-slate-500">404</p><h1 className="mt-2 text-3xl font-bold text-slate-900">Page not found</h1><Link className="mt-6 inline-block underline" to="/">Return home</Link></div></main>}
