import { supabase } from '@/lib/supabase';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
const API_URL = `${BACKEND_URL}/api`;

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
  propertyName?: string | null;
  bookingNumber?: string | null;
  checkinDate?: string | null;
  checkoutDate?: string | null;
  checkinTime?: string | null;
  checkoutTime?: string | null;
  keyboxCode?: string | null;
  guestPhone?: string | null;
  objectNameInternal?: string | null;
  adults?: number | null;
  children?: number | null;
}

export interface BackendMessage {
  id: string;
  content: string;
  originalContent?: string | null;
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

  async request(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session?.access_token) {
      throw new Error('Authentication required');
    }

    const headers = new Headers(init.headers);
    headers.set('Authorization', `Bearer ${data.session.access_token}`);
    return fetch(input, { ...init, headers });
  }

  async getConversations(): Promise<BackendConversation[]> {
    const response = await this.request(`${API_URL}/conversations`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  }

  async getMessages(conversationId: string): Promise<BackendMessage[]> {
    const response = await this.request(`${API_URL}/conversations/${conversationId}/messages`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  }

  async sendMessage(conversationId: string, content: string, senderName?: string): Promise<void> {
    const response = await this.request(`${API_URL}/messages/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ conversationId, content, senderName }),
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    return response.json();
  }

  async markConversationRead(conversationId: string): Promise<void> {
    await this.request(`${API_URL}/conversations/${conversationId}/read`, { method: 'POST' });
  }

  async generateAiResponse(conversationId: string): Promise<string | null> {
    const response = await this.request(`${API_URL}/conversations/${conversationId}/generate-ai`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return data.aiSuggestion || null;
  }

  async retryTranslation(messageId: string): Promise<{ content: string; originalContent: string | null }> {
    const response = await this.request(`${API_URL}/messages/${messageId}/retry-translation`, {
      method: 'POST',
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Translation failed' }));
      throw new Error(err.error || `HTTP ${response.status}`);
    }
    return response.json();
  }

  async reparseMessage(messageId: string): Promise<{ content: string; originalContent: string | null }> {
    const response = await this.request(`${API_URL}/messages/${messageId}/reparse`, {
      method: 'POST',
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Reparse failed' }));
      throw new Error(err.error || `HTTP ${response.status}`);
    }
    return response.json();
  }

  async getPendingAiSuggestion(conversationId: string): Promise<string | null> {
    const response = await this.request(`${API_URL}/conversations/${conversationId}/pending-ai`);
    if (!response.ok) return null;
    const data = await response.json();
    return data.aiSuggestion || null;
  }

  async getPendingAiIds(): Promise<string[]> {
    const response = await this.request(`${API_URL}/pending-ai-ids`);
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  }

  async getActionRequiredIds(): Promise<string[]> {
    const response = await this.request(`${API_URL}/action-required`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  }

  async getAdminUsers(): Promise<{ id: string; email: string; name: string; created_at: string; last_sign_in_at: string | null }[]> {
    const response = await this.request(`${API_URL}/admin/users`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }

  async createAdminUser(email: string, password: string, name: string): Promise<any> {
    const response = await this.request(`${API_URL}/admin/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Failed' }));
      throw new Error(err.error || `HTTP ${response.status}`);
    }
    return response.json();
  }

  async deleteAdminUser(userId: string, password?: string, email?: string): Promise<void> {
    const response = await this.request(`${API_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, email }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Failed' }));
      throw new Error(err.error || `HTTP ${response.status}`);
    }
  }

  async changeAdminPassword(userId: string, email: string, oldPassword: string, newPassword: string): Promise<void> {
    const response = await this.request(`${API_URL}/admin/users/${userId}/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, oldPassword, newPassword }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Failed' }));
      throw new Error(err.error || `HTTP ${response.status}`);
    }
  }

  connectWebSocket(_onMessage: (data: any) => void): WebSocket | null {
    // Disabled by the v1 security hotfix. Polling remains active until v2 SSE is live.
    return null;
  }

  disconnectWebSocket(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const apiService = new ApiService();
