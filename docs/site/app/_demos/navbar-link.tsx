import { BellIcon } from "lucide-react"
import { Button } from "sebs7n-ui/button"
import { NavbarLink } from "sebs7n-ui/navbar-link"
import { navbarLinkClassName } from "sebs7n-ui/variants/navbar-link"

/**
 * En la barra
 * Secundarios en reposo, más fuertes con el puntero y en la página actual. El CTA va aparte, con el acento.
 */
export function EnLaBarra() {
  return (
    <nav aria-label="Demo de links de la barra" className="flex items-center gap-1 rounded-surface bg-surface-header px-4 py-2">
      <NavbarLink active href="#facturas">
        Facturas
      </NavbarLink>
      <NavbarLink href="#clientes">Clientes</NavbarLink>
      <NavbarLink href="#ayuda">Ayuda</NavbarLink>
      <button aria-label="Avisos" className={navbarLinkClassName({ icon: true })} type="button">
        <BellIcon />
      </button>
      <Button className="ml-2" size="sm">
        Ingresar
      </Button>
    </nav>
  )
}
