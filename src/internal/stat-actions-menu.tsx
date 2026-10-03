"use client"

import type * as React from "react"
import { EllipsisIcon } from "lucide-react"

import { Button } from "../components/button.js"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../components/dropdown-menu.js"

/** El menú de `StatActions`, en su propio módulo para que se pida con `React.lazy`. */
export default function StatActionsMenu({ name, loading, defaultOpen, children }: { name: string; loading?: boolean; defaultOpen?: boolean; children: React.ReactNode }) {
  return (
    <DropdownMenu defaultOpen={defaultOpen}>
      <DropdownMenuTrigger render={<Button aria-label={name} disabled={loading} size="icon-sm" variant="plain" />}>
        <EllipsisIcon aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">{children}</DropdownMenuContent>
    </DropdownMenu>
  )
}
