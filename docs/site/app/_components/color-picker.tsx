"use client"

import { CheckIcon, TriangleAlertIcon } from "lucide-react"
import { useEffect, useId, useRef, useState } from "react"
import { Badge } from "sebs7n-ui/badge"
import { Button } from "sebs7n-ui/button"
import { Input } from "sebs7n-ui/input"
import { Label } from "sebs7n-ui/label"
import { cn } from "sebs7n-ui/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "sebs7n-ui/popover"
import { Slider } from "sebs7n-ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "sebs7n-ui/tabs"
import brands from "sebs7n-ui/tokens/brands.json"

import { focoSobre, hexOfOklch, oklchOfHex, textoSobre, type Oklch } from "../_lib/color"

/**
 * El selector del color de marca.
 *
 * Trabaja en OKLCH de punta a punta porque así se declara `--brand-base`: lo que se mueve acá
 * es el mismo número que termina en el CSS, sin una conversión de ida y vuelta por HSL que lo
 * corra un decimal. Tres formas de elegir, que son las del selector de color de macOS:
 *
 * - **Paleta**: una grilla para quien quiere un color y no una coordenada.
 * - **Espectro**: croma contra luminosidad para un matiz, más la tira de matices.
 * - **Valores**: los tres números y el hexadecimal, para pegar el color que ya se tiene.
 *
 * Abajo de todo, siempre a la vista, lo que el color no deja ver a ojo: si el texto que va
 * encima llega a 4,5:1 y si el anillo de foco llega a 3:1.
 */
const L_MAX = 0.92
const L_MIN = 0.25
const C_MAX = 0.3

const clamp = (valor: number, min = 0, max = 1) => Math.min(max, Math.max(min, valor))
const redondear = (valor: number, decimales: number) => Number(valor.toFixed(decimales))

const MATICES = [25, 50, 80, 110, 145, 165, 183, 215, 258, 285, 315, 350]
const LUCES = [0.78, 0.68, 0.573, 0.5, 0.42]
const GRILLA: Oklch[] = LUCES.flatMap((l) => MATICES.map((h) => [l, l > 0.7 ? 0.13 : 0.17, h] as const))
const DEL_PAQUETE = Object.entries(brands as Record<string, { light: { base: number[] } }>).map(
  ([nombre, tema]) => ({ nombre, color: tema.light.base as unknown as Oklch })
)

const igual = (a: Oklch, b: Oklch) => Math.abs(a[0] - b[0]) < 0.002 && Math.abs(a[1] - b[1]) < 0.002 && Math.abs(a[2] - b[2]) < 1

type ColorPickerProps = {
  value: Oklch
  onChange: (color: Oklch) => void
  /** El nombre del control: «Color de marca (tema claro)». */
  label: string
  /** La superficie contra la que se mide el anillo de foco: `#ffffff` en claro, `#0a0a0a` en oscuro. */
  superficie: string
}

export function ColorPicker({ value, onChange, label, superficie }: ColorPickerProps) {
  const hex = hexOfOklch(value)
  return (
    <Popover>
      <PopoverTrigger render={<Button aria-label={`${label}: ${hex}`} className="gap-2 pl-1.5" variant="outline" />}>
        <span
          aria-hidden="true"
          className="size-6 rounded-full shadow-[inset_0_1px_0_rgb(255_255_255/0.45),0_0_0_1px_rgb(0_0_0/0.12)]"
          style={{ backgroundColor: hex }}
        />
        <span className="text-label-13-mono uppercase">{hex}</span>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 gap-4">
        <Tabs defaultValue="paleta">
          <TabsList aria-label="Cómo elegir el color" className="w-full [&>[data-slot=tabs-trigger]]:flex-1">
            <TabsTrigger value="paleta">Paleta</TabsTrigger>
            <TabsTrigger value="espectro">Espectro</TabsTrigger>
            <TabsTrigger value="valores">Valores</TabsTrigger>
          </TabsList>
          <TabsContent value="paleta">
            <Paleta onChange={onChange} value={value} />
          </TabsContent>
          <TabsContent value="espectro">
            <Espectro onChange={onChange} value={value} />
          </TabsContent>
          <TabsContent value="valores">
            <Valores onChange={onChange} value={value} />
          </TabsContent>
        </Tabs>
        <Veredicto color={value} superficie={superficie} />
      </PopoverContent>
    </Popover>
  )
}

