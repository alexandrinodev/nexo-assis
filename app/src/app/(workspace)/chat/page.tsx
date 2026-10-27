import type { Metadata } from 'next'
import UserChatScreen from '@/components/features/chat/user-chat-screen'

export const metadata: Metadata = {
  title: 'Meu atendimento | Nexo Assist',
}

export default function UserChatPage() {
  return <UserChatScreen />
}
