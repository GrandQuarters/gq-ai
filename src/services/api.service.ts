const API_URL = 'http://localhost:4000/api';
const WS_URL = 'ws://localhost:4000';

export interface BackendConversation {
  id: string;
  name: string;
  avatar: string;
  isGroup: boolean;
  participants: any[];
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
  pinned: boolean;
  online: boolean;
  readOnly: boolean;
}

export interface BackendMessage {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  timestamp: Date;
  isOwn: boolean;
  reactions: any[];
  attachments: any[];
}

export class ApiService {
  private ws: WebSocket | null = null;

  async getConversations(): Promise<BackendConversation[]> {
    const response = await fetch(`${API_URL}/conversations`);
    return response.json();
  }

  async getMessages(conversationId: string): Promise<BackendMessage[]> {
    const response = await fetch(`${API_URL}/conversations/${conversationId}/messages`);
    return response.json();
  }

  async sendMessage(conversationId: string, content: string): Promise<void> {
    const response = await fetch(`${API_URL}/messages/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ conversationId, content }),
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    return response.json();
  }

  async getActionRequiredIds(): Promise<string[]> {
    const response = await fetch(`${API_URL}/action-required`);
    return response.json();
  }

  connectWebSocket(onMessage: (data: any) => void): WebSocket {
    if (this.ws) {
      this.ws.close();
    }

    this.ws = new WebSocket(WS_URL);

    this.ws.onopen = () => {
      console.log('✅ WebSocket connected to backend');
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('📨 WebSocket message:', data);
      onMessage(data);
    };

    this.ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('🔌 WebSocket disconnected');
    };

    return this.ws;
  }

  disconnectWebSocket(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const apiService = new ApiService();

