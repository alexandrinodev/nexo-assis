import type {
  CustomerTicket,
  TechnicianConversation,
  TechnicianMessage,
} from '@/types/technician'

const anaMessages: TechnicianMessage[] = [
  {
    id: 'a1',
    role: 'user',
    text: 'Qual o status do meu chamado?',
    time: '10:01',
  },
  {
    id: 'a2',
    role: 'agent',
    text: 'Você tem 3 chamados abertos. Sobre qual deles quer saber?',
    time: '10:01',
  },
  {
    id: 'a3',
    role: 'user',
    text: 'INC-20311 · Notebook lento após atualização',
    time: '10:02',
  },
  {
    id: 'a4',
    role: 'agent',
    text: 'Está sem atualização há 5 dias, acima do prazo de 3 dias úteis. Quer que eu chame um analista?',
    time: '10:02',
  },
  { id: 'a5', role: 'user', text: 'Está parado há 5 dias.', time: '10:04' },
  {
    id: 'a6',
    role: 'user',
    text: 'Quero falar com um analista.',
    time: '10:04',
  },
  {
    id: 'a7',
    role: 'agent',
    text: 'Encaminhei para o Suporte N2. Um analista vai falar com você em até 2 h úteis.',
    time: '10:05',
  },
  {
    id: 'a8',
    role: 'event',
    text: 'Transferida para Suporte N2',
    time: '10:05',
  },
]

const anaTickets: CustomerTicket[] = [
  {
    id: 'INC-20311',
    title: 'Notebook lento após atualização',
    category: 'Hardware · prioridade média',
    status: 'waiting',
    detail: 'Transferido para um analista',
  },
  {
    id: 'INC-20298',
    title: 'Acesso à pasta Financeiro',
    category: 'Acesso e permissões',
    status: 'active',
    detail: 'Em andamento',
  },
  {
    id: 'REQ-10442',
    title: 'Segundo monitor para home office',
    category: 'Equipamentos',
    status: 'approved',
    detail: 'Aprovado',
  },
  {
    id: 'INC-19877',
    title: 'Outlook não sincroniza no celular',
    category: 'E-mail e colaboração',
    status: 'resolved',
    detail: 'Resolvido em 02 set',
  },
  {
    id: 'INC-19410',
    title: 'Troca de senha de rede',
    category: 'Acesso e permissões',
    status: 'resolved',
    detail: 'Resolvido em 11 jul',
  },
]

const conversations: TechnicianConversation[] = [
  {
    id: 'ana',
    name: 'Ana Souza',
    initials: 'AS',
    department: 'Financeiro',
    avatarClassName: 'bg-[#dceafb] text-[#0064c9]',
    status: 'waiting',
    preview: 'Está parado há 5 dias. Quero falar com...',
    time: '10:05',
    unread: 2,
    note: 'Transferida · INC-20311',
    ticketId: 'INC-20311',
    messages: anaMessages,
    tickets: anaTickets,
    reply: '',
  },
  {
    id: 'carla',
    name: 'Carla Mendes',
    initials: 'CM',
    department: 'Comercial',
    avatarClassName: 'bg-[#f9e4d2] text-[#934600]',
    status: 'waiting',
    preview: 'Preciso de acesso ao SAP ainda hoje',
    time: '09:58',
    unread: 1,
    note: 'Transferida · contato em 25 min',
    ticketId: 'INC-20318',
    messages: [],
    tickets: [],
    reply: '',
  },
  {
    id: 'bruno',
    name: 'Bruno Tavares',
    initials: 'BT',
    department: 'Operações',
    avatarClassName: 'bg-[#e8e0fa] text-[#6643c5]',
    status: 'waiting',
    preview: 'Nexo: Vou chamar um analista para isso.',
    time: '09:51',
    unread: 0,
    note: 'Agent pediu ajuda · confiança 41%',
    ticketId: 'INC-20309',
    messages: [],
    tickets: [],
    reply: '',
  },
  {
    id: 'diego',
    name: 'Diego Ramos',
    initials: 'DR',
    department: 'Operações',
    avatarClassName: 'bg-[#dff3e7] text-[#087349]',
    status: 'agent',
    preview: 'Estou tentando conectar de novo.',
    time: 'agora',
    unread: 0,
    note: 'Agent atendendo',
    ticketId: 'INC-20322',
    messages: [],
    tickets: [],
    reply: '',
  },
  {
    id: 'elisa',
    name: 'Elisa Prado',
    initials: 'EP',
    department: 'Marketing',
    avatarClassName: 'bg-[#f8e1e9] text-[#bc3157]',
    status: 'agent',
    preview: 'Nexo: Chamado INC-20519 criado.',
    time: '10:03',
    unread: 0,
    note: 'Agent atendendo',
    ticketId: 'INC-20519',
    messages: [],
    tickets: [],
    reply: '',
  },
  {
    id: 'fabio',
    name: 'Fábio Nunes',
    initials: 'FN',
    department: 'Administrativo',
    avatarClassName: 'bg-[#e5e8ed] text-[#536073]',
    status: 'closed',
    preview: 'Isso resolveu, obrigado!',
    time: '10:01',
    unread: 0,
    note: 'Resolvida pelo agent',
    ticketId: 'INC-20285',
    messages: [],
    tickets: [],
    reply: '',
  },
  {
    id: 'gabriela',
    name: 'Gabriela Rocha',
    initials: 'GR',
    department: 'Pessoas e Cultura',
    avatarClassName: 'bg-[#fff0ce] text-[#906100]',
    status: 'closed',
    preview: 'Nexo: A senha do Wi-Fi foi enviada...',
    time: 'ontem',
    unread: 0,
    note: 'Resolvida pelo agent',
    ticketId: 'INC-20270',
    messages: [],
    tickets: [],
    reply: '',
  },
]

export const demoConversations = conversations.map(
  (conversation): TechnicianConversation => {
    if (conversation.id === 'ana') return conversation
    const title =
      conversation.id === 'carla'
        ? 'Solicitação de acesso ao SAP'
        : conversation.id === 'bruno'
          ? 'Falha de acesso ao sistema interno'
          : conversation.id === 'diego'
            ? 'Dificuldade de conexão à rede'
            : conversation.id === 'elisa'
              ? 'Solicitação de suporte de TI'
              : conversation.id === 'fabio'
                ? 'Acesso ao e-mail restabelecido'
                : 'Acesso ao Wi-Fi'
    return {
      ...conversation,
      messages: [
        {
          id: `${conversation.id}-1`,
          role: 'user',
          text: conversation.preview.replace('Nexo: ', ''),
          time: conversation.time,
        },
        {
          id: `${conversation.id}-2`,
          role: 'agent',
          text:
            conversation.status === 'waiting'
              ? 'Encaminhei sua solicitação para a equipe de suporte. Um analista vai continuar o atendimento.'
              : conversation.status === 'closed'
                ? 'Atendimento concluído. Se precisar, é só iniciar uma nova conversa.'
                : 'Estou verificando as informações do seu atendimento.',
          time: conversation.time,
        },
      ],
      tickets: [
        {
          id: conversation.ticketId,
          title,
          category: 'Service desk · prioridade média',
          status:
            conversation.status === 'closed'
              ? 'resolved'
              : conversation.status === 'waiting'
                ? 'waiting'
                : 'active',
          detail:
            conversation.status === 'closed'
              ? 'Atendimento concluído'
              : 'Solicitação em acompanhamento',
        },
      ],
    }
  },
)
