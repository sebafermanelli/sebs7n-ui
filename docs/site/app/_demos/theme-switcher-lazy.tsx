"use client"

import { ThemeSwitcherLazy } from "sebs7n-ui/theme-switcher-lazy"

/**
 * El tema, diferido sin salto
 * Ocupa 96 × 32 desde el primer render; el control real se pide al quedar libre el navegador o al apuntarlo.
 */
export function Basic() {
  return <ThemeSwitcherLazy />
}
