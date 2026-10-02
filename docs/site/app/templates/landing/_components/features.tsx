import { BellIcon, ChartColumnIcon, DownloadIcon, ReceiptIcon, ShieldCheckIcon, UsersIcon } from "lucide-react"
import { Card, CardContent, CardGrid } from "sebs7n-ui/card"

import { FEATURES, type FeatureIcon } from "../_data/content"
import { SectionHeader } from "./section-header"

const ICONS: Record<FeatureIcon, React.ReactNode> = {
  receipt: <ReceiptIcon />,
  bell: <BellIcon />,
  chart: <ChartColumnIcon />,
  users: <UsersIcon />,
  download: <DownloadIcon />,
  shield: <ShieldCheckIcon />,
}

export function Features() {
  return (
    <section className="flex scroll-mt-20 flex-col gap-10" id="beneficios">
      <SectionHeader subtitle="Lo que hace falta para facturar y cobrar, sin lo que sobra." title="Todo en un lugar" />
      <CardGrid>
        {FEATURES.map((feature) => (
          // Solo cuerpo: sin nada debajo, una cabecera dejaría la franja del cuerpo vacía.
          <Card key={feature.title}>
            <CardContent className="flex gap-4 py-(--card-spacing)">
              <span aria-hidden="true" className="text-brand-900 [&_svg]:size-7">
                {ICONS[feature.icon]}
              </span>
              <div className="flex flex-col gap-1">
                <h3 className="text-headline text-label">{feature.title}</h3>
                <p className="text-callout text-label-secondary">{feature.body}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardGrid>
    </section>
  )
}
