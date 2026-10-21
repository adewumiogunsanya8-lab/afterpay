import { cn } from "@/lib/cn";

export type Column<T> = {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
  align?: "left" | "center" | "right";
};

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  emptyMessage = "No items found.",
  className,
}: {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  className?: string;
}) {
  if (data.length === 0) {
    return (
      <div className={cn("rounded-xl border border-line bg-white shadow-sm", className)}>
        <div className="p-8 text-center text-ink-400">{emptyMessage}</div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl border border-line bg-white shadow-sm", className)}>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-line text-left text-xs font-semibold text-ink-500 uppercase">
            {columns.map((col) => (
              <th
                key={col.header}
                className={cn(
                  "p-4",
                  col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "",
                  col.className,
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-ink-700 divide-y divide-line">
          {data.map((row) => (
            <tr key={String((row as Record<string, unknown>).id)} className="hover:bg-surface transition">
              {columns.map((col) => {
                const cell =
                  typeof col.accessor === "function"
                    ? col.accessor(row)
                    : row[col.accessor];
                return (
                  <td
                    key={col.header}
                    className={cn(
                      "p-4",
                      col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "",
                      col.className,
                    )}
                  >
                    {String(cell)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}