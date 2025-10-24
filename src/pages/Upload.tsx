import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { uploadService, DistributionSummary, Task } from '../services/uploadService';
import { Upload as UploadIcon, FileText, CheckCircle, Clock, User } from 'lucide-react';

const Upload: React.FC = () => {
  const { token } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    message: string;
    totalTasks: number;
    agentCount: number;
    distribution: DistributionSummary[];
  } | null>(null);
  const [error, setError] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showTasks, setShowTasks] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [token]);

  const fetchTasks = async () => {
    if (!token) return;

    try {
      const tasksData = await uploadService.getTasks(token);
      setTasks(tasksData);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
      const fileExtensions = ['.csv', '.xlsx', '.xls'];
      const fileExtension = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'));

      if (allowedTypes.includes(selectedFile.type) || fileExtensions.includes(fileExtension)) {
        setFile(selectedFile);
        setError('');
      } else {
        setError('Please select a valid CSV, XLSX, or XLS file');
        setFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file || !token) return;

    setUploading(true);
    setError('');
    setUploadResult(null);

    try {
      const result = await uploadService.uploadFile(token, file);
      setUploadResult(result);
      setFile(null);
      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      // Refresh tasks
      fetchTasks();
    } catch (error: any) {
      setError(error.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Upload & Distribution</h1>
        <p className="mt-1 text-sm text-gray-600">
          Upload CSV/Excel files to automatically distribute tasks among agents
        </p>
      </div>

      {/* Upload Section */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">File Upload</h2>
          
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {/* File Input */}
          <div className="mb-4">
            <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
              Choose CSV/Excel File
            </label>
            <div className="flex items-center space-x-4">
              <input
                id="file-upload"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <UploadIcon className="h-4 w-4 mr-2" />
                    Upload
                  </>
                )}
              </button>
            </div>
          </div>

          {/* File Requirements */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">File Requirements:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Supported formats: CSV, XLSX, XLS</li>
              <li>• Required columns: FirstName, Phone, Notes</li>
              <li>• Tasks will be distributed equally among up to 5 active agents</li>
              <li>• Maximum file size: 5MB</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Upload Result */}
      {uploadResult && (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="p-6">
            <div className="flex items-center mb-4">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">Upload Successful</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-900">{uploadResult.totalTasks}</div>
                <div className="text-sm text-blue-600">Total Tasks</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-900">{uploadResult.agentCount}</div>
                <div className="text-sm text-green-600">Agents</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-900">
                  {Math.round(uploadResult.totalTasks / uploadResult.agentCount)}
                </div>
                <div className="text-sm text-purple-600">Avg. per Agent</div>
              </div>
            </div>

            <h3 className="text-md font-medium text-gray-900 mb-3">Distribution Summary:</h3>
            <div className="space-y-2">
              {uploadResult.distribution.map((dist) => (
                <div key={dist.agentId} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                  <div>
                    <div className="font-medium text-gray-900">{dist.agentName}</div>
                    <div className="text-sm text-gray-500">{dist.agentEmail}</div>
                  </div>
                  <div className="text-lg font-semibold text-blue-600">
                    {dist.taskCount} tasks
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tasks Overview */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Recent Tasks</h2>
            <button
              onClick={() => setShowTasks(!showTasks)}
              className="text-blue-600 hover:text-blue-500 text-sm font-medium"
            >
              {showTasks ? 'Hide' : 'View All'} ({tasks.length})
            </button>
          </div>

          {tasks.length > 0 ? (
            <div className="space-y-3">
              {(showTasks ? tasks : tasks.slice(0, 5)).map((task) => (
                <div key={task._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{task.firstName}</div>
                      <div className="text-sm text-gray-500">{task.phone}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-sm text-gray-500 mb-1">
                      <User className="h-3 w-3 mr-1" />
                      {task.assignedTo.name}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        task.status === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : task.status === 'in-progress'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {task.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                        {task.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {task.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks yet</h3>
              <p className="mt-1 text-sm text-gray-500">Upload a CSV file to create tasks.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Upload;