export type User = {
  id: string
  username: string
  email: string
  createdAt: string
}

export type Conversation = {
  id: string
  createdAt: string
  updatedAt: string
  members: { user: Pick<User, 'id' | 'username' | 'email'> }[]
}

export type Message = {
  id: string
  conversationId: string
  content: string
  createdAt: string
  sender: {
    id: string
    username: string
  }
}
