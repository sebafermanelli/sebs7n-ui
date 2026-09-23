"use client"

import { Toolbar as ToolbarPrimitive } from "@base-ui/react/toolbar"

import { cn, type WithClassName } from "../lib/utils.js"
import { inputControlClassName, inputDisabledClassName } from "../variants/input.js"
import { Button } from "./button.js"

/**
 * Una barra de acciones agrupadas con **roving tabindex**.
 *
 * Todo el grupo es **una sola parada de tabulación**: entrás con Tab, te movés
 * adentro con las flechas y salís con Tab. Veinte botones sueltos son veinte
 * paradas de Tab entre el contenido de arriba y el de abajo; quien navega con
 * teclado o con un switch los tiene que atravesar **todos** cada vez que quiere
 * llegar al documento. Esa es toda la razón del componente: la barra ya se veía
 * bien con un `<div className="flex gap-1">`.
 *
 * A cambio, adentro no van controles sueltos: cada hijo interactivo tiene que
 * ser un `ToolbarButton`, `ToolbarLink` o `ToolbarInput` para entrar en el
 * recorrido. Un `<button>` puesto a mano queda fuera y se vuelve inalcanzable,
 * porque la barra le sacó el Tab al resto.
 *
 * `orientation="vertical"` cambia las flechas a ↑ ↓ y da vuelta los separadores.
 */
type ToolbarProps = WithClassName<ToolbarPrimitive.Root.Props>

/**
 * Los hijos que el primitivo metió en el recorrido.
 *
 * Son los únicos con `tabindex`: el roving tabindex se lo pone a cada ítem (0 al
 * activo, -1 al resto) y a nada más. Un `ToolbarSeparator` no lo tiene, así que
 * el filtro sale gratis y no depende de adivinar qué componente rindió cada uno.
 */
function rovingItems(root: HTMLElement) {
  return Array.from(root.querySelectorAll<HTMLElement>("[tabindex]"))
}

function Toolbar({ className, onKeyDown, ...props }: ToolbarProps) {
  return (
    <ToolbarPrimitive.Root
      data-slot="toolbar"
      // Home y End no las trae Base UI: su composite las tiene detrás de un
      // `enableHomeAndEndKeys` que `Menubar` prende y `Toolbar` no. El patrón
      // toolbar de la WAI las pide, y en una barra larga son la diferencia entre
      // una tecla y quince flechas. Mover el foco a mano alcanza: el ítem, al
      // recibirlo, le avisa al composite cuál quedó activo.
      onKeyDown={(event) => {
        onKeyDown?.(event)
        if (event.defaultPrevented) return
        if (event.key !== "Home" && event.key !== "End") return
        // Dentro de un campo de texto, Home y End son principio y fin de línea.
        if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return
        const items = rovingItems(event.currentTarget)
        const target = event.key === "Home" ? items.at(0) : items.at(-1)
        if (!target) return
        event.preventDefault()
        target.focus()
      }}
      className={cn(
        "flex items-center gap-1 rounded-lg bg-background-100 p-1 text-gray-1000",
        "data-[orientation=vertical]:w-fit data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch",
        className
      )}
      {...props}
    />
  )
}

/**
 * Un control de la barra. No trae estilos propios: los pone el `render`.
 *
 * Por defecto rinde el `Button` del sistema en `ghost`, que es el cuerpo de un
 * ícono de barra. Para otra cosa, se pasa el componente entero y `ToolbarButton`
 * solo le suma el comportamiento (roving tabindex, `disabled` heredado del
 * grupo):
 *
 * ```tsx
 * <ToolbarButton render={<Toggle />} aria-label="Negrita" />
 * <ToolbarButton render={<Button variant="outline" size="sm" />}>Publicar</ToolbarButton>
 * <ToolbarButton render={<DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />} />} />
 * ```
 *
 * Nunca hay dos juegos de clases peleando: el `className` que llega acá se
 * fusiona con el del `render` por `cn()`, una sola vez.
 *
 * `focusableWhenDisabled` viene en `true` de Base UI y se deja así: un control
 * deshabilitado que desaparece del recorrido con flechas mueve la barra abajo
 * de los dedos, y encima nunca se puede leer por qué está apagado.
 */
type ToolbarButtonProps = WithClassName<ToolbarPrimitive.Button.Props>

