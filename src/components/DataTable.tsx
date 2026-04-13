import type { ReactNode } from "react";

type Column<T> = {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  rows: T[];
  emptyTitle?: string;
  emptyHint?: string;
};

export function DataTable<T>({
  columns,
  rows,
  emptyTitle = "No records found yet.",
  emptyHint = "Use the filters above or add a new record to get started.",
}: DataTableProps<T>) {
  if (rows.length === 0) {
    return (
      <div className="table-empty-state">
        <div className="table-empty-state__glyph">--</div>
        <strong>{emptyTitle}</strong>
        <p>{emptyHint}</p>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              {columns.map((column) => (
                <td key={column.key}>{column.render(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
