// app/reservations/page.tsx
import { AppShell } from '@/components/common/AppShell'
import { ReservationsView } from '@/components/reservations/ReservationsView'

export default function ReservationsPage() {
  return (
    <AppShell>
      <ReservationsView />
    </AppShell>
  )
}
