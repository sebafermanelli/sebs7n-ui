// Formatos del template, en un solo lugar: la tabla, el detalle, Inicio y Clientes muestran lo mismo.

export const money = new Intl.NumberFormat("es-AR", { style: "currency", currency: "USD" })

/** Sin centavos: para listas angostas, donde el monto le come lugar a la descripción. */
export const wholeMoney = new Intl.NumberFormat("es-AR", { style: "currency", currency: "USD", maximumFractionDigits: 0 })

const shortDate = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "short", year: "numeric" })

/** Las fechas del mock son `YYYY-MM-DD` locales: con `new Date(iso)` serían UTC y en Argentina darían el día anterior. */
export function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number)
  return shortDate.format(new Date(y!, m! - 1, d))
}

const dayMonth = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "short" })

/** «8 oct»: para listas angostas, donde el año sobra. */
export function formatDayMonth(iso: string) {
  const [y, m, d] = iso.split("-").map(Number)
  return dayMonth.format(new Date(y!, m! - 1, d))
}

/** Hoy en `YYYY-MM-DD` local: `toISOString()` da la de UTC, que después de las 21 ya es mañana. */
export function today() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}
