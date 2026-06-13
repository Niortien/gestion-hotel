// app/clients/page.tsx
import { AppShell } from '@/components/common/AppShell'
import { ClientsView } from '@/components/clients/ClientsView'

export default function ClientsPage() {
  return (
    <AppShell>
      <ClientsView />
    </AppShell>
  )
}
