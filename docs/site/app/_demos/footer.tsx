import { Footer, FooterBottom, FooterContent, FooterGroup } from "sebs7n-ui/footer"

const GROUPS = [
  { title: "Producto", links: ["Facturas", "Presupuestos", "Cobros", "Precios"] },
  { title: "Clientes", links: ["Estudios contables", "Comercios", "Profesionales"] },
  { title: "Ayuda", links: ["Centro de ayuda", "Estado del servicio", "Contacto"] },
]

/**
 * El pie de un sitio
 * La contraparte del `Navbar` abajo: opaco como la barra global y translúcido sobre el wallpaper. `FooterGroup` arma cada columna; `FooterBottom`, la fila de abajo.
 */
export function Site() {
  return (
    <div className="w-full overflow-hidden rounded-surface border border-separator">
      <Footer>
        <FooterContent maxWidth={960}>
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3">
            {GROUPS.map((group) => (
              <FooterGroup key={group.title} title={group.title}>
                {group.links.map((link) => (
                  <a href="#ejemplos" key={link}>
                    {link}
                  </a>
                ))}
              </FooterGroup>
            ))}
          </div>
          <FooterBottom>
            <span>© 2026 Acme Facturación S.A.</span>
            <span>Rosario, Argentina</span>
          </FooterBottom>
        </FooterContent>
      </Footer>
    </div>
  )
}

/**
 * Sobre el wallpaper
 * Con `data-ambient` (lo pone `AppShell ambient`) el pie es `material-translucent`, como las barras: el wallpaper se ve a través y el texto sigue a 4,5:1.
 */
export function OnWallpaper() {
  return (
    <div className="bg-ambient flex h-64 w-full flex-col justify-end overflow-hidden rounded-surface border border-separator" data-ambient="">
      <Footer>
        <FooterContent className="py-6">
          <FooterBottom className="border-t-0 pt-0">
            <span>© 2026 Acme Facturación S.A.</span>
            <a className="text-label-secondary hover:text-label hover:underline" href="#ejemplos">
              Términos
            </a>
          </FooterBottom>
        </FooterContent>
      </Footer>
    </div>
  )
}
