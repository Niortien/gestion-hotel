// app/depenses/page.tsx
import { AppShell } from '@/components/common/AppShell'
import { DepensesView } from '@/components/depenses/DepensesView'

export default function DepensesPage() {
  return (
    <AppShell>
      <DepensesView />
    </AppShell>
  )
}
