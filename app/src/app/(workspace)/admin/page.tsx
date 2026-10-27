import type { Metadata } from 'next'
import TechnicianWorkspace from '@/components/features/technician/technician-workspace'

export const metadata: Metadata = {
  title: 'Console dos técnicos | Nexo Assist',
}

export default function TechnicianChatPage() {
  return <TechnicianWorkspace />
}
