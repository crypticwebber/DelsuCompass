import { Compass, Github, Instagram, Linkedin, Mail, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export function BrandMark({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="inline-flex items-center gap-3" aria-label="DELSU Compass home">
      <span className={`grid h-10 w-10 place-items-center rounded-2xl ${light ? "bg-white/12 text-white" : "bg-blue-700 text-white"}`}>
        <Compass className="h-5 w-5" />
      </span>
      <span className={`text-[17px] font-semibold tracking-[-.02em] ${light ? "text-white" : "text-slate-950"}`}>
        DELSU <span className={light ? "text-blue-200" : "text-blue-700"}>Compass</span>
      </span>
    </Link>
  );
}

export function PublicHeader({ dark = false }: { dark?: boolean }) {
  const [open, setOpen] = useState(false);
  const base = dark ? "border-white/10 bg-blue-950/80" : "border-blue-100/80 bg-white/88";
  const nav = dark ? "text-blue-100 hover:bg-white/10 hover:text-white" : "text-slate-600 hover:bg-blue-50 hover:text-blue-800";
  return (
    <header className={`sticky top-0 z-50 border-b backdrop-blur-xl ${base}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <BrandMark light={dark} />
        <nav className="hidden items-center gap-2 md:flex">
          <Link to="/" className={`rounded-xl px-3 py-2 text-sm font-medium ${nav}`}>Home</Link>
          <Link to="/explore" className={`rounded-xl px-3 py-2 text-sm font-medium ${nav}`}>Information hub</Link>
          <Link to="/login" className={`rounded-xl border px-4 py-2 text-sm font-semibold ${dark ? "border-white/15 text-white hover:bg-white/10" : "border-blue-100 text-blue-900 hover:bg-blue-50"}`}>Log in</Link>
          <Link to="/register" className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-950/10 hover:bg-blue-500">Join Compass</Link>
        </nav>
        <button onClick={() => setOpen(v => !v)} className={`grid h-10 w-10 place-items-center rounded-xl md:hidden ${dark ? "bg-white/10 text-white" : "bg-blue-50 text-blue-800"}`} aria-label="Toggle menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className={`border-t px-5 py-4 md:hidden ${dark ? "border-white/10 bg-blue-950" : "border-blue-100 bg-white"}`}>
          <div className="mx-auto grid max-w-7xl gap-2">
            <Link to="/" className={`rounded-xl px-3 py-2 text-sm font-medium ${nav}`}>Home</Link>
            <Link to="/explore" className={`rounded-xl px-3 py-2 text-sm font-medium ${nav}`}>Information hub</Link>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Link to="/login" className={`rounded-xl border px-4 py-2 text-center text-sm font-semibold ${dark ? "border-white/15 text-white" : "border-blue-100 text-blue-900"}`}>Log in</Link>
              <Link to="/register" className="rounded-xl bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white">Join Compass</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-blue-100 bg-blue-950 text-blue-100">
      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.35fr_.7fr_.7fr_.8fr]">
          <div>
            <BrandMark light />
            <p className="mt-4 max-w-sm text-sm leading-6 text-blue-100/70">A campus survival and community intelligence platform built to make DELSU student life easier to understand, navigate and manage.</p>
            <p className="mt-4 text-xs leading-5 text-blue-200/60">DELSU Compass informs and guides. Official DELSU systems remain responsible for institutional transactions.</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Explore</p>
            <div className="mt-4 grid gap-3 text-sm text-blue-100/70">
              <Link to="/explore" className="hover:text-white">Information hub</Link>
              <Link to="/register" className="hover:text-white">Create account</Link>
              <Link to="/login" className="hover:text-white">Student login</Link>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Student tools</p>
            <div className="mt-4 grid gap-3 text-sm text-blue-100/70">
              <span>Timetable & reminders</span><span>Compass Map</span><span>Safety & community</span><span>Budget planner</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Project</p>
            <p className="mt-4 text-sm leading-6 text-blue-100/70">Built as a practical DELSU campus platform with moderated student contributions and administrator-managed public information.</p>
            <div className="mt-5 flex gap-2">
              {[Mail, Instagram, Linkedin, Github].map((Icon, i) => <span key={i} className="grid h-9 w-9 place-items-center rounded-xl bg-white/8 text-blue-100"><Icon className="h-4 w-4" /></span>)}
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-blue-200/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} DELSU Compass. Final-year project implementation.</p>
          <p>Delta State University, Abraka.</p>
        </div>
      </div>
    </footer>
  );
}
