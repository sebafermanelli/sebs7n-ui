"use client"

import { Button, ToggleGroup, ToggleGroupItem } from "sebs7n-ui"
import { toast } from "sonner"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

// Marcas de ejemplo, mismos valores que tokens/brands.json. Una app real define
// sus tres variables en su propio CSS; esto es solo para ver el sistema.
const BRANDS = {
  teal: { base: "oklch(0.515 0.099 183)", baseDark: "oklch(0.62 0.11 183)", contrastDark: "#000" },
  terracotta: { base: "oklch(0.55 0.16 35)", baseDark: "oklch(0.55 0.16 35)", contrastDark: "#fff" },
  emerald: { base: "oklch(0.53 0.13 162)", baseDark: "oklch(0.74 0.13 162)", contrastDark: "#000" },
  blue: { base: "oklch(0.573 0.214 258)", baseDark: "oklch(0.573 0.214 258)", contrastDark: "#fff" },
} as const

type BrandKey = keyof typeof BRANDS

export function Controls() {
  const { resolvedTheme, setTheme } = useTheme()
  const [brand, setBrand] = useState<BrandKey>("blue")

  useEffect(() => {
    const b = BRANDS[brand]
    const root = document.documentElement.style
    root.setProperty("--brand-base", b.base)
    root.setProperty("--brand-base-dark", b.baseDark)
    root.setProperty("--brand-contrast", "#fff")
    root.setProperty("--brand-contrast-dark", b.contrastDark)
  }, [brand])

  return (
    <div className="flex flex-wrap items-center gap-3">
      <ToggleGroup value={[brand]} onValueChange={(v) => v[0] && setBrand(v[0] as BrandKey)}>
        {(Object.keys(BRANDS) as BrandKey[]).map((key) => (
          <ToggleGroupItem key={key} value={key}>
            {key}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <Button variant="outline" size="sm" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>
        {resolvedTheme === "dark" ? "Claro" : "Oscuro"}
      </Button>
      <Button variant="secondary" size="sm" onClick={() => toast.success("Guardado", { description: "Los cambios ya están en producción." })}>
        Toast
      </Button>
    </div>
  )
}
