"use client"

import { Suspense } from "react"

import { DEMOS } from "../_demos/registry"

// El corte de código tiene que caer del lado del cliente, y por eso esto existe.
//
// `/docs/components/[slug]` es UNA ruta para los 58 componentes, así que el
// manifiesto de cliente que Next arma para ella es el mismo en las 58 páginas: todo
// componente de cliente alcanzable desde el Server Component termina en la lista de
// `<script>` de cada una. Con las 59 demos importadas derecho desde `Example` eso
// daba un chunk de 454 KB raw / 137 KB gz en cada página, para mostrar dos o tres.
//
// Poner acá el `"use client"` mueve la frontera: lo que entra al manifiesto es este
// archivo, y los `import()` del registry quedan del otro lado, como chunks async que
// el navegador pide solo si la página los usa. El `id` viaja como string, que es
// serializable, así que `Example` sigue siendo un Server Component.
export function DemoSlot({ id }: { id: string }) {
  const Demo = DEMOS[id]
  if (!Demo) return <p className="text-copy-14 text-red-900">Falta la demo {id}.</p>
  // Cada entrada del registry es un `next/dynamic`, o sea un `React.lazy`: sin este
  // Suspense el render se corta. En el prerenderizado la promesa ya está resuelta
  // cuando Next cierra el stream, así que el fallback no llega al HTML final.
  return (
    <Suspense fallback={<span aria-hidden="true" className="block h-8" />}>
      <Demo />
    </Suspense>
  )
}
