import type { NextConfig } from "next"

const config: NextConfig = {
  turbopack: { root: import.meta.dirname },
  // Los .md y los .json del registry salen de public/: son archivos, no rutas.
  // Sin cache-control explícito Next ya los sirve con ETag; el default alcanza.
}

export default config
