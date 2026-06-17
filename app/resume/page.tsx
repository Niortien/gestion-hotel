// app/resume/page.tsx
import { AppShell } from '@/components/common/AppShell'
import { ResumeView } from '@/components/resume/ResumeView'

export default function ResumePage() {
  return (
    <AppShell>
      <ResumeView />
    </AppShell>
  )
}
