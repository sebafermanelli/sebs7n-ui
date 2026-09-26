import type { NextConfig } from "next"

const config: NextConfig = {
  turbopack: { root: import.meta.dirname },
  // Next 16.3 escribe AGENTS.md y CLAUDE.md en cada `next dev`; el repo tiene los suyos.
  agentRules: false,
  // View Transitions no necesitan flag en Next 16: cada navegación por <Link> ya es
  // una transición de React, y los <ViewTransition> de app/docs/** animan con eso.
  // Los .md y los .json del registry salen de public/: son archivos, no rutas.
  // Sin cache-control explícito Next ya los sirve con ETag; el default alcanza.
}

export default config
