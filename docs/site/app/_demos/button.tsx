"use client"

import { ArrowRightIcon, PlusIcon, TrashIcon } from "lucide-react"
import { useState } from "react"
import { Button } from "sebs7n-ui/button"
import { buttonVariants } from "sebs7n-ui/variants/button"

/** Variantes */
export function Variantes() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button>Guardar</Button>
      <Button variant="accent">Nueva factura</Button>
      <Button variant="outline">Exportar</Button>
      <Button variant="secondary">Duplicar</Button>
      <Button variant="ghost">Cancelar</Button>
      <Button variant="destructive">Eliminar</Button>
      <Button variant="link">Ver detalle</Button>
    </div>
  )
}

/** Tamaños e íconos */
export function Tamanos() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="sm">Pequeño</Button>
      <Button size="md">Mediano</Button>
      <Button size="lg">Grande</Button>
      <Button size="icon-sm" aria-label="Agregar">
        <PlusIcon />
      </Button>
      <Button size="icon-md" variant="outline" aria-label="Eliminar">
        <TrashIcon />
      </Button>
      <Button>
        Continuar <ArrowRightIcon />
      </Button>
    </div>
  )
}

/**
 * Carga
 * El ancho no cambia y el click queda cancelado mientras dura.
 */
export function Carga() {
  const [guardando, setGuardando] = useState(false)
  return (
    <Button
      loading={guardando}
      onClick={() => {
        setGuardando(true)
        setTimeout(() => setGuardando(false), 1600)
      }}
    >
      Guardar cambios
    </Button>
  )
}

/**
 * Píldora, solo para marketing
 * `shape="pill"` en los CTA de un hero. Nunca en el chrome de una app.
 */
export function Pildora() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button shape="pill" size="lg">
        Empezar gratis
      </Button>
      <Button shape="pill" size="lg" variant="outline">
        Hablar con ventas
      </Button>
    </div>
  )
}

/**
 * Un link con forma de botón
 * `buttonVariants()` sobre un `<a>`: sigue siendo un link para el lector de pantalla.
 */
export function ComoLink() {
  return (
    <a className={buttonVariants({ variant: "accent" })} href="/docs/instalacion">
      Ir a la instalación
    </a>
  )
}
