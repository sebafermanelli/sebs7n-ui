import { SearchField } from "sebs7n-ui/search-field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "sebs7n-ui/select"
import type { InvoiceStatus } from "../_data/invoices-mock"

// `items` es lo que hace que el trigger muestre «Todas las facturas» y no `all`.
const STATUS_ITEMS: Record<InvoiceStatus | "all", string> = {
  all: "Todas las facturas",
  paid: "Cobradas",
  pending: "Pendientes",
  overdue: "Vencidas",
  void: "Anuladas",
}

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
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        <div className="w-full sm:max-w-xs">
          <SearchField
            placeholder="Buscar factura o cliente…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-44">
          <Select
            items={STATUS_ITEMS}
            value={statusFilter}
            aria-label="Estado"
            onValueChange={(val) => onStatusFilterChange((val ?? "all") as InvoiceStatus | "all")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(STATUS_ITEMS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
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
