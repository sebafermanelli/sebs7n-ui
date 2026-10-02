export const DASHBOARD_PATH = "/templates/dashboard"
export const INVOICES_PATH = `${DASHBOARD_PATH}/invoices`
export const CUSTOMERS_PATH = `${DASHBOARD_PATH}/customers`
export const SETTINGS_PATH = `${DASHBOARD_PATH}/settings`

/**
 * La galería de la que sale el template. En el sitio es `/templates`; el bloque del registry lo
 * pone en `null` y la app copiada no muestra la vuelta.
 */
export const GALLERY_PATH: string | null = "/templates"
