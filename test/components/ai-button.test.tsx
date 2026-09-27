import { readFileSync } from "node:fs"
import { join } from "node:path"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { AiButton, AiIcon, AiLauncher, AiShimmer } from "../../src/components/ai-button"
import { contrastRatio, luminanceOfHex, luminanceOfOklch, type Oklch } from "../../src/lib/contrast"
import { LabelsProvider } from "../../src/lib/labels"

const css = readFileSync(join(import.meta.dirname, "../../src/styles/theme.css"), "utf8")
const bloque = (tema: "light" | "dark") => {
  const inicio = css.indexOf(tema === "light" ? ":root {" : ".dark {")
  return css.slice(inicio, css.indexOf("\n  }", inicio))
}
const oklch = (texto: string, token: string): Oklch | null => {
  const m = texto.match(new RegExp(`${token}: oklch\\(([\\d.]+) ([\\d.]+) ([\\d.]+)\\);`))
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null
}

describe("AiButton", () => {
  it("es el Button del sistema con el color de la IA: misma forma, mismo foco", () => {
    render(<AiButton>Resumir</AiButton>)
    const boton = screen.getByRole("button", { name: "Resumir" })
    expect(boton).toHaveAttribute("data-slot", "button")
    expect(boton).toHaveAttribute("data-ai", "outline")
    expect(boton).toHaveClass("rounded-full", "h-10", "focus-visible:focus-ring", "glass-control", "text-ai", "border-ai/40")
    // No usa la marca: una acción de IA se reconoce igual en cualquier app.
    expect(boton.className).not.toMatch(/brand/)
  })

  it("solid es la acción principal: fondo violeta fijo, texto blanco, halo", () => {
    render(<AiButton variant="solid">Generar</AiButton>)
    const boton = screen.getByRole("button", { name: "Generar" })
    expect(boton).toHaveAttribute("data-ai", "solid")
    expect(boton).toHaveClass("bg-ai-solid", "text-white", "sheen", "shadow-ai")
    expect(boton).not.toHaveClass("bg-gray-1000")
  })

  it("hereda la espera y el apagado del Button", async () => {
    const onClick = vi.fn()
    const { rerender } = render(<AiButton disabled onClick={onClick}>Generar</AiButton>)
    await userEvent.click(screen.getByRole("button", { name: "Generar" }))
    expect(onClick).not.toHaveBeenCalled()
    rerender(<AiButton loading onClick={onClick}>Generar</AiButton>)
    expect(screen.getByRole("button", { name: "Generar" })).toHaveAttribute("aria-busy", "true")
  })

  it("el hover no le gana al estado apagado", () => {
    render(<AiButton>Resumir</AiButton>)
    expect(screen.getByRole("button").className).toMatch(/not-data-disabled:hover:bg-ai\/8/)
    expect(screen.getByRole("button").className).not.toMatch(/(^|\s)hover:bg-ai/)
  })

  it("el ícono es decoración y lleva el color de la IA", () => {
    const { container } = render(<AiIcon />)
    const icono = container.querySelector("[data-slot=ai-icon]")!
    expect(icono).toHaveAttribute("aria-hidden", "true")
    expect(icono).toHaveClass("text-ai", "size-4")
  })
})

describe("AiLauncher", () => {
  it("es un botón redondo de vidrio con el canto de la IA, y se llama Asistente", () => {
    render(<AiLauncher />)
    const lanzador = screen.getByRole("button", { name: "Asistente" })
    expect(lanzador).toHaveClass("size-14", "rounded-full", "glass", "glass-thick", "ai-rim", "relative", "focus-visible:focus-ring")
    expect(lanzador.querySelector("[data-slot=ai-icon]")).not.toBeNull()
  })

  it("no se posiciona solo: dónde flota lo decide la app", () => {
    render(<AiLauncher className="fixed right-6 bottom-6" />)
    const lanzador = screen.getByRole("button")
    expect(lanzador).toHaveClass("fixed", "right-6", "bottom-6")
    // tailwind-merge sacó el `relative` de la base: con los dos, gana el que Tailwind emitió último.
    expect(lanzador).not.toHaveClass("relative")
  })

  it("la etiqueta es el mismo nombre, y para un lector no existe", () => {
    render(<AiLauncher label="Preguntale a Rita" />)
    expect(screen.getByRole("button", { name: "Preguntale a Rita" })).toBeInTheDocument()
    const etiqueta = document.querySelector("[data-slot=ai-launcher-label]")!
    expect(etiqueta).toHaveTextContent("Preguntale a Rita")
    expect(etiqueta).toHaveAttribute("aria-hidden", "true")
    expect(etiqueta).toHaveClass("opacity-0", "group-hover/ai-launcher:opacity-100", "group-focus-visible/ai-launcher:opacity-100")
  })

  it("labelVisible la deja a la vista, y labelSide la cambia de lado", () => {
    render(<AiLauncher labelSide="right" labelVisible />)
    const etiqueta = document.querySelector("[data-slot=ai-launcher-label]")!
    expect(etiqueta).toHaveAttribute("data-visible")
    expect(etiqueta).toHaveClass("left-full", "data-visible:opacity-100")
  })

  it("acepta otro ícono: la X cuando el panel está abierto", () => {
    render(
      <AiLauncher label="Cerrar asistente">
        <svg data-testid="equis" />
      </AiLauncher>
    )
    expect(screen.getByTestId("equis")).toBeInTheDocument()
    expect(document.querySelector("[data-slot=ai-icon]")).toBeNull()
  })

  it("el nombre sale del LabelsProvider", () => {
    render(
      <LabelsProvider value={{ ai: { launcher: "Assistant" } }}>
        <AiLauncher />
      </LabelsProvider>
    )
    expect(screen.getByRole("button", { name: "Assistant" })).toBeInTheDocument()
  })
})

