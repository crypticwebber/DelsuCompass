import type { LucideIcon } from "lucide-react";
import { ArrowLeft, Construction } from "lucide-react";
import { Link } from "react-router-dom";

interface Props {
  title: string;
  description: string;
  icon?: LucideIcon;
}

export function FeaturePlaceholderPage({ title, description, icon: Icon = Construction }: Props) {
  return (
    <section className="mx-auto max-w-4xl py-8 sm:py-14">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-700">
          <Icon className="h-6 w-6" />
        </span>
        <p className="mt-7 text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Module foundation</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-4 max-w-2xl leading-7 text-slate-600">{description}</p>
        <div className="mt-7 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
          The application route and shell integration are ready. The feature's data model, API and interactive functions will be implemented in its scheduled development phase.
        </div>
        <Link to="/app/dashboard" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>
      </div>
    </section>
  );
}
