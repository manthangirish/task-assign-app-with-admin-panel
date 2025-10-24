const API_URL = 'http://localhost:5000/api';

interface AgentLoginResponse {
  message: string;
  token: string;
  agent: {
    id: string;
    name: string;
    email: string;
    mobile: string;
  };
}

interface AgentResponse {
  agent: {
    id: string;
    name: string;
    email: string;
    mobile: string;
  };
}

export interface AgentTask {
  _id: string;
  firstName: string;
  phone: string;
  notes: string;
  status: 'pending' | 'in-progress' | 'completed';
  uploadBatch: string;
  createdAt: string;
  updatedAt: string;
}

export const agentAuthService = {
  async login(email: string, password: string): Promise<AgentLoginResponse> {
    const response = await fetch(`${API_URL}/agent/login`, {
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

  async getMe(token: string): Promise<AgentResponse> {
    const response = await fetch(`${API_URL}/agent/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch agent data');
    }

    return data;
  },

  async getTasks(token: string): Promise<AgentTask[]> {
    const response = await fetch(`${API_URL}/agent/tasks`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch tasks');
    }

    return data.tasks;
  },

  async updateTaskStatus(token: string, taskId: string, status: string): Promise<void> {
    const response = await fetch(`${API_URL}/agent/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to update task status');
    }
  }
};