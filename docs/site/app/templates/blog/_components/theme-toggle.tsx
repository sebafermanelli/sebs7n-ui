"use client"

import dynamic from "next/dynamic"

// El selector de tema se pide después de hidratar: la lectura es de Server Components y no debe pagar
// su JS al abrir. Mientras llega, una caja del mismo tamaño evita que la barra salte.
const ThemeSwitcher = dynamic(() => import("sebs7n-ui/theme-switcher").then((mod) => mod.ThemeSwitcher), {
  ssr: false,
  loading: () => <span aria-hidden="true" className="inline-block h-8 w-24" />,
})

export function ThemeToggle() {
  return <ThemeSwitcher />
}
