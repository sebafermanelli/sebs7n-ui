"use client"

import * as React from "react"
import { Popover as PopoverPrimitive } from "@base-ui/react/popover"

import { isSameColor, oklchOfHex } from "../lib/color.js"
import { hexOfOklch, type Oklch } from "../lib/contrast.js"
import { useLabels, type Labels } from "../lib/labels.js"
import { cn } from "../lib/utils.js"
import {
  inputControlClassName,
  inputDisabledClassName,
  inputInvalidClassName,
  inputPaddingClassName,
  inputSizeClassName,
} from "../variants/input.js"
import { floatingPopupClassName } from "../variants/overlay.js"
import { sliderThumbClassName, sliderThumbPeerActiveClassName } from "../variants/slider.js"
import { Input } from "./input.js"
import { Label } from "./label.js"
import { Slider } from "./slider.js"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs.js"

type ColorPickerLabels = Labels["colorPicker"]

type ColorPickerProps = Omit<React.ComponentProps<"button">, "value" | "defaultValue" | "onChange" | "name" | "children"> & {
  /** El color elegido, controlado. En OKLCH, como se escribe en CSS: `[0.573, 0.214, 258]`. */
  value?: Oklch
  /** El color con el que arranca, sin controlar. */
  defaultValue?: Oklch
  /** Avisa el color en cada cambio, también mientras se arrastra. */
  onValueChange?: (color: Oklch) => void
  /**
   * Los últimos colores usados, del más nuevo al más viejo. Se muestran arriba de la paleta;
   * sin lista, la sección no aparece.
   *
   * El componente los **muestra**, no los guarda: qué cuenta como «usado» y dónde vive la
   * lista —un estado, `localStorage`, la base— lo decide la app. Lo más común es sumar el
   * color al cerrar el panel, con `onOpenChange`.
   */
  recent?: readonly Oklch[]
  /** Las mismas tres alturas que `Input`. */
  size?: "sm" | "md" | "lg"
  /** El nombre con el que el color viaja en un formulario, como `#0070f3`. */
  name?: string
  /** El panel abierto o cerrado, controlado. */
  open?: boolean
  /** Avisa cuando se abre o se cierra. Es el momento para guardar el color en los recientes. */
  onOpenChange?: (open: boolean) => void
  /** El idioma de los números de la pestaña Valores, como lo entiende `Intl`. Por defecto, `es-AR`. */
  locale?: string
  /** Lo que va abajo del panel: una vista previa, un aviso de contraste. Recibe el color actual. */
  footer?: React.ReactNode | ((color: Oklch) => React.ReactNode)
  /** Los textos del panel. */
  labels?: Partial<ColorPickerLabels>
  /** Clases del panel. */
  popupClassName?: string
}

// El campo de la pestaña Espectro: croma de izquierda a derecha, luminosidad de arriba a abajo.
const L_MAX = 0.92
const L_MIN = 0.25
const C_MAX = 0.3
/** El azul del paquete: con algo tiene que arrancar un selector sin valor. */
const DEFAULT: Oklch = [0.573, 0.214, 258]

// Diez matices por cinco luces. Diez y no doce: en un panel de 320px, doce columnas dejan
// muestras de 18px, por debajo de los 24 que pide un objetivo táctil.
const MATICES = [25, 55, 85, 140, 165, 200, 240, 270, 305, 345]
const LUCES = [0.78, 0.68, 0.573, 0.5, 0.42]
const PALETA: Oklch[] = LUCES.flatMap((l) => MATICES.map((h) => [l, l > 0.7 ? 0.13 : 0.17, h] as const))

const clamp = (valor: number, min = 0, max = 1) => Math.min(max, Math.max(min, valor))
const redondear = (valor: number, decimales: number) => Number(valor.toFixed(decimales))

/**
 * Un campo que abre un selector de color.
 *
 * Trabaja en OKLCH de punta a punta: lo que se mueve acá es el mismo número que termina en
 * el CSS, sin una conversión de ida y vuelta por HSL que lo corra un decimal. Tres formas de
 * elegir, que son las del selector de macOS:
 *
 * - **Paleta**: una grilla, y arriba los recientes, para quien quiere un color y no una coordenada.
 * - **Espectro**: croma contra luminosidad para un matiz, más la tira de matices.
 * - **Valores**: los tres números y el hexadecimal, para pegar el color que ya se tiene.
 *
 * Reemplaza a `<input type="color">`, cuyo panel es del sistema operativo: no toma el
 * material, cambia de forma en cada navegador y no sabe de OKLCH.
 */
