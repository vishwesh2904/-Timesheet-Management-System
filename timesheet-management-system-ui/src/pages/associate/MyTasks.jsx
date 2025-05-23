import React, { useState, useEffect } from 'react';
import { AlertCircle, ChevronLeft, ChevronRight, Calendar, Clock, Plus, Grid3X3, List } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function MyTasks() {


  const base_url = "https://timesheet-management-system-api.vercel.app";
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [weekStart, setWeekStart] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // 'week' or 'day'
  const [selectedDay, setSelectedDay] = useState(new Date());

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(`${base_url}/api/tasks/my`);
        setTasks(response.data.tasks);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError('Failed to load tasks. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchTasks();
  }, []);
  // Mock date functions
  const startOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const isSameDay = (date1, date2) => {
    return date1.toDateString() === date2.toDateString();
  };

  const format = (date, formatStr) => {
    const options = {
      'MMMM d, yyyy': { year: 'numeric', month: 'long', day: 'numeric' },
      'EEE': { weekday: 'short' },
      'd': { day: 'numeric' },
      'EEEE, MMMM d': { weekday: 'long', month: 'long', day: 'numeric' }
    };
    return date.toLocaleDateString('en-US', options[formatStr] || {});
  };

  const parseISO = (dateString) => new Date(dateString);

  const prevWeek = () => {
    setWeekStart(prev => addDays(prev, -7));
  };

  const nextWeek = () => {
    setWeekStart(prev => addDays(prev, 7));
  };

  const setToday = () => {
    const today = new Date();
    setWeekStart(startOfWeek(today));
    setSelectedDay(today);
  };

  const switchToDay = (day) => {
    setViewMode('day');
    setSelectedDay(day);
  };

  const switchToWeek = () => {
    setViewMode('week');
  };

  const weekdays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const dayTasks = tasks?.filter(task => {
    const taskDate = parseISO(task.date);
    return isSameDay(taskDate, selectedDay);
  });

  const MockLink = ({ to, className, children, ...props }) => (
    <div className={className} style={{ cursor: 'pointer' }} {...props}>
      {children}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex justify-center items-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent absolute top-0"></div>
          <div className="mt-4 text-center">
            <p className="text-slate-600 font-medium">Loading tasks...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex justify-center items-center p-4">
        <div className="bg-white rounded-xl shadow-lg border border-red-200 p-8 max-w-md w-full">
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-full bg-red-100 mr-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Error Loading Tasks</h3>
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
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl overflow-hidden border border-white/50">
          {/* Enhanced Header */}
          <div className="px-8 py-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                  {viewMode === 'week' ? (
                    <Grid3X3 className="h-6 w-6 text-white" />
                  ) : (
                    <List className="h-6 w-6 text-white" />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    {viewMode === 'week' ? 'Weekly Schedule' : `Daily Tasks`}
                  </h2>
                  <p className="text-blue-100 mt-1">
                    {viewMode === 'week' 
                      ? `${format(weekStart, 'MMMM d, yyyy')} - ${format(addDays(weekStart, 6), 'MMMM d, yyyy')}`
                      : format(selectedDay, 'MMMM d, yyyy')
                    }
                  </p>
                </div>
              </div>
              
              {/* Navigation Controls */}
              <div className="flex items-center space-x-3">
                {viewMode === 'day' && (
                  <button
                    onClick={switchToWeek}
                    className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm text-white font-medium rounded-xl hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200"
                  >
                    <Grid3X3 className="h-4 w-4 mr-2" />
                    Week View
                  </button>
                )}
                
                <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-xl p-1">
                  <button
                    onClick={prevWeek}
                    className="p-2 rounded-lg text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  
                  <button
                    onClick={setToday}
                    className="px-4 py-2 text-white font-medium hover:bg-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200"
                  >
                    Today
                  </button>
                  
                  <button
                    onClick={nextWeek}
                    className="p-2 rounded-lg text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {viewMode === 'week' ? (
            <div className="grid grid-cols-7 divide-x divide-gray-200/50">
              {/* Enhanced Day Headers */}
              {weekdays.map((day, index) => (
                <div key={index} className="text-center py-4 px-2 bg-gradient-to-b from-gray-50 to-white">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    {format(day, 'EEE')}
                  </p>
                  <button
                    onClick={() => switchToDay(day)}
                    className={`text-lg font-bold p-3 rounded-2xl w-12 h-12 transition-all duration-200 ${
                      isSameDay(day, new Date()) 
                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200/50 scale-110' 
                        : 'hover:bg-blue-50 hover:text-blue-600 hover:scale-105'
                    }`}
                  >
                    {format(day, 'd')}
                  </button>
                </div>
              ))}
              
              {/* Enhanced Tasks Calendar */}
              {weekdays?.map((day, dayIndex) => {
                const dayTasks = tasks.filter(task => {
                  const taskDate = parseISO(task.date);
                  return isSameDay(taskDate, day);
                });
                
                return (
                  <div 
                    key={dayIndex} 
                    className={`p-4 min-h-[200px] transition-colors duration-200 ${
                      isSameDay(day, new Date()) 
                        ? 'bg-gradient-to-b from-blue-50/50 to-indigo-50/50' 
                        : 'hover:bg-gray-50/50'
                    }`}
                  >
                    {dayTasks.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-gray-400">
                        <Calendar className="h-8 w-8 mb-2" />
                        <p className="text-xs font-medium">No tasks</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {dayTasks.map(task => (
                          <div 
                            key={task._id} 
                            className="group p-3 bg-white rounded-xl border border-gray-200/50 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5"
                            onClick={() => switchToDay(day)}
                          >
                            <p className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2">
                              {task.description}
                            </p>
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>{task.estimatedHours}h</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8">
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Tasks for {format(selectedDay, 'EEEE, MMMM d')}
                    </h3>
                    <p className="text-gray-600">
                      {dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'} scheduled
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl">
                    <Calendar className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </div>
              
              {dayTasks.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="p-6 bg-gray-100 rounded-full inline-block mb-6">
                    <Calendar className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No tasks scheduled</h3>
                  <p className="text-gray-500 mb-6">This day is free for you to focus on other priorities.</p>
                  <MockLink
                    to="/create-task"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 hover:shadow-lg"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Task
                  </MockLink>
                </div>
              ) : (
                <div className="grid gap-6">
                  {dayTasks.map((task, index) => (
                    <div 
                      key={task._id} 
                      className="group bg-white rounded-2xl border border-gray-200/50 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-300 overflow-hidden"
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-3">
                              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mr-3"></div>
                              <span className="text-sm font-medium text-gray-500">Task #{index + 1}</span>
                            </div>
                            <h4 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-200">
                              {task.description}
                            </h4>
                            <div className="flex items-center text-sm text-gray-600 mb-4">
                              <Clock className="h-4 w-4 mr-2 text-blue-500" />
                              <span className="font-medium">Estimated: {task.estimatedHours} hours</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <div className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                              Scheduled
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-6 pt-4 border-t border-gray-100">
                          <Link
                            to="/my-timesheets"
                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 hover:shadow-lg hover:shadow-blue-200/50"
                          >
                            <Clock className="h-4 w-4 mr-2" />
                            Log Hours
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyTasks;