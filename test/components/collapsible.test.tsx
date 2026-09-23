import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Button } from "../../src/components/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../src/components/collapsible"

describe("Collapsible", () => {
  it("el trigger anuncia el estado y controla al panel", async () => {
    render(
      <Collapsible>
        <CollapsibleTrigger render={<Button variant="ghost" />}>Ver el detalle</CollapsibleTrigger>
        <CollapsibleContent>3 ítems · IVA 21% · vence el 30/09</CollapsibleContent>
      </Collapsible>
    )
    const trigger = screen.getByRole("button", { name: "Ver el detalle" })
    expect(trigger).toHaveAttribute("aria-expanded", "false")
    expect(screen.queryByText("3 ítems · IVA 21% · vence el 30/09")).not.toBeInTheDocument()

    await userEvent.click(trigger)
    expect(trigger).toHaveAttribute("aria-expanded", "true")
    expect(trigger).toHaveAttribute("data-panel-open")
    const panel = document.querySelector("[data-slot=collapsible-content]")!
    expect(trigger).toHaveAttribute("aria-controls", panel.id)
    expect(screen.getByText("3 ítems · IVA 21% · vence el 30/09")).toBeInTheDocument()
  })

  it("el trigger usa render, no asChild: mantiene el cuerpo del Button", () => {
    render(
      <Collapsible>
        <CollapsibleTrigger render={<Button variant="ghost" size="sm" />}>Más</CollapsibleTrigger>
        <CollapsibleContent>x</CollapsibleContent>
      </Collapsible>
    )
    expect(screen.getByRole("button", { name: "Más" })).toHaveClass("h-8", "text-button-14")
  })

  it("teclado: abre con Enter y cierra con Espacio, sin salir del trigger", async () => {
    render(
      <Collapsible>
        <CollapsibleTrigger render={<Button variant="ghost" />}>Filtros avanzados</CollapsibleTrigger>
        <CollapsibleContent>contenido</CollapsibleContent>
      </Collapsible>
    )
    const trigger = screen.getByRole("button", { name: "Filtros avanzados" })
    await userEvent.tab()
    expect(trigger).toHaveFocus()
    await userEvent.keyboard("{Enter}")
    expect(trigger).toHaveAttribute("aria-expanded", "true")
    await userEvent.keyboard(" ")
    expect(trigger).toHaveAttribute("aria-expanded", "false")
    expect(trigger).toHaveFocus()
  })

  it("controlado por la app: open + onOpenChange", async () => {
    const onOpenChange = vi.fn()
    render(
      <Collapsible onOpenChange={onOpenChange} open={false}>
        <CollapsibleTrigger render={<Button variant="ghost" />}>Abrir</CollapsibleTrigger>
        <CollapsibleContent>x</CollapsibleContent>
      </Collapsible>
    )
    await userEvent.click(screen.getByRole("button", { name: "Abrir" }))
    expect(onOpenChange).toHaveBeenCalledWith(true, expect.anything())
    // No cambió solo: el estado lo maneja la app.
    expect(screen.getByRole("button", { name: "Abrir" })).toHaveAttribute("aria-expanded", "false")
  })

  it("keepMounted deja el contenido en el DOM, oculto", () => {
    render(
      <Collapsible>
        <CollapsibleTrigger render={<Button variant="ghost" />}>Ver</CollapsibleTrigger>
        <CollapsibleContent keepMounted>clave-de-recuperacion</CollapsibleContent>
      </Collapsible>
    )
    const panel = document.querySelector("[data-slot=collapsible-content]")!
    expect(panel).toHaveAttribute("hidden")
    expect(panel.textContent).toContain("clave-de-recuperacion")
    expect(panel).toHaveClass("[&[hidden]:not([hidden='until-found'])]:hidden")
  })

  it("el panel anima el alto con la variable de Base UI y respeta motion-reduce", () => {
    render(
      <Collapsible defaultOpen>
        <CollapsibleTrigger render={<Button variant="ghost" />}>Ver</CollapsibleTrigger>
        <CollapsibleContent>x</CollapsibleContent>
      </Collapsible>
    )
    expect(document.querySelector("[data-slot=collapsible-content]")).toHaveClass(
      "h-(--collapsible-panel-height)",
      "overflow-hidden",
      "transition-[height]",
      "motion-reduce:transition-none",
      "data-starting-style:h-0",
      "data-ending-style:h-0"
    )
  })

  it("el className del llamador cae en el contenido y le gana a la clase base", () => {
    render(
      <Collapsible className="gap-2" defaultOpen>
        <CollapsibleTrigger render={<Button variant="ghost" />}>Ver</CollapsibleTrigger>
        <CollapsibleContent className="pt-6 text-copy-13">cuerpo</CollapsibleContent>
      </Collapsible>
    )
    const inner = screen.getByText("cuerpo")
    expect(inner).toHaveClass("pt-6", "text-copy-13")
    expect(inner.className).not.toMatch(/\bpt-2\b/)
    expect(inner.className).not.toMatch(/text-copy-14/)
  })
})
