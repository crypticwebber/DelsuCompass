import { useState } from "react";
import { LogOut, Mail, Pencil, School, ShieldCheck, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthProvider";
import { getInitials } from "@/lib/user";
import { profileApi } from "./profile.api";

export function ProfilePage() {
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ fullName:user?.fullName ?? "", phoneNumber:user?.phoneNumber ?? "", faculty:user?.faculty ?? "", department:user?.department ?? "", level:user?.level ? String(user.level) : "" });
  const [saving,setSaving] = useState(false);
  const [message,setMessage] = useState("");

  async function handleLogout() { await logout(); navigate("/login", { replace: true }); }
  async function saveProfile() {
    setSaving(true); setMessage("");
    try {
      const updated = await profileApi.update({ fullName:form.fullName, phoneNumber:form.phoneNumber, faculty:form.faculty, department:form.department, level:form.level ? Number(form.level) : undefined });
      setUser(updated); setEditing(false); setMessage("Profile updated. Timetable imports will now use your department and level.");
    } finally { setSaving(false); }
  }

  return <div className="mx-auto max-w-4xl space-y-5">
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><div className="flex flex-col gap-5 sm:flex-row sm:items-center">{user?.profileImage ? <img src={user.profileImage} alt="Profile" className="h-24 w-24 rounded-3xl object-cover" /> : <span className="grid h-24 w-24 place-items-center rounded-3xl bg-blue-100 text-2xl font-black text-blue-800">{getInitials(user?.fullName)}</span>}<div className="min-w-0 flex-1"><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Student profile</p><h1 className="mt-1 truncate text-3xl font-black tracking-tight">{user?.fullName}</h1><p className="mt-1 text-slate-500">{user?.email}</p></div><div className="flex flex-wrap gap-2"><span className={`w-fit rounded-full px-3 py-1.5 text-xs font-bold ${user?.isVerified ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-800"}`}>{user?.isVerified ? "Verified account" : "Email not verified"}</span><button onClick={()=>setEditing(!editing)} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-bold"><Pencil className="h-3.5 w-3.5"/>Edit profile</button></div></div></section>
    {message && <p className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm font-semibold text-blue-800">{message}</p>}
    {editing ? <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h2 className="text-lg font-black">Academic profile</h2><p className="mt-1 text-sm text-slate-500">Faculty, department and level are used to match uploaded faculty timetables to your personal schedule.</p><div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="Full name" value={form.fullName} onChange={(v)=>setForm({...form,fullName:v})}/><Field label="Phone number" value={form.phoneNumber} onChange={(v)=>setForm({...form,phoneNumber:v})}/><Field label="Faculty" placeholder="Faculty of Computing" value={form.faculty} onChange={(v)=>setForm({...form,faculty:v})}/><Field label="Department" placeholder="Computer Science" value={form.department} onChange={(v)=>setForm({...form,department:v})}/><label className="text-sm font-semibold text-slate-700">Level<select className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5" value={form.level} onChange={(e)=>setForm({...form,level:e.target.value})}><option value="">Choose level</option>{[100,200,300,400,500,600,700].map((n)=><option value={n} key={n}>{n} Level</option>)}</select></label></div><div className="mt-5 flex justify-end gap-3"><button onClick={()=>setEditing(false)} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold">Cancel</button><button disabled={saving || !form.fullName || !form.faculty || !form.department || !form.level} onClick={()=>void saveProfile()} className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-40">{saving?"Saving…":"Save profile"}</button></div></section> : <section className="grid gap-4 sm:grid-cols-2"><InfoCard icon={Mail} label="Email address" value={user?.email || "Not provided"} /><InfoCard icon={School} label="Faculty" value={user?.faculty || "Not added yet"} /><InfoCard icon={School} label="Department" value={user?.department || "Not added yet"} /><InfoCard icon={UserRound} label="Level" value={user?.level ? `${user.level} Level` : "Not added yet"} /></section>}
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 text-blue-700" /><div><h2 className="font-bold">Account access</h2><p className="mt-1 text-sm leading-6 text-slate-500">Your account is protected by JWT authentication, refresh sessions and role-based authorization.</p></div></div><button type="button" onClick={() => void handleLogout()} className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-800 hover:bg-slate-50"><LogOut className="h-4 w-4" /> Sign out</button></section>
  </div>;
}
function Field({label,value,onChange,placeholder}:{label:string;value:string;onChange(v:string):void;placeholder?:string}){return <label className="text-sm font-semibold text-slate-700">{label}<input className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5" placeholder={placeholder} value={value} onChange={(e)=>onChange(e.target.value)}/></label>}
function InfoCard({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) { return <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-700"><Icon className="h-5 w-5" /></span><p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{label}</p><p className="mt-1 font-semibold text-slate-900">{value}</p></div>; }
