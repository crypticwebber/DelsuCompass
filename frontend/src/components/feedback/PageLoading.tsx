export function PageLoading() {
  return (
    <div className="compass-app-bg flex min-h-[45vh] items-center justify-center px-6" role="status" aria-live="polite">
      <div className="text-center">
        <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" />
        <p className="mt-3 text-sm font-medium text-slate-600">Loading your Compass…</p>
      </div>
    </div>
  );
}
