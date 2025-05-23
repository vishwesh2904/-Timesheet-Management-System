import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, parseISO, startOfWeek, endOfWeek, isSameDay } from 'date-fns';
import { Clock, CheckCircle, AlertCircle, Calendar, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import WeeklyHoursChart from '../../components/WeeklyHoursChart.jsx';

function AssociateDashboard() {
  const base_url = "http://localhost:5000";
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
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6 flex items-center space-x-4 transform transition-all duration-300 hover:scale-105">
          <div className="p-3 rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Tasks Completed</p>
            <p className="text-2xl font-bold text-gray-900">{stats.tasksCompleted}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 flex items-center space-x-4 transform transition-all duration-300 hover:scale-105">
          <div className="p-3 rounded-full bg-yellow-100">
            <Clock className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Tasks In Progress</p>
            <p className="text-2xl font-bold text-gray-900">{stats.tasksInProgress}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 flex items-center space-x-4 transform transition-all duration-300 hover:scale-105">
          <div className="p-3 rounded-full bg-blue-100">
            <Clock className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Hours Logged</p>
            <p className="text-2xl font-bold text-gray-900">{stats.hoursLogged}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 flex items-center space-x-4 transform transition-all duration-300 hover:scale-105">
          <div className="p-3 rounded-full bg-purple-100">
            <Calendar className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Weekly Completion</p>
            <p className="text-2xl font-bold text-gray-900">{Math.round(stats.weeklyCompletion)}%</p>
          </div>
        </div>
      </div>
      
      {/* Weekly Hours Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Weekly Hours</h3>
        <div className="h-64">
          <WeeklyHoursChart timesheets={timesheets} />
        </div>
      </div>
      
      {/* Today's Tasks */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">Today's Tasks</h3>
          <Link 
            to="/my-tasks"
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            View All Tasks
          </Link>
        </div>
        
        {todaysTasks?.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-gray-500">No tasks scheduled for today.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {todaysTasks?.map(task => (
              <li key={task._id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{task.description}</p>
                    <p className="text-xs text-gray-500">
                      Estimated hours: {task.estimatedHours}
                    </p>
                  </div>
                  <Link
                    to="/my-timesheets"
                    className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    Log Hours
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {/* Recent Timesheets */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">Recent Timesheets</h3>
          <Link 
            to="/my-timesheets"
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Manage Timesheets
          </Link>
        </div>
        
        {timesheets?.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-gray-500">No timesheets available yet.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {timesheets?.slice(0, 3).map(timesheet => (
              <li key={timesheet._id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Week of {format(parseISO(timesheet.weekStart), 'MMM dd, yyyy')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {timesheet.entries.length} entries &middot; {
                        timesheet.entries.reduce((sum, entry) => sum + entry.actualHours, 0)
                      } hours logged
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    timesheet.status === 'submitted' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {timesheet.status === 'submitted' ? 'Submitted' : 'Draft'}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default AssociateDashboard;