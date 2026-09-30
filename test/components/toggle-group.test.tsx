// ToggleGroup 2.4: lo que pidieron las barras de filtros de las apps. El alto por defecto es el de un
// campo (md 36), `required` para el filtro de selección única que nunca queda vacío, «todos» como
// valor vacío (`""`) y opciones que son links.
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
import { describe, expect, it, vi } from "vitest"

import { Field, FieldLabel } from "../../src/components/field"
import { Form } from "../../src/components/form"
import { Toolbar } from "../../src/components/toolbar"
import { ToggleGroup, ToggleGroupItem } from "../../src/components/toggle-group"

const boton = (name: string) => screen.getByRole("button", { name })

describe("ToggleGroup: tamaño por defecto", () => {
  it("md (36) por defecto: mide lo mismo que la búsqueda y los Select de una barra de filtros", () => {
    render(
      <ToggleGroup aria-label="Estado">
        <ToggleGroupItem value="paid">Pagadas</ToggleGroupItem>
      </ToggleGroup>
    )
    expect(screen.getByRole("group", { name: "Estado" })).toHaveAttribute("data-size", "md")
  })

  it("adentro de una Toolbar el segmento sigue en 28, el escalón de la barra", () => {
    render(
      <Toolbar aria-label="Formato">
        <ToggleGroup aria-label="Estilo">
          <ToggleGroupItem value="bold">B</ToggleGroupItem>
        </ToggleGroup>
      </Toolbar>
    )
    const b = boton("B")
    expect(b).toHaveClass("h-6")
    expect(b.className).toMatch(/group-data-\[size=md\]\/toggle-group:not-in-data-\[slot=toolbar\]:h-8/)
    expect(b.className).not.toMatch(/(^|\s)group-data-\[size=md\]\/toggle-group:h-8/)
  })
})

describe("ToggleGroup required: selección única obligatoria", () => {
  it("tocar la opción prendida no la apaga", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <ToggleGroup aria-label="Estado" defaultValue={["paid"]} onValueChange={onValueChange} required>
        <ToggleGroupItem value="paid">Pagadas</ToggleGroupItem>
        <ToggleGroupItem value="due">Vencidas</ToggleGroupItem>
      </ToggleGroup>
    )
    await user.click(boton("Pagadas"))
    expect(boton("Pagadas")).toHaveAttribute("aria-pressed", "true")
    expect(onValueChange).not.toHaveBeenCalled()
    await user.click(boton("Vencidas"))
    expect(boton("Vencidas")).toHaveAttribute("aria-pressed", "true")
    expect(boton("Pagadas")).toHaveAttribute("aria-pressed", "false")
    expect(onValueChange).toHaveBeenLastCalledWith(["due"], expect.anything())
  })

  it("controlado: el último prendido tampoco se apaga", async () => {
    const user = userEvent.setup()
    function Filtro() {
      const [value, setValue] = React.useState(["paid"])
      return (
        <ToggleGroup aria-label="Estado" onValueChange={setValue} required value={value}>
          <ToggleGroupItem value="paid">Pagadas</ToggleGroupItem>
          <ToggleGroupItem value="due">Vencidas</ToggleGroupItem>
        </ToggleGroup>
      )
    }
    render(<Filtro />)
    await user.click(boton("Pagadas"))
    expect(boton("Pagadas")).toHaveAttribute("aria-pressed", "true")
  })

  it("con multiple, se pueden apagar todos menos el último", async () => {
    const user = userEvent.setup()
    render(
      <ToggleGroup aria-label="Estados" defaultValue={["paid", "due"]} multiple required>
        <ToggleGroupItem value="paid">Pagadas</ToggleGroupItem>
        <ToggleGroupItem value="due">Vencidas</ToggleGroupItem>
      </ToggleGroup>
    )
    await user.click(boton("Pagadas"))
    expect(boton("Pagadas")).toHaveAttribute("aria-pressed", "false")
    await user.click(boton("Vencidas"))
    expect(boton("Vencidas")).toHaveAttribute("aria-pressed", "true")
  })

  it("sin nada elegido, Form no envía y enfoca el primer ítem (como un grupo de radios required)", async () => {
    const user = userEvent.setup()
    const onFormSubmit = vi.fn()
    render(
      <Form onFormSubmit={onFormSubmit}>
        <Field name="status">
          <FieldLabel>Estado</FieldLabel>
          <ToggleGroup required>
            <ToggleGroupItem value="paid">Pagadas</ToggleGroupItem>
            <ToggleGroupItem value="due">Vencidas</ToggleGroupItem>
          </ToggleGroup>
        </Field>
        <button type="submit">Filtrar</button>
      </Form>
    )
    await user.click(boton("Filtrar"))
    expect(onFormSubmit).not.toHaveBeenCalled()
    expect(boton("Pagadas")).toHaveFocus()
    await user.click(boton("Vencidas"))
    await user.click(boton("Filtrar"))
    expect(onFormSubmit.mock.calls[0]![0]).toEqual({ status: ["due"] })
  })
})