function Muestra({ color, nombre, activo, onPick }: { color: Oklch; nombre: string; activo: boolean; onPick: () => void }) {
  return (
    <button
      aria-label={nombre}
      aria-pressed={activo}
      className={cn(
        "relative size-5.5 cursor-pointer rounded-[7px] outline-none transition-[scale,box-shadow] duration-150 hover:scale-115 focus-visible:focus-ring active:scale-95",
        "shadow-[inset_0_1px_0_rgb(255_255_255/0.4),0_0_0_0.5px_rgb(0_0_0/0.16)]",
        activo && "shadow-[0_0_0_2px_var(--color-background-100),0_0_0_4px_var(--color-gray-1000)]"
      )}
      onClick={onPick}
      style={{ backgroundColor: hexOfOklch(color) }}
      type="button"
    />
  )
}

function Paleta({ value, onChange }: { value: Oklch; onChange: (color: Oklch) => void }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <span className="text-label-12 text-gray-900">Del paquete</span>
        <div className="flex gap-1.5">
          {DEL_PAQUETE.map(({ nombre, color }) => (
            <Muestra activo={igual(color, value)} color={color} key={nombre} nombre={nombre} onPick={() => onChange(color)} />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-label-12 text-gray-900">Todos los matices</span>
        <div className="grid grid-cols-12 gap-1.5">
          {GRILLA.map((color) => (
            <Muestra
              activo={igual(color, value)}
              color={color}
              key={color.join("-")}
              nombre={`Luminosidad ${color[0]}, matiz ${color[2]}°`}
              onPick={() => onChange(color)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function Espectro({ value, onChange }: { value: Oklch; onChange: (color: Oklch) => void }) {
  const [l, c, h] = value
  const canvas = useRef<HTMLCanvasElement>(null)
  const [arrastrando, setArrastrando] = useState(false)
  const matizId = useId()

  // El campo se pinta pixel por pixel con la misma función que usa el paquete para medir
  // contraste. Un degradé de CSS sería más barato, pero no es el mismo color: el punto bajo el
  // cursor y el color elegido no coincidirían, y un selector que miente no sirve.
  useEffect(() => {
    const lienzo = canvas.current
    const ctx = lienzo?.getContext("2d")
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
    const x = clamp((evento.clientX - caja.left) / caja.width)
    const y = clamp((evento.clientY - caja.top) / caja.height)
    onChange([redondear(L_MAX - y * (L_MAX - L_MIN), 3), redondear(x * C_MAX, 3), h])
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        aria-label="Croma y luminosidad"
        aria-valuetext={`Luminosidad ${l}, croma ${c}`}
        className="relative h-40 cursor-crosshair touch-none overflow-hidden rounded-control outline-none select-none focus-visible:focus-ring"
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
          evento.currentTarget.setPointerCapture(evento.pointerId)
          setArrastrando(true)
          mover(evento)
        }}
        onPointerMove={(evento) => arrastrando && mover(evento)}
        onPointerUp={() => setArrastrando(false)}
        role="slider"
        aria-valuenow={Math.round((c / C_MAX) * 100)}
        tabIndex={0}
      >
        <canvas aria-hidden="true" className="size-full" height={100} ref={canvas} width={160} />
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute size-5 -translate-1/2 rounded-full border-2 border-white shadow-tooltip transition-thumb",
            // El mismo gesto que el Slider del paquete: agarrado, el pulgar es un lente.
            arrastrando && "scale-150 border thumb-lens"
          )}
          style={{
            left: `${clamp(c / C_MAX) * 100}%`,
            top: `${clamp((L_MAX - l) / (L_MAX - L_MIN)) * 100}%`,
            backgroundColor: arrastrando ? undefined : hexOfOklch(value),
          }}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={matizId}>Matiz</Label>
        <div className="relative h-5">
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-1.5 h-2 rounded-full shadow-track"
            style={{ background: "linear-gradient(to right in oklch longer hue, oklch(0.7 0.19 0), oklch(0.7 0.19 360))" }}
          />
          <input
            className="peer absolute inset-0 size-full cursor-pointer opacity-0"
            id={matizId}
            max={360}
            min={0}
            onChange={(evento) => onChange([l, c, Number(evento.target.value)])}
            type="range"
            value={h}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0 h-5 w-7 -translate-x-1/2 rounded-full bg-white shadow-tooltip transition-thumb peer-focus-visible:focus-ring peer-active:scale-x-125 peer-active:scale-y-135 peer-active:thumb-lens"
            style={{ left: `calc(14px + (100% - 28px) * ${h / 360})` }}
          />
        </div>
      </div>
    </div>
  )
}

function Valores({ value, onChange }: { value: Oklch; onChange: (color: Oklch) => void }) {
  const [l, c, h] = value
  const hex = hexOfOklch(value)
  const hexId = useId()
  // Mientras se tipea, el campo muestra lo tipeado: `#0070` todavía no es un color, y pisarlo
  // con el hexadecimal del color actual le borraría al usuario lo que está escribiendo.
  const [texto, setTexto] = useState<string | null>(null)
  return (
    <div className="flex flex-col gap-4">
      <Slider
        format={{ maximumFractionDigits: 2, minimumFractionDigits: 2 }}
        label="Luminosidad"
        locale="es-AR"
        max={L_MAX}
        min={L_MIN}
        onValueChange={(valor) => onChange([redondear(valor as number, 3), c, h])}
        showValue
        size="sm"
        step={0.005}
        value={l}
      />
      <Slider
        format={{ maximumFractionDigits: 3, minimumFractionDigits: 3 }}
        label="Croma"
        locale="es-AR"
        max={C_MAX}
        min={0}
        onValueChange={(valor) => onChange([l, redondear(valor as number, 3), h])}
        showValue
        size="sm"
        step={0.005}
        value={c}
      />
      <Slider
        format={{ maximumFractionDigits: 0 }}
        label="Matiz"
        max={360}
        min={0}
        onValueChange={(valor) => onChange([l, c, valor as number])}
        showValue
        size="sm"
        step={1}
        value={h}
      />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={hexId}>Hexadecimal</Label>
        <Input
          autoCapitalize="off"
          autoComplete="off"
          className="text-copy-13-mono uppercase"
          id={hexId}
          onBlur={() => setTexto(null)}
          onChange={(evento) => {
            setTexto(evento.target.value)
            const color = oklchOfHex(evento.target.value)
            if (color) onChange(color)
          }}
          size="sm"
          spellCheck={false}
          value={texto ?? hex}
        />
      </div>
    </div>
  )
}

function Veredicto({ color, superficie }: { color: Oklch; superficie: string }) {
  const texto = textoSobre(color)
  const foco = focoSobre(color, superficie)
  const numero = (ratio: number) => ratio.toFixed(2).replace(".", ",")
  return (
    <div className="flex flex-col gap-2 border-t border-gray-alpha-400 pt-3">
      <div
        className="flex h-10 items-center justify-center rounded-full text-button-14 shadow-button-accent sheen"
        style={{ backgroundColor: hexOfOklch(color), color: texto.hex }}
      >
        Así queda el botón
      </div>
      <div className="flex flex-wrap gap-1.5">
        <Badge color={texto.aa ? "green" : "red"} size="sm">
          {texto.aa ? <CheckIcon /> : <TriangleAlertIcon />}
          Texto {texto.hex === "#ffffff" ? "blanco" : "negro"} · {numero(texto.ratio)}:1
        </Badge>
        <Badge color={foco.ok ? "green" : "red"} size="sm">
          {foco.ok ? <CheckIcon /> : <TriangleAlertIcon />}
          Foco · {numero(foco.ratio)}:1
        </Badge>
      </div>
      {(!texto.aa || !foco.ok) && (
        <p className="text-copy-13 text-gray-900">
          {!texto.aa
            ? "Con este color ni el blanco ni el negro llegan a 4,5:1 encima. Bajale o subile la luminosidad."
            : "El anillo de foco no llega a 3:1 contra la superficie de este tema."}
        </p>
      )}
    </div>
  )
}
