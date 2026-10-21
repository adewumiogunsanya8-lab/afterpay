export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="h-8 w-8 border-4 border-line border-t-brand-600 rounded-full animate-spin" />
      <p className="mt-4 text-sm text-ink-500">Loading…</p>
    </div>
  );
}