describe("ToggleGroup: «todos» como valor vacío", () => {
  it("un ítem con value=\"\" se prende y avisa \"\"", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <ToggleGroup aria-label="Estado" defaultValue={[""]} onValueChange={onValueChange} required>
        <ToggleGroupItem value="">Todas</ToggleGroupItem>
        <ToggleGroupItem value="paid">Pagadas</ToggleGroupItem>
      </ToggleGroup>
    )
    expect(boton("Todas")).toHaveAttribute("aria-pressed", "true")
    await user.click(boton("Pagadas"))
    expect(onValueChange).toHaveBeenLastCalledWith(["paid"], expect.anything())
    await user.click(boton("Todas"))
    expect(onValueChange).toHaveBeenLastCalledWith([""], expect.anything())
    expect(boton("Todas")).toHaveAttribute("aria-pressed", "true")
    expect(boton("Pagadas")).toHaveAttribute("aria-pressed", "false")
  })

  it("con name viaja como \"\", igual que un <select> con la opción vacía", () => {
    const { container } = render(
      <form>
        <ToggleGroup aria-label="Estado" defaultValue={[""]} name="status">
          <ToggleGroupItem value="">Todas</ToggleGroupItem>
          <ToggleGroupItem value="paid">Pagadas</ToggleGroupItem>
        </ToggleGroup>
      </form>
    )
    expect(new FormData(container.querySelector("form")!).getAll("status")).toEqual([""])
  })
})

describe("ToggleGroupItem con href: opciones que navegan", () => {
  function Filtro({ value = "paid" }: { value?: string }) {
    return (
      <ToggleGroup aria-label="Estado" value={[value]}>
        <ToggleGroupItem href="?status=" value="">
          Todas
        </ToggleGroupItem>
        <ToggleGroupItem href="?status=paid" value="paid">
          Pagadas
        </ToggleGroupItem>
        <ToggleGroupItem href="?status=due" value="due">
          Vencidas
        </ToggleGroupItem>
      </ToggleGroup>
    )
  }

  it("son <a href> reales (Cmd-clic abre en pestaña nueva) y la elegida lleva aria-current, no aria-pressed", () => {
    render(<Filtro />)
    const pagadas = screen.getByRole("link", { name: "Pagadas" })
    expect(pagadas).toHaveAttribute("href", "?status=paid")
    expect(pagadas).toHaveAttribute("aria-current", "page")
    expect(pagadas).toHaveAttribute("data-pressed")
    expect(pagadas).not.toHaveAttribute("aria-pressed")
    expect(pagadas).not.toHaveAttribute("role")
    const todas = screen.getByRole("link", { name: "Todas" })
    expect(todas).not.toHaveAttribute("aria-current")
    expect(todas).not.toHaveAttribute("data-pressed")
    expect(screen.queryAllByRole("button")).toEqual([])
  })

  it("«todos» (\"\") también se marca como el actual", () => {
    render(<Filtro value="" />)
    expect(screen.getByRole("link", { name: "Todas" })).toHaveAttribute("aria-current", "page")
  })

  it("llevan el estilo del segmento y cada una es una parada de Tab, como cualquier link", async () => {
    const user = userEvent.setup()
    render(<Filtro />)
    const [todas, pagadas] = screen.getAllByRole("link")
    expect(pagadas).toHaveClass("h-6", "data-pressed:bg-brand-700", "group-data-[size=md]/toggle-group:not-in-data-[slot=toolbar]:h-8")
    await user.tab()
    expect(todas).toHaveFocus()
    await user.tab()
    expect(pagadas).toHaveFocus()
  })

  it("render={<Link href>}: con el href en el Link alcanza para que sea un link", () => {
    const Link = (props: React.ComponentProps<"a">) => <a {...props} />
    render(
      <ToggleGroup aria-label="Estado" value={["due"]}>
        <ToggleGroupItem render={<Link href="?status=due" />} value="due">
          Vencidas
        </ToggleGroupItem>
        <ToggleGroupItem render={<Link href="?status=paid" />} value="paid">
          Pagadas
        </ToggleGroupItem>
      </ToggleGroup>
    )
    expect(screen.getByRole("link", { name: "Vencidas" })).toHaveAttribute("aria-current", "page")
    expect(screen.getByRole("link", { name: "Pagadas" })).toHaveAttribute("href", "?status=paid")
    expect(screen.queryAllByRole("button")).toEqual([])
  })

  it("render: el Link del router recibe href, clases y aria-current (conserva su prefetch)", () => {
    const Link = ({ prefetch, ...props }: React.ComponentProps<"a"> & { prefetch?: boolean }) => (
      <a data-prefetch={String(prefetch)} {...props} />
    )
    render(
      <ToggleGroup aria-label="Estado" value={["due"]}>
        <ToggleGroupItem href="?status=due" render={<Link prefetch={false} />} value="due">
          Vencidas
        </ToggleGroupItem>
      </ToggleGroup>
    )
    const link = screen.getByRole("link", { name: "Vencidas" })
    expect(link).toHaveAttribute("href", "?status=due")
    expect(link).toHaveAttribute("data-prefetch", "false")
    expect(link).toHaveAttribute("aria-current", "page")
    expect(link).toHaveClass("data-pressed:bg-brand-700")
  })
})
