import { UserCredentials, RegisterData, AuthResponse } from '@mini-gather/shared';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const result = await this.request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(result.token);
    return result;
  }

  async login(credentials: UserCredentials): Promise<AuthResponse> {
    const result = await this.request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    this.setToken(result.token);
    return result;
  }

  async getMe() {
    return this.request('/api/auth/me');
  }

  async getLiveKitProximityToken(): Promise<{ token: string }> {
    return this.request('/api/livekit/token/proximity', { method: 'POST' });
  }

  async getLiveKitRoomToken(roomId: string): Promise<{ token: string }> {
    return this.request('/api/livekit/token/room', {
      method: 'POST',
      body: JSON.stringify({ roomId }),
    });
  }
}

export const apiService = new ApiService();
