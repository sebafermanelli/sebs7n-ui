"use client"

import { useState } from "react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "sebs7n-ui/resizable"

/**
 * Carpetas, lista y vista previa
 * Tres paneles lado a lado: la línea entre paneles de Mail se agarra (se vuelve acento) y se arrastra, o se enfoca con Tab y se mueve con las flechas. `onLayout` avisa el reparto para guardarlo.
 */
export function Basico() {
  const [reparto, setReparto] = useState<number[]>([22, 33, 45])
  return (
    <div className="flex w-full flex-col gap-2">
      <div className="h-72 w-full overflow-hidden rounded-surface border border-separator-strong">
        <ResizablePanelGroup defaultLayout={reparto} onLayout={setReparto}>
          <ResizablePanel className="bg-surface-secondary p-4" maxSize={40} minSize={15}>
            <p className="text-callout font-semibold">Carpetas</p>
            <p className="text-callout text-label-secondary">Emitidas · Recibidas · Archivo</p>
          </ResizablePanel>
          <ResizableHandle aria-label="Ancho de las carpetas" />
          <ResizablePanel className="p-4" minSize={25}>
            <p className="text-callout font-semibold">Facturas</p>
            <p className="text-callout text-label-secondary">A-0012 · Acme S.A.</p>
          </ResizablePanel>
          <ResizableHandle aria-label="Ancho de la lista" withHandle />
          <ResizablePanel className="p-4" minSize={25}>
            <p className="text-callout font-semibold">Vista previa</p>
            <p className="text-callout text-label-secondary">Servicios de septiembre · $ 128.400</p>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      <p className="text-footnote text-label-secondary tabular-nums">Reparto: {reparto.map((size) => `${Math.round(size)} %`).join(" · ")}</p>
    </div>
  )
}

/**
 * Apilados
 * `orientation="vertical"`: el detalle arriba y las notas abajo; la línea se mueve con ↑ ↓.
 */
export function Vertical() {
  return (
    <div className="h-72 w-full max-w-md overflow-hidden rounded-surface border border-separator-strong">
      <ResizablePanelGroup orientation="vertical">
        <ResizablePanel className="p-4" defaultSize={60} minSize={30}>
          <p className="text-callout font-semibold">Factura A-0012</p>
          <p className="text-callout text-label-secondary">Acme S.A. · Vence el 30/09</p>
        </ResizablePanel>
        <ResizableHandle aria-label="Alto de las notas" withHandle />
        <ResizablePanel className="bg-surface-secondary p-4" minSize={20}>
          <p className="text-callout font-semibold">Notas internas</p>
          <p className="text-callout text-label-secondary">Pedir la orden de compra antes de enviar.</p>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