// El `aria-label` se saca de las props y se vuelve a poner a mano en el `render` por defecto en vez
// de viajar con el resto: ese render es un botón de ícono, y el `aria-label` que trae el elemento de
// `render` le gana al que pone Base UI desde afuera. Si no se copiara acá, un
// `<ToolbarButton aria-label="Centrar">` terminaría anunciándose por su ícono. El `?? ""` es el caso
// "el llamador no puso nombre": un `aria-label` vacío la spec de accname lo ignora, así que el botón
// queda nombrado por su contenido, igual que un botón cualquiera.
function ToolbarButton({ className, render, "aria-label": ariaLabel, ...props }: ToolbarButtonProps) {
  return (
    <ToolbarPrimitive.Button
      data-slot="toolbar-button"
      className={className}
      aria-label={ariaLabel}
      render={render ?? <Button size="icon-sm" variant="ghost" aria-label={ariaLabel ?? ""} />}
      {...props}
    />
  )
}

/**
 * Agrupa controles que se leen como una unidad (alineación, formato de número).
 *
 * `aria-label` no es opcional: el lector anuncia «grupo» y nada más si falta.
 * Visualmente pega los ítems, sin el `gap` de la barra, para que se vean como
 * un segmento y no como tres botones que cayeron cerca.
 */
type ToolbarGroupProps = Omit<ToolbarPrimitive.Group.Props, "className" | "aria-label"> & { className?: string } & (
    | { "aria-label": string }
    | { "aria-labelledby": string }
  )

function ToolbarGroup({ className, ...props }: ToolbarGroupProps) {
  return (
    <ToolbarPrimitive.Group
      data-slot="toolbar-group"
      className={cn("flex items-center gap-0.5 data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch", className)}
      {...props}
    />
  )
}

/**
 * El separador entre grupos.
 *
 * Base UI le da la orientación contraria a la de la barra —una barra horizontal
 * lleva separadores verticales— así que las dos alturas van escritas y la que
 * manda la elige el `data-orientation` que pone el primitivo.
 */
type ToolbarSeparatorProps = WithClassName<ToolbarPrimitive.Separator.Props>

function ToolbarSeparator({ className, ...props }: ToolbarSeparatorProps) {
  return (
    <ToolbarPrimitive.Separator
      data-slot="toolbar-separator"
      className={cn(
        "mx-1 shrink-0 bg-gray-400",
        "data-[orientation=vertical]:h-5 data-[orientation=vertical]:w-px",
        "data-[orientation=horizontal]:my-1 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full",
        className
      )}
      {...props}
    />
  )
}

/**
 * Un link dentro de la barra: el «Editado hace 5 min» que lleva al historial.
 *
 * Renderiza un `<a>` de verdad, con el cuerpo de un link de texto y no el de un
 * botón: en una barra de acciones, lo único que navega tiene que verse distinto
 * de lo que ejecuta. Para el `Link` del framework, `render={<NextLink … />}`.
 */
type ToolbarLinkProps = WithClassName<ToolbarPrimitive.Link.Props>

function ToolbarLink({ className, ...props }: ToolbarLinkProps) {
  return (
    <ToolbarPrimitive.Link
      data-slot="toolbar-link"
      className={cn(
        "inline-flex h-8 items-center rounded-md px-2 text-copy-14 text-gray-900 no-underline outline-none",
        "transition-control hover:text-gray-1000 focus-visible:focus-ring",
        className
      )}
      {...props}
    />
  )
}

/**
 * Un `<input>` que entra en el recorrido con flechas.
 *
 * Es el campo chico de una barra —el ancho de línea, el nivel de zoom—, no un
 * campo de formulario: para eso está `Field` + `Input`, que traen label, error
 * y descripción. Base UI deja que las flechas ← → muevan el cursor adentro del
 * texto en vez de saltar al control de al lado, así que escribir funciona como
 * en cualquier input.
 */
type ToolbarInputProps = WithClassName<ToolbarPrimitive.Input.Props>

function ToolbarInput({ className, ...props }: ToolbarInputProps) {
  return (
    <ToolbarPrimitive.Input
      data-slot="toolbar-input"
      className={cn(
        inputControlClassName,
        inputDisabledClassName,
        // Mismo cuerpo que `Input size="sm"`, sin el `w-full`: en una barra el
        // ancho lo pone quien lo usa (`className="w-20"`), no el componente.
        "h-8 min-w-0 px-2 placeholder:text-gray-900 focus:focus-border",
        className
      )}
      {...props}
    />
  )
}

export {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarInput,
  ToolbarLink,
  ToolbarSeparator,
  type ToolbarButtonProps,
  type ToolbarGroupProps,
  type ToolbarInputProps,
  type ToolbarLinkProps,
  type ToolbarProps,
  type ToolbarSeparatorProps,
}
