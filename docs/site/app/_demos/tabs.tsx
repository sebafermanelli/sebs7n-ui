"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "sebs7n-ui/tabs"

/**
 * Secciones de la misma página
 * La lista entera es una sola parada de tabulación; adentro se recorre con ← →.
 */
export function Basico() {
  return (
    <Tabs className="w-full max-w-lg" defaultValue="resumen">
      <TabsList>
        <TabsTrigger value="resumen">Resumen</TabsTrigger>
        <TabsTrigger value="items">Ítems</TabsTrigger>
        <TabsTrigger value="historial">Historial</TabsTrigger>
        <TabsTrigger disabled value="afip">
          AFIP
        </TabsTrigger>
      </TabsList>
      <TabsContent value="resumen">Factura 0012 · Acme S.A. · $ 128.400 · vence el 30/09.</TabsContent>
      <TabsContent value="items">3 ítems: consultoría, hosting y soporte.</TabsContent>
      <TabsContent value="historial">Emitida el 01/09. Enviada por email el 01/09. Vista el 03/09.</TabsContent>
      <TabsContent value="afip">Sin datos.</TabsContent>
    </Tabs>
  )
}
