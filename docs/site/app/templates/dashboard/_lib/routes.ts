export const DASHBOARD_PATH = "/templates/dashboard"
export const INVOICES_PATH = `${DASHBOARD_PATH}/invoices`
export const CUSTOMERS_PATH = `${DASHBOARD_PATH}/customers`
export const customerPath = (id: string) => `${CUSTOMERS_PATH}/${id}`
export const SETTINGS_PATH = `${DASHBOARD_PATH}/settings`
export const LOGIN_PATH = `${DASHBOARD_PATH}/login`

/**
 * La galería de la que sale el template. En el sitio es `/templates`; el bloque del registry lo
 * pone en `null` y la app copiada no muestra la vuelta.
 */
export const GALLERY_PATH: string | null = "/templates"
