"use client"

import { LogOutIcon, SettingsIcon } from "lucide-react"
import { DropdownMenuItem } from "sebs7n-ui/dropdown-menu"
import { UserMenu } from "sebs7n-ui/user-menu"

/**
 * Con ítems propios
 * La fila «Tema» son `menuitemradio`: se recorren con las flechas y no cierran el menú.
 */
export function Basico() {
  return (
    <div className="w-64 rounded-xl border border-gray-400 bg-background-200 p-2">
      <UserMenu
        signOut={
          <DropdownMenuItem>
            <LogOutIcon />
            Cerrar sesión
          </DropdownMenuItem>
        }
        user={{ name: "Ana Pérez", email: "ana@acme.com" }}
      >
        <DropdownMenuItem>
          <SettingsIcon />
          Ajustes de cuenta
        </DropdownMenuItem>
      </UserMenu>
    </div>
  )
}
