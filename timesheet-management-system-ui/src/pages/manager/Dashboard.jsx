import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  Users, 
  ClipboardList, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Calendar,
  Plus,
  Filter,
  Download,
  MoreVertical,
  ExternalLink,
  ArrowUpRight,
  Activity,
  CheckCircle,
  Timer,
  BarChart3,
  Zap,
  Target,
  Bell,
  Search,
  Settings
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

// Mock data for demonstration
const mockStats = {
  totalAssociates: 12,
  totalTasks: 34,
  totalHoursPlanned: 280,
  totalHoursLogged: 245,
  pendingTimesheets: 3
};

const mockRecentTasks = [
  {
    _id: '1',
    description: 'Implement user authentication system',
    assignedTo: { name: 'Alice Johnson' },
    date: '2024-01-15',
    estimatedHours: 8,
    status: 'in-progress'
  },
  {
    _id: '2', 
    description: 'Design database schema for orders',
    assignedTo: { name: 'Bob Smith' },
    date: '2024-01-14',
    estimatedHours: 6,
    status: 'completed'
  },
  {
    _id: '3',
    description: 'Create responsive dashboard layout',
    assignedTo: { name: 'Carol Davis' },
    date: '2024-01-13',
    estimatedHours: 12,
    status: 'pending'
  }
];

// Mock chart components
const TaskDistributionChart = () => (
  <div className="h-full flex items-center justify-center">
    <div className="text-center space-y-4">
      <div className="relative w-32 h-32 mx-auto">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 opacity-20"></div>
        <div className="absolute inset-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 opacity-40"></div>
        <div className="absolute inset-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
          <BarChart3 className="h-8 w-8 text-white" />
        </div>
      </div>
      <p className="text-sm text-gray-500">Interactive chart will display here</p>
    </div>
  </div>
);

const TimeComparisonChart = ({ planned, actual }) => (
  <div className="h-full flex items-center justify-center">
    <div className="text-center space-y-4 w-full">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Planned Hours</span>
          <span className="text-sm font-bold text-blue-600">{planned}h</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full" style={{width: '100%'}}></div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Actual Hours</span>
          <span className="text-sm font-bold text-green-600">{actual}h</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full" style={{width: `${(actual/planned) * 100}%`}}></div>
        </div>
      </div>
      <div className="pt-2">
        <p className="text-xs text-gray-500">Efficiency: {Math.round((actual/planned) * 100)}%</p>
      </div>
    </div>
  </div>
);

