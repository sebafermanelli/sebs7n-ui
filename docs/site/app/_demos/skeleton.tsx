"use client"

import { Card, CardContent, CardHeader } from "sebs7n-ui/card"
import { Skeleton } from "sebs7n-ui/skeleton"

/**
 * Del tamaño de lo que viene
 * Un skeleton que no coincide con el contenido final produce un salto peor que un spinner.
 */
export function Basico() {
  return (
    <Card className="w-full max-w-sm" aria-busy="true">
      <CardHeader>
        <Skeleton className="h-5 w-32 rounded-md" />
        <Skeleton className="h-4 w-48 rounded-md" />
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-2/3 rounded-md" />
      </CardContent>
    </Card>
  )
}
