import * as React from "react"

// Un `react-easy-crop` de mentira pero fiel en lo que el paquete usa de él: al montar informa el tamaño
// de la imagen con zoom 1 (`setMediaSize`, `onMediaLoaded`) y el del marco (`setCropSize`), deja pasar
// `cropperProps` al marco (el nombre, la descripción y el `onKeyDown` del paquete) y respeta `minZoom`.
// La geometría real (arrastre, rueda, pellizco) se prueba en un navegador; ver `crop-geometry.test.ts`.
export const stub = {
  media: { width: 400, height: 225, naturalWidth: 1600, naturalHeight: 900 },
  frame: { width: 225, height: 225 },
}

type Props = {
  image?: string
  zoom: number
  minZoom: number
  maxZoom: number
  cropShape: string
  aspect: number
  setMediaSize?: (size: typeof stub.media) => void
  setCropSize?: (size: typeof stub.frame) => void
  onMediaLoaded?: (size: typeof stub.media) => void
  cropperProps?: React.HTMLAttributes<HTMLDivElement>
  crop: { x: number; y: number }
}

export default function CropperStub(props: Props) {
  React.useEffect(() => {
    props.setMediaSize?.(stub.media)
    props.setCropSize?.(stub.frame)
    props.onMediaLoaded?.(stub.media)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo al montar, como la librería
  }, [])
  return (
    <div data-testid="container">
      <div
        data-testid="cropper"
        data-shape={props.cropShape}
        data-zoom={props.zoom}
        data-minzoom={props.minZoom}
        data-crop={`${props.crop.x},${props.crop.y}`}
        data-aspect={props.aspect}
        tabIndex={0}
        {...props.cropperProps}
      />
    </div>
  )
}
