import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { AuthVisualPanel } from "./AuthVisualPanel";
import { PasswordField } from "./PasswordField";
const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});
type FormData = z.infer<typeof schema>;
const inputClass =
  "mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3.5 text-sm outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100/70";
export function LoginPage() {
  const { login } = useAuth();
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
      const user = await login(values.email, values.password);
      navigate(
        user.role === "administrator" ? "/admin/dashboard" : "/app/dashboard",
        { replace: true },
      );
    } catch (error: any) {
      setServerError(
        error?.response?.data?.error?.message ??
          "Unable to sign in. Please try again.",
      );
    }
  });
  return (
    <main className="min-h-screen bg-blue-50/55 lg:grid lg:grid-cols-[1.02fr_.98fr]">
      <AuthVisualPanel
        image="https://images.pexels.com/photos/19501563/pexels-photo-19501563.jpeg"
        eyebrow="Welcome back"
        title="Pick up your campus day without losing your place."
        copy="Your timetable, campus updates, map routes, events and personal tools are ready when you are."
      />
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
              DELSU Compass
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-.04em]">
              Sign in
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Welcome back to your student space.
            </p>
            <label className="mt-7 block text-sm font-medium text-slate-700">
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
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">
                Password
              </span>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-blue-700 hover:text-blue-800"
              >
                Forgot password?
              </Link>
            </div>
            <PasswordField
              className={inputClass}
              placeholder="••••••••"
              autoComplete="current-password"
              {...register("password")}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-700">
                {errors.password.message}
              </p>
            )}
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
              className="mt-6 w-full rounded-2xl bg-blue-700 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-700/15 transition hover:bg-blue-800 disabled:opacity-60"
            >
              {isSubmitting ? "Signing in..." : "Sign in to Compass"}
            </button>
            <p className="mt-6 text-center text-sm text-slate-500">
              New student?{" "}
              <Link to="/register" className="font-semibold text-blue-700">
                Create an account
              </Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
