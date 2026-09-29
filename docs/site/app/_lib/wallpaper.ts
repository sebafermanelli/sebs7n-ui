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
