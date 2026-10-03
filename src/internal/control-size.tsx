"use client"

import * as React from "react"

type ControlSize = "sm" | "md" | "lg"

const ControlSizeContext = React.createContext<ControlSize | undefined>(undefined)

/**
 * Un tamaño para todos los controles de adentro (`FilterBar`): el `size` que el control declara gana;
 * si no declara, el del contexto (los popups, diálogos y hojas lo reinician: lo de adentro no es de la barra); y si no hay contexto, el default del control.
 */
function ControlSizeProvider({ size, children }: { size: ControlSize | undefined; children: React.ReactNode }) {
  return <ControlSizeContext.Provider value={size}>{children}</ControlSizeContext.Provider>
}

function useControlSize<T extends string>(size: T | undefined, fallback: T): T {
  const ctx = React.useContext(ControlSizeContext)
  return size ?? (ctx as T | undefined) ?? fallback
}

/** El tamaño del contexto, sin default: para controles cuyo `size` puede faltar (`Button`). */
const useContextControlSize = () => React.useContext(ControlSizeContext)

export {
  useContextControlSize, ControlSizeProvider, useControlSize, type ControlSize }
