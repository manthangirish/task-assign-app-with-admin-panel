const API_URL = 'http://localhost:5000/api';

export interface Agent {
  id: string;
  name: string;
  email: string;
  mobile: string;
  isActive: boolean;
  createdAt: string;
}

interface CreateAgentData {
  name: string;
  email: string;
  mobile: string;
  password: string;
}

export const agentService = {
  async createAgent(token: string, agentData: CreateAgentData): Promise<Agent> {
    const response = await fetch(`${API_URL}/agents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(agentData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create agent');
    }

    return data.agent;
  },

  async getAgents(token: string): Promise<Agent[]> {
    const response = await fetch(`${API_URL}/agents`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch agents');
    }

    return data.agents;
  },

  async deleteAgent(token: string, agentId: string): Promise<void> {
    const response = await fetch(`${API_URL}/agents/${agentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to delete agent');
    }
  }
};