import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "../../src/components/navigation-menu"

const SERVICES = [
  { href: "/sistemas", title: "Sistemas", description: "Cuando la operación vive en planillas." },
  { href: "/webs", title: "Webs", description: "Un sitio que trae consultas." },
  { href: "/cloud", title: "Cloud", description: "Arquitectura que aguanta." },
]

function Nav({ keepMounted = false, active = false }: { keepMounted?: boolean; active?: boolean } = {}) {
  return (
    <NavigationMenu render={<div />}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger active={active}>Servicios</NavigationMenuTrigger>
          <NavigationMenuContent keepMounted={keepMounted}>
            <ul>
              {SERVICES.map((service) => (
                <li key={service.href}>
                  <NavigationMenuLink href={service.href} title={service.title} description={service.description} />
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="/blog">Blog</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
      <NavigationMenuViewport />
    </NavigationMenu>
  )
}

const trigger = () => screen.getByRole("button", { name: /Servicios/ })
const serviceLinks = () => SERVICES.map((service) => document.querySelector(`a[href="${service.href}"]`))

describe("NavigationMenu", () => {
  it("abre con click y muestra los tres links con su descripción", async () => {
    render(<Nav />)
    await userEvent.click(trigger())

    for (const service of SERVICES) {
      const link = await screen.findByRole("link", { name: new RegExp(service.title) })
      expect(link).toHaveAttribute("href", service.href)
      expect(link).toHaveTextContent(service.description)
    }
  })

  it("abre con el teclado y Base UI emite aria-expanded y aria-controls", async () => {
    render(<Nav />)
    expect(trigger()).toHaveAttribute("aria-expanded", "false")

    await userEvent.tab()
    expect(trigger()).toHaveFocus()
    await userEvent.keyboard("{Enter}")

    await waitFor(() => expect(trigger()).toHaveAttribute("aria-expanded", "true"))
    const controls = trigger().getAttribute("aria-controls")
    expect(controls).toBeTruthy()
    expect(document.getElementById(controls!)).toBeTruthy()
    expect(await screen.findByRole("link", { name: /Sistemas/ })).toBeInTheDocument()
  })

  it("Escape cierra y devuelve el foco al trigger", async () => {
    render(<Nav />)
    await userEvent.click(trigger())
    await screen.findByRole("link", { name: /Sistemas/ })

    await userEvent.keyboard("{Escape}")

    await waitFor(() => expect(trigger()).toHaveAttribute("aria-expanded", "false"))
    expect(trigger()).toHaveFocus()
  })

  it("el chevron gira al abrir y el trigger se ve como un link del nav", async () => {
    render(<Nav />)
    // Sin fondo en ningún estado: en una barra de navegación el único control
    // con fondo es el CTA.
    expect(trigger()).toHaveClass("h-7", "px-2.5", "text-callout", "text-label-secondary", "bg-transparent", "hover:text-label")
    expect(trigger().className).not.toMatch(/\bhover:bg-/)

    const icon = document.querySelector("[data-slot=navigation-menu-icon]")!
    expect(icon).toHaveClass("data-popup-open:rotate-180", "motion-reduce:transition-none")
    expect(icon).not.toHaveAttribute("data-popup-open")

    await userEvent.click(trigger())
    await waitFor(() => expect(icon).toHaveAttribute("data-popup-open"))
  })

  it("`active` marca el trigger sin mentir con aria-current", () => {
    render(<Nav active />)
    expect(trigger()).toHaveAttribute("data-active")
    expect(trigger()).toHaveClass("data-active:text-label")
    // El trigger no es un link: no lleva a ninguna parte y no puede decir que
    // es la página actual.
    expect(trigger()).not.toHaveAttribute("aria-current")
  })

  it("sin keepMounted el contenido no está en el DOM con el menú cerrado", () => {
    render(<Nav />)
    expect(serviceLinks()).toEqual([null, null, null])
  })

  it("con keepMounted los links están en el DOM antes de la primera apertura", () => {
    render(<Nav keepMounted />)
    // El HTML del server los lleva aunque nadie haya pasado el mouse: un
    // crawler no ejecuta hover ni teclado, y estas páginas viven de que las
    // indexen.
    for (const link of serviceLinks()) expect(link).toBeInTheDocument()
    expect(trigger()).toHaveAttribute("aria-expanded", "false")
  })

  it("con keepMounted el contenido cerrado no ocupa lugar en la barra", () => {
    render(<Nav keepMounted />)
    const contenido = document.querySelector("[data-slot=navigation-menu-content]")!
    expect(contenido).toHaveAttribute("hidden")
    // Una grilla en el className (`grid sm:grid-cols-2`, como dice la doc) no le gana al `hidden`.
    expect(contenido).toHaveClass("[&[hidden]]:hidden")
  })

  it("con keepMounted los links salen ya en el HTML del server", () => {
    // Lo que de verdad importa para el crawler no es el DOM del cliente sino
    // el HTML que llega en la respuesta: nadie ejecuta React antes de indexar.
    const html = renderToString(<Nav keepMounted />)
    for (const service of SERVICES) expect(html).toContain(`href="${service.href}"`)
    expect(renderToString(<Nav />)).not.toContain('href="/sistemas"')
  })

  it("sin title el link de la barra es idéntico al trigger: mismo alto, tamaño, color y estados", async () => {
    render(<Nav />)
    // Antes el link solo traía el radio y el foco, y heredaba el texto de 17 de la página: al lado
    // del trigger («Documentación» vs «Changelog») se veía más grande y más oscuro.
    const plain = screen.getByRole("link", { name: "Blog" })
    const clases = (el: Element) => el.className.split(/\s+/).filter((c) => !c.startsWith("data-popup-open") && !c.startsWith("data-disabled") && c !== "cursor-pointer")
    expect(plain).toHaveClass("h-7", "px-2.5", "text-callout", "text-label-secondary", "hover:text-label", "rounded-control", "focus-visible:focus-ring")
    expect(clases(trigger()).filter((c) => !clases(plain).includes(c))).toEqual([])
    expect(plain.className).not.toMatch(/\bp-2\b|hover:bg-/)

    await userEvent.click(trigger())
    const card = await screen.findByRole("link", { name: /Sistemas/ })
    expect(card).toHaveClass("p-2", "hover:bg-fill-1")
  })

  it("el panel usa los tokens del menú del sistema y no duplica el borde", async () => {
    render(<Nav />)
    await userEvent.click(trigger())
    await screen.findByRole("link", { name: /Sistemas/ })

    const popup = document.querySelector("[data-slot=navigation-menu-popup]")!
    expect(popup).toHaveClass("shadow-menu", "rounded-menu", "bg-surface")
    // El aire entre el panel y los links es el de los menús (5 px), y lo pone uno solo.
    expect(popup.className).not.toMatch(/(^|\s)p-\d/)
    expect(document.querySelector("[data-slot=navigation-menu-content]")).toHaveClass("p-1.25")
    // `shadow-menu` ya trae el hairline de 1px.
    expect(popup.className).not.toMatch(/\bborder\b/)
  })

  it("los links son <a> en una <ul>, no ítems de menú", async () => {
    render(<Nav />)
    await userEvent.click(trigger())
    const link = await screen.findByRole("link", { name: /Sistemas/ })
    // Si esto fuese un DropdownMenu, Base UI pondría role="menuitem" y el
    // lector de pantalla anunciaría acciones en vez de páginas.
    expect(link).not.toHaveAttribute("role")
    expect(link.tagName).toBe("A")
    expect(link.closest("ul")).toBeTruthy()
  })
})
