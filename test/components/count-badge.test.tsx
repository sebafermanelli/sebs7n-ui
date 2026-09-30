import { render, screen } from "@testing-library/react"
import { BellIcon } from "lucide-react"
import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { Button } from "../../src/components/button"
import { CountBadge, countLabel } from "../../src/components/count-badge"

function Pending({ count, max }: { count: number; max?: number }) {
  return (
    <Button aria-label={countLabel("Facturas", count, "pendientes")} size="icon-sm" variant="plain">
      <BellIcon />
      <CountBadge count={count} max={max} />
    </Button>
  )
}

const badge = () => document.querySelector("[data-slot=count-badge]")

describe("CountBadge", () => {
  it("un Badge count arriba a la derecha del ícono, decorativo: el número va en el nombre del botón", () => {
    render(<Pending count={3} />)
    expect(screen.getByRole("button")).toHaveAccessibleName("Facturas, 3 pendientes")
    expect(badge()).toHaveTextContent("3")
    expect(badge()).toHaveAttribute("aria-hidden", "true")
    expect(badge()).toHaveAttribute("data-variant", "count")
    expect(badge()).toHaveClass("absolute", "pointer-events-none", "rounded-full")
  })

  it("con cero (o menos, o NaN) no se dibuja y el nombre no habla de cantidad", () => {
    const { rerender } = render(<Pending count={0} />)
    expect(badge()).toBeNull()
    expect(screen.getByRole("button")).toHaveAccessibleName("Facturas")
    rerender(<Pending count={-2} />)
    expect(badge()).toBeNull()
    rerender(<Pending count={Number.NaN} />)
    expect(badge()).toBeNull()
  })

  it("pasado el tope dice «99+», pero el nombre dice el número real", () => {
    render(<Pending count={120} />)
    expect(badge()).toHaveTextContent("99+")
    expect(screen.getByRole("button")).toHaveAccessibleName("Facturas, 120 pendientes")
  })

  it("max cambia el tope", () => {
    render(<Pending count={12} max={9} />)
    expect(badge()).toHaveTextContent("9+")
  })

  it("countLabel sin detalle", () => {
    expect(countLabel("Bandeja", 4)).toBe("Bandeja, 4")
    expect(countLabel("Bandeja", 0)).toBe("Bandeja")
  })

  it("rojo por defecto, color y className se pasan", () => {
    const { rerender } = render(<CountBadge count={1} />)
    expect(badge()).toHaveAttribute("data-color", "red")
    rerender(<CountBadge className="ring-surface-header" color="brand" count={1} />)
    expect(badge()).toHaveAttribute("data-color", "brand")
    expect(badge()).toHaveClass("ring-surface-header")
  })

  it("sin estado: renderiza en el servidor", () => {
    expect(renderToString(<CountBadge count={5} />)).toContain("5")
  })
})
