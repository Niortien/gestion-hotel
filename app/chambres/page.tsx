// app/chambres/page.tsx
import { AppShell } from '@/components/common/AppShell'
import { ChambresView } from '@/components/chambres/ChambresView'

export default function ChambresPage() {
  return (
    <AppShell>
      <ChambresView />
    </AppShell>
  )
}
