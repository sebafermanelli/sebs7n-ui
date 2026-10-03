import { render, screen } from "@testing-library/react"
import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { FilterBar } from "../../src/components/filter-bar"
import { SearchField } from "../../src/components/search-field"

describe("FilterBar", () => {
  it("tres slots en orden: búsqueda, filtros y acciones", () => {
    render(<FilterBar actions={<button>Exportar</button>} filters={<button>Estado</button>} search={<SearchField aria-label="Buscar" />} />)
    const bar = document.querySelector("[data-slot=filter-bar]")!
    expect([...bar.children].map((child) => child.getAttribute("data-slot"))).toEqual(["filter-bar-search", "filter-bar-filters", "filter-bar-actions"])
  })

  it("una fila en escritorio y una columna en el teléfono", () => {
    render(<FilterBar actions={<button>Exportar</button>} filters={<button>Estado</button>} search="x" />)
    expect(document.querySelector("[data-slot=filter-bar]")).toHaveClass("flex-col", "@xl:flex-row")
    // Las acciones van a la derecha en escritorio y se reparten la fila en el teléfono: sin huérfanos.
    expect(document.querySelector("[data-slot=filter-bar-actions]")).toHaveClass("@xl:ml-auto", "@max-xl:[&>*]:flex-1")
    expect(document.querySelector("[data-slot=filter-bar-search]")).toHaveClass("w-full", "@xl:w-72")
  })

  it("en el teléfono un ToggleGroup mantiene su tamaño natural y el input oculto de `required` no se estira", () => {
    render(<FilterBar filters={<button>Estado</button>} />)
    const filtros = document.querySelector("[data-slot=filter-bar-filters]")!.className
    expect(filtros).toContain("@max-xl:[&>:not(.sr-only,[role=group])]:w-full")
  })

  it("responde al ancho de su caja (container query), no al de la ventana: queda dentro de un @container", () => {
    render(<FilterBar search="x" />)
    const bar = document.querySelector("[data-slot=filter-bar]")!
    expect(bar.parentElement).toHaveAttribute("data-slot", "filter-bar-container")
    expect(bar.parentElement).toHaveClass("@container", "w-full")
    expect(bar.className).not.toMatch(/(^|\s)(sm|md|lg):/)
  })

  it("un slot que falta no deja un contenedor vacío", () => {
    render(<FilterBar search="x" />)
    expect(document.querySelector("[data-slot=filter-bar-filters]")).toBeNull()
    expect(document.querySelector("[data-slot=filter-bar-actions]")).toBeNull()
  })

  it("pasa role, aria-label y className al contenedor", () => {
    render(<FilterBar aria-label="Filtrar facturas" className="mb-4" role="search" search="x" />)
    expect(screen.getByRole("search", { name: "Filtrar facturas" })).toHaveClass("mb-4")
  })

  it("sin estado: renderiza en el servidor y no es un Client Component", async () => {
    expect(renderToString(<FilterBar search="x" />)).toContain("filter-bar")
    const { readFileSync } = await import("node:fs")
    expect(readFileSync(`${import.meta.dirname}/../../src/components/filter-bar.tsx`, "utf8")).not.toMatch(/^"use client"/)
  })
})
