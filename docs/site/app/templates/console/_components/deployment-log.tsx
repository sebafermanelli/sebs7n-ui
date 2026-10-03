"use client"

import { useEffect, useMemo, useState } from "react"
import { LogViewer, type LogLine } from "sebs7n-ui/log-viewer"

import { BUILD_TAIL, buildTailLine } from "../_data/derive"
import type { Deployment } from "../_data/mock"

// El log de un despliegue. Con `follow` y un build en curso simula la cola: una línea nueva cada 1,5 s,
// con la hora calculada a partir de la última (no la del reloj), hasta agotar las del guion.
export function DeploymentLog({ deployment, follow }: { deployment: Deployment; follow: boolean }) {
  const [extra, setExtra] = useState(0)

  useEffect(() => {
    if (!follow) return
    const timer = setInterval(() => {
      setExtra((previous) => {
        if (previous >= BUILD_TAIL.length) {
          clearInterval(timer)
          return previous
        }
        return previous + 1
      })
    }, 1500)
    return () => clearInterval(timer)
  }, [follow])

  const lines = useMemo<LogLine[]>(
    () => [...deployment.logs, ...Array.from({ length: extra }, (_, index) => buildTailLine(deployment, index))].map((line, index) => ({ ...line, id: index })),
    [deployment, extra]
  )

  // Alto de lo que tiene: un log corto no ocupa el panel entero, y uno largo scrollea adentro.
  return <LogViewer aria-label="Log del despliegue" className="h-auto max-h-96 min-h-24 flex-initial" follow={follow} lines={lines} />
}