function ColorPicker({
  className,
  popupClassName,
  value: valueProp,
  defaultValue = DEFAULT,
  onValueChange,
  recent,
  size = "md",
  name,
  open,
  onOpenChange,
  locale = "es-AR",
  footer,
  labels: labelsProp,
  disabled,
  ...props
}: ColorPickerProps) {
  const labels = { ...useLabels().colorPicker, ...labelsProp }
  const [interno, setInterno] = React.useState(defaultValue)
  const color = valueProp ?? interno
  const hex = hexOfOklch(color)

  const cambiar = (siguiente: Oklch) => {
    if (valueProp === undefined) setInterno(siguiente)
    onValueChange?.(siguiente)
  }

  return (
    <PopoverPrimitive.Root onOpenChange={onOpenChange} open={open}>
      <PopoverPrimitive.Trigger
        data-slot="color-picker"
        data-size={size}
        disabled={disabled}
        className={cn(
          inputControlClassName,
          inputSizeClassName,
          inputDisabledClassName,
          inputInvalidClassName,
          inputPaddingClassName[size],
          // La muestra va pegada al borde, como el ícono de un campo: menos aire a la izquierda.
          "flex w-full min-w-0 cursor-pointer items-center gap-2 text-left",
          size === "sm" ? "pl-1.5" : size === "lg" ? "pl-2.5" : "pl-2",
          "focus-visible:focus-border data-popup-open:focus-border",
          "data-[size=sm]:[&>[data-slot=color-picker-swatch]]:size-5",
          className
        )}
        {...props}
      >
        <Muestra className="size-6" color={color} />
        <span className="min-w-0 flex-1 truncate text-mono-body uppercase">{hex}</span>
      </PopoverPrimitive.Trigger>
      {name && <input name={name} type="hidden" value={hex} />}
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Positioner align="start" className="isolate z-50" side="bottom" sideOffset={6}>
          <PopoverPrimitive.Popup
            aria-label={labels.popup}
            data-slot="color-picker-popup"
            className={cn(floatingPopupClassName, "w-80 gap-4", popupClassName)}
          >
            <Tabs defaultValue="palette">
              <TabsList aria-label={labels.tabs} className="w-full [&>[data-slot=tabs-trigger]]:flex-1">
                <TabsTrigger value="palette">{labels.palette}</TabsTrigger>
                <TabsTrigger value="spectrum">{labels.spectrum}</TabsTrigger>
                <TabsTrigger value="values">{labels.values}</TabsTrigger>
              </TabsList>
              <TabsContent className="flex flex-col gap-4" value="palette">
                {recent && recent.length > 0 && (
                  <Grilla colores={recent.slice(0, MATICES.length)} elegido={color} onPick={cambiar} slot="recent" titulo={labels.recent} />
                )}
                <Grilla colores={PALETA} elegido={color} onPick={cambiar} slot="swatches" titulo={labels.swatches} />
              </TabsContent>
              <TabsContent value="spectrum">
                <Espectro color={color} labels={labels} onChange={cambiar} />
              </TabsContent>
              <TabsContent value="values">
                <Valores color={color} labels={labels} locale={locale} onChange={cambiar} />
              </TabsContent>
            </Tabs>
            {footer != null && (
              <div className="flex flex-col gap-2 border-t border-gray-alpha-400 pt-3" data-slot="color-picker-footer">
                {typeof footer === "function" ? footer(color) : footer}
              </div>
            )}
          </PopoverPrimitive.Popup>
        </PopoverPrimitive.Positioner>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}

/** El círculo de color. El filo claro de arriba es el mismo de los botones de color. */
function Muestra({ color, className }: { color: Oklch; className?: string }) {
  return (
    <span
      aria-hidden="true"
      data-slot="color-picker-swatch"
      className={cn("shrink-0 rounded-full shadow-[inset_0_1px_0_rgb(255_255_255/0.45),0_0_0_1px_rgb(0_0_0/0.12)]", className)}
      style={{ backgroundColor: hexOfOklch(color) }}
    />
  )
}

function Grilla({
  titulo,
  colores,
  elegido,
  onPick,
  slot,
}: {
  titulo: string
  colores: readonly Oklch[]
  elegido: Oklch
  onPick: (color: Oklch) => void
  slot: string
}) {
  const id = React.useId()
  return (
    <div className="flex flex-col gap-2" data-slot={`color-picker-${slot}`}>
      <span className="text-callout text-gray-900" id={id}>
        {titulo}
      </span>
      <div aria-labelledby={id} className="grid grid-cols-10 gap-1.5" role="group">
        {colores.map((color, indice) => {
          const valor = hexOfOklch(color)
          const activo = isSameColor(color, elegido)
          return (
            <button
              // El índice va en la clave: en los recientes un color puede venir repetido, y dos
              // hijos con la misma clave hacen que React se quede con uno solo.
              key={`${valor}-${indice}`}
              aria-label={valor.toUpperCase()}
              aria-pressed={activo}
              className={cn(
                // El cuadrado mide lo que mide la columna (~23px); el `::after` lleva el área de
                // toque a 24 sin mover un pixel de lo que se ve.
                "relative aspect-square w-full cursor-pointer rounded-[7px] outline-none transition-[scale,box-shadow] duration-150 after:absolute after:-inset-0.5",
                "shadow-[inset_0_1px_0_rgb(255_255_255/0.4),0_0_0_0.5px_rgb(0_0_0/0.16)]",
                "hover:scale-115 focus-visible:focus-ring active:scale-95",
                "aria-pressed:shadow-[0_0_0_2px_var(--color-background-100),0_0_0_4px_var(--color-gray-1000)]"
              )}
              onClick={() => onPick(color)}
              style={{ backgroundColor: valor }}
              type="button"
            />
          )
        })}
      </div>
    </div>
  )
}

function Espectro({ color, onChange, labels }: { color: Oklch; onChange: (color: Oklch) => void; labels: ColorPickerLabels }) {
  const [l, c, h] = color
  const canvas = React.useRef<HTMLCanvasElement>(null)
  const [arrastrando, setArrastrando] = React.useState(false)
  const matizId = React.useId()

  // El campo se pinta pixel por pixel con la misma función que usa el paquete para medir
  // contraste. Un degradé de CSS sería más barato, pero no es el mismo color: el punto bajo el
  // cursor y el color elegido no coincidirían, y un selector que miente no sirve.
  React.useEffect(() => {
    const lienzo = canvas.current
    const ctx = lienzo?.getContext?.("2d")
    if (!lienzo || !ctx) return
    const { width, height } = lienzo
    const imagen = ctx.createImageData(width, height)
    for (let y = 0; y < height; y++) {
      const luz = L_MAX - (y / (height - 1)) * (L_MAX - L_MIN)
      for (let x = 0; x < width; x++) {
        const punto = hexOfOklch([luz, (x / (width - 1)) * C_MAX, h])
        const i = (y * width + x) * 4
        imagen.data[i] = parseInt(punto.slice(1, 3), 16)
        imagen.data[i + 1] = parseInt(punto.slice(3, 5), 16)
        imagen.data[i + 2] = parseInt(punto.slice(5, 7), 16)
        imagen.data[i + 3] = 255
      }
    }
    ctx.putImageData(imagen, 0, 0)
  }, [h])

  const mover = (evento: React.PointerEvent<HTMLDivElement>) => {
    const caja = evento.currentTarget.getBoundingClientRect()
    if (!caja.width || !caja.height) return
    const x = clamp((evento.clientX - caja.left) / caja.width)
    const y = clamp((evento.clientY - caja.top) / caja.height)
    onChange([redondear(L_MAX - y * (L_MAX - L_MIN), 3), redondear(x * C_MAX, 3), h])
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        aria-label={labels.area}
        aria-valuenow={Math.round((c / C_MAX) * 100)}
        aria-valuetext={`${labels.lightness} ${l}, ${labels.chroma} ${c}`}
        className="relative h-40 cursor-crosshair touch-none overflow-hidden rounded-control outline-none select-none focus-visible:focus-ring"
        data-slot="color-picker-area"
        onKeyDown={(evento) => {
          const paso = evento.shiftKey ? 0.05 : 0.01
          const teclas: Record<string, Oklch> = {
            ArrowLeft: [l, clamp(c - paso, 0, C_MAX), h],
            ArrowRight: [l, clamp(c + paso, 0, C_MAX), h],
            ArrowUp: [clamp(l + paso, L_MIN, L_MAX), c, h],
            ArrowDown: [clamp(l - paso, L_MIN, L_MAX), c, h],
          }
          const siguiente = teclas[evento.key]
          if (!siguiente) return
          evento.preventDefault()
          onChange([redondear(siguiente[0], 3), redondear(siguiente[1], 3), h])
        }}
        onPointerDown={(evento) => {
          evento.currentTarget.setPointerCapture?.(evento.pointerId)
          setArrastrando(true)
          mover(evento)
        }}
        onPointerMove={(evento) => arrastrando && mover(evento)}
        onPointerUp={() => setArrastrando(false)}
        role="slider"
        tabIndex={0}
      >
        <canvas aria-hidden="true" className="size-full" height={100} ref={canvas} width={160} />
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute size-5 -translate-1/2 rounded-full border-2 border-white shadow-tooltip transition-thumb",
            // El mismo gesto que el Slider: agarrado, el pulgar es un lente.
            arrastrando && "scale-150 border thumb-lens"
          )}
          style={{
            left: `${clamp(c / C_MAX) * 100}%`,
            top: `${clamp((L_MAX - l) / (L_MAX - L_MIN)) * 100}%`,
            backgroundColor: arrastrando ? undefined : hexOfOklch(color),
          }}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={matizId}>{labels.hue}</Label>
        <div className="relative h-5">
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-1.5 h-2 rounded-full shadow-track"
            style={{ background: "linear-gradient(to right in oklch longer hue, oklch(0.7 0.19 0), oklch(0.7 0.19 360))" }}
          />
          {/* Un `<input type="range">` de verdad, invisible y encima: el teclado, el lector de
              pantalla y el arrastre son los del navegador. Lo que se ve es el pulgar de abajo. */}
          <input
            className="peer absolute inset-0 size-full cursor-pointer opacity-0"
            data-slot="color-picker-hue"
            id={matizId}
            max={360}
            min={0}
            onChange={(evento) => onChange([l, c, Number(evento.target.value)])}
            type="range"
            value={h}
          />
          <span
            aria-hidden="true"
            // La perilla del Slider: la misma cápsula de 20 × 28, de `variants/slider`.
            className={cn(
              sliderThumbClassName,
              sliderThumbPeerActiveClassName,
              "pointer-events-none absolute top-0 h-5 w-7 -translate-x-1/2 peer-focus-visible:focus-ring"
            )}
            style={{ left: `calc(14px + (100% - 28px) * ${h / 360})` }}
          />
        </div>
      </div>
    </div>
  )
}

