import { NavLink, useNavigate } from "react-router-dom";
import { Compass, LogOut, X } from "lucide-react";
import { primaryStudentNav } from "./nav.config";
import { useAuth } from "@/features/auth/AuthProvider";

interface Props { mobileOpen:boolean; onClose():void; }

function NavGroup({items,onNavigate}:{items:typeof primaryStudentNav;onNavigate():void}){
  return <nav className="space-y-1" aria-label="Student navigation">{items.map(({label,to,icon:Icon})=><NavLink key={to} to={to} onClick={onNavigate} className={({isActive})=>`group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition ${isActive?"bg-blue-50 text-blue-800 shadow-sm ring-1 ring-blue-100":"text-slate-600 hover:bg-slate-50 hover:text-blue-800"}`}><span className="grid h-8 w-8 place-items-center rounded-xl transition group-hover:bg-white"><Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true"/></span><span>{label}</span></NavLink>)}</nav>;
}

export function StudentSidebar({mobileOpen,onClose}:Props){
  const { logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = async () => {
    await logout();
    onClose();
    navigate("/login", { replace: true });
  };
  return <>
    {mobileOpen&&<button type="button" className="fixed inset-0 z-40 bg-blue-950/35 backdrop-blur-[2px] lg:hidden" aria-label="Close navigation" onClick={onClose}/>} 
    <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-blue-100 bg-white/98 px-4 py-5 shadow-xl shadow-blue-950/5 backdrop-blur-xl transition-transform lg:translate-x-0 lg:shadow-none ${mobileOpen?"translate-x-0":"-translate-x-full"}`}>
      <div className="flex items-center justify-between px-2">
        <NavLink to="/app/dashboard" className="flex items-center gap-3" onClick={onClose}><span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-blue-800 to-blue-600 text-white shadow-lg shadow-blue-700/20"><Compass className="h-5 w-5"/></span><span><span className="block text-base font-bold tracking-tight">DELSU Compass</span><span className="block text-xs font-medium text-slate-400">Your student space</span></span></NavLink>
        <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-800 lg:hidden" aria-label="Close menu"><X className="h-5 w-5"/></button>
      </div>
      <div className="compass-scrollbar mt-7 min-h-0 flex-1 overflow-y-auto pr-1">
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[.2em] text-slate-400">Explore</p>
        <NavGroup items={primaryStudentNav} onNavigate={onClose}/>
      </div>
      <div className="border-t border-slate-100 pt-4">
        <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-700"><span className="grid h-8 w-8 place-items-center rounded-xl"><LogOut className="h-[18px] w-[18px]"/></span>Log out</button>
      </div>
    </aside>
  </>;
}
