const API_URL = 'http://localhost:5000/api';

export interface DistributionSummary {
  agentId: string;
  agentName: string;
  agentEmail: string;
  taskCount: number;
}

interface UploadResponse {
  message: string;
  totalTasks: number;
  agentCount: number;
  batchId: string;
  distribution: DistributionSummary[];
}

export interface Task {
  _id: string;
  firstName: string;
  phone: string;
  notes: string;
  assignedTo: {
    _id: string;
    name: string;
    email: string;
  };
  status: string;
  uploadBatch: string;
  createdAt: string;
}

export const uploadService = {
  async uploadFile(token: string, file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Upload failed');
    }

    return data;
  },

  async getTasks(token: string): Promise<Task[]> {
    const response = await fetch(`${API_URL}/upload/tasks`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch tasks');
    }

    return data.tasks;
  }
};