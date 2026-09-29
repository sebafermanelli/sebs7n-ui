import { TextLink } from "sebs7n-ui/text-link"

/**
 * Adentro y afuera
 * `chevron` lleva a otra pantalla de la app; `external` sale del sitio y abre otra pestaña.
 */
export function Adornos() {
  return (
    <div className="flex flex-col items-start gap-3 text-body">
      <TextLink href="/docs/instalacion" trailing="chevron">
        Ver la instalación
      </TextLink>
      <TextLink href="https://github.com/sebafermanelli/sebs7n-ui" trailing="external">
        github.com
      </TextLink>
      <TextLink href="/docs/theming">Theming</TextLink>
    </div>
  )
}

/**
 * Debajo de una sección
 * Como en los ajustes de iCloud: título, una línea que explica y el link que lleva a hacerlo.
 */
export function EnUnaSeccion() {
  return (
    <div className="flex max-w-sm flex-col gap-1">
      <h3 className="text-title-3 text-label">Facturación</h3>
      <p className="text-body text-label-secondary">Cambiá el plan, el medio de pago o descargá las facturas del año.</p>
      <TextLink className="text-body" href="#" trailing="chevron">
        Administrar la facturación
      </TextLink>
    </div>
  )
}
