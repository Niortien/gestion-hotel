// app/dashboard/page.tsx
import { AppShell } from '@/components/common/AppShell'
import { DashboardView } from '@/components/dashboard/DashboardView'

export default function DashboardPage() {
  return (
    <AppShell>
      <DashboardView />
    </AppShell>
  )
}
