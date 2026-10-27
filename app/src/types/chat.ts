export type ChatPlaceholderProps = {
  audience: 'user' | 'technician'
}

export type AffectedAudience =
  'Só eu' | 'Minha equipe' | 'Toda a empresa' | 'Não sei'

export type TicketDraft = {
  title: string
  description: string
  category: string
  priority: 'Baixa' | 'Média' | 'Alta'
}

export type DraftStatus = 'pending' | 'editing' | 'confirmed' | 'cancelled'

export type ChatMessage = {
  id: number
  role: 'user' | 'assistant'
  content: string
}

export type ChatIconProps = {
  name:
    | 'chat'
    | 'user'
    | 'logout'
    | 'arrow'
    | 'check'
    | 'chevron'
    | 'search'
    | 'more'
    | 'close'
    | 'headset'
    | 'robot'
    | 'hand'
    | 'send'
    | 'briefcase'
    | 'transfer'
    | 'back'
  className?: string
}
