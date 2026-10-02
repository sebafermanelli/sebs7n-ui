import { toast } from "sonner"

import type { Invoice } from "../_data/invoices-mock"

// Cobrar es reversible: el toast lo dice y ofrece volver atrás. Anular no lo es y va por AlertDialog.
export function notifyPaid(previous: Invoice[], restore: (previous: Invoice[]) => void) {
  if (previous.length === 0) return
  const message = previous.length === 1 ? `Factura ${previous[0]!.id} cobrada.` : `${previous.length} facturas cobradas.`
  toast.success(message, { action: { label: "Deshacer", onClick: () => restore(previous) } })
}
