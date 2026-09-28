import "@testing-library/jest-dom/vitest"
import { cleanup } from "@testing-library/react"
import { afterEach } from "vitest"

import { desmontarHidratadas } from "./hidratar"

afterEach(async () => {
  // Primero las raíces de `hydrateRoot`, que `cleanup` no ve: ver `hidratar.ts`.
  await desmontarHidratadas()
  cleanup()
})
