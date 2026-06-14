export interface UserDTO {
  _id: string
  name: string
  email: string
  avatar?: string
}

export interface ChatDTO {
  _id: string
  name?: string
  members: UserDTO[]
  avatar?: string
}

export interface MessageDTO {
  _id: string
  chatId: string
  senderId: string
  content: string
  media?: string[]
  createdAt: string
  delivered?: boolean
  read?: boolean
}

