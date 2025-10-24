import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { agentService, Agent } from '../services/agentService';
import { uploadService, Task } from '../services/uploadService';
import { Users, Upload, FileText, BarChart3 } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { admin, token } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAgents: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;

      try {
        setLoading(true);
        const [agentsData, tasksData] = await Promise.all([
          agentService.getAgents(token),
          uploadService.getTasks(token)
        ]);

        setAgents(agentsData);
        setTasks(tasksData);

        // Calculate stats
        const completedTasks = tasksData.filter(task => task.status === 'completed').length;
        const pendingTasks = tasksData.filter(task => task.status === 'pending').length;

        setStats({
          totalAgents: agentsData.length,
          totalTasks: tasksData.length,
          completedTasks,
          pendingTasks
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const StatCard: React.FC<{
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
  }> = ({ title, value, icon, color }) => (
    <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`w-8 h-8 rounded-md flex items-center justify-center ${color}`}>
              {icon}
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="text-lg font-semibold text-gray-900">{value}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {admin?.name}!
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Here's an overview of your MERN application
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Agents"
          value={stats.totalAgents}
          icon={<Users className="w-5 h-5 text-white" />}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Tasks"
          value={stats.totalTasks}
          icon={<FileText className="w-5 h-5 text-white" />}
          color="bg-green-500"
        />
        <StatCard
          title="Pending Tasks"
          value={stats.pendingTasks}
          icon={<BarChart3 className="w-5 h-5 text-white" />}
          color="bg-yellow-500"
        />
        <StatCard
          title="Completed Tasks"
          value={stats.completedTasks}
          icon={<Upload className="w-5 h-5 text-white" />}
          color="bg-purple-500"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Agents */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Agents</h3>
          </div>
          <div className="p-6">
            {agents.length > 0 ? (
              <div className="space-y-3">
                {agents.slice(0, 5).map((agent) => (
                  <div key={agent.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{agent.name}</p>
                      <p className="text-sm text-gray-500">{agent.email}</p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No agents found. Create your first agent!</p>
            )}
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Recent Tasks</h3>
              <div className="text-sm text-gray-500">Live Status Updates</div>
            </div>
          </div>
          <div className="p-6">
            {tasks.length > 0 ? (
              <div className="space-y-3">
                {tasks.slice(0, 5).map((task) => (
                  <div key={task._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{task.firstName}</p>
                      <p className="text-sm text-gray-500">
                        📞 {task.phone} • Assigned to: {task.assignedTo.name}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span 
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          task.status === 'completed' 
                            ? 'bg-green-100 text-green-800'
                            : task.status === 'in-progress'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {task.status === 'completed' && '✅'}
                        {task.status === 'in-progress' && '🔄'}
                        {task.status === 'pending' && '⏳'}
                        <span className="ml-1 capitalize">{task.status.replace('-', ' ')}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No tasks found. Upload a CSV file to get started!</p>
            )}
          </div>
        </div>
      </div>

      {/* All Tasks Overview */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">All Tasks Overview</h3>
        </div>
        <div className="p-6">
          {tasks.length > 0 ? (
            <div className="space-y-2">
              {tasks.map((task) => (
                <div key={task._id} className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded-md">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{task.firstName}</p>
                      <p className="text-xs text-gray-500">{task.phone} • {task.assignedTo.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span 
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        task.status === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : task.status === 'in-progress'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {task.status === 'completed' && '✅'}
                      {task.status === 'in-progress' && '🔄'}
                      {task.status === 'pending' && '⏳'}
                      <span className="ml-1 capitalize">{task.status.replace('-', ' ')}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No tasks found. Upload a CSV file to get started!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;