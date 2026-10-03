"use client"

import { FileTextIcon, HomeIcon, KeyboardIcon, SettingsIcon, UserIcon, UsersIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo } from "react"
import { CommandPalette, type CommandPaletteGroup } from "sebs7n-ui/command-palette"

import { deriveCustomers } from "../_data/derive"
import { customerPath, CUSTOMERS_PATH, DASHBOARD_PATH, INVOICES_PATH, SETTINGS_PATH } from "../_lib/routes"
import { shortcutOf } from "../_lib/shortcuts"
import { useInvoicesStore } from "../_state/invoices-context"

const SECTIONS = [
  { href: DASHBOARD_PATH, label: "Inicio", icon: <HomeIcon /> },
  { href: INVOICES_PATH, label: "Facturas", icon: <FileTextIcon /> },
  { href: CUSTOMERS_PATH, label: "Clientes", icon: <UsersIcon /> },
  { href: SETTINGS_PATH, label: "Configuración", icon: <SettingsIcon /> },
]

// El cuerpo de la paleta, en su propio archivo para pedirlo recién la primera vez que se abre
// (`dynamic` en `dashboard-command.tsx`): cmdk no hace falta para pintar la pantalla.
export default function DashboardCommandDialog({ open, onOpenChange, onOpenShortcuts }: { open: boolean; onOpenChange: (open: boolean) => void; onOpenShortcuts: () => void }) {
  const router = useRouter()
  const { invoices, customers: records } = useInvoicesStore()

  const groups = useMemo<CommandPaletteGroup[]>(() => {
    const customers = deriveCustomers(invoices, records)
    return [
      {
        heading: "Secciones",
        items: SECTIONS.map((section) => ({
          value: section.href,
          label: section.label,
          icon: section.icon,
          description: shortcutOf(section.href),
          onSelect: () => router.push(section.href),
        })),
      },
      {
        heading: "Facturas",
        items: invoices.map((invoice) => ({
          value: invoice.id,
          label: invoice.id,
          icon: <FileTextIcon />,
          description: `${invoice.customer} · ${invoice.concept}`,
          keywords: [invoice.customer, invoice.concept, ...(invoice.tags ?? [])],
          onSelect: () => router.push(INVOICES_PATH),
        })),
      },
      {
        heading: "Clientes",
        items: customers.map((customer) => ({
          value: customer.name,
          label: customer.name,
          icon: <UserIcon />,
          description: customer.email,
          onSelect: () => router.push(customerPath(customer.id)),
        })),
      },
      {
        heading: "Ayuda",
        items: [{ value: "shortcuts", label: "Atajos de teclado", icon: <KeyboardIcon />, description: "Tecla ?", keywords: ["atajos", "teclado", "shortcuts"], onSelect: onOpenShortcuts }],
      },
    ]
  }, [invoices, records, router, onOpenShortcuts])

  return <CommandPalette groups={groups} labels={{ dialog: "Buscar en Acme Facturación" }} onOpenChange={onOpenChange} open={open} placeholder="Secciones, facturas, clientes…" />
}
