import type { NextConfig } from "next"

const config: NextConfig = {
  turbopack: { root: import.meta.dirname },
  // View Transitions no necesitan flag en Next 16: cada navegación por <Link> ya es
  // una transición de React, y los <ViewTransition> de app/docs/** animan con eso.
  // Los .md y los .json del registry salen de public/: son archivos, no rutas.
  // Sin cache-control explícito Next ya los sirve con ETag; el default alcanza.
}

export default config
