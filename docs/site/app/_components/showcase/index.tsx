"use client"

import { lazy, Suspense, useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "sebs7n-ui/tabs"
import { TooltipProvider } from "sebs7n-ui/tooltip"

/** Las cuatro pantallas de ejemplo, en el orden del selector. */
export const SHOWCASES = [
  { id: "home", label: "Inicio" },
  { id: "files", label: "Archivos" },
  { id: "settings", label: "Ajustes" },
  { id: "mail", label: "Correo" },
] as const

export type ShowcaseId = (typeof SHOWCASES)[number]["id"]

// Cada pantalla es un chunk aparte que se pide recién al elegirla. `lazy` de React y no
// `next/dynamic`: el de Next agrega un preload al HTML y el chunk contaría en el presupuesto de JS
// del Playground (ver `demo-slot.tsx`).
const LAYOUTS: Record<ShowcaseId, React.LazyExoticComponent<() => React.JSX.Element>> = {
  home: lazy(() => import("./home").then((mod) => ({ default: mod.HomeShowcase }))),
  files: lazy(() => import("./files").then((mod) => ({ default: mod.FilesShowcase }))),
  settings: lazy(() => import("./settings").then((mod) => ({ default: mod.SettingsShowcase }))),
  mail: lazy(() => import("./mail").then((mod) => ({ default: mod.MailShowcase }))),
}

const STORAGE_KEY = "sebs7n-docs:showcase"
const esShowcase = (valor: unknown): valor is ShowcaseId => SHOWCASES.some((showcase) => showcase.id === valor)

/** Pantallas enteras armadas con el paquete, una por vez, dentro de un marco de alto fijo. */
export function Showcase() {
  const [elegida, setElegida] = useState<ShowcaseId>("home")
  // La pantalla se monta recién en el cliente: prerenderizada, su chunk iría en el HTML.
  const [montado, setMontado] = useState(false)

  useEffect(() => {
    try {
      const guardada = window.localStorage.getItem(STORAGE_KEY)
      if (esShowcase(guardada)) setElegida(guardada)
    } catch {
      // Sin almacenamiento (ventana privada, bloqueado): arranca en Inicio.
    }
    setMontado(true)
  }, [])

  const elegir = (valor: unknown) => {
    if (!esShowcase(valor)) return
    setElegida(valor)
    try {
      window.localStorage.setItem(STORAGE_KEY, valor)
    } catch {
      // Recordarla es una comodidad: si no se puede, no pasa nada.
    }
  }

  return (
    <section aria-labelledby="pg-pantallas" className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-title-2 text-label" id="pg-pantallas">
          Pantallas
        </h2>
        <p className="text-callout text-label-secondary">
          Cuatro pantallas completas, armadas solo con componentes del paquete: probalas con el mouse y con el teclado.
        </p>
      </div>
      <Tabs onValueChange={elegir} value={elegida}>
        <TabsList aria-label="Pantalla" className="w-full max-w-md" variant="segmented">
          {SHOWCASES.map((showcase) => (
            <TabsTrigger key={showcase.id} value={showcase.id}>
              {showcase.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {SHOWCASES.map((showcase) => {
          const Layout = LAYOUTS[showcase.id]
          return (
            <TabsContent
              // El marco: alto fijo (`--showcase-height`, que usan las pantallas con AppShell) y
              // `[contain:paint]`, que deja adentro el wallpaper y todo lo `fixed`. El filo es un `ring` y no
              // un borde: el borde le comía 2 px al ancho y el Correo, a 1024 justos, perdía el tercer panel.
              className="relative h-(--showcase-height) overflow-hidden rounded-surface bg-background ring-1 ring-separator shadow-card [--showcase-height:560px] [contain:paint] sm:[--showcase-height:640px]"
              key={showcase.id}
              value={showcase.id}
            >
              {montado && (
                <Suspense fallback={null}>
                  <TooltipProvider>
                    <Layout />
                  </TooltipProvider>
                </Suspense>
              )}
            </TabsContent>
          )
        })}
      </Tabs>
    </section>
  )
}
