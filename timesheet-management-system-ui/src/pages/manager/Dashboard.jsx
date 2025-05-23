import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { Users, ClipboardList, Clock, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import TaskDistributionChart from '../../components/TaskDistributionChart.jsx';
import TimeComparisonChart from '../../components/TimeComparisonChart.jsx';

function ManagerDashboard() {
  const base_url = "http://localhost:5000";
  const [stats, setStats] = useState({
    totalAssociates: 0,
    totalTasks: 0,
    totalHoursPlanned: 0,
    totalHoursLogged: 0,
    pendingTimesheets: 0
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch all tasks
        const tasksResponse = await axios.get(`${base_url}/api/tasks/all`);
        const tasks = tasksResponse.data.tasks;
        
        // Fetch all timesheets
        const timesheetsResponse = await axios.get(`${base_url}/api/timesheets/all`);
        const timesheets = timesheetsResponse.data.timesheets;
        
        // Calculate stats
        const totalAssociates = new Set(tasks?.map(task => task.assignedTo._id)).size;
        const totalTasks = tasks.length;
        const totalHoursPlanned = tasks?.reduce((sum, task) => sum + task.estimatedHours, 0);
        
        const totalHoursLogged = timesheets?.reduce((sum, timesheet) => {
          return sum + timesheet.entries.reduce((entrySum, entry) => entrySum + entry.actualHours, 0);
        }, 0);
        
        const pendingTimesheets = timesheets.filter(timesheet => !timesheet.submitted).length;
        
        setStats({
          totalAssociates,
          totalTasks,
          totalHoursPlanned,
          totalHoursLogged,
          pendingTimesheets
        });
        
        // Get recent tasks (last 5)
        const sortedTasks = [...tasks].sort((a, b) => new Date(b.date) - new Date(a.date));
        setRecentTasks(sortedTasks.slice(0, 5));
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
        <div className="flex items-center">
          <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stats Cards */}
        <div className="bg-white rounded-lg shadow p-6 flex items-center space-x-4 transform transition-all duration-300 hover:scale-105">
          <div className="p-3 rounded-full bg-blue-100">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Assigned Associates</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalAssociates}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 flex items-center space-x-4 transform transition-all duration-300 hover:scale-105">
          <div className="p-3 rounded-full bg-green-100">
            <ClipboardList className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Tasks</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalTasks}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 flex items-center space-x-4 transform transition-all duration-300 hover:scale-105">
          <div className="p-3 rounded-full bg-purple-100">
            <Clock className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Hours Planned/Logged</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.totalHoursLogged} / {stats.totalHoursPlanned}
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 flex items-center space-x-4 transform transition-all duration-300 hover:scale-105">
          <div className="p-3 rounded-full bg-yellow-100">
            <AlertCircle className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Pending Timesheets</p>
            <p className="text-2xl font-bold text-gray-900">{stats.pendingTimesheets}</p>
          </div>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Task Distribution</h3>
          <div className="h-64">
            <TaskDistributionChart />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Planned vs Actual Hours</h3>
          <div className="h-64">
            <TimeComparisonChart 
              planned={stats.totalHoursPlanned}
              actual={stats.totalHoursLogged}
            />
          </div>
        </div>
      </div>
      
      {/* Recent Tasks */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">Recent Tasks</h3>
          <Link 
            to="/assign-task"
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Assign New
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Est. Hours</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentTasks.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                    No tasks assigned yet
                  </td>
                </tr>
              ) : (
                recentTasks.map((task) => (
                  <tr key={task._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {task.description}``
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {task.assignedTo?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(task.date), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {task.estimatedHours}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {recentTasks.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <Link 
              to="/view-timesheets" 
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View All Timesheets →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default ManagerDashboard;