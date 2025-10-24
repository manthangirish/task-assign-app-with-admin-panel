import React, { createContext, useContext, useState, useEffect } from 'react';
import { agentAuthService } from '../services/agentAuthService';

interface Agent {
  id: string;
  name: string;
  email: string;
  mobile: string;
}

interface AgentAuthContextType {
  agent: Agent | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AgentAuthContext = createContext<AgentAuthContextType | undefined>(undefined);

export const useAgentAuth = () => {
  const context = useContext(AgentAuthContext);
  if (!context) {
    throw new Error('useAgentAuth must be used within an AgentAuthProvider');
  }
  return context;
};

export const AgentAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('agentToken');
      if (savedToken) {
        try {
          const agentData = await agentAuthService.getMe(savedToken);
          setAgent(agentData.agent);
          setToken(savedToken);
        } catch (error) {
          localStorage.removeItem('agentToken');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await agentAuthService.login(email, password);
      setAgent(response.agent);
      setToken(response.token);
      localStorage.setItem('agentToken', response.token);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setAgent(null);
    setToken(null);
    localStorage.removeItem('agentToken');
  };

  const value = {
    agent,
    token,
    isAuthenticated: !!agent,
    loading,
    login,
    logout
  };

  return <AgentAuthContext.Provider value={value}>{children}</AgentAuthContext.Provider>;
};