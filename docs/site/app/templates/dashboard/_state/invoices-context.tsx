"use client"

import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react"

import { calculateMetrics, INVOICES_MOCK, type Invoice } from "../_data/invoices-mock"
import { today } from "../_lib/format"
import { invoicesReducer, isCollectable, nextInvoiceId, type NewInvoice } from "./invoices-reducer"

interface InvoicesStore {
  invoices: Invoice[]
  loading: boolean
  metrics: ReturnType<typeof calculateMetrics>
  addInvoice: (input: NewInvoice) => Invoice
  /** Cobra las que se deben y devuelve cómo estaban, para el «Deshacer» del toast. */
  markPaid: (ids: string[]) => Invoice[]
  voidInvoice: (id: string) => void
  restore: (previous: Invoice[]) => void
}

const InvoicesContext = createContext<InvoicesStore | null>(null)

/** Lo que tarda el «fetch» de mentira: alcanza para ver los esqueletos sin hacer esperar. */
export const SIMULATED_LOAD_MS = 600

// Vive en el layout: navegar entre secciones no lo remonta, así que la carga se ve una sola vez y
// un alta en Facturas aparece en Inicio y en Clientes.
export function InvoicesProvider({ children, simulateLoading = true }: { children: ReactNode; simulateLoading?: boolean }) {
  const [state, dispatch] = useReducer(invoicesReducer, { invoices: INVOICES_MOCK, loading: simulateLoading })

  useEffect(() => {
    if (!simulateLoading) return
    const timer = setTimeout(() => dispatch({ type: "loaded" }), SIMULATED_LOAD_MS)
    return () => clearTimeout(timer)
  }, [simulateLoading])

  const store = useMemo<InvoicesStore>(
    () => ({
      invoices: state.invoices,
      loading: state.loading,
      metrics: calculateMetrics(state.invoices),
      addInvoice: (input) => {
        const invoice: Invoice = { ...input, id: nextInvoiceId(state.invoices), status: "pending" }
        dispatch({ type: "add", invoice })
        return invoice
      },
      markPaid: (ids) => {
        const previous = state.invoices.filter((inv) => ids.includes(inv.id) && isCollectable(inv))
        dispatch({ type: "markPaid", ids, date: today() })
        return previous
      },
      voidInvoice: (id) => dispatch({ type: "void", id, date: today() }),
      restore: (previous) => dispatch({ type: "restore", previous }),
    }),
    [state]
  )

  return <InvoicesContext.Provider value={store}>{children}</InvoicesContext.Provider>
}

export function useInvoicesStore() {
  const store = useContext(InvoicesContext)
  if (!store) throw new Error("useInvoicesStore necesita <InvoicesProvider>")
  return store
}
