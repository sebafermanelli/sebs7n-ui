"use client"

import { useId } from "react"
import { Label } from "sebs7n-ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "sebs7n-ui/select"

/**
 * Básico
 * `items` no es opcional en la práctica: es lo que hace que el trigger muestre
 * «Consumidor final» y no `cf`.
 */
export function Basico() {
  const id = useId()
  const condiciones = {
    ri: "Responsable inscripto",
    mono: "Monotributo",
    exento: "Exento",
    cf: "Consumidor final",
  }
  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <Label htmlFor={id}>Condición frente al IVA</Label>
      <Select items={condiciones}>
        <SelectTrigger id={id}>
          <SelectValue placeholder="Elegí una" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(condiciones).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

/**
 * Pop-up button de macOS
 * El ⌃⌄ avisa que la lista no baja: se abre con la opción elegida encima del disparador, en el
 * mismo lugar que el valor. Con el dedo, Base UI la hace bajar como un menú.
 */
export function PopUpButton() {
  const id = useId()
  const monedas = { ars: "Pesos", usd: "Dólares", eur: "Euros" }
  return (
    <form className="flex w-full max-w-sm flex-col gap-2" onSubmit={(event) => event.preventDefault()}>
      <Label htmlFor={id}>Moneda de la factura</Label>
      <Select defaultValue="ars" items={monedas} name="moneda">
        <SelectTrigger id={id}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(monedas).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </form>
  )
}

/**
 * Lista larga
 * Treinta países con uno del final elegido: la lista se abre con esa opción encima del disparador
 * y el resto se desplaza adentro del panel, con flechas arriba y abajo.
 */
export function ListaLarga() {
  const id = useId()
  const paises = Object.fromEntries(
    [
      "Alemania", "Argentina", "Australia", "Bolivia", "Brasil", "Canadá", "Chile", "China", "Colombia", "Costa Rica",
      "Ecuador", "España", "Estados Unidos", "Francia", "Guatemala", "India", "Italia", "Japón", "México", "Nicaragua",
      "Países Bajos", "Panamá", "Paraguay", "Perú", "Portugal", "Reino Unido", "República Dominicana", "Suecia", "Uruguay", "Venezuela",
    ].map((nombre) => [nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-"), nombre])
  )
  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <Label htmlFor={id}>País de facturación</Label>
      <Select defaultValue="uruguay" items={paises} name="pais">
        <SelectTrigger id={id}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(paises).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

/** Con grupos */
export function Grupos() {
  const monedas = { ars: "Peso argentino", usd: "Dólar", eur: "Euro", brl: "Real" }
  return (
    <Select defaultValue="ars" items={monedas}>
      <SelectTrigger aria-label="Moneda" className="max-w-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Local</SelectLabel>
          <SelectItem value="ars">{monedas.ars}</SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Extranjera</SelectLabel>
          <SelectItem value="usd">{monedas.usd}</SelectItem>
          <SelectItem value="eur">{monedas.eur}</SelectItem>
          <SelectItem value="brl">{monedas.brl}</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

/**
 * Tamaños y error
 * Las mismas tres alturas que `Input`, para que un formulario mixto quede alineado.
 */
export function TamanosYError() {
  const opciones = { a: "Una opción" }
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <Select items={opciones}>
        <SelectTrigger aria-label="Pequeño" size="sm">
          <SelectValue placeholder="sm · 32px" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">{opciones.a}</SelectItem>
        </SelectContent>
      </Select>
      <Select items={opciones}>
        <SelectTrigger aria-invalid aria-label="Con error">
          <SelectValue placeholder="Falta elegir" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">{opciones.a}</SelectItem>
        </SelectContent>
      </Select>
      <Select disabled items={opciones}>
        <SelectTrigger aria-label="Deshabilitado">
          <SelectValue placeholder="No se puede cambiar" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">{opciones.a}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
