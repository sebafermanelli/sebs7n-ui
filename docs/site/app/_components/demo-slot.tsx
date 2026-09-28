"use client"

import { Suspense, useEffect, useRef, useState } from "react"

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
//
// Además la demo se monta recién cuando su marco entra en pantalla (con 400px de margen, así ya
// está cuando llega). Montadas en el render, Next las prerenderizaba y metía sus chunks en el HTML:
// la página de un componente con cinco ejemplos pedía los cinco al abrir. El código de cada
// ejemplo sigue visible sin la demo, y el marco (`min-h-32` en `Example`) reserva el alto.
export function DemoSlot({ id }: { id: string }) {
  const Demo = DEMOS[id]
  const marco = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const nodo = marco.current
    if (!nodo) return
    const observer = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((entrada) => entrada.isIntersecting)) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: "400px" }
    )
    observer.observe(nodo)
    return () => observer.disconnect()
  }, [])

  if (!Demo) return <p className="text-copy-14 text-red-900">Falta la demo {id}.</p>
  return (
    // Mismo centrado que el marco de `Example`, para que la demo quede donde quedaba.
    <div className="flex w-full items-center justify-center" ref={marco}>
      {visible && (
        // Cada entrada del registry es un `next/dynamic`, o sea un `React.lazy`: sin este
        // Suspense el render se corta.
        <Suspense fallback={<span aria-hidden="true" className="block h-8" />}>
          <Demo />
        </Suspense>
      )}
    </div>
  )
}