describe("AiShimmer", () => {
  it("es decoración: quien anuncia la espera es el contenedor", () => {
    const { container } = render(<AiShimmer className="w-1/2" />)
    const brillo = container.querySelector("[data-slot=ai-shimmer]")!
    expect(brillo).toHaveAttribute("aria-hidden", "true")
    expect(brillo).toHaveClass("ai-shimmer", "h-4", "w-1/2")
  })
})

// El color de la IA lleva texto e íconos, y el sólido lleva texto blanco encima.
describe("El color de la IA (WCAG 1.4.3)", () => {
  const SUPERFICIE = { light: "#ffffff", dark: "#0a0a0a" }

  for (const tema of ["light", "dark"] as const) {
    it(`${tema}: el texto en color IA llega a 4.5:1 sobre la superficie`, () => {
      const ai = oklch(bloque(tema), "--sf-ai")!
      expect(contrastRatio(luminanceOfOklch(ai), luminanceOfHex(SUPERFICIE[tema]))).toBeGreaterThanOrEqual(4.5)
    })
  }

  it("el sólido es el mismo en los dos temas, y el blanco le llega a 4.5:1 en reposo y en hover", () => {
    expect(oklch(bloque("dark"), "--sf-ai-solid")).toBeNull()
    for (const token of ["--sf-ai-solid", "--sf-ai-solid-hover"]) {
      const fondo = oklch(bloque("light"), token)!
      expect(contrastRatio(luminanceOfOklch(fondo), luminanceOfHex("#ffffff")), token).toBeGreaterThanOrEqual(4.5)
    }
  })

  it("en oscuro el color de la IA se aclara: por eso el sólido no lo puede usar de fondo", () => {
    const claro = oklch(bloque("dark"), "--sf-ai")!
    expect(contrastRatio(luminanceOfOklch(claro), luminanceOfHex("#ffffff"))).toBeLessThan(4.5)
  })
})

describe("AiLauncher: el canto gira mientras la IA trabaja", () => {
  it("en reposo está quieto; con active, gira", () => {
    const { rerender } = render(<AiLauncher />)
    expect(screen.getByRole("button")).not.toHaveAttribute("data-ai-active")
    rerender(<AiLauncher active />)
    expect(screen.getByRole("button")).toHaveAttribute("data-ai-active")
  })
})

describe("ai-glow: una señal de estado, no un adorno", () => {
  const inicio = css.indexOf("@utility ai-glow {")
  const utilidad = css.slice(inicio, css.indexOf("\n}", inicio))

  it("apagado por defecto: solo se ve y gira con data-ai-active", () => {
    const [reposo, activo] = [utilidad.slice(0, utilidad.indexOf("&[data-ai-active]")), utilidad.slice(utilidad.indexOf("&[data-ai-active]"))]
    expect(reposo).toContain("opacity: 0;")
    expect(reposo).not.toContain("animation:")
    expect(activo).toContain("animation: var(--animate-ai-glow);")
    expect(activo).toContain("opacity: 1;")
  })

  it("gira el ángulo del degradé, no el elemento", () => {
    expect(utilidad).toContain("conic-gradient(")
    expect(utilidad).toContain("from var(--sf-ai-angle)")
    expect(utilidad).not.toMatch(/rotate|transform/)
    // Sin `@property` el ángulo no se interpola: salta de 0 a 360.
    expect(css).toMatch(/@property --sf-ai-angle \{\s*syntax: "<angle>";/)
  })

  it("no tapa los clics y sigue la curva de quien lo lleva", () => {
    expect(utilidad).toContain("pointer-events: none;")
    expect(utilidad).toContain("border-radius: inherit;")
  })
})
