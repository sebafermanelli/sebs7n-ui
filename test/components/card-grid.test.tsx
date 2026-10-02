import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Card, CardContent, CardFooter, CardGrid, CardHeader, CardTitle } from "../../src/components/card"

const fila = (columns?: 2 | 3 | 4) =>
  render(
    <CardGrid columns={columns}>
      {["Inicial", "Profesional"].map((nombre) => (
        <Card key={nombre}>
          <CardHeader>
            <CardTitle>{nombre}</CardTitle>
          </CardHeader>
          <CardContent>Cuerpo</CardContent>
          <CardFooter>Pie</CardFooter>
        </Card>
      ))}
    </CardGrid>
  ).container.firstElementChild as HTMLElement

describe("CardGrid", () => {
  // La regla: en una fila, la cabecera más alta fija la de todas, y lo mismo el cuerpo y el pie.
  it("las cards comparten las filas de la grilla (subgrid): cabecera, cuerpo y pie alineados", () => {
    const grid = fila()
    expect(grid.dataset.slot).toBe("card-grid")
    expect(grid.className).toContain("[&>[data-slot=card]]:grid-rows-subgrid")
    expect(grid.className).toContain("[&>[data-slot=card]]:row-span-3")
    expect(grid.className).toContain("[&>[data-slot=card]]:gap-0")
  })

  it("el texto de la cabecera arranca arriba aunque la franja crezca", () => {
    expect(fila().className).toContain("content-start")
  })

  it("columnas: una en el teléfono, las pedidas desde lg", () => {
    expect(fila(4).className).toContain("lg:grid-cols-4")
    expect(fila().className).toContain("lg:grid-cols-3")
    expect(fila().className).toContain("grid-cols-1")
  })
})

describe("CardGrid sin huérfanas", () => {
  const conCards = (n: number, columns?: 2 | 3 | 4) =>
    render(
      <CardGrid columns={columns}>
        {Array.from({ length: n }, (_, i) => (
          <Card key={i}>
            <CardContent>{i}</CardContent>
          </Card>
        ))}
      </CardGrid>
    ).container.firstElementChild as HTMLElement

  // Tres planes en dos columnas dejan uno solo abajo: o todas en paralelo o todas apiladas.
  it("con un número impar de cards no pasa por dos columnas", () => {
    expect(conCards(3).className).not.toContain("sm:grid-cols-2")
    expect(conCards(3).className).toContain("lg:grid-cols-3")
  })

  it("con un número par sí", () => {
    expect(conCards(6).className).toContain("sm:grid-cols-2")
    expect(conCards(4, 4).className).toContain("sm:grid-cols-2")
  })
})

