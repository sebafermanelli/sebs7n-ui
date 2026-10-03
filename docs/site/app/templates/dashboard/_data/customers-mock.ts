export interface CustomerRecord {
  /** Estable y apto para la URL: sale del nombre. */
  id: string
  name: string
  email: string
  phone: string
  city: string
  /** Código ISO del país («AR»). Los del ejemplo son todos de Argentina. */
  country?: string
}

/** «Acme Corporation» → `acme-corporation`: el id de un cliente alcanza para armar su URL. */
export function slugify(name: string) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export const CUSTOMERS_MOCK: CustomerRecord[] = [
  { id: "acme-corporation", name: "Acme Corporation", email: "pagos@acme.example", phone: "+54 11 4000-1001", city: "Buenos Aires" },
  { id: "globex-industries", name: "Globex Industries", email: "finanzas@globex.example", phone: "+54 351 400-1002", city: "Córdoba" },
  { id: "hooli-systems", name: "Hooli Systems", email: "ap@hooli.example", phone: "+54 341 400-1003", city: "Rosario" },
  { id: "initech-soluciones", name: "Initech Soluciones", email: "tesoreria@initech.example", phone: "+54 11 4000-1004", city: "Buenos Aires" },
  { id: "massive-dynamic", name: "Massive Dynamic", email: "cuentas@massive.example", phone: "+54 261 400-1005", city: "Mendoza" },
  { id: "soylent-logistics", name: "Soylent Logistics", email: "admin@soylent.example", phone: "+54 11 4000-1006", city: "Buenos Aires" },
  { id: "umbrella-health", name: "Umbrella Health", email: "compras@umbrella.example", phone: "+54 223 400-1007", city: "Mar del Plata" },
  { id: "wayne-enterprises", name: "Wayne Enterprises", email: "billing@wayne.example", phone: "+54 11 4000-1008", city: "Buenos Aires" },
]
