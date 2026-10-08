/**
 * Dónde va el wallpaper en el sitio (W). La home lo lleva siempre, en su propio contenedor
 * (`app/page.tsx`, en el HTML del servidor); de las páginas de docs, solo el Playground y solo
 * con su switch prendido. El resto de la documentación es opaca, como una app de iCloud.
 */
export const PLAYGROUND_PATH = "/docs/playground"

export function docsWallpaper(pathname: string | null, ambient: boolean): boolean {
  if (!ambient || !pathname) return false
  return pathname.replace(/\/+$/, "") === PLAYGROUND_PATH
}

/**
 * La versión de lo que el Playground guarda en `localStorage`. Hasta W el switch arrancaba
 * apagado, y cualquier visita que tocó algo del Playground guardó `ambient: false`: sin versión,
 * esa gente no vería nunca el default nuevo. De lo anterior a la 2 se descarta solo el switch; la
 * marca y la luz se conservan.
 */
export const CONFIG_VERSION = 2

export function ambientGuardado(guardado: { v?: unknown; ambient?: unknown }): boolean {
  return guardado.v === CONFIG_VERSION && typeof guardado.ambient === "boolean" ? guardado.ambient : true
}

/**
 * La luz (`--ambient`) guardada, solo si es de esta versión. Lo de la 1.x no tiene `v` y guardaba
 * `luz: 0` (el vidrio apagado): leerlo así dejaba la home sin wallpaper en esa visita.
 */
export function luzGuardada(guardado: { v?: unknown; luz?: unknown }): number {
  return guardado.v === CONFIG_VERSION && typeof guardado.luz === "number" && guardado.luz >= 0 && guardado.luz <= 1
    ? guardado.luz
    : 1
}

/**
 * El fondo del sitio (no del paquete): `site` es el de la home (`SiteBackdrop`: lavado de la marca y grano),
 * `icloud` el wallpaper de ondas que el paquete le da a una app (`bg-ambient`) y `liso` la página sin nada.
 * El wallpaper solo se previsualiza en el Playground: en el resto de las páginas, `icloud` cae en `site`.
 */
export type Fondo = "site" | "icloud" | "liso"

export const FONDOS: readonly Fondo[] = ["site", "icloud", "liso"]

export function fondoGuardado(guardado: { fondo?: unknown; v?: unknown; ambient?: unknown }): Fondo {
  return FONDOS.includes(guardado.fondo as Fondo) ? (guardado.fondo as Fondo) : "site"
}

export function docsFondo(pathname: string | null, fondo: Fondo): Fondo {
  if (fondo === "icloud" && !docsWallpaper(pathname, true)) return "site"
  return fondo
}
