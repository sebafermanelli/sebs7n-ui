export const CONSOLE_PATH = "/templates/console"
export const DEPLOYMENTS_PATH = `${CONSOLE_PATH}/deployments`
export const COSTS_PATH = `${CONSOLE_PATH}/costs`
export const LOGS_PATH = `${CONSOLE_PATH}/logs`
export const servicePath = (id: string) => `${CONSOLE_PATH}/services/${id}`
export const VARIABLES_PATH = `${CONSOLE_PATH}/variables`

/** La galería de la que sale el template; en una app copiada va en `null`. */
export const GALLERY_PATH: string | null = "/templates"
export const RESOURCES_PATH = `${CONSOLE_PATH}/resources`
export const ALERTS_PATH = `${CONSOLE_PATH}/alerts`
