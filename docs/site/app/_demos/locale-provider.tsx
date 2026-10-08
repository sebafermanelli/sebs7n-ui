"use client"

import { LocaleProvider, useFormat } from "sebs7n-ui/locale-provider"

function Resumen() {
  const f = useFormat()
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-callout">
      <dt className="text-label-secondary">Importe</dt>
      <dd className="tabular-nums">{f.currency(1240.5)}</dd>
      <dt className="text-label-secondary">Descuento</dt>
      <dd className="tabular-nums">{f.percent(0.125)}</dd>
      <dt className="text-label-secondary">Vence</dt>
      <dd>{f.date("2026-10-08")}</dd>
      <dt className="text-label-secondary">Emitida</dt>
      <dd>{f.relative(-2, "day")}</dd>
      <dt className="text-label-secondary">Equipos</dt>
      <dd>{f.list(["Norte", "Sur", "Oeste"])}</dd>
    </dl>
  )
}

/**
 * Un idioma, una moneda
 * El mismo `Resumen` en dos idiomas: el símbolo, los separadores, el orden de la fecha y la conjunción salen de `Intl`, no del código.
 */
export function Basic() {
  return (
    <div className="flex flex-wrap gap-10">
      <LocaleProvider currency="ARS" locale="es-AR">
        <Resumen />
      </LocaleProvider>
      <LocaleProvider currency="USD" locale="en-US">
        <Resumen />
      </LocaleProvider>
    </div>
  )
}
