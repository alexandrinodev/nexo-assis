export type AttendanceStatus = 'waiting' | 'assigned' | 'agent' | 'closed'
export type ConversationFilter = 'all' | 'waiting' | 'agent' | 'mine'

export type TechnicianMessage = {
  id: string
  role: 'user' | 'agent' | 'technician' | 'event'
  text: string
  time: string
}

export type CustomerTicket = {
  id: string
  title: string
  category: string
  status: 'waiting' | 'active' | 'approved' | 'resolved'
  detail: string
}

export type TechnicianConversation = {
  id: string
  name: string
  initials: string
  department: string
  avatarClassName: string
  status: AttendanceStatus
  preview: string
  time: string
  unread: number
  note: string
  ticketId: string
  messages: TechnicianMessage[]
  tickets: CustomerTicket[]
  reply: string
}

export type TechnicianConversationListProps = {
  conversations: TechnicianConversation[]
  selectedId: string
  onSelect: (id: string) => void
  mobileChatOpen: boolean
}

export type TechnicianThreadProps = {
  conversation: TechnicianConversation
  onAssume: () => void
  onReturn: () => void
  onClose: () => void
  onSend: () => void
  onReplyChange: (value: string) => void
  onShowTickets: () => void
  onBack: () => void
  mobileChatOpen: boolean
}

export type TechnicianTicketsProps = {
  conversation: TechnicianConversation
  visibility: 'auto' | 'open' | 'closed'
  onClose: () => void
}
