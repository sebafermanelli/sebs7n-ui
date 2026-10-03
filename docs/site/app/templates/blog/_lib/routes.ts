export const BLOG_PATH = "/templates/blog"
export const postPath = (slug: string) => `${BLOG_PATH}/${slug}`

/**
 * La galería de la que sale el template. En el sitio es `/templates`; el bloque del registry lo
 * pone en `null` y la app copiada no muestra la vuelta.
 */
export const GALLERY_PATH: string | null = "/templates"
