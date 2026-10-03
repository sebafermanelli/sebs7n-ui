import { Card, CardContent } from "sebs7n-ui/card"
import { Sparkline } from "sebs7n-ui/sparkline"

const WEEKS = [12, 18, 15, 22, 30, 26, 34, 41]

/**
 * Junto a la cifra
 * Decorativa: da la forma de la serie y el número va escrito al lado.
 */
export function Basic() {
  return (
    <Card className="w-full max-w-xs">
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <span className="text-callout text-label-secondary">Cobros por semana</span>
          <span className="text-title-3 text-label tabular-nums">41</span>
        </div>
        <Sparkline className="h-10 w-full" values={WEEKS} />
      </CardContent>
    </Card>
  )
}

/**
 * Sin relleno, con otro color
 * `area={false}` deja solo la línea; el color es el del texto de la caja.
 */
export function LineOnly() {
  return <Sparkline area={false} className="h-8 w-48 text-red-ink" values={[30, 28, 31, 24, 20, 22, 15, 12]} />
}
