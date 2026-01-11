
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Document {
  id: string;
  name: string;
  content: string;
  type: string;
  timestamp: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
  sources?: string[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  documentIds: string[];
}
