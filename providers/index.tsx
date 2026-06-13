'use client'

import { Toaster } from 'react-hot-toast'
import { toastConfig } from '@/config/app.config'
import { QueryProvider } from './query-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      {children}
      <Toaster {...toastConfig} />
    </QueryProvider>
  )
}