function Valores({
  color,
  onChange,
  labels,
  locale,
}: {
  color: Oklch
  onChange: (color: Oklch) => void
  labels: ColorPickerLabels
  locale: string
}) {
  const [l, c, h] = color
  const hex = hexOfOklch(color)
  const hexId = React.useId()
  // Mientras se tipea, el campo muestra lo tipeado: `#0070` todavía no es un color, y pisarlo
  // con el hexadecimal del color actual le borraría al usuario lo que está escribiendo.
  const [texto, setTexto] = React.useState<string | null>(null)
  return (
    <div className="flex flex-col gap-4">
      <Slider
        format={{ maximumFractionDigits: 2, minimumFractionDigits: 2 }}
        label={labels.lightness}
        locale={locale}
        max={L_MAX}
        min={L_MIN}
        onValueChange={(valor) => onChange([redondear(valor as number, 3), c, h])}
        showValue
        size="sm"
        step={0.005}
        value={clamp(l, L_MIN, L_MAX)}
      />
      <Slider
        format={{ maximumFractionDigits: 3, minimumFractionDigits: 3 }}
        label={labels.chroma}
        locale={locale}
        max={C_MAX}
        min={0}
        onValueChange={(valor) => onChange([l, redondear(valor as number, 3), h])}
        showValue
        size="sm"
        step={0.005}
        value={clamp(c, 0, C_MAX)}
      />
      <Slider
        format={{ maximumFractionDigits: 0 }}
        label={labels.hue}
        locale={locale}
        max={360}
        min={0}
        onValueChange={(valor) => onChange([l, c, valor as number])}
        showValue
        size="sm"
        step={1}
        value={clamp(h, 0, 360)}
      />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={hexId}>{labels.hex}</Label>
        <Input
          autoCapitalize="off"
          autoComplete="off"
          className="text-mono-body uppercase"
          data-slot="color-picker-hex"
          id={hexId}
          onBlur={() => setTexto(null)}
          onChange={(evento) => {
            setTexto(evento.target.value)
            const siguiente = oklchOfHex(evento.target.value)
            if (siguiente) onChange(siguiente)
          }}
          size="sm"
          spellCheck={false}
          value={texto ?? hex}
        />
      </div>
    </div>
  )
}

export { ColorPicker, type ColorPickerLabels, type ColorPickerProps }
