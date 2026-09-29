import { CheckIcon } from "lucide-react"

import { menuCheckClassName } from "../variants/menu.js"

/**
 * El tilde de un ítem marcado: el círculo de acento del «View as» de iCloud. Lo comparten
 * DropdownMenu, ContextMenu, Menubar, Select y Combobox; va adentro de su `ItemIndicator`.
 */
export function MenuCheck() {
  return (
    <span data-slot="menu-check" className={menuCheckClassName}>
      <CheckIcon aria-hidden="true" className="size-2.5 stroke-3" />
    </span>
  )
}
