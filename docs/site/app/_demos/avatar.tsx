"use client"

import { Avatar, AvatarFallback, AvatarImage } from "sebs7n-ui/avatar"

/**
 * Tamaños y monograma
 * Los de iCloud: 28 en una barra, 32 en una lista, 40 y 80 en una ficha. Sin foto, el monograma blanco sobre el gradiente gris.
 */
export function Basico() {
  return (
    <div className="flex items-center gap-4">
      <Avatar size="sm">
        <AvatarFallback>AP</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage alt="" src="https://avatars.githubusercontent.com/u/9919?s=96&v=4" />
        <AvatarFallback>GH</AvatarFallback>
      </Avatar>
      <Avatar size="lg">
        <AvatarFallback>ER</AvatarFallback>
      </Avatar>
      <Avatar size="xl">
        <AvatarFallback>ND</AvatarFallback>
      </Avatar>
    </div>
  )
}
