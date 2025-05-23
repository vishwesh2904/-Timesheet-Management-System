import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, parseISO, startOfWeek, addDays, isSameDay } from 'date-fns';
import { AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

function MyTasks() {
  const base_url = "http://localhost:5000";
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
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

  const prevWeek = () => {
    setWeekStart(prev => addDays(prev, -7));
  };

  const nextWeek = () => {
    setWeekStart(prev => addDays(prev, 7));
  };

  const setToday = () => {
    setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
    setSelectedDay(new Date());
  };

  const switchToDay = (day) => {
    setViewMode('day');
    setSelectedDay(day);
  };

  const switchToWeek = () => {
    setViewMode('week');
  };

  // Generate weekdays
  const weekdays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Filter tasks for the selected day
  const dayTasks = tasks?.filter(task => {
    const taskDate = parseISO(task.date);
    return isSameDay(taskDate, selectedDay);
  });

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
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Header with Navigation */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              {viewMode === 'week' ? 'Weekly Schedule' : `Tasks for ${format(selectedDay, 'MMMM d, yyyy')}`}
            </h2>
            <div className="flex space-x-2">
              {viewMode === 'day' && (
                <button
                  onClick={switchToWeek}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  View Week
                </button>
              )}
              <button
                onClick={prevWeek}
                className="inline-flex items-center p-1 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={setToday}
                className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Today
              </button>
              <button
                onClick={nextWeek}
                className="inline-flex items-center p-1 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {format(weekStart, 'MMMM d, yyyy')} - {format(addDays(weekStart, 6), 'MMMM d, yyyy')}
          </div>
        </div>
        
        {viewMode === 'week' ? (
          <div className="grid grid-cols-7 divide-x divide-gray-200">
            {/* Day Headers */}
            {weekdays.map((day, index) => (
              <div key={index} className="text-center py-2 px-1 bg-gray-50">
                <p className="text-xs font-medium text-gray-500">{format(day, 'EEE')}</p>
                <button
                  onClick={() => switchToDay(day)}
                  className={`text-sm font-semibold mt-1 p-1 rounded-full w-8 h-8 ${
                    isSameDay(day, new Date()) 
                      ? 'bg-blue-500 text-white' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {format(day, 'd')}
                </button>
              </div>
            ))}
            
            {/* Tasks Calendar */}
            {weekdays?.map((day, dayIndex) => {
              const dayTasks = tasks.filter(task => {
                const taskDate = parseISO(task.date);
                return isSameDay(taskDate, day);
              });
              
              return (
                <div 
                  key={dayIndex} 
                  className={`p-2 min-h-[150px] ${isSameDay(day, new Date()) ? 'bg-blue-50' : ''}`}
                >
                  {dayTasks.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-xs text-gray-400">
                      No tasks
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {dayTasks.map(task => (
                        <li 
                          key={task._id} 
                          className="p-2 bg-white rounded border border-gray-200 shadow-sm text-xs hover:bg-gray-50"
                        >
                          <p className="font-medium truncate">{task.description}</p>
                          <p className="text-gray-500 mt-1">{task.estimatedHours} hours</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Tasks for {format(selectedDay, 'EEEE, MMMM d')}
              </h3>
            </div>
            
            {dayTasks.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-gray-500">No tasks scheduled for this day.</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {dayTasks.map(task => (
                  <li 
                    key={task._id} 
                    className="p-4 bg-white rounded-lg border border-gray-200 shadow"
                  >
                    <h4 className="font-medium text-gray-900">{task.description}</h4>
                    <p className="text-gray-500 mt-1">Estimated: {task.estimatedHours} hours</p>
                    <div className="mt-4">
                      <Link
                        to="/my-timesheets"
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Log Hours
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyTasks;