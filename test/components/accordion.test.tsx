import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../src/components/accordion"

function Faq(props: React.ComponentProps<typeof Accordion>) {
  return (
    <Accordion {...props}>
      <AccordionItem value="a">
        <AccordionTrigger>¿Qué incluye?</AccordionTrigger>
        <AccordionContent>Hosting, soporte y actualizaciones.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="b">
        <AccordionTrigger>¿Se puede cancelar?</AccordionTrigger>
        <AccordionContent>Cuando quieras, desde Ajustes.</AccordionContent>
      </AccordionItem>
      <AccordionItem disabled value="c">
        <AccordionTrigger>Facturación por convenio</AccordionTrigger>
        <AccordionContent>Solo para cuentas enterprise.</AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

describe("Accordion", () => {
  it("cada sección es un <h3> con un botón adentro y su panel asociado", async () => {
    render(<Faq defaultValue={["a"]} />)
    const heading = screen.getByRole("heading", { level: 3, name: "¿Qué incluye?" })
    const trigger = screen.getByRole("button", { name: "¿Qué incluye?" })
    expect(heading).toContainElement(trigger)
    expect(trigger).toHaveAttribute("aria-expanded", "true")
    const panel = screen.getByRole("region", { name: "¿Qué incluye?" })
    expect(trigger).toHaveAttribute("aria-controls", panel.id)
  })

  it("abre y cierra con click, y el chevron gira con data-panel-open", async () => {
    render(<Faq />)
    const trigger = screen.getByRole("button", { name: "¿Qué incluye?" })
    expect(trigger).toHaveAttribute("aria-expanded", "false")
    await userEvent.click(trigger)
    expect(trigger).toHaveAttribute("aria-expanded", "true")
    expect(trigger).toHaveAttribute("data-panel-open")
    expect(await screen.findByText("Hosting, soporte y actualizaciones.")).toBeInTheDocument()
    await userEvent.click(trigger)
    expect(trigger).toHaveAttribute("aria-expanded", "false")
  })

  it("por defecto una sola abierta; con `multiple` conviven varias", async () => {
    const { unmount } = render(<Faq />)
    await userEvent.click(screen.getByRole("button", { name: "¿Qué incluye?" }))
    await userEvent.click(screen.getByRole("button", { name: "¿Se puede cancelar?" }))
    expect(screen.getByRole("button", { name: "¿Qué incluye?" })).toHaveAttribute("aria-expanded", "false")
    unmount()

    render(<Faq multiple />)
    await userEvent.click(screen.getByRole("button", { name: "¿Qué incluye?" }))
    await userEvent.click(screen.getByRole("button", { name: "¿Se puede cancelar?" }))
    expect(screen.getByRole("button", { name: "¿Qué incluye?" })).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByRole("button", { name: "¿Se puede cancelar?" })).toHaveAttribute("aria-expanded", "true")
  })

  it("teclado: cada trigger es una parada de Tab y abre con Enter y con Espacio", async () => {
    render(<Faq />)
    const [primero, segundo] = screen.getAllByRole("button")
    await userEvent.tab()
    expect(primero).toHaveFocus()
    await userEvent.keyboard("{Enter}")
    expect(primero).toHaveAttribute("aria-expanded", "true")
    await userEvent.tab()
    expect(segundo).toHaveFocus()
    await userEvent.keyboard(" ")
    expect(segundo).toHaveAttribute("aria-expanded", "true")
  })

  it("el ítem deshabilitado no abre y se marca con data-disabled", async () => {
    render(<Faq />)
    const trigger = screen.getByRole("button", { name: "Facturación por convenio" })
    expect(trigger).toHaveAttribute("data-disabled")
    await userEvent.click(trigger)
    expect(trigger).toHaveAttribute("aria-expanded", "false")
  })

  it("controlado: onValueChange devuelve los valores abiertos", async () => {
    const abiertos: unknown[] = []
    render(<Faq onValueChange={(value) => abiertos.push(value)} />)
    await userEvent.click(screen.getByRole("button", { name: "¿Se puede cancelar?" }))
    await waitFor(() => expect(abiertos.at(-1)).toEqual(["b"]))
  })

  it("el panel anima el alto con la variable de Base UI y respeta motion-reduce", async () => {
    render(<Faq defaultValue={["a"]} />)
    const panel = screen.getByRole("region", { name: "¿Qué incluye?" })
    expect(panel).toHaveClass(
      "h-(--accordion-panel-height)",
      "overflow-hidden",
      "transition-[height]",
      "motion-reduce:transition-none",
      "data-starting-style:h-0",
      "data-ending-style:h-0"
    )
  })

  it("el className del llamador gana: en el trigger y en el contenido", () => {
    render(
      <Accordion className="max-w-sm" defaultValue={["a"]}>
        <AccordionItem value="a">
          <AccordionTrigger className="py-2 text-heading-16">Título</AccordionTrigger>
          <AccordionContent className="pb-8">Cuerpo</AccordionContent>
        </AccordionItem>
      </Accordion>
    )
    const trigger = screen.getByRole("button", { name: "Título" })
    expect(trigger).toHaveClass("py-2", "text-heading-16")
    expect(trigger.className).not.toMatch(/\bpy-4\b/)
    expect(trigger.className).not.toMatch(/text-heading-14/)
    const inner = screen.getByText("Cuerpo")
    expect(inner).toHaveClass("pb-8")
    expect(inner.className).not.toMatch(/\bpb-4\b/)
  })
})
