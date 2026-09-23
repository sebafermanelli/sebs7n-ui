"use client"

import { Card, CardContent } from "sebs7n-ui/card"
import { Stat } from "sebs7n-ui/stat"

/** KPIs dentro de un Card */
export function Basico() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-3">
      <Card size="sm">
        <CardContent>
          <Stat label="Facturado" value="$ 1.284.000" delta="+12,4 %" trend="up" hint="vs. mes anterior" />
        </CardContent>
      </Card>
      <Card size="sm">
        <CardContent>
          <Stat label="Cobrado" value="$ 998.200" delta="+3,1 %" trend="up" hint="77,7 % del total" />
        </CardContent>
      </Card>
      <Card size="sm">
        <CardContent>
          <Stat label="Vencido" value="$ 142.900" delta="+8,0 %" trend="down" hint="6 facturas" />
        </CardContent>
      </Card>
    </div>
  )
}
