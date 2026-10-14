// @vitest-environment jsdom
//
// axe-core sobre `ImageCropDialog` ABIERTO en sus tres estados (cargando, listo y con una imagen ilegible), en claro y en oscuro. El test de las
// demos (`a11y-demos.test.tsx`) solo ve el botón que abre el diálogo; el recorte en sí vive en un portal que se monta al elegir un archivo.
// jsdom no carga imágenes ni mide: la imagen y la librería de recorte se reemplazan por lo mínimo que el componente usa (el arrastre, la rueda
// y el pellizco se probaron en un navegador real). Las reglas de contraste y de página entera no corren en jsdom, igual que en el otro test.
import { cleanup, render, screen, waitFor } from "@testing-library/react"
import axe from "axe-core"
import { createElement } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"

vi.mock("react-easy-crop", async () => {
  const React = await import("react")
  return {
    default: (props: { setMediaSize?: (s: unknown) => void; setCropSize?: (s: unknown) => void; cropperProps?: Record<string, unknown> }) => {
      React.useEffect(() => {
        props.setMediaSize?.({ width: 400, height: 225, naturalWidth: 1600, naturalHeight: 900 })
        props.setCropSize?.({ width: 225, height: 225 })
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [])
      return React.createElement("div", { "data-testid": "container" }, React.createElement("div", { tabIndex: 0, ...props.cropperProps }))
    },
  }
})

import { ImageCropDialog } from "sebs7n-ui/image-crop-dialog"

window.matchMedia ??= ((query: string) => ({ matches: false, media: query, onchange: null, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false })) as typeof window.matchMedia
Element.prototype.getAnimations ??= () => []
HTMLCanvasElement.prototype.getContext = (() => null) as typeof HTMLCanvasElement.prototype.getContext
URL.createObjectURL = () => "blob:x"
URL.revokeObjectURL = () => {}

const DESACTIVADAS = ["color-contrast", "region", "landmark-one-main", "page-has-heading-one", "scrollable-region-focusable"]
const archivo = () => new File([new Uint8Array(8)], "foto.png", { type: "image/png" })

// `Image` de mentira: `onload` o `onerror` según el estado que se quiere ver; `"never"` deja la carga pendiente.
function imagen(modo: "ok" | "error" | "never") {
  vi.stubGlobal(
    "Image",
    class {
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      set src(_: string) {
        if (modo === "never") return
        queueMicrotask(() => (modo === "ok" ? this.onload?.() : this.onerror?.()))
      }
    },
  )
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

for (const tema of ["light", "dark"] as const) {
  describe(`axe, ImageCropDialog abierto (${tema})`, () => {
    const revisar = async () => {
      document.documentElement.classList.toggle("dark", tema === "dark")
      const resultado = await axe.run(document.body, { rules: Object.fromEntries(DESACTIVADAS.map((r) => [r, { enabled: false }])) })
      return resultado.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.length} × ${v.nodes[0]?.html.slice(0, 140)}`)
    }

    it("listo, con la ayuda para arrastrar", async () => {
      imagen("ok")
      render(createElement(ImageCropDialog, { file: archivo(), onCancel() {}, onSave() {} }))
      await screen.findByRole("group", { name: "Área de recorte" }, { timeout: 2000 })
      await waitFor(() => expect(document.querySelector("[data-slot=image-crop-hint]")?.classList.contains("invisible")).toBe(false))
      expect(await revisar()).toEqual([])
    })

    it("cargando", async () => {
      imagen("never")
      render(createElement(ImageCropDialog, { file: archivo(), onCancel() {}, onSave() {} }))
      await screen.findByRole("status", { name: "Cargando la imagen…" })
      expect(await revisar()).toEqual([])
    })

    it("con una imagen ilegible", async () => {
      imagen("error")
      render(createElement(ImageCropDialog, { file: archivo(), onCancel() {}, onSave() {} }))
      await screen.findByRole("alert")
      expect((screen.getByRole("button", { name: "Guardar" }) as HTMLButtonElement).disabled).toBe(true)
      expect(await revisar()).toEqual([])
    })
  })
}
