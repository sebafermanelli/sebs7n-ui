import { ListIndex } from "sebs7n-ui/list-index"
import { List, ListRow, ListSection } from "sebs7n-ui/list-row"

const CUSTOMERS = [
  "Acme S.A.",
  "Almacén Norte",
  "Alfa Distribución",
  "Bodega del Sur",
  "Cooperativa Centro",
  "Constructora Río",
  "Distribuidora Este",
  "Estudio Ruiz",
  "Ferretería Oeste",
  "Grupo Litoral",
  "Imprenta Delta",
  "Logística Andina",
  "Mercado Nube",
  "Metalúrgica Paraná",
  "Nube Digital",
  "Óptica Central",
  "Panadería Sol",
  "Química Pampa",
  "Servicios Unidos",
  "Textil Norte",
  "Viajes Delta",
]

// La inicial sin tilde: «Óptica» va con la O.
const initialOf = (name: string) => name.normalize("NFD").charAt(0).toUpperCase()
const SECTIONS = Object.entries(Object.groupBy(CUSTOMERS, initialOf)) as [string, string[]][]

/**
 * Clientes de la A a la Z
 * Una lista agrupada por inicial con la tira de letras al costado: cada letra es un link a su sección y las que no tienen clientes se ven apagadas. En un teléfono, apoyá el dedo en la tira y deslizalo.
 */
export function Clientes() {
  return (
    <div className="relative h-[660px] w-full max-w-md overflow-hidden rounded-surface border border-separator">
      <div className="h-full overflow-y-auto scroll-smooth pe-8 motion-reduce:scroll-auto">
        <List aria-label="Clientes">
          {SECTIONS.map(([letter, names]) => (
            <ListSection className="scroll-mt-2" id={`customer-${letter}`} key={letter} title={letter}>
              {names.map((name) => (
                <ListRow key={name} title={name} />
              ))}
            </ListSection>
          ))}
        </List>
      </div>
      <ListIndex
        available={SECTIONS.map(([letter]) => letter)}
        className="absolute inset-y-2 end-1"
        getHref={(letter) => `#customer-${letter}`}
      />
    </div>
  )
}
