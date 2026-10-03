import { render, screen } from "@testing-library/react"
import * as React from "react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Button } from "../../src/components/button"
import { Field, FieldError, FieldLabel } from "../../src/components/field"
import { Form } from "../../src/components/form"
import { NumberField } from "../../src/components/number-field"
import { LabelsProvider } from "../../src/lib/labels"

const group = () => document.querySelector("[data-slot=number-field-group]")!
const input = () => screen.getByRole("textbox") as HTMLInputElement

describe("NumberField", () => {
  it("es un input de texto con los botones de −/+ nombrados en español", () => {
    render(<NumberField aria-label="Pasajeros" defaultValue={2} />)
    // Es `type="text"` con `inputMode` numérico, no `type="number"`: así el
    // formato por locale ("1.234") no lo rechaza el navegador.
    expect(input()).toHaveAccessibleName("Pasajeros")
    expect(input()).toHaveValue("2")
    expect(screen.getByRole("button", { name: "Aumentar" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Disminuir" })).toBeInTheDocument()
  })

  it("teclado: flechas por `step`, Shift por `largeStep`, Alt por `smallStep`", async () => {
    render(<NumberField aria-label="Cantidad" defaultValue={10} largeStep={25} smallStep={0.5} step={2} />)
    await userEvent.tab()
    expect(input()).toHaveFocus()

    await userEvent.keyboard("{ArrowUp}")
    expect(input()).toHaveValue("12")
    await userEvent.keyboard("{ArrowDown}")
    expect(input()).toHaveValue("10")

    await userEvent.keyboard("{Shift>}{ArrowUp}{/Shift}")
    expect(input()).toHaveValue("35")
    await userEvent.keyboard("{Alt>}{ArrowDown}{/Alt}")
    expect(input()).toHaveValue("34.5")
  })

  it("Inicio y Fin van al mínimo y al máximo; Re Pág y Av Pág no hacen nada", async () => {
    render(<NumberField aria-label="Stock" defaultValue={50} max={99} min={5} />)
    await userEvent.tab()

    await userEvent.keyboard("{End}")
    expect(input()).toHaveValue("99")
    await userEvent.keyboard("{Home}")
    expect(input()).toHaveValue("5")

    // Base UI no ata Re Pág / Av Pág: se deja documentado acá para que nadie
    // prometa en la doc una tecla que el componente no responde.
    await userEvent.keyboard("{PageUp}")
    expect(input()).toHaveValue("5")
    await userEvent.keyboard("{PageDown}")
    expect(input()).toHaveValue("5")
  })

  it("respeta min y max: los botones se apagan en el tope y el teclado no lo pasa", async () => {
    render(<NumberField aria-label="Pasajeros" defaultValue={8} max={9} min={1} />)
    const subir = screen.getByRole("button", { name: "Aumentar" })

    await userEvent.click(subir)
    expect(input()).toHaveValue("9")
    expect(subir).toBeDisabled()

    input().focus()
    await userEvent.keyboard("{ArrowUp}")
    expect(input()).toHaveValue("9")

    await userEvent.click(screen.getByRole("button", { name: "Disminuir" }))
    expect(input()).toHaveValue("8")
    expect(subir).not.toBeDisabled()
  })

  it("el valor que sale es número, no string", async () => {
    const onValueChange = vi.fn()
    render(<NumberField aria-label="Cantidad" defaultValue={3} onValueChange={onValueChange} />)

    await userEvent.click(screen.getByRole("button", { name: "Aumentar" }))

    expect(onValueChange).toHaveBeenCalled()
    const valor = onValueChange.mock.calls.at(-1)?.[0]
    expect(typeof valor).toBe("number")
    expect(valor).toBe(4)
  })

  it("vaciar el campo da null, no cero ni cadena vacía", async () => {
    const onValueChange = vi.fn()
    render(<NumberField aria-label="Cantidad" defaultValue={3} onValueChange={onValueChange} />)

    await userEvent.clear(input())

    expect(onValueChange.mock.calls.at(-1)?.[0]).toBeNull()
  })

  it("el formato por locale es cosmética: el submit manda el número crudo", async () => {
    const onFormSubmit = vi.fn()
    render(
      <Form onFormSubmit={onFormSubmit}>
        <Field name="precio">
          <FieldLabel>Precio</FieldLabel>
          <NumberField
            defaultValue={12_500}
            format={{ style: "currency", currency: "ARS", maximumFractionDigits: 0 }}
            locale="es-AR"
          />
        </Field>
        <Button type="submit">Guardar</Button>
      </Form>
    )

    // Lo que se ve está formateado…
    expect(input().value).toMatch(/12\.500/)
    await userEvent.click(screen.getByRole("button", { name: "Guardar" }))

    // …y lo que se envía es el número.
    expect(onFormSubmit).toHaveBeenCalledOnce()
    expect(onFormSubmit.mock.calls[0]?.[0]).toEqual({ precio: 12_500 })
  })

  it("adentro de un Field queda nombrado por el FieldLabel, sin htmlFor", () => {
    render(
      <Field name="pasajeros">
        <FieldLabel>Pasajeros</FieldLabel>
        <NumberField defaultValue={1} />
      </Field>
    )
    // Mismo contrato que `Input`: nadie escribió un id y el control igual tiene nombre.
    expect(screen.getByLabelText("Pasajeros")).toBe(input())
  })

  it("inválido: marca el input y el error describe al control", async () => {
    render(
      <Field
        name="stock"
        validate={(valor) => (Number(valor) >= 0 ? null : "El stock no puede ser negativo")}
        validationMode="onBlur"
      >
        <FieldLabel>Stock</FieldLabel>
        <NumberField defaultValue={0} min={-10} />
        <FieldError />
      </Field>
    )

    input().focus()
    await userEvent.keyboard("{ArrowDown}")
    await userEvent.tab()

    expect(await screen.findByText("El stock no puede ser negativo")).toBeInTheDocument()
    expect(input()).toHaveAttribute("aria-invalid", "true")
    expect(input()).toHaveAccessibleDescription("El stock no puede ser negativo")
    // El borde rojo lo pinta la superficie leyendo el aria-invalid del input.
    expect(group()).toHaveClass("has-[input[aria-invalid=true]]:border-red-800")
  })

  it("disabled: no se escribe, no se pulsa, y la superficie queda marcada", async () => {
    render(<NumberField aria-label="Cantidad" defaultValue={4} disabled />)
    expect(input()).toBeDisabled()
    expect(group()).toHaveAttribute("data-disabled")

    input().focus()
    await userEvent.keyboard("{ArrowUp}")
    expect(input()).toHaveValue("4")
  })

  it("readOnly: se lee y se copia, pero los steppers no lo mueven", async () => {
    render(<NumberField aria-label="Cantidad" defaultValue={4} readOnly />)
    await userEvent.click(screen.getByRole("button", { name: "Aumentar" }))
    expect(input()).toHaveValue("4")
  })

  // Revisión de R4 (M3): los steppers miden 20, bien con el mouse; con el dedo crecen a 28, arriba
  // de los 24 del mínimo de WCAG 2.5.8 (también los botones de Combobox y Autocomplete).
  it("con el dedo los steppers crecen a 28", () => {
    render(<NumberField aria-label="Cantidad" />)
    for (const nombre of ["Aumentar", "Disminuir"]) {
      expect(screen.getByRole("button", { name: nombre })).toHaveClass("size-5", "pointer-coarse:size-7")
    }
  })

  it("los steppers están fuera del orden de tabulación: la única parada es el input", async () => {
    render(<NumberField aria-label="Cantidad" defaultValue={1} />)
    expect(screen.getByRole("button", { name: "Aumentar" })).toHaveAttribute("tabindex", "-1")
    await userEvent.tab()
    expect(input()).toHaveFocus()
    await userEvent.tab()
    expect(input()).not.toHaveFocus()
  })

  it("tamaños: 28, 36 y 40px, los mismos de Input", () => {
    const { rerender } = render(<NumberField aria-label="x" defaultValue={1} />)
    expect(group()).toHaveAttribute("data-size", "md")
    expect(group()).toHaveClass("data-[size=sm]:h-7", "data-[size=md]:h-9", "data-[size=lg]:h-10")
    rerender(<NumberField aria-label="x" defaultValue={1} size="lg" />)
    expect(group()).toHaveAttribute("data-size", "lg")
  })

  // Con el campo a todo el ancho y el input en `flex-1`, un «1» quedaba con los botones en las
  // puntas y un hueco en el medio. El input mide lo que el número (`field-sizing: content`), con
  // un mínimo de 3 cifras, y el grupo abraza a los tres. Sin `field-sizing` (Firefox), 5 cifras fijas.
  it("el campo se ajusta al número: − y + quedan pegados a él", () => {
    render(<NumberField aria-label="x" defaultValue={1} />)
    expect(group()).toHaveClass("w-fit", "max-w-full")
    expect(group().className).not.toMatch(/(^|\s)w-full(\s|$)/)
    expect(input()).toHaveClass(
      "field-sizing-content",
      "w-[calc(5ch+1rem)]",
      "supports-[field-sizing:content]:w-auto",
      "min-w-[calc(3ch+1rem)]",
      "flex-initial"
    )
    expect(input().className).not.toMatch(/\bflex-1\b/)
  })

  it("el className del llamador le gana a la clase base", () => {
    render(<NumberField aria-label="x" className="w-24" defaultValue={1} inputClassName="text-left" />)
    expect(group()).toHaveClass("w-24")
    expect(group().className).not.toMatch(/(^|\s)w-full(\s|$)/)
    expect(input()).toHaveClass("text-left")
    expect(input().className).not.toMatch(/\btext-center\b/)
  })

  describe("locale", () => {
    it("sin prop, el de LabelsProvider (numberField.locale)", () => {
      render(
        <LabelsProvider value={{ numberField: { locale: "de-DE" } }}>
          <NumberField aria-label="Importe" defaultValue={1234.5} />
        </LabelsProvider>
      )
      expect(input()).toHaveValue("1.234,5")
    })

    it("la prop locale le gana al provider", () => {
      render(
        <LabelsProvider value={{ numberField: { locale: "de-DE" } }}>
          <NumberField aria-label="Importe" defaultValue={1234.5} locale="en-US" />
        </LabelsProvider>
      )
      expect(input()).toHaveValue("1,234.5")
    })
  })

  describe("currency", () => {
    it("arma el formato de moneda con el código ISO y el submit sigue siendo el número", async () => {
      const onFormSubmit = vi.fn()
      render(
        <Form onFormSubmit={onFormSubmit}>
          <Field name="total">
            <FieldLabel>Total</FieldLabel>
            <NumberField currency="USD" defaultValue={1240.5} locale="en-US" />
          </Field>
          <Button type="submit">Guardar</Button>
        </Form>
      )
      expect(input()).toHaveValue("$1,240.50")
      await userEvent.click(screen.getByRole("button", { name: "Guardar" }))
      expect(onFormSubmit.mock.calls[0]?.[0]).toEqual({ total: 1240.5 })
    })

    it("acepta el código en minúsculas y con espacios", () => {
      render(<NumberField aria-label="Total" currency=" eur " defaultValue={10} locale="de-DE" />)
      expect(input().value).toMatch(/^10,00\s€$/)
    })

    it("un código mal formado no tira: cae a número con 2 decimales", () => {
      render(<NumberField aria-label="Total" currency="dólar" defaultValue={10} locale="en-US" />)
      expect(input()).toHaveValue("10.00")
    })

    it("format se mezcla encima del de moneda", () => {
      render(<NumberField aria-label="Total" currency="USD" defaultValue={1240} format={{ maximumFractionDigits: 0 }} locale="en-US" />)
      expect(input()).toHaveValue("$1,240")
    })

    it("pone step=\"any\" (el submit no rechaza centavos) salvo que se pase step", async () => {
      const onFormSubmit = vi.fn()
      const { unmount } = render(
        <Form onFormSubmit={onFormSubmit}>
          <Field name="total">
            <FieldLabel>Total</FieldLabel>
            <NumberField currency="USD" defaultValue={10.25} locale="en-US" min={0} />
          </Field>
          <Button type="submit">Guardar</Button>
        </Form>
      )
      const oculto = document.querySelector<HTMLInputElement>("input[name=total]")!
      expect(oculto).toHaveAttribute("step", "any")
      await userEvent.click(screen.getByRole("button", { name: "Guardar" }))
      expect(onFormSubmit).toHaveBeenCalledOnce()
      unmount()
      render(<NumberField aria-label="Total" currency="USD" name="total" step={5} />)
      expect(document.querySelector("input[name=total]")).toHaveAttribute("step", "5")
    })
  })

  describe("props del input visible", () => {
    it("autoFocus enfoca el input que se ve", () => {
      render(<NumberField aria-label="Cantidad" autoFocus defaultValue={1} />)
      expect(input()).toHaveFocus()
    })

    it("inputRef apunta al input visible, no al oculto del submit", () => {
      const ref = React.createRef<HTMLInputElement>()
      render(<NumberField aria-label="Cantidad" defaultValue={1} inputRef={ref} name="cantidad" />)
      expect(ref.current).toBe(input())
    })

    it("id va al input visible (para un <label htmlFor>)", () => {
      render(
        <>
          <label htmlFor="qty">Cantidad</label>
          <NumberField defaultValue={1} id="qty" />
        </>
      )
      expect(input()).toHaveAttribute("id", "qty")
      expect(screen.getByLabelText("Cantidad")).toBe(input())
    })
  })

  it("fullWidth: el grupo ocupa todo el ancho; sin él abraza al número", () => {
    const { container, rerender } = render(<NumberField defaultValue={1} />)
    expect(container.querySelector("[data-slot=number-field-group]")).toHaveClass("w-fit")
    rerender(<NumberField defaultValue={1} fullWidth />)
    expect(container.querySelector("[data-slot=number-field-group]")).toHaveClass("w-full")
    expect(container.querySelector("[data-slot=number-field-group]")).not.toHaveClass("w-fit")
  })
})
