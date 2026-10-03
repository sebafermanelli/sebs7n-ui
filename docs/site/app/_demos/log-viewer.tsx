"use client"

import { PauseIcon, PlayIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "sebs7n-ui/button"
import { LogViewer, type LogLine } from "sebs7n-ui/log-viewer"

const LINES: LogLine[] = [
  { id: 1, time: "14:02:11", message: "Generando factura F-0042" },
  { id: 2, time: "14:02:12", message: "Enviando a Acme S.A." },
  { id: 3, time: "14:02:14", level: "warn", message: "Reintento 1 de 3: el servidor de correo tardó en responder" },
  { id: 4, time: "14:02:19", level: "error", message: "No se pudo enviar F-0042: buzón lleno" },
  { id: 5, time: "14:02:20", message: "F-0042 queda pendiente de envío" },
]

/**
 * Niveles
 * `warn` y `error` llevan el nivel escrito además del color; `info` lo dice solo el lector. El visor se recorre con el teclado.
 */
export function Levels() {
  return <LogViewer aria-label="Registro de envíos" className="w-full" lines={LINES} />
}

/**
 * En vivo
 * Sigue la última línea mientras el scroll esté al final; si subís a leer, se queda donde estás. Pausar es un botón de la app.
 */
export function Live() {
  const [lines, setLines] = useState<LogLine[]>(LINES)
  const [paused, setPaused] = useState(false)
  useEffect(() => {
    if (paused) return
    const timer = setInterval(() => {
      setLines((previous) => [...previous, { id: previous.length + 1, time: new Date().toTimeString().slice(0, 8), message: `Cobro conciliado ${previous.length + 1}` }].slice(-200))
    }, 1000)
    return () => clearInterval(timer)
  }, [paused])
  return (
    <div className="flex w-full flex-col gap-2">
      <div>
        <Button onClick={() => setPaused((value) => !value)} size="sm" variant="secondary">
          {paused ? <PlayIcon /> : <PauseIcon />}
          {paused ? "Reanudar" : "Pausar"}
        </Button>
      </div>
      <LogViewer aria-label="Cobros en vivo" lines={lines} variant="terminal" />
    </div>
  )
}

/**
 * Cargando y vacío
 * Cargando dice «Cargando…» y marca la región como ocupada; sin líneas, por qué no hay.
 */
export function States() {
  return (
    <div className="flex w-full flex-col gap-3">
      <LogViewer aria-label="Cargando registro" className="h-24" lines={[]} loading />
      <LogViewer aria-label="Registro vacío" className="h-24" emptyMessage="Ninguna línea coincide con los filtros." lines={[]} />
    </div>
  )
}
