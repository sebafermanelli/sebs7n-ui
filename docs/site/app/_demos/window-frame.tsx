import { Badge } from "sebs7n-ui/badge"
import { WindowFrame } from "sebs7n-ui/window-frame"

/**
 * Una pantalla dentro del marco
 * La barra con título y tres puntos grises; el cuerpo es lo que quieras mostrar: una captura, un video o una pieza de interfaz.
 */
export function Basic() {
  return (
    <WindowFrame className="w-full max-w-md" title="Facturas">
      <ul className="m-0 flex list-none flex-col divide-y divide-separator p-0">
        {[
          ["F-0012", "Estudio Norte", "$ 145.200", "Emitida"],
          ["F-0013", "Taller Sur", "$ 38.900", "Borrador"],
          ["F-0014", "Equipo Oeste", "$ 92.000", "Emitida"],
        ].map(([code, client, total, status]) => (
          <li className="flex items-center justify-between gap-3 px-4 py-3" key={code}>
            <div className="min-w-0">
              <p className="text-headline text-label">{code}</p>
              <p className="truncate text-callout text-label-secondary">{client}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-callout tabular-nums text-label">{total}</span>
              <Badge color={status === "Emitida" ? "green" : "gray"}>{status}</Badge>
            </div>
          </li>
        ))}
      </ul>
    </WindowFrame>
  )
}

/**
 * Tres alturas, sin glow
 * `resting`, `floating` y `overlay` salen del set chico de sombras; sin los puntos, para un recorte limpio.
 */
export function Elevations() {
  return (
    <div className="grid w-full gap-6 sm:grid-cols-3">
      {(["resting", "floating", "overlay"] as const).map((elevation) => (
        <WindowFrame controls={false} elevation={elevation} key={elevation} title={elevation}>
          <p className="p-4 text-callout text-label-secondary">shadow-{elevation === "resting" ? "widget" : elevation === "floating" ? "menu" : "modal"}</p>
        </WindowFrame>
      ))}
    </div>
  )
}
