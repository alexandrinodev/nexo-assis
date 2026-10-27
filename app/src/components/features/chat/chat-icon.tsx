import type { ChatIconProps } from '@/types/chat'

const paths = {
  chat: 'M4 4h16v12H8l-4 4V4Z',
  user: 'M20 21a8 8 0 0 0-16 0M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
  logout: 'M9 4H4v16h5M14 8l4 4-4 4M8 12h10',
  arrow: 'M12 19V5m-5 5 5-5 5 5',
  check: 'm5 12 4 4L19 6',
  chevron: 'm9 5 7 7-7 7',
  search: 'M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z',
  more: 'M12 4v1m0 6v1m0 6v1',
  close: 'm6 6 12 12M6 18 18 6',
  headset:
    'M4 14v-3a8 8 0 0 1 16 0v7a3 3 0 0 1-3 3h-3M4 11H2v7h4v-7H4Zm16 0h2v7h-4v-7h2Z',
  robot: 'M12 3v3M5 7h14v13H5V7ZM2 11v5m20-5v5M9 12h.01M15 12h.01M9 16h6',
  hand: 'M8 12V5a2 2 0 0 1 4 0v7-9a2 2 0 0 1 4 0v9-6a2 2 0 0 1 4 0v9a8 8 0 0 1-14 5l-4-6a2 2 0 0 1 3-2l3 3',
  send: 'm3 3 19 9-19 9 4-9-4-9Zm4 9h15',
  briefcase: 'M3 7h18v14H3V7Zm5 0V3h8v4M3 12h18M10 12v3h4v-3',
  transfer: 'M4 8h15m-4-4 4 4-4 4M20 16H5m4-4-4 4 4 4',
  back: 'm14 5-7 7 7 7',
}

export default function ChatIcon({
  name,
  className = 'size-4',
}: ChatIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  )
}
