"use client"

import { useMemo, useState } from "react"
import {
  calculateMetrics,
  filterInvoices,
  INVOICES_MOCK,
  type Invoice,
  type InvoiceStatus,
} from "../_data/invoices-mock"

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>(INVOICES_MOCK)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "all">("all")

  const filteredInvoices = useMemo(
    () => filterInvoices(invoices, search, statusFilter),
    [invoices, search, statusFilter]
  )

  const metrics = useMemo(() => calculateMetrics(invoices), [invoices])

  const addInvoice = (newInv: Omit<Invoice, "id" | "status">) => {
    const nextId = `FAC-${1000 + invoices.length + 1}`
    const created: Invoice = {
      ...newInv,
      id: nextId,
      status: "pending",
    }
    setInvoices((prev) => [created, ...prev])
    return created
  }

  const markAsPaid = (id: string) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status: "paid" } : inv))
    )
  }

  const voidInvoice = (id: string) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status: "void" } : inv))
    )
  }

  return {
    invoices: filteredInvoices,
    rawInvoices: invoices,
    metrics,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    addInvoice,
    markAsPaid,
    voidInvoice,
  }
}
