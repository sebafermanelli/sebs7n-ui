"use client"

import { ArrowRightIcon, EllipsisIcon, PlusIcon, ShareIcon, TrashIcon, XIcon } from "lucide-react"
import { useState } from "react"
import { Button } from "sebs7n-ui/button"
import { buttonVariants } from "sebs7n-ui/variants/button"

/**
 * Variantes
 * Las de iCloud: el acento sólido para la acción principal (una por pantalla), el gris para las
 * demás, el texto de acento para lo secundario y el rojo para lo que borra. No hay botón con borde.
 */
export function Variantes() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button>Nueva factura</Button>
      <Button variant="secondary">Duplicar</Button>
      <Button variant="plain">Editar</Button>
      <Button variant="ghost">Cancelar</Button>
      <Button variant="destructive">Eliminar</Button>
      <Button variant="destructive-plain">Quitar</Button>
      <Button variant="link">Ver detalle</Button>
    </div>
  )
}

/**
 * Tamaños
 * 28, 36 y 40: los mismos altos que los campos, texto de 14 en los tres.
 */
export function Tamanos() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="sm">Pequeño</Button>
      <Button size="md">Mediano</Button>
      <Button size="lg">Grande</Button>
      <Button variant="secondary">
        Continuar <ArrowRightIcon />
      </Button>
    </div>
  )
}

/**
 * Botones de ícono
 * El de la toolbar de iCloud: 28 × 28, sin fondo en reposo, gris claro con el puntero y el glifo en
 * el acento (`plain`). `ghost` para el glifo neutro (cerrar, la barra global). Apagados a .4.
 */
export function Iconos() {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Button aria-label="Nueva" size="icon-sm" variant="plain">
        <PlusIcon />
      </Button>
      <Button aria-label="Compartir" size="icon-sm" variant="plain">
        <ShareIcon />
      </Button>
      <Button aria-label="Más acciones" size="icon-sm" variant="plain">
        <EllipsisIcon />
      </Button>
      <Button aria-label="Eliminar" disabled size="icon-sm" variant="plain">
        <TrashIcon />
      </Button>
      <Button aria-label="Cerrar" size="icon-sm" variant="ghost">
        <XIcon />
      </Button>
      <Button aria-label="Nueva" size="icon-md" variant="ghost">
        <PlusIcon />
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
      <Button shape="pill" size="lg" variant="secondary">
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
    <a className={buttonVariants()} href="/docs/instalacion">
      Ir a la instalación
    </a>
  )
}
