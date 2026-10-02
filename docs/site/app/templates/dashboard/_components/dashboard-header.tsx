"use client"

import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"
import { DropdownMenuItem } from "sebs7n-ui/dropdown-menu"
import { UserMenu } from "sebs7n-ui/user-menu"
import { buttonVariants } from "sebs7n-ui/variants/button"

// El contenido de la barra global: el alto, el fondo y el borde los pone `AppShell` (prop `header`).
// `compact` es la del teléfono (`mobileBar`): al lado de la hamburguesa entran el nombre y el avatar.
// El tema no va aparte: `UserMenu` ya trae su fila.
export function DashboardHeader({ compact = false }: { compact?: boolean }) {
  return (
    <>
      <div className="flex min-w-0 items-center gap-2">
        {!compact && (
          <>
            <Link
              className={buttonVariants({ variant: "plain", size: "sm" })}
              href="/templates"
            >
              <ArrowLeftIcon />
              Templates
            </Link>
            <span aria-hidden="true" className="text-label-tertiary">
              /
            </span>
          </>
        )}
        <span className="truncate text-callout font-medium text-label">
          Acme Facturación
        </span>
      </div>

      {/* En su caja: el trigger de `UserMenu` ocupa todo el ancho que le den (es la fila del sidebar). */}
      <div className="ml-auto shrink-0">
        <UserMenu
          align="end"
          collapsed={compact}
          signOut={<DropdownMenuItem>Cerrar sesión</DropdownMenuItem>}
          user={{ name: "Administración", email: "admin@acme.com" }}
        >
          <DropdownMenuItem>Perfil y equipo</DropdownMenuItem>
          <DropdownMenuItem>Preferencias de facturación</DropdownMenuItem>
        </UserMenu>
      </div>
    </>
  )
}
