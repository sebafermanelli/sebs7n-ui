import type { Invoice } from "../_data/invoices-mock"

/** Lo que carga el diálogo de alta: el id y el estado los pone el store. */
export type NewInvoice = Omit<Invoice, "id" | "status" | "paidAt" | "voidedAt">

export interface InvoicesState {
  invoices: Invoice[]
  loading: boolean
}

export type InvoicesAction =
  | { type: "loaded" }
  | { type: "add"; invoice: Invoice }
  | { type: "markPaid"; ids: string[]; date: string }
  | { type: "void"; id: string; date: string }
  | { type: "restore"; previous: Invoice[] }

/** Solo se cobra lo que se debe: una cobrada o una anulada no cambia. */
export const isCollectable = (inv: Invoice) => inv.status === "pending" || inv.status === "overdue"

export function nextInvoiceId(invoices: Invoice[]) {
  const max = invoices.reduce((acc, inv) => Math.max(acc, Number(inv.id.replace(/\D/g, "")) || 0), 1000)
  return `FAC-${max + 1}`
}

export function invoicesReducer(state: InvoicesState, action: InvoicesAction): InvoicesState {
  switch (action.type) {
    case "loaded":
      return { ...state, loading: false }
    case "add":
      return { ...state, invoices: [action.invoice, ...state.invoices] }
    case "markPaid": {
      const ids = new Set(action.ids)
      return {
        ...state,
        invoices: state.invoices.map((inv) =>
          ids.has(inv.id) && isCollectable(inv) ? { ...inv, status: "paid" as const, paidAt: action.date } : inv
        ),
      }
    }
    case "void":
      return {
        ...state,
        invoices: state.invoices.map((inv) => {
          if (inv.id !== action.id || inv.status === "void") return inv
          // Una anulada no se cobró: sin `paidAt` el gráfico no la cuenta como cobrada.
          const { paidAt: _paidAt, ...rest } = inv
          return { ...rest, status: "void" as const, voidedAt: action.date }
        }),
      }
    case "restore": {
      const previous = new Map(action.previous.map((inv) => [inv.id, inv]))
      return { ...state, invoices: state.invoices.map((inv) => previous.get(inv.id) ?? inv) }
    }
  }
}
