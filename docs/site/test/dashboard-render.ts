// Las páginas del dashboard leen el store: se renderizan adentro del provider, sin la carga simulada
// (en `renderToString` el `useEffect` que la apaga nunca corre).
import { createElement, type ReactElement } from "react"
import { renderToString } from "react-dom/server"

import { InvoicesProvider } from "../app/templates/dashboard/_state/invoices-context"

export const renderWithInvoices = (page: ReactElement, simulateLoading = false) =>
  renderToString(createElement(InvoicesProvider, { simulateLoading, children: page }))
