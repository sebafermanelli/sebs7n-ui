import { TextDiff } from "sebs7n-ui/text-diff"

/**
 * Qué cambió entre dos versiones
 * Lo quitado tachado y lo agregado subrayado, palabra por palabra; un lector de pantalla oye «Eliminado:» y «Agregado:».
 */
export function Basic() {
  return (
    <p className="max-w-lg text-body text-label">
      <TextDiff
        from="El cliente paga el total a 30 días en dos cuotas sin interés."
        to="El cliente abona el total a 60 días en tres cuotas sin interés."
      />
    </p>
  )
}
