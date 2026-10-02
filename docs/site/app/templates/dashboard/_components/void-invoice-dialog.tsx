"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "sebs7n-ui/alert-dialog"
import { toast } from "sonner"
import type { Invoice } from "../_data/invoices-mock"

interface VoidInvoiceDialogProps {
  invoice: Invoice | null
  onClose: () => void
  onConfirmVoid: (id: string) => void
}

export function VoidInvoiceDialog({ invoice, onClose, onConfirmVoid }: VoidInvoiceDialogProps) {
  if (!invoice) return null

  const handleConfirm = () => {
    onConfirmVoid(invoice.id)
    toast.info(`Factura ${invoice.id} anulada.`)
    onClose()
  }

  return (
    <AlertDialog open={!!invoice} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Anular factura {invoice.id}?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción marcará el comprobante de {invoice.customer} como anulado y descontará los
            montos de la cuenta corriente. Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Volver</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleConfirm}>
            Anular factura
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
