import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Pagination } from "../../src/components/pagination"

describe("Pagination", () => {
  it("es un <nav> con nombre y una lista de páginas", () => {
    render(<Pagination page={1} pageCount={3} />)
    const nav = screen.getByRole("navigation", { name: "Paginación" })
    expect(within(nav).getByRole("list").tagName).toBe("UL")
    expect(screen.getByRole("button", { name: "Página 2" })).toBeInTheDocument()
  })

  it("con 0 páginas no renderiza nada", () => {
    const { container } = render(<Pagination page={1} pageCount={0} />)
    expect(container).toBeEmptyDOMElement()
  })

  it("la página actual lleva aria-current=page y las otras no", () => {
    render(<Pagination page={3} pageCount={10} />)
    expect(screen.getByRole("button", { name: "Página 3" })).toHaveAttribute("aria-current", "page")
    expect(screen.getByRole("button", { name: "Página 2" })).not.toHaveAttribute("aria-current")
  })

  it("modo botones: onPageChange recibe la página destino", async () => {
    const onPageChange = vi.fn()
    render(<Pagination onPageChange={onPageChange} page={3} pageCount={10} />)
    await userEvent.click(screen.getByRole("button", { name: "Página 4" }))
    expect(onPageChange).toHaveBeenCalledWith(4)
    await userEvent.click(screen.getByRole("button", { name: "Página siguiente" }))
    expect(onPageChange).toHaveBeenCalledWith(4)
    await userEvent.click(screen.getByRole("button", { name: "Página anterior" }))
    expect(onPageChange).toHaveBeenLastCalledWith(2)
  })

  it("modo links: cada página es un <a> con su href, también anterior y siguiente", () => {
    render(<Pagination page={3} pageCount={10} render={(page) => <a href={`/facturas?page=${page}`} />} />)
    expect(screen.getByRole("link", { name: "Página 4" })).toHaveAttribute("href", "/facturas?page=4")
    expect(screen.getByRole("link", { name: "Página anterior" })).toHaveAttribute("href", "/facturas?page=2")
    expect(screen.getByRole("link", { name: "Página siguiente" })).toHaveAttribute("href", "/facturas?page=4")
    // El actual también es link, con aria-current.
    expect(screen.getByRole("link", { name: "Página 3" })).toHaveAttribute("aria-current", "page")
  })

  it("en las puntas, anterior y siguiente quedan sin destino pero no pierden el foco", async () => {
    const onPageChange = vi.fn()
    render(<Pagination onPageChange={onPageChange} page={1} pageCount={5} render={(page) => <a href={`?p=${page}`} />} />)
    const anterior = screen.getByRole("button", { name: "Página anterior" })
    expect(anterior).toHaveAttribute("aria-disabled", "true")
    expect(anterior).not.toHaveAttribute("href")
    expect(anterior).not.toBeDisabled()
    anterior.focus()
    expect(anterior).toHaveFocus()
    await userEvent.keyboard("{Enter}")
    expect(onPageChange).not.toHaveBeenCalled()
  })

  it("los «…» son decorativos y tienen nombre accesible", () => {
    const { container } = render(<Pagination page={50} pageCount={100} />)
    const huecos = container.querySelectorAll("[data-slot=pagination-ellipsis]")
    expect(huecos).toHaveLength(2)
    for (const hueco of huecos) {
      expect(hueco).toHaveAttribute("role", "presentation")
      expect(hueco.querySelector("[aria-hidden=true]")).toHaveTextContent("…")
      expect(hueco.querySelector(".sr-only")).toHaveTextContent("Más páginas")
    }
  })

  it("se recorre con Tab en el orden visual y se activa con Enter", async () => {
    const onPageChange = vi.fn()
    render(<Pagination onPageChange={onPageChange} page={2} pageCount={4} />)
    await userEvent.tab()
    expect(screen.getByRole("button", { name: "Página anterior" })).toHaveFocus()
    await userEvent.tab()
    expect(screen.getByRole("button", { name: "Página 1" })).toHaveFocus()
    await userEvent.tab()
    expect(screen.getByRole("button", { name: "Página 2" })).toHaveFocus()
    await userEvent.keyboard("{Enter}")
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it("los textos se pueden traducir", () => {
    render(
      <Pagination
        aria-label="Pages"
        labels={{ previous: "Previous", next: "Next", page: (page) => `Page ${page}`, ellipsis: "More" }}
        page={1}
        pageCount={20}
      />
    )
    expect(screen.getByRole("navigation", { name: "Pages" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Previous" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Page 2" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument()
  })

  it("usa buttonVariants: el actual secundario, el resto ghost, y el className del llamador gana", () => {
    render(<Pagination className="justify-end" page={2} pageCount={5} size="sm" />)
    const actual = screen.getByRole("button", { name: "Página 2" })
    expect(actual).toHaveClass("bg-gray-100", "size-8", "focus-visible:focus-ring", "transition-surface")
    expect(screen.getByRole("button", { name: "Página 3" })).toHaveClass("text-gray-900", "hover:bg-gray-alpha-200")
    expect(screen.getByRole("navigation")).toHaveClass("justify-end")
    expect(screen.getByRole("navigation")).not.toHaveClass("justify-center")
  })
})
