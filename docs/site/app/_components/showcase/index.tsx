"use client"

import { SiteBackdrop } from "../site-backdrop"
import { type Fondo } from "../../_lib/wallpaper"
import { lazy, Suspense, useCallback, useEffect, useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "sebs7n-ui/tabs"
import { TooltipProvider } from "sebs7n-ui/tooltip"

import { RECETA_MARCO, RECETAS, SHOWCASES, umbralDe, type ShowcaseId } from "./catalog"

export { SHOWCASES, type ShowcaseId }

// Cada pantalla es un chunk aparte que se pide recién al elegirla, igual que el marco (`AppShell` con el
// panel, ⌘K y los atajos) y «Cómo se arma». `lazy` de React y no `next/dynamic`: el de Next agrega un preload
// al HTML y el chunk contaría en el presupuesto de JS del Playground (ver `demo-slot.tsx`).
const LAYOUTS: Record<ShowcaseId, React.LazyExoticComponent<() => React.JSX.Element>> = {
  home: lazy(() => import("./home").then((mod) => ({ default: mod.HomeShowcase }))),
  files: lazy(() => import("./files").then((mod) => ({ default: mod.FilesShowcase }))),
  settings: lazy(() => import("./settings").then((mod) => ({ default: mod.SettingsShowcase }))),
  mail: lazy(() => import("./mail").then((mod) => ({ default: mod.MailShowcase })))
}
const ShowcaseShell = lazy(() => import("./shell").then((mod) => ({ default: mod.ShowcaseShell })))
const ComoSeArma = lazy(() => import("./como-se-arma"))

const STORAGE_KEY = "sebs7n-docs:showcase"
const esShowcase = (valor: unknown): valor is ShowcaseId => SHOWCASES.some((showcase) => showcase.id === valor)

type ShowcaseProps = {
  /** El fondo del marco: el del sitio, el wallpaper de iCloud (`AppShell ambient`) o liso. Lo elige el Playground. */
  fondo?: Fondo
  /** El panel lateral con el asistente, abierto o no: el interruptor «Panel del asistente» del Playground. */
  asideOpen?: boolean
  onAsideOpenChange?: (open: boolean) => void
}

/** Pantallas enteras armadas con el paquete, una por vez, dentro de un `AppShell` de alto fijo. */
export function Showcase({ fondo = "site", asideOpen = false, onAsideOpenChange }: ShowcaseProps) {
  const [elegida, setElegida] = useState<ShowcaseId>("home")
  // La pantalla se monta recién en el cliente: prerenderizada, su chunk iría en el HTML.
  const [montado, setMontado] = useState(false)
  const [ancho, setAncho] = useState<number | null>(null)
  const [propio, setPropio] = useState(false)
  const abierto = onAsideOpenChange ? asideOpen : propio
  const abrir = onAsideOpenChange ?? setPropio

  useEffect(() => {
    try {
      const guardada = window.localStorage.getItem(STORAGE_KEY)
      if (esShowcase(guardada)) setElegida(guardada)
    } catch {
      // Sin almacenamiento (ventana privada, bloqueado): arranca en Inicio.
    }
    setMontado(true)
  }, [])

  const elegir = useCallback((valor: unknown) => {
    if (!esShowcase(valor)) return
    setElegida(valor)
    try {
      window.localStorage.setItem(STORAGE_KEY, valor)
    } catch {
      // Recordarla es una comodidad: si no se puede, no pasa nada.
    }
  }, [])

  const Layout = LAYOUTS[elegida]
  const umbral = ancho === null ? null : umbralDe(ancho)
  return (
    <section aria-labelledby="pg-pantallas" className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-title-2 text-label" id="pg-pantallas">
          Pantallas
        </h2>
        <p className="text-callout text-label-secondary">
          Cuatro pantallas dentro de un <code className="text-mono-body">AppShell</code>, armadas solo con componentes del paquete. Hacé clic adentro y probá{" "}
          <kbd className="text-mono-body">⌘K</kbd>, <kbd className="text-mono-body">?</kbd> o <kbd className="text-mono-body">g</kbd> y una letra.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <Tabs onValueChange={elegir} value={elegida}>
          <TabsList aria-label="Pantalla" className="w-full max-w-md" variant="segmented">
            {SHOWCASES.map((showcase) => (
              <TabsTrigger key={showcase.id} value={showcase.id}>
                {showcase.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        {/* El ancho de la caja que miden las container queries de adentro: con el panel abierto baja. */}
        <p className="text-footnote text-label-secondary tabular-nums" data-slot="showcase-width">
          Ancho del contenido: {ancho === null ? "—" : `${ancho} px`}
          {umbral && <> · pasa <code className="text-mono-body">{umbral}</code></>}
        </p>
      </div>
      {/* El marco: alto fijo (`--showcase-height`, que usan el AppShell y las pantallas con paneles) y
          `[contain:paint]`, que deja adentro el wallpaper y todo lo `fixed`. El filo es un `ring` y no un
          borde: el borde le comía 2 px al ancho. */}
      <div
        className="relative h-(--showcase-height) overflow-hidden rounded-surface bg-background ring-1 ring-separator shadow-card [--showcase-height:560px] [contain:paint] sm:[--showcase-height:640px]"
        data-slot="showcase-frame"
      >
        {fondo === "site" && <SiteBackdrop />}
        {montado && (
          <Suspense fallback={null}>
            <TooltipProvider>
              <ShowcaseShell fondo={fondo} asideOpen={abierto} onAsideOpenChange={abrir} onScreen={elegir} onWidth={setAncho} screen={elegida}>
                <Suspense fallback={null}>
                  <Layout />
                </Suspense>
              </ShowcaseShell>
            </TooltipProvider>
          </Suspense>
        )}
      </div>
      {montado && (
        <div className="flex flex-col gap-2">
          <Suspense fallback={null}>
            <ComoSeArma key={elegida} receta={RECETAS[elegida]} titulo={`Cómo se arma · ${SHOWCASES.find((item) => item.id === elegida)?.label}`} />
            <ComoSeArma receta={RECETA_MARCO} titulo="Cómo se arma el marco: AppShell, panel del asistente, ⌘K y atajos" />
          </Suspense>
        </div>
      )}
    </section>
  )
}
