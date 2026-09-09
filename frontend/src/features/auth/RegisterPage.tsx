import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { authApi } from "./auth.api";
import { AuthVisualPanel } from "./AuthVisualPanel";
import { PasswordField } from "./PasswordField";
const schema = z.object({
  fullName: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Use at least 8 characters")
    .regex(/[A-Z]/, "Add an uppercase letter")
    .regex(/[a-z]/, "Add a lowercase letter")
    .regex(/[0-9]/, "Add a number"),
});
type FormData = z.infer<typeof schema>;
const inputClass =
  "mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3.5 text-sm outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100/70";
export function RegisterPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });
  const submit = handleSubmit(async (values) => {
    setServerError("");
    try {
      await authApi.register(values);
      navigate(`/verify-email?email=${encodeURIComponent(values.email)}`, {
        replace: true,
      });
    } catch (error: any) {
      setServerError(
        error?.response?.data?.error?.message ?? "Unable to create account.",
      );
    }
  });
  return (
    <main className="min-h-screen bg-blue-50/55 lg:grid lg:grid-cols-[.98fr_1.02fr]">
      <section className="grid min-h-screen place-items-center px-5 py-10">
        <div className="w-full max-w-md compass-page-enter">
          <Link
            to="/"
            className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back home
          </Link>
          <form
            onSubmit={submit}
            className="rounded-[2rem] border border-blue-100 bg-white p-7 shadow-[0_24px_60px_rgba(30,64,175,.09)] sm:p-9"
          >
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-blue-700">
              Join DELSU Compass
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-.04em]">
              Create your student space
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Create your account, verify your email with a 6-digit code, then
              personalize your academic profile.
            </p>
            <label className="mt-7 block text-sm font-medium text-slate-700">
              Full name
              <input
                className={inputClass}
                placeholder="Your full name"
                autoComplete="name"
                {...register("fullName")}
              />
            </label>
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-700">
                {errors.fullName.message}
              </p>
            )}
            <label className="mt-4 block text-sm font-medium text-slate-700">
              Email
              <input
                className={inputClass}
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                {...register("email")}
              />
            </label>
            {errors.email && (
              <p className="mt-1 text-sm text-red-700">
                {errors.email.message}
              </p>
            )}
            <label className="mt-4 block text-sm font-medium text-slate-700">
              Password
              <PasswordField
                className={inputClass}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                {...register("password")}
              />
            </label>
            {errors.password && (
              <p className="mt-1 text-sm text-red-700">
                {errors.password.message}
              </p>
            )}
            <div className="mt-4 grid grid-cols-3 gap-2 text-[11px] text-slate-500">
              {["8+ characters", "Upper & lowercase", "At least 1 number"].map(
                (x) => (
                  <span
                    key={x}
                    className="rounded-xl bg-slate-50 px-2 py-2 text-center"
                  >
                    {x}
                  </span>
                ),
              )}
            </div>
            {serverError && (
              <p
                role="alert"
                className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-3 text-sm font-medium text-red-800"
              >
                {serverError}
              </p>
            )}
            <button
              disabled={isSubmitting}
              className="mt-6 w-full rounded-2xl bg-blue-700 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-700/15 hover:bg-blue-800 disabled:opacity-60"
            >
              {isSubmitting ? "Creating account..." : "Create my account"}
            </button>
            <p className="mt-6 text-center text-sm text-slate-500">
              Already registered?{" "}
              <Link to="/login" className="font-semibold text-blue-700">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </section>
      <AuthVisualPanel
        image="https://images.pexels.com/photos/9158715/pexels-photo-9158715.jpeg"
        eyebrow="Student life, connected"
        title="Build one useful place for classes, housing, safety and campus discovery."
        copy="DELSU Compass is designed around the everyday decisions students make before, during and after lectures."
      />
    </main>
  );
}
