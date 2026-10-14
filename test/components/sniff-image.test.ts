import { describe, expect, it } from "vitest"

import { acceptsSniffed, sniffImageType } from "../../src/internal/files"

const blob = (...bytes: number[]) => new Blob([new Uint8Array(bytes)])

describe("sniffImageType", () => {
  it("reconoce PNG, JPEG y WebP por sus primeros bytes", async () => {
    expect(await sniffImageType(blob(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0))).toBe("image/png")
    expect(await sniffImageType(blob(0xff, 0xd8, 0xff, 0xdb, 0, 0))).toBe("image/jpeg")
    expect(await sniffImageType(blob(0x52, 0x49, 0x46, 0x46, 9, 9, 9, 9, 0x57, 0x45, 0x42, 0x50))).toBe("image/webp")
  })

  it("no confunde un RIFF que no es WebP (un WAV), un GIF, un SVG ni un vacío", async () => {
    expect(await sniffImageType(blob(0x52, 0x49, 0x46, 0x46, 9, 9, 9, 9, 0x57, 0x41, 0x56, 0x45))).toBeNull()
    expect(await sniffImageType(new Blob(["GIF89a......"]))).toBeNull()
    expect(await sniffImageType(new Blob(["<svg xmlns='http://www.w3.org/2000/svg'/>"]))).toBeNull()
    expect(await sniffImageType(new Blob([]))).toBeNull()
    expect(await sniffImageType(blob(0x89, 0x50, 0x4e, 0x47))).toBeNull()
  })
})

describe("acceptsSniffed", () => {
  it("compara contra accept por tipo, comodín o extensión", () => {
    expect(acceptsSniffed("image/png", "image/png,image/jpeg")).toBe(true)
    expect(acceptsSniffed("image/webp", "image/png,image/jpeg")).toBe(false)
    expect(acceptsSniffed("image/jpeg", "image/*")).toBe(true)
    expect(acceptsSniffed("image/jpeg", ".jpeg")).toBe(true)
    expect(acceptsSniffed("image/jpeg", ".jpg")).toBe(true)
    expect(acceptsSniffed("image/png", undefined)).toBe(true)
  })
})
