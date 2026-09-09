import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props { children: ReactNode }
interface State { hasError: boolean }

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) console.error("UI boundary caught an error", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <main className="compass-app-bg flex min-h-screen items-center justify-center px-6">
        <section className="compass-card max-w-md p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
            <AlertTriangle size={24} />
          </div>
          <h1 className="text-xl font-semibold text-slate-950">Compass hit a temporary problem</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Your data has not been changed. Reload this page and try again.</p>
          <button onClick={() => window.location.reload()} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800">
            <RefreshCw size={16} /> Reload Compass
          </button>
        </section>
      </main>
    );
  }
}
