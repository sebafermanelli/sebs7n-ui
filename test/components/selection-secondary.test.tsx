import { readFileSync } from "node:fs"
import { resolve } from "node:path"

import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { Badge } from "../../src/components/badge"
import { Button } from "../../src/components/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../src/components/dropdown-menu"
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "../../src/components/navigation-menu"
import { Sidebar, SidebarContent, SidebarItem } from "../../src/components/sidebar"
import { Table, TableBody, TableCell, TableRow } from "../../src/components/table"
import { selectionSecondaryClassName } from "../../src/variants/selection"

// En jsdom `import.meta.url` no es `file:`: se resuelve desde la raíz, que es donde corre vitest.
const theme = readFileSync(resolve(process.cwd(), "src/styles/theme.css"), "utf8")

/**
 * El selector de `inside-selection`, tal cual está en theme.css, sin el `&`: con él se le pregunta
 * a jsdom si un descendiente queda adentro de un ítem seleccionado. Es la misma regla que va a
 * compilar Tailwind en la app, así que el test prueba el selector y no una copia.
 */
const insideSelection = /@custom-variant inside-selection \(&(.+)\);/.exec(theme)?.[1] ?? ""

const Secundario = () => (
  <span className={selectionSecondaryClassName} data-testid="secundario">
    hace 5 min
  </span>
)

describe("selectionSecondaryClassName: lo que tiene color propio adentro de un ítem seleccionado", () => {
  it("el variant existe y la clase cuelga de él", () => {
    expect(insideSelection).toMatch(/^:where\(/)
    expect(selectionSecondaryClassName.split(" ")).toContain("inside-selection:text-on-selection")
  })

  it("MenuItem resaltado", async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="outline" />}>Acciones</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            Guardar <Secundario />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    await userEvent.click(screen.getByRole("button", { name: "Acciones" }))
    const item = await screen.findByRole("menuitem", { name: /Guardar/ })
    expect(item).toHaveClass("group/selectable")
    expect(screen.getByTestId("secundario").matches(insideSelection)).toBe(false)
    await userEvent.keyboard("{ArrowDown}")
    await waitFor(() => expect(item).toHaveAttribute("data-highlighted"))
    expect(screen.getByTestId("secundario").matches(insideSelection)).toBe(true)
  })

  it("MenuItem deshabilitado no cuenta aunque quede resaltado", () => {
    const { container } = render(
      <div className="group/selectable" data-highlighted="" data-disabled="">
        <Secundario />
      </div>
    )
    expect(container.querySelector("[data-testid=secundario]")!.matches(insideSelection)).toBe(false)
  })

  it("SidebarItem activo", () => {
    render(
      <Sidebar>
        <SidebarContent>
          <SidebarItem active href="/inicio">
            Inicio <Secundario />
          </SidebarItem>
          <SidebarItem href="/clientes">Clientes</SidebarItem>
        </SidebarContent>
      </Sidebar>
    )
    expect(screen.getByRole("link", { name: /Inicio/ })).toHaveClass("group/selectable")
    expect(screen.getByRole("link", { name: "Clientes" })).toHaveClass("group/selectable")
    expect(screen.getByTestId("secundario").matches(insideSelection)).toBe(true)
  })

  it("TableRow seleccionada", () => {
    const { rerender } = render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>
              Factura <Secundario />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
    expect(screen.getByRole("row")).toHaveClass("group/selectable")
    expect(screen.getByTestId("secundario").matches(insideSelection)).toBe(false)
    rerender(
      <Table>
        <TableBody>
          <TableRow data-state="selected">
            <TableCell>
              Factura <Secundario />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
    expect(screen.getByTestId("secundario").matches(insideSelection)).toBe(true)
  })

  it("NavigationMenuLink de la página actual (el de tarjeta; el de la barra no se pinta de acento)", () => {
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink active href="/sistemas" title="Sistemas">
              <Secundario />
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink active href="/blog">
              Blog
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    )
    expect(screen.getByRole("link", { name: /Sistemas/ })).toHaveClass("group/selectable")
    expect(screen.getByTestId("secundario").matches(insideSelection)).toBe(true)
    expect(screen.getByRole("link", { name: "Blog" })).not.toHaveClass("group/selectable")
  })
})

describe("Badge adentro de un ítem seleccionado", () => {
  // Un badge `subtle` es el tono de su color en alfa: sobre el acento sólido el texto `*-ink`
  // queda sin contraste. Pasa solo a un contorno en el color de contraste, como las etiquetas
  // del Finder en una fila seleccionada; la app no tiene que acordarse.
  it("subtle pasa a contorno de contraste", () => {
    render(<Badge color="red">Vencida</Badge>)
    expect(screen.getByText("Vencida")).toHaveClass(
      "inside-selection:bg-transparent",
      "inside-selection:border-on-selection/60",
      "inside-selection:text-on-selection"
    )
  })

  // El brand sólido es el mismo color que la selección: sin esto desaparece.
  it("solid brand se invierte", () => {
    render(
      <Badge color="brand" variant="solid">
        Nuevo
      </Badge>
    )
    expect(screen.getByText("Nuevo")).toHaveClass("inside-selection:bg-on-selection", "inside-selection:text-selection")
  })
})
