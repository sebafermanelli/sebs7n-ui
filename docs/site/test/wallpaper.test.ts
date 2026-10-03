// Dónde va el wallpaper en el sitio (W): la home siempre, el Playground por su switch (prendido por
// default) y el resto de las docs nunca.
import { describe, expect, it } from "vitest"

import { ambientGuardado, CONFIG_VERSION, docsWallpaper, luzGuardada } from "../app/_lib/wallpaper"

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

describe("luzGuardada", () => {
  it("sin nada guardado, el default", () => {
    expect(luzGuardada({})).toBe(1)
  })

  it("lo de la 1.x (luz 0, sin versión) no apaga el wallpaper", () => {
    expect(luzGuardada({ luz: 0 })).toBe(1)
  })

  it("lo guardado desde la versión 2 se respeta", () => {
    expect(luzGuardada({ v: CONFIG_VERSION, luz: 0.4 })).toBe(0.4)
    expect(luzGuardada({ v: CONFIG_VERSION, luz: 0 })).toBe(0)
  })

  it("un valor roto o fuera de rango vuelve al default", () => {
    expect(luzGuardada({ v: CONFIG_VERSION, luz: "x" })).toBe(1)
    expect(luzGuardada({ v: CONFIG_VERSION, luz: 5 })).toBe(1)
  })
})
