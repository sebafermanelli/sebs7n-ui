"use client"

import { useEffect, useState } from "react"
import { Button } from "sebs7n-ui/button"
import { Progress } from "sebs7n-ui/progress"

/**
 * Una subida real
 * El `label` es el nombre accesible: no hace falta `aria-label`. `showValue` deja el porcentaje a la vista.
 */
export function Subida() {
  // Arranca a mitad de camino: una barra vacía como primer cuadro de la página no muestra nada.
  const [valor, setValor] = useState(41)
  const [corriendo, setCorriendo] = useState(false)

  useEffect(() => {
    if (!corriendo) return
    const id = setInterval(() => {
      setValor((actual) => {
        const siguiente = Math.min(100, actual + 7)
        if (siguiente === 100) setCorriendo(false)
        return siguiente
      })
    }, 300)
    return () => clearInterval(id)
  }, [corriendo])

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <Progress label="contratos-2026.zip" showValue value={valor} />
      <div className="flex gap-2">
        <Button
          onClick={() => {
            setValor(0)
            setCorriendo(true)
          }}
          size="sm"
          variant="outline"
        >
          Subir de nuevo
        </Button>
        <Button disabled={!corriendo} onClick={() => setCorriendo(false)} size="sm" variant="ghost">
          Pausar
        </Button>
      </div>
    </div>
  )
}

/**
 * Determinada e indeterminada
 * Con `value={null}` no hay porcentaje: Base UI saca `aria-valuenow` y la barra pasa a ser una franja que recorre la pista. Es para cuando no se puede saber cuánto falta.
 */
export function Indeterminada() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <Progress label="Importando clientes" showValue value={68} />
      <Progress label="Consultando a AFIP" value={null} />
    </div>
  )
}

/**
 * Tamaños y uso en una fila
 * `sm` (4px) dentro de una fila o una card chica; `md` (6px) suelto. Sin etiqueta visible va `aria-label`.
 */
export function Tamanos() {
  const cuotas = [
    { plan: "Plan Pro", pagadas: 9 },
    { plan: "Plan Equipo", pagadas: 4 },
  ]
  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      {cuotas.map((cuota) => (
        <div className="flex flex-col gap-1.5" key={cuota.plan}>
          <div className="flex items-baseline justify-between">
            <span className="text-label-14 text-gray-1000">{cuota.plan}</span>
            <span className="text-copy-13 text-gray-900">{cuota.pagadas} de 12 cuotas</span>
          </div>
          <Progress
            aria-label={`Cuotas pagadas de ${cuota.plan}`}
            max={12}
            size="sm"
            value={cuota.pagadas}
          />
        </div>
      ))}
      <Progress aria-label="Espacio usado" size="md" value={100} />
    </div>
  )
}
