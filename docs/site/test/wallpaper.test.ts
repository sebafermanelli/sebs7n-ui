// Dónde va el wallpaper en el sitio (W): la home siempre, el Playground por su switch (prendido por
// default) y el resto de las docs nunca.
import { describe, expect, it } from "vitest"

import { ambientGuardado, CONFIG_VERSION, docsWallpaper } from "../app/_lib/wallpaper"

describe("docsWallpaper", () => {
  it("el Playground lo lleva con el switch prendido", () => {
    expect(docsWallpaper("/docs/playground", true)).toBe(true)
    expect(docsWallpaper("/docs/playground/", true)).toBe(true)
  })

  it("con el switch apagado, ni el Playground", () => {
    expect(docsWallpaper("/docs/playground", false)).toBe(false)
  })

  it("el resto de las docs es opaco aunque el switch esté prendido", () => {
    for (const ruta of ["/docs", "/docs/components/card", "/docs/theming", "/docs/playground-x", ""]) {
      expect(docsWallpaper(ruta, true), ruta).toBe(false)
    }
  })
})

describe("ambientGuardado", () => {
  it("sin nada guardado, prendido", () => {
    expect(ambientGuardado({})).toBe(true)
  })

  it("lo guardado antes de la versión 2 no apaga el default nuevo", () => {
    expect(ambientGuardado({ ambient: false })).toBe(true)
  })

  it("lo guardado desde la versión 2 se respeta", () => {
    expect(ambientGuardado({ v: CONFIG_VERSION, ambient: false })).toBe(false)
    expect(ambientGuardado({ v: CONFIG_VERSION, ambient: true })).toBe(true)
  })

  it("un valor roto no apaga el wallpaper", () => {
    expect(ambientGuardado({ v: CONFIG_VERSION, ambient: "no" })).toBe(true)
  })
})