function ManagerDashboard() {

  const [timeRange, setTimeRange] = useState('7d');
  const base_url = "https://timesheet-management-system-api.vercel.app";

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
        console.log(stats)
        
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




  // Calculate efficiency percentage
  const efficiency = stats.totalHoursPlanned > 0 ? Math.round((stats.totalHoursLogged / stats.totalHoursPlanned) * 100) : 0;

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <CheckCircle className="h-3 w-3" />;
      case 'in-progress': return <Timer className="h-3 w-3" />;
      case 'pending': return <Clock className="h-3 w-3" />;
      default: return <AlertCircle className="h-3 w-3" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-blue-200 opacity-30 mx-auto"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
          <p className="text-gray-400 text-sm mt-1">Gathering the latest insights</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Enhanced Floating Header */}
      <div className="top-0 z-20 backdrop-blur-xl bg-white/80 border-b border-white/20 shadow-lg shadow-black/5">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Dashboard Overview
                  </h1>
                  <p className="text-gray-600 text-sm flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(), 'EEEE, MMMM do, yyyy')}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search tasks..."
                  className="pl-10 pr-4 py-2 bg-white/50 border border-white/20 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm w-64"
                />
              </div>
              
              <button className="p-2 bg-white/50 border border-white/20 rounded-xl hover:bg-white/80 transition-all duration-300 backdrop-blur-sm">
                <Bell className="h-4 w-4 text-gray-600" />
              </button>
              
              <button className="p-2 bg-white/50 border border-white/20 rounded-xl hover:bg-white/80 transition-all duration-300 backdrop-blur-sm">
                <Settings className="h-4 w-4 text-gray-600" />
              </button>
              
              <Link to="/assign-task" className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transform hover:scale-105">
                <Plus className="h-4 w-4" />
                New Task
              </Link >
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Time Range Selector */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-sm font-medium text-gray-600">View:</span>
          {['7d', '30d', '90d'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                timeRange === range
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-white/60 text-gray-600 hover:bg-white/80 border border-white/20'
              }`}
            >
              {range === '7d' ? 'Last 7 days' : range === '30d' ? 'Last 30 days' : 'Last 90 days'}
            </button>
          ))}
        </div>

        {/* Enhanced Floating Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group relative bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-500 hover:scale-105 hover:bg-white/80">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-all duration-300">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="flex items-center gap-1 px-3 py-1 bg-blue-50 rounded-full text-xs font-medium text-blue-700 border border-blue-100">
                  <TrendingUp className="h-3 w-3" />
                  Active
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  {stats.totalAssociates}
                </p>
                <p className="text-sm font-semibold text-gray-900">Team Members</p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <ArrowUpRight className="h-3 w-3 text-green-500" />
                  All active this week
                </p>
              </div>
            </div>
          </div>

          <div className="group relative bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-green-500/10 transition-all duration-500 hover:scale-105 hover:bg-white/80">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-lg shadow-green-500/25 group-hover:shadow-green-500/40 transition-all duration-300">
                  <ClipboardList className="h-6 w-6 text-white" />
                </div>
                <div className="flex items-center gap-1 px-3 py-1 bg-green-50 rounded-full text-xs font-medium text-green-700 border border-green-100">
                  <Target className="h-3 w-3" />
                  {stats.totalTasks > 0 ? 'Growing' : 'Start'}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  {stats.totalTasks}
                </p>
                <p className="text-sm font-semibold text-gray-900">Active Tasks</p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Zap className="h-3 w-3 text-blue-500" />
                  {Math.round(stats.totalTasks / stats.totalAssociates * 10) / 10} avg per person
                </p>
              </div>
            </div>
          </div>

          <div className="group relative bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-500 hover:scale-105 hover:bg-white/80">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-indigo-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/40 transition-all duration-300">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${
                  efficiency >= 90 ? 'bg-green-50 text-green-700 border-green-100' : 
                  efficiency >= 70 ? 'bg-yellow-50 text-yellow-700 border-yellow-100' : 
                  'bg-red-50 text-red-700 border-red-100'
                }`}>
                  <TrendingUp className="h-3 w-3" />
                  {efficiency}%
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  {stats.totalHoursLogged}
                  <span className="text-lg text-gray-500">/{stats.totalHoursPlanned}</span>
                </p>
                <p className="text-sm font-semibold text-gray-900">Hours Tracked</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-1000" 
                    style={{width: `${Math.min(efficiency, 100)}%`}}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="group relative bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-500 hover:scale-105 hover:bg-white/80">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl shadow-lg shadow-orange-500/25 group-hover:shadow-orange-500/40 transition-all duration-300">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${
                  stats.pendingTimesheets === 0 ? 'bg-green-50 text-green-700 border-green-100' : 'bg-orange-50 text-orange-700 border-orange-100'
                }`}>
                  <Clock className="h-3 w-3" />
                  {stats.pendingTimesheets === 0 ? 'All Clear' : 'Pending'}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  {stats.pendingTimesheets}
                </p>
                <p className="text-sm font-semibold text-gray-900">Pending Reviews</p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  {stats.pendingTimesheets === 0 ? (
                    <>
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      All caught up!
                    </>
                  ) : (
                    <>
                      <Timer className="h-3 w-3 text-orange-500" />
                      Need attention
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg shadow-black/5 overflow-hidden hover:shadow-xl transition-all duration-500">
            <div className="px-6 py-4 border-b border-white/20 bg-gradient-to-r from-white/20 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Task Distribution</h3>
                  <p className="text-sm text-gray-500">Overview of task allocation</p>
                </div>
                <button className="p-2 hover:bg-white/50 rounded-xl transition-all duration-300 border border-white/20">
                  <MoreVertical className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="h-[300px]">
                <TaskDistributionChart />
              </div>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg shadow-black/5 overflow-hidden hover:shadow-xl transition-all duration-500">
            <div className="px-6 py-4 border-b border-white/20 bg-gradient-to-r from-white/20 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Time Comparison</h3>
                  <p className="text-sm text-gray-500">Planned vs actual hours</p>
                </div>
                <button className="p-2 hover:bg-white/50 rounded-xl transition-all duration-300 border border-white/20">
                  <Download className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="h-[300px]">
                <TimeComparisonChart planned={stats.totalHoursPlanned} actual={stats.totalHoursLogged} />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Recent Tasks Table */}
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg shadow-black/5 overflow-hidden hover:shadow-xl transition-all duration-500">
          <div className="px-6 py-5 border-b border-white/20 bg-gradient-to-r from-white/20 to-transparent">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Recent Tasks</h3>
                <p className="text-sm text-gray-500 mt-1">Latest assigned tasks and their current status</p>
              </div>
              <div className="flex items-center gap-3">
             
                <Link to="/assign-task"   className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 text-sm font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl transform hover:scale-105">
                  <Plus className="h-4 w-4" />
                  Assign New Task
                </Link>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20 bg-gradient-to-r from-gray-50/50 to-transparent">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Task</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Assigned To</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Est. Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20">
                {recentTasks.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center">
                        <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
                          <ClipboardList className="h-12 w-12 text-white" />
                        </div>
                        <p className="text-gray-900 font-semibold text-lg">No tasks assigned yet</p>
                        <p className="text-gray-500 text-sm mt-1 mb-4">Create your first task to get started</p>
                        <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg transform hover:scale-105">
                          <Plus className="h-4 w-4" />
                          Create First Task
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  recentTasks.map((task, index) => (
                    <tr key={task._id} className="hover:bg-white/30 transition-all duration-300 group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                              <span className="text-white font-semibold text-sm">#{index + 1}</span>
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                              {task.description}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">ID: {task._id.slice(-6)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-sm font-semibold shadow-lg">
                            {task.assignedTo?.name ? task.assignedTo.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{task.assignedTo?.name || 'Unknown'}</p>
                            <p className="text-xs text-gray-500">Team Member</p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{format(new Date(task.date), 'MMM dd')}</p>
                            <p className="text-xs text-gray-500">{format(new Date(task.date), 'yyyy')}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="p-1 bg-blue-50 rounded-lg">
                            <Clock className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{task.estimatedHours}h</p>
                            <p className="text-xs text-gray-500">estimated</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

         

          {recentTasks.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <Link
                to="/view-timesheets"
                className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors group"
              >
                View All Timesheets
                <ExternalLink className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ManagerDashboard;


