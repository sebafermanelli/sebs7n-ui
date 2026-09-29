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

  // En iCloud el resaltado de un menú es gris y el texto no cambia: no es una selección sobre el acento.
  it("MenuItem resaltado no cuenta", async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="secondary" />}>Acciones</DropdownMenuTrigger>
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
    expect(screen.getByTestId("secundario").matches(insideSelection)).toBe(false)
  })

  it("MenuItem deshabilitado no cuenta aunque quede resaltado", () => {
    const { container } = render(
      <div className="group/selectable" data-highlighted="" data-disabled="">
        <Secundario />
      </div>
    )
    expect(container.querySelector("[data-testid=secundario]")!.matches(insideSelection)).toBe(false)
  })

  it("SidebarItem activo no cuenta: es gris", () => {
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
    expect(screen.getByTestId("secundario").matches(insideSelection)).toBe(false)
  })

  it("TableRow seleccionada cuenta solo mientras la tabla tiene el foco", () => {
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
          <TableRow data-state="selected" tabIndex={0}>
            <TableCell>
              Factura <Secundario />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
    // Elegida pero sin foco: la fila es gris (`selection-inactive`) y lo de adentro no cambia.
    expect(screen.getByTestId("secundario").matches(insideSelection)).toBe(false)
    screen.getByRole("row").focus()
    // nwsapi (el motor de selectores de jsdom) cachea el resultado de `matches()` y no lo invalida
    // cuando cambia el foco: se pregunta con el mismo selector más una rama que no matchea nada.
    expect(screen.getByTestId("secundario").matches(`${insideSelection}, :not(*)`)).toBe(true)
  })

  it("NavigationMenuLink de la página actual no cuenta: es gris", () => {
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
    expect(screen.getByTestId("secundario").matches(insideSelection)).toBe(false)
    expect(screen.getByRole("link", { name: "Blog" })).not.toHaveClass("group/selectable")
  })
})

describe("Badge adentro de un ítem seleccionado", () => {
  // 2.0: el badge es sólido y trae su propia tinta, así que se lee igual sobre el acento: no se
  // toca, como las etiquetas del Finder en una fila seleccionada. Lo único que se protege es el
  // ícono de adentro, que el ítem resaltado pinta de `on-selection` con un selector más fuerte.
  it("un color sólido conserva su relleno y su tinta", () => {
    render(<Badge color="red">Vencida</Badge>)
    const badge = screen.getByText("Vencida")
    expect(badge.className).not.toMatch(/inside-selection:(bg|text|border)-/)
    expect(badge).toHaveClass("inside-selection:[&>svg]:text-current!")
  })

  // El brand sólido es el mismo color que la selección: sin esto desaparece.
  it("brand se invierte", () => {
    render(<Badge color="brand">Nuevo</Badge>)
    expect(screen.getByText("Nuevo")).toHaveClass("inside-selection:bg-on-selection", "inside-selection:text-selection")
  })
})
