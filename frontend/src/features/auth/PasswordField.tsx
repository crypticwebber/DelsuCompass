import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { InputHTMLAttributes } from "react";

export function PasswordField({ className="", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  const [visible,setVisible]=useState(false);
  return <div className="relative">
    <input {...props} type={visible?"text":"password"} className={`${className} pr-12`} />
    <button type="button" onClick={()=>setVisible(v=>!v)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-blue-50 hover:text-blue-700" aria-label={visible?"Hide password":"Show password"}>
      {visible?<EyeOff className="h-4 w-4"/>:<Eye className="h-4 w-4"/>}
    </button>
  </div>;
}
