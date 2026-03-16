export interface User {
  id: string
  name: string
  avatar?: string
  online?: boolean
}

export interface Reaction {
  emoji: string
  userId: string
  userName: string
}

export interface PollOption {
  id: string
  text: string
  count: number
  voterIds: string[]
}

export interface Poll {
  id: string
  question: string
  options: PollOption[]
  allowMultiple: boolean
  myVotes: string[]
}

export interface Attachment {
  id: string
  type: 'image' | 'pdf' | 'file'
  url: string
  name: string
  size?: number
  thumbnail?: string
}

export interface Message {
  id: string
  content: string
  originalContent?: string | null
  senderId: string
  senderName: string
  senderAvatar?: string
  timestamp: Date
  isOwn: boolean
  replyTo?: {
    id: string
    content: string
    senderName: string
  }
  reactions: Reaction[]
  attachments: Attachment[]
  poll?: Poll
  edited?: boolean
  read?: boolean
}

export interface Conversation {
  id: string
  name: string
  avatar?: string
  isGroup: boolean
  participants: User[]
  lastMessage?: string
  lastMessageTime?: Date
  unreadCount: number
  pinned: boolean
  online?: boolean
  readOnly?: boolean
}

export interface ContextMenuPosition {
  x: number
  y: number
}

export interface ToastNotification {
  id: string
  conversationId: string
  conversationName: string
  conversationAvatar?: string
  message: string
  senderName: string
  timestamp: Date
}




