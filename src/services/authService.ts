const API_URL = 'http://localhost:5000/api';

interface LoginResponse {
  message: string;
  token: string;
  admin: {
    id: string;
    name: string;
    email: string;
  };
}

interface AdminResponse {
  admin: {
    id: string;
    name: string;
    email: string;
  };
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    return data;
  },

  async getMe(token: string): Promise<AdminResponse> {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch admin data');
    }

    return data;
  }
};