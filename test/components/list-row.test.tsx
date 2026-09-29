import { readFileSync } from "node:fs"
import { resolve } from "node:path"

import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { List, ListRow, ListSection } from "../../src/components/list-row"
import { selectionSecondaryClassName } from "../../src/variants/selection"

const theme = readFileSync(resolve(process.cwd(), "src/styles/theme.css"), "utf8")
const insideSelection = /@custom-variant inside-selection \(&(.+)\);/.exec(theme)?.[1] ?? ""

describe("ListRow", () => {
  it("una lista de filas es una lista: el lector cuenta los ítems", () => {
    render(
      <List aria-label="Facturas">
        <ListRow title="Acme S.A." />
        <ListRow title="Nube Digital" />
      </List>
    )
    const lista = screen.getByRole("list", { name: "Facturas" })
    expect(within(lista).getAllByRole("listitem")).toHaveLength(2)
  })

  it("título 17, detalle 14 gris, valor a la derecha (trailing) y punto de color", () => {
    render(
      <List aria-label="Espacio">
        <ListRow description="455 archivos" dot="amber" title="Documentos" trailing="13,5 GB" />
      </List>
    )
    expect(screen.getByText("Documentos")).toHaveClass("text-body", "text-label")
    expect(screen.getByText("455 archivos")).toHaveClass("text-callout", "text-label-secondary")
    expect(screen.getByText("13,5 GB")).toHaveClass("tabular-nums")
    const punto = document.querySelector("[data-slot=list-row-dot]")!
    expect(punto).toHaveClass("size-2", "bg-amber-700")
    // El punto es decorativo: el color no puede ser la única forma de decir la categoría.
    expect(punto).toHaveAttribute("aria-hidden", "true")
  })

  it("inline: el detalle va en una columna del medio, en 17", () => {
    render(
      <List aria-label="Espacio">
        <ListRow description="Todos los archivos" inline title="Documentos" />
      </List>
    )
    expect(screen.getByText("Todos los archivos")).toHaveClass("text-body", "text-label-secondary")
  })

  it("el ícono va en una caja de 32 y corre el separador hasta el texto", () => {
    render(
      <List aria-label="Archivos">
        <ListRow icon={<svg data-testid="icono" />} title="Contrato.pdf" />
      </List>
    )
    const fila = screen.getByRole("listitem")
    expect(fila).toHaveAttribute("data-icon")
    expect(screen.getByTestId("icono").parentElement).toHaveClass("size-8")
  })

  it("render: la fila entera es el link, con chevron de navegación", async () => {
    render(
      <List aria-label="Clientes">
        <ListRow chevron render={<a href="/clientes/acme" />} title="Acme S.A." />
      </List>
    )
    const link = screen.getByRole("link", { name: "Acme S.A." })
    expect(link).toHaveAttribute("href", "/clientes/acme")
    expect(link.querySelector("[data-slot=list-row-chevron]")).toHaveAttribute("aria-hidden", "true")
  })

  it("onClick sin render: la fila es un botón", async () => {
    const onClick = vi.fn()
    render(
      <List aria-label="Clientes">
        <ListRow onClick={onClick} title="Acme S.A." />
      </List>
    )
    await userEvent.click(screen.getByRole("button", { name: "Acme S.A." }))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it("selected: acento con el foco en la lista, gris sin foco, y aria-current", () => {
    render(
      <List aria-label="Clientes">
        <ListRow onClick={() => {}} selected title="Acme S.A.">
          <span className={selectionSecondaryClassName} data-testid="secundario">
            hace 5 min
          </span>
        </ListRow>
      </List>
    )
    const boton = screen.getByRole("button", { name: /Acme/ })
    expect(boton).toHaveAttribute("aria-current", "true")
    const item = screen.getByRole("listitem")
    expect(item).toHaveAttribute("data-state", "selected")
    expect(item.className).toContain("data-[state=selected]:bg-selection-inactive")
    expect(item.className).toContain("data-[state=selected]:group-focus-within/list:bg-selection")
    // Con el foco adentro, lo de color propio pasa al de contraste. (Una sola consulta del selector:
    // jsdom recuerda el resultado de `:focus-within` entre dos `matches` del mismo selector.)
    expect(screen.getByRole("list").matches(":focus-within")).toBe(false)
    boton.focus()
    expect(screen.getByTestId("secundario").matches(insideSelection)).toBe(true)
  })

  it("ListSection: cabecera 19/600 con el total a la derecha, y nombra su lista", () => {
    render(
      <List aria-label="Espacio">
        <ListSection title="Usado por vos" total="23,6 GB">
          <ListRow title="Documentos" />
        </ListSection>
      </List>
    )
    const grupo = screen.getByRole("list", { name: "Usado por vos" })
    expect(within(grupo).getAllByRole("listitem")).toHaveLength(1)
    expect(screen.getByText("Usado por vos")).toHaveClass("text-title-3")
    expect(screen.getByText("23,6 GB")).toHaveClass("text-title-3", "tabular-nums")
  })
})
