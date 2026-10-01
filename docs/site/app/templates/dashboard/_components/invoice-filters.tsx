import { SearchField } from "sebs7n-ui/search-field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "sebs7n-ui/select"
import type { InvoiceStatus } from "../_data/invoices-mock"

interface InvoiceFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  statusFilter: InvoiceStatus | "all"
  onStatusFilterChange: (status: InvoiceStatus | "all") => void
  totalCount: number
}

export function InvoiceFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  totalCount,
}: InvoiceFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 items-center gap-3">
        <div className="w-full max-w-xs">
          <SearchField
            placeholder="Buscar factura o cliente…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="w-44">
          <Select
            value={statusFilter}
            onValueChange={(val) => onStatusFilterChange(val as InvoiceStatus | "all")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las facturas</SelectItem>
              <SelectItem value="paid">Cobradas</SelectItem>
              <SelectItem value="pending">Pendientes</SelectItem>
              <SelectItem value="overdue">Vencidas</SelectItem>
              <SelectItem value="void">Anuladas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="text-footnote text-label-secondary">
        Mostrando <span className="font-semibold text-label">{totalCount}</span> comprobantes
      </div>
    </div>
  )
}
