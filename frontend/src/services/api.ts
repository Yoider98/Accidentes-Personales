const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export interface User {
  id: string;
  email: string;
  fullName: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Accident {
  id: string;
  userId: string;
  affectedName: string;
  affectedPhone: string;
  accidentType: string;
  accidentDate: string;
  location: string;
  description: string;
  status: 'Registrado' | 'En revisión' | 'Cerrado';
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccidentPayload {
  affectedName: string;
  affectedPhone: string;
  accidentType: string;
  accidentDate: string;
  location: string;
  description: string;
}

class ApiService {
  private getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  public setToken(token: string | null): void {
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>)
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers
    });

    let data: any;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      let errorMessage = 'Ocurrió un error inesperado al procesar la solicitud.';
      if (data?.details && Array.isArray(data.details)) {
        errorMessage = data.details.map((d: any) => `${d.campo}: ${d.mensaje}`).join(', ');
      } else if (data?.message) {
        errorMessage = data.message;
      } else if (data?.error) {
        errorMessage = data.error;
      }
      throw new Error(errorMessage);
    }

    return data as T;
  }

  // Auth endpoints
  public async register(payload: { email: string; password: string; fullName: string }): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    this.setToken(res.token);
    return res;
  }

  public async login(payload: { email: string; password: string }): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    this.setToken(res.token);
    return res;
  }

  public async getMe(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  // Accident endpoints
  public async createAccident(payload: CreateAccidentPayload): Promise<Accident> {
    return this.request<Accident>('/accidents', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public async listAccidents(): Promise<Accident[]> {
    return this.request<Accident[]>('/accidents');
  }

  public async getAccidentDetail(id: string): Promise<Accident> {
    return this.request<Accident>(`/accidents/${id}`);
  }

  public async updateAccidentStatus(id: string, status: string): Promise<Accident> {
    return this.request<Accident>(`/accidents/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }
}

export const api = new ApiService();

