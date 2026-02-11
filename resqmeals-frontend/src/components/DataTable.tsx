type Column<T> = {
  header: string
  accessor: keyof T
}

type DataTableProps<T> = {
  data: T[]
  columns: Column<T>[]
}

const DataTable = <T extends Record<string, unknown>>({ data, columns }: DataTableProps<T>) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate/10 bg-white shadow-card">
      <table className="min-w-full text-sm">
        <thead className="bg-soft text-left text-slate/70">
          <tr>
            {columns.map((col) => (
              <th key={String(col.accessor)} className="px-4 py-3 font-semibold">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={idx}
              className="border-t border-slate/5 bg-white transition hover:bg-primary/5"
            >
              {columns.map((col) => (
                <td key={String(col.accessor)} className="px-4 py-3 text-slate/80">
                  {String(row[col.accessor])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default DataTable
