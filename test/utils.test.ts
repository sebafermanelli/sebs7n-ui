// @vitest-environment node
import { describe, expect, it } from "vitest"

import { cn } from "../src/lib/utils"

describe("cn", () => {
  it("keeps a type-scale class next to a text colour", () => {
    expect(cn("text-heading-32", "text-gray-1000")).toBe("text-heading-32 text-gray-1000")
  })

  it("lets the last type-scale class win", () => {
    expect(cn("text-copy-14", "text-copy-13")).toBe("text-copy-13")
  })

  it("treats Geist shadows as one group", () => {
    expect(cn("shadow-menu", "shadow-modal")).toBe("shadow-modal")
  })

  it("drops falsy values", () => {
    expect(cn("a", false, undefined, "b")).toBe("a b")
  })
})
