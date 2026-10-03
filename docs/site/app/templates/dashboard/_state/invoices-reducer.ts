import type { Invoice } from "../_data/invoices-mock"

/** Lo que carga el diálogo de alta: el id y el estado los pone el store. */
export type NewInvoice = Omit<Invoice, "id" | "status" | "paidAt" | "voidedAt">

export interface InvoicesState {
  invoices: Invoice[]
  loading: boolean
  /** La carga falló: las listas muestran el error con «Reintentar» en vez de las filas. */
  error: boolean
}

export type InvoicesAction =
  | { type: "loaded" }
  | { type: "failed" }
  | { type: "retry" }
  | { type: "add"; invoice: Invoice }
  | { type: "markPaid"; ids: string[]; date: string }
  | { type: "void"; id: string; date: string }
  | { type: "restore"; previous: Invoice[] }
  /** Una cobrada vuelve a «se debe»: pendiente, o vencida si ya pasó su fecha (`date` es hoy). */
  | { type: "reopen"; ids: string[]; date: string }
  | { type: "setTags"; id: string; tags: string[] }
  /** `at` en `YYYY-MM-DDTHH:mm`; `null` lo cancela. */
  | { type: "scheduleReminder"; id: string; at: string | null }

/** Solo se cobra lo que se debe: una cobrada o una anulada no cambia. */
export const isCollectable = (inv: Invoice) => inv.status === "pending" || inv.status === "overdue"

/** Etiquetas sin espacios de más, sin vacías y sin repetidas (sin distinguir mayúsculas). */
export function normalizeTags(tags: string[]) {
  const seen = new Set<string>()
  return tags
    .map((tag) => tag.trim())
    .filter((tag) => {
      const key = tag.toLocaleLowerCase("es")
      if (!tag || seen.has(key)) return false
      seen.add(key)
      return true
    })
}

export function nextInvoiceId(invoices: Invoice[]) {
  const max = invoices.reduce((acc, inv) => Math.max(acc, Number(inv.id.replace(/\D/g, "")) || 0), 1000)
  return `FAC-${max + 1}`
}

export function invoicesReducer(state: InvoicesState, action: InvoicesAction): InvoicesState {
  switch (action.type) {
    case "loaded":
      return { ...state, loading: false, error: false }
    case "failed":
      return { ...state, loading: false, error: true }
    case "retry":
      return { ...state, loading: true, error: false }
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
    case "reopen": {
      const ids = new Set(action.ids)
      return {
        ...state,
        invoices: state.invoices.map((inv) => {
          if (!ids.has(inv.id) || inv.status !== "paid") return inv
          const { paidAt: _paidAt, ...rest } = inv
          return { ...rest, status: inv.dueDate < action.date ? ("overdue" as const) : ("pending" as const) }
        }),
      }
    }
    case "setTags":
      return { ...state, invoices: state.invoices.map((inv) => (inv.id === action.id ? { ...inv, tags: normalizeTags(action.tags) } : inv)) }
    case "scheduleReminder":
      return {
        ...state,
        invoices: state.invoices.map((inv) => {
          if (inv.id !== action.id || !isCollectable(inv)) return inv
          const { reminderAt: _reminderAt, ...rest } = inv
          return action.at ? { ...rest, reminderAt: action.at } : rest
        }),
      }
    case "restore": {
      const previous = new Map(action.previous.map((inv) => [inv.id, inv]))
      return { ...state, invoices: state.invoices.map((inv) => previous.get(inv.id) ?? inv) }
    }
  }
}
