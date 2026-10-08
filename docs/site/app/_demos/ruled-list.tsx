import { DefinitionItem, DefinitionList, RuledList, RuledListItem } from "sebs7n-ui/ruled-list"

/**
 * Funciones con numeración editorial
 * Un filete de 1 px entre filas y el número a la izquierda: una alternativa a una grilla de cards con ícono.
 */
export function Numbered() {
  return (
    <RuledList className="w-full max-w-2xl" marker="number">
      <RuledListItem title="Cargá la factura">Desde un PDF o a mano, con los datos del cliente.</RuledListItem>
      <RuledListItem title="Revisala con tu equipo">Cada cambio queda en el historial.</RuledListItem>
      <RuledListItem title="Emitila y envíala">Tu cliente la recibe al instante.</RuledListItem>
    </RuledList>
  )
}

/**
 * Secciones con §
 * Para un modelo de seguridad o unas condiciones: la numeración sale de un contador, no del texto.
 */
export function Sections() {
  return (
    <RuledList className="w-full max-w-2xl" marker="section">
      <RuledListItem title="Datos del equipo">Cada equipo ve solo lo suyo.</RuledListItem>
      <RuledListItem title="Copias de seguridad">Diarias, con retención de 30 días.</RuledListItem>
    </RuledList>
  )
}

/**
 * Lista de definiciones
 * Término a la izquierda y detalle a la derecha, con filetes: los datos de un plan, de una factura.
 */
export function Definitions() {
  return (
    <DefinitionList className="w-full max-w-2xl">
      <DefinitionItem term="Plazo de pago">30 días corridos desde la emisión.</DefinitionItem>
      <DefinitionItem term="Moneda">Pesos argentinos.</DefinitionItem>
      <DefinitionItem term="Recordatorios">Automáticos, 3 días antes y el día del vencimiento.</DefinitionItem>
    </DefinitionList>
  )
}
