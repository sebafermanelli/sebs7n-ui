import { act } from "@testing-library/react"
import type { ReactNode } from "react"
import { hydrateRoot, type HydrationOptions, type Root } from "react-dom/client"

// Las raíces de `hydrateRoot` no las conoce Testing Library, y su `cleanup` no las desmonta. Una
// que queda montada sigue trabajando después del test: el AppShell y el Sidebar piden el Sheet y
// el Tooltip después de hidratar y abren con un `requestAnimationFrame`, y React agenda el flush
// de sus efectos con el scheduler. Si eso corre cuando Vitest ya desarmó jsdom, React lee
// `window.event` y tira «window is not defined»: el error sin dueño que cortó el CI en Node 22
// (en Node 24 el orden de los timers lo escondía). Todo test que hidrata pasa por acá, y
// `setup.ts` las desmonta adentro de un `act` al final de cada test, que vacía lo pendiente.
const raices = new Set<Root>()

export async function hidratar(container: Element, ui: ReactNode, options?: HydrationOptions): Promise<Root> {
  let raiz: Root | undefined
  await act(async () => {
    raiz = hydrateRoot(container, ui, options)
  })
  raices.add(raiz!)
  return raiz!
}

export async function desmontarHidratadas() {
  for (const raiz of raices) {
    await act(async () => raiz.unmount())
  }
  raices.clear()
}
