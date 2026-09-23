// @vitest-environment jsdom
//
// `renderElement` es lo que permite que Breadcrumb, Pagination y Badge acepten un
// `render={<Link href="…" />}` sin volverse componentes de cliente: clona el elemento
// del llamador en vez de usar el hook `useRender` de Base UI.
//
// Su docblock promete una precedencia exacta —las props del llamador ganan, el
// `className` se fusiona y el del llamador queda último— y hasta ahora no la
// verificaba nadie: se probaba de rebote, a través de los componentes que la usan.
import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { renderElement } from "../src/lib/render"

describe("renderElement", () => {
  it("sin `render` crea el elemento de respaldo con las props que se le pasan", () => {
    render(renderElement(undefined, "span", { "data-slot": "x", className: "text-gray-900", children: "hola" }))

    const span = screen.getByText("hola")
    expect(span.tagName).toBe("SPAN")
    expect(span).toHaveAttribute("data-slot", "x")
    expect(span).toHaveClass("text-gray-900")
  })

  it("con `render` usa ese elemento y le mete las props adentro", () => {
    render(renderElement(<a href="/facturas" />, "span", { "data-slot": "x", children: "Facturas" }))

    const link = screen.getByRole("link", { name: "Facturas" })
    expect(link).toHaveAttribute("href", "/facturas")
    expect(link).toHaveAttribute("data-slot", "x")
  })

  it("las props del elemento del llamador le ganan a las del componente", () => {
    const delLlamador = vi.fn()
    const delComponente = vi.fn()
    render(
      renderElement(<button onClick={delLlamador} type="submit" />, "span", {
        type: "button",
        onClick: delComponente,
        children: "Enviar",
      })
    )

    const boton = screen.getByRole("button", { name: "Enviar" })
    expect(boton).toHaveAttribute("type", "submit")
    boton.click()
    expect(delLlamador).toHaveBeenCalledTimes(1)
    expect(delComponente).not.toHaveBeenCalled()
  })

  it("el `className` no se pisa: se fusionan los dos y el del llamador queda último", () => {
    render(renderElement(<span className="text-gray-1000" />, "span", { className: "text-gray-900 truncate", children: "x" }))

    // `cn()` resuelve el conflicto de color a favor del último —el del llamador— y
    // conserva lo que no choca. Si se pisaran, `truncate` se perdería.
    const span = screen.getByText("x")
    expect(span).toHaveClass("truncate", "text-gray-1000")
    expect(span.className).not.toMatch(/\btext-gray-900\b/)
  })

  it("los children del elemento del llamador le ganan a los del componente", () => {
    render(renderElement(<a href="/x">Mío</a>, "span", { children: "Del componente" }))

    expect(screen.getByRole("link")).toHaveTextContent("Mío")
    expect(screen.queryByText("Del componente")).toBeNull()
  })

  it("un `render` que no es un elemento válido cae al respaldo", () => {
    render(renderElement("no soy un elemento" as never, "span", { children: "respaldo" }))

    expect(screen.getByText("respaldo").tagName).toBe("SPAN")
  })
})
