import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { timetableFormSchema, type TimetableFormInput, type TimetableFormValues } from "../timetable.schema";
import type { TimetableEntry } from "../timetable.types";

const fieldClass = "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10";

export function TimetableEntryForm({ initial, busy, onSubmit, onCancel }: {
  initial?: TimetableEntry | null;
  busy?: boolean;
  onSubmit(values: TimetableFormValues): Promise<void>;
  onCancel(): void;
}) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<TimetableFormInput, unknown, TimetableFormValues>({
    resolver: zodResolver(timetableFormSchema),
    defaultValues: initial ? {
      courseCode: initial.courseCode, courseTitle: initial.courseTitle, lecturer: initial.lecturer ?? "", day: initial.day,
      startTime: initial.startTime, endTime: initial.endTime, venue: initial.venue, color: initial.color ?? "emerald", notes: initial.notes ?? "",
      isCarryOver: initial.isCarryOver ?? false, sourceLevel: initial.sourceLevel, source: initial.source ?? "manual", allowConflict: false,
    } : { courseCode: "", courseTitle: "", lecturer: "", day: "monday", startTime: "08:00", endTime: "10:00", venue: "", color: "emerald", notes: "", isCarryOver: false, source: "manual", allowConflict: false },
  });

  const isCarryOver = watch("isCarryOver");
  const errorText = (name: keyof TimetableFormInput) => errors[name]?.message ? <p className="mt-1 text-xs font-medium text-red-600">{String(errors[name]?.message)}</p> : null;

  return <form className="space-y-4" onSubmit={handleSubmit(async (values) => onSubmit({ ...values, source: "manual" }))}>
    <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold text-slate-700">Course code<input className={`${fieldClass} mt-1.5 uppercase`} placeholder="CSC 301" {...register("courseCode")} />{errorText("courseCode")}</label><label className="text-sm font-semibold text-slate-700">Day<select className={`${fieldClass} mt-1.5 capitalize`} {...register("day")}><option value="monday">Monday</option><option value="tuesday">Tuesday</option><option value="wednesday">Wednesday</option><option value="thursday">Thursday</option><option value="friday">Friday</option><option value="saturday">Saturday</option><option value="sunday">Sunday</option></select></label></div>
    <label className="block text-sm font-semibold text-slate-700">Course title<input className={`${fieldClass} mt-1.5`} placeholder="Data Structures" {...register("courseTitle")} />{errorText("courseTitle")}</label>
    <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold text-slate-700">Start time<input type="time" className={`${fieldClass} mt-1.5`} {...register("startTime")} />{errorText("startTime")}</label><label className="text-sm font-semibold text-slate-700">End time<input type="time" className={`${fieldClass} mt-1.5`} {...register("endTime")} />{errorText("endTime")}</label></div>
    <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold text-slate-700">Venue<input className={`${fieldClass} mt-1.5`} placeholder="CSC Hall 2" {...register("venue")} />{errorText("venue")}</label><label className="text-sm font-semibold text-slate-700">Lecturer <span className="font-normal text-slate-400">optional</span><input className={`${fieldClass} mt-1.5`} placeholder="Dr. Example" {...register("lecturer")} /></label></div>
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4"><label className="flex items-start gap-3"><input type="checkbox" className="mt-1 h-4 w-4" {...register("isCarryOver")} /><span><span className="block text-sm font-bold text-amber-950">This is a carry-over course</span><span className="mt-0.5 block text-xs leading-5 text-amber-800">Carry-over classes can be kept even when they clash with a current-level class.</span></span></label>{isCarryOver && <div className="mt-3 grid gap-3 sm:grid-cols-2"><label className="text-sm font-semibold text-amber-950">Original level<select className={`${fieldClass} mt-1.5`} {...register("sourceLevel", { valueAsNumber: true })}><option value="">Choose level</option><option value="100">100 Level</option><option value="200">200 Level</option><option value="300">300 Level</option><option value="400">400 Level</option><option value="500">500 Level</option></select>{errorText("sourceLevel")}</label><label className="flex items-center gap-2 self-end rounded-xl bg-white px-3 py-3 text-sm font-semibold"><input type="checkbox" {...register("allowConflict")} />Keep this class if it clashes</label></div>}</div>
    <label className="block text-sm font-semibold text-slate-700">Notes <span className="font-normal text-slate-400">optional</span><textarea rows={3} className={`${fieldClass} mt-1.5 resize-none`} placeholder="Class-specific note" {...register("notes")} /></label>
    <div className="flex justify-end gap-3 border-t border-slate-100 pt-4"><button type="button" onClick={onCancel} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold">Cancel</button><button disabled={busy} className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">{busy ? "Saving…" : initial ? "Save changes" : "Add class"}</button></div>
  </form>;
}
