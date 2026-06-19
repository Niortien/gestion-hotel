// app/accueil/page.tsx
import { AppShell } from '@/components/common/AppShell'
import { WalkInView } from '@/components/walk-in/WalkInView'

export default function AccueilPage() {
  return (
    <AppShell>
      <WalkInView />
    </AppShell>
  )
}
