import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, parseISO, startOfWeek, endOfWeek, isSameDay } from 'date-fns';
import { Clock, CheckCircle, AlertCircle, Calendar, FileText, TrendingUp, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import WeeklyHoursChart from '../../components/WeeklyHoursChart.jsx';

function AssociateDashboard() {
  const base_url = "https://timesheet-management-system-api.vercel.app";
  const [tasks, setTasks] = useState([]);
  const [timesheets, setTimesheets] = useState([]);
  const [todaysTasks, setTodaysTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    tasksCompleted: 0,
    tasksInProgress: 0,
    hoursLogged: 0,
    weeklyCompletion: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch tasks
        const tasksResponse = await axios.get(`${base_url}/api/tasks/my`);
        const fetchedTasks = tasksResponse.data.tasks;
        setTasks(fetchedTasks);
        
        // Fetch timesheets
        const timesheetsResponse = await axios.get(`${base_url}/api/timesheets/my`);
        const fetchedTimesheets = timesheetsResponse.data.timesheets;
        setTimesheets(fetchedTimesheets);
        
        // Filter today's tasks
        const today = new Date();
        const todayTasks = fetchedTasks?.filter(task => {
          const taskDate = parseISO(task.date);
          return isSameDay(taskDate, today);
        });
        setTodaysTasks(todayTasks);
        
        // Calculate stats
        const completedEntries = fetchedTimesheets?.flatMap(ts => ts.entries);
        
        const tasksWithEntries = new Set(completedEntries?.map(entry => entry.taskId));
        
        // Count completed tasks (those with logged hours)
        const completedTasksCount = tasksWithEntries?.size;
        
        // Count in-progress tasks (assigned but not completed)
        const inProgressTasksCount = fetchedTasks?.length - completedTasksCount;
        
        // Total hours logged
        const totalHoursLogged = completedEntries?.reduce((sum, entry) => sum + entry.actualHours, 0);
        
        // Weekly completion percentage
        const currentWeekStart = startOfWeek(today);
        const currentWeekEnd = endOfWeek(today);
        
        const currentWeekTasks = fetchedTasks?.filter(task => {
          const taskDate = parseISO(task.date);
          return taskDate >= currentWeekStart && taskDate <= currentWeekEnd;
        });
        
        const currentWeekCompletedTasks = currentWeekTasks?.filter(task => 
          completedEntries?.some(entry => entry.taskId === task._id)
        );
        
        const weeklyCompletion = currentWeekTasks.length > 0 
          ? (currentWeekCompletedTasks.length / currentWeekTasks.length) * 100 
          : 0;
        
        setStats({
          tasksCompleted: completedTasksCount,
          tasksInProgress: inProgressTasksCount,
          hoursLogged: totalHoursLogged,
          weeklyCompletion
        });
        
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex justify-center items-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent absolute top-0"></div>
          <div className="mt-4 text-center">
            <p className="text-slate-600 font-medium">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex justify-center items-center p-4">
        <div className="bg-white rounded-xl shadow-lg border border-red-200 p-8 max-w-md w-full">
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-full bg-red-100 mr-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Error Loading Dashboard</h3>
              <p className="text-red-600 mt-1">{error}</p>
            </div>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="w-full mt-4 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
          <p className="text-gray-600">Track your tasks, hours, and progress at a glance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 p-6 hover:shadow-xl hover:shadow-green-100/50 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center space-x-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg shadow-green-200/50 group-hover:shadow-green-300/60 transition-all duration-300">
                <CheckCircle className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Tasks Completed</p>
                <p className="text-3xl font-bold text-gray-900">{stats.tasksCompleted}</p>
              </div>
            </div>
          </div>
          
          <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 p-6 hover:shadow-xl hover:shadow-amber-100/50 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center space-x-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-200/50 group-hover:shadow-amber-300/60 transition-all duration-300">
                <Clock className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Tasks In Progress</p>
                <p className="text-3xl font-bold text-gray-900">{stats.tasksInProgress}</p>
              </div>
            </div>
          </div>
          
          <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 p-6 hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center space-x-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 shadow-lg shadow-blue-200/50 group-hover:shadow-blue-300/60 transition-all duration-300">
                <BarChart3 className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Hours Logged</p>
                <p className="text-3xl font-bold text-gray-900">{stats.hoursLogged}</p>
              </div>
            </div>
          </div>
          
          <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 p-6 hover:shadow-xl hover:shadow-purple-100/50 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center space-x-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-400 to-violet-500 shadow-lg shadow-purple-200/50 group-hover:shadow-purple-300/60 transition-all duration-300">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Weekly Completion</p>
                <p className="text-3xl font-bold text-gray-900">{Math.round(stats.weeklyCompletion)}%</p>
              </div>
            </div>
          </div>
        </div>
      
        
        {/* Today's Tasks */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 overflow-hidden hover:shadow-lg transition-all duration-300">
          <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Today's Tasks</h3>
              <p className="text-gray-600">Focus on what needs to be done today</p>
            </div>
            <Link 
              to="/my-tasks"
              className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 hover:shadow-lg hover:shadow-blue-200/50"
            >
              View All Tasks
            </Link>
          </div>
          
          {todaysTasks?.length === 0 ? (
            <div className="px-8 py-12 text-center">
              <div className="p-4 rounded-full bg-gray-100 inline-block mb-4">
                <Calendar className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">No tasks scheduled for today.</p>
              <p className="text-gray-400 text-sm mt-1">Enjoy your free time or check upcoming tasks!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {todaysTasks?.map(task => (
                <div key={task._id} className="px-8 py-6 hover:bg-blue-50/50 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-base font-semibold text-gray-900 mb-2">{task.description}</p>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Estimated: {task.estimatedHours} hours</span>
                      </div>
                    </div>
                    <Link
                      to="/my-timesheets"
                      className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 text-sm font-medium rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 ml-4"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Log Hours
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Recent Timesheets */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 overflow-hidden hover:shadow-lg transition-all duration-300">
          <div className="px-8 py-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100/50 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Recent Timesheets</h3>
              <p className="text-gray-600">Keep track of your submitted work</p>
            </div>
            <Link 
              to="/my-timesheets"
              className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 hover:shadow-lg hover:shadow-indigo-200/50"
            >
              Manage Timesheets
            </Link>
          </div>
          
          {timesheets?.length === 0 ? (
            <div className="px-8 py-12 text-center">
              <div className="p-4 rounded-full bg-gray-100 inline-block mb-4">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">No timesheets available yet.</p>
              <p className="text-gray-400 text-sm mt-1">Start logging your hours to see timesheets here!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {timesheets?.slice(0, 3).map(timesheet => (
                <div key={timesheet._id} className="px-8 py-6 hover:bg-indigo-50/50 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-base font-semibold text-gray-900 mb-2">
                        Week of {format(parseISO(timesheet.weekStart), 'MMM dd, yyyy')}
                      </p>
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <span className="flex items-center">
                          <FileText className="h-4 w-4 mr-1" />
                          {timesheet.entries.length} entries
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {timesheet.entries.reduce((sum, entry) => sum + entry.actualHours, 0)} hours logged
                        </span>
                      </div>
                    </div>
                    <span className={`px-4 py-2 text-sm font-semibold rounded-full ${
                      timesheet.status === 'submitted' 
                        ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200' 
                        : 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border border-amber-200'
                    }`}>
                      {timesheet.status === 'submitted' ? 'Submitted' : 'Draft'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AssociateDashboard;