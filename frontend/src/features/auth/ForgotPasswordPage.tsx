import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowLeft, CheckCircle2, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { authApi } from "./auth.api";
import { AuthVisualPanel } from "./AuthVisualPanel";

const schema = z.object({ email: z.string().trim().email("Enter a valid email address") });
type FormData = z.infer<typeof schema>;

export function ForgotPasswordPage() {
  const [serverError, setServerError] = useState("");
  const [message, setMessage] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const submit = handleSubmit(async ({ email }) => {
    setServerError("");
    setMessage("");
    try {
      const response = await authApi.forgotPassword(email);
      setMessage(response.message ?? "If an account exists for that email, a reset link has been prepared.");
    } catch (error: any) {
      setServerError(error?.response?.data?.error?.message ?? "Unable to start password reset. Please try again.");
    }
  });

  return (
    <main className="min-h-screen bg-blue-50/55 lg:grid lg:grid-cols-[1.02fr_.98fr]">
      <AuthVisualPanel image="https://images.pexels.com/photos/5896921/pexels-photo-5896921.jpeg?auto=compress&cs=tinysrgb&w=1400" eyebrow="Account recovery" title="Get back into your Compass securely." copy="Request a time-limited password reset link. In local development the link is printed in the backend terminal when Resend delivery is disabled." />
      <section className="grid min-h-screen place-items-center px-5 py-10">
        <div className="w-full max-w-md compass-page-enter">
          <Link to="/login" className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-700"><ArrowLeft className="h-4 w-4" /> Back to sign in</Link>
          <form onSubmit={submit} className="rounded-[2rem] border border-blue-100 bg-white p-7 shadow-[0_24px_60px_rgba(30,64,175,.09)] sm:p-9">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-700"><Mail className="h-5 w-5" /></div>
            <h2 className="mt-5 text-3xl font-semibold tracking-[-.04em]">Forgot password?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Enter the email connected to your DELSU Compass account.</p>
            <label className="mt-7 block text-sm font-medium text-slate-700">Email<input className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3.5 text-sm outline-none" type="email" placeholder="you@example.com" autoComplete="email" {...register("email")} /></label>
            {errors.email && <p className="mt-1 text-sm text-red-700">{errors.email.message}</p>}
            {serverError && <p role="alert" className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-3 text-sm font-medium text-red-800">{serverError}</p>}
            {message && <div className="mt-4 flex gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-medium text-emerald-800"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /><span>{message}<span className="mt-1 block font-normal text-emerald-700">During local development, check the backend terminal for the reset link if SMTP is disabled.</span></span></div>}
            <button disabled={isSubmitting} className="mt-6 w-full rounded-2xl bg-blue-700 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-700/15 hover:bg-blue-800 disabled:opacity-60">{isSubmitting ? "Preparing reset link..." : "Send reset link"}</button>
          </form>
        </div>
      </section>
    </main>
  );
}
