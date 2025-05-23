import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  format, parseISO, startOfWeek, endOfWeek, addWeeks, isSameWeek, 
  eachDayOfInterval, getDay, isSameDay
} from 'date-fns';
import { AlertCircle, Check, Calendar, ChevronLeft, ChevronRight, Save } from 'lucide-react';
import toast from 'react-hot-toast';

function MyTimesheets() {
  const base_url = "https://timesheet-management-system-api.vercel.app";
  const [tasks, setTasks] = useState([]);
  const [timesheets, setTimesheets] = useState([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [timeEntries, setTimeEntries] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get current week's timesheet (if it exists)
  const currentWeekTimesheet = timesheets.find(ts => 
    isSameWeek(parseISO(ts.weekStart), currentWeekStart, { weekStartsOn: 1 })
  );

  // Check if current week is submitted
  const isWeekSubmitted = currentWeekTimesheet?.submitted || false;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch tasks
        const tasksResponse = await axios.get(`${base_url}/api/tasks/my`);
        setTasks(tasksResponse.data.tasks);
        
        // Fetch timesheets
        const timesheetsResponse = await axios.get(`${base_url}/api/timesheets/my`);
        setTimesheets(timesheetsResponse.data.timesheets);
        
        // Initialize time entries from current week's timesheet (if it exists)
        if (currentWeekTimesheet) {
          const entries = {};
          currentWeekTimesheet.entries.forEach(entry => {
            entries[`${entry.taskId}-${entry.date}`] = entry.actualHours;
          });
          setTimeEntries(entries);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load timesheet data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [currentWeekStart]);

  const prevWeek = () => {
    setCurrentWeekStart(prev => addWeeks(prev, -1));
  };

  const nextWeek = () => {
    setCurrentWeekStart(prev => addWeeks(prev, 1));
  };

  const currentWeek = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  const handleHoursChange = (taskId, date, hours) => {
    if (isWeekSubmitted) return; // Don't allow changes if submitted
    
    const key = `${taskId}-${date}`;
    const parsedHours = hours === '' ? '' : parseFloat(hours);
    
    setTimeEntries(prev => ({
      ...prev,
      [key]: parsedHours
    }));
  };

  const saveTimesheet = async () => {
    if (isWeekSubmitted) return;
    
    setIsSaving(true);
    
    // Convert timeEntries to the format expected by the API
    const entries = Object.entries(timeEntries)
      .filter(([_, hours]) => hours !== '' && !isNaN(hours))
      .map(([key, hours]) => {
        const [taskId, date] = key.split('-');
        return {
          taskId,
          date,
          actualHours: parseFloat(hours)
        };
      });
    
    try {
      await axios.post(`${base_url}/api/timesheets/save`, {
        weekStart: format(currentWeekStart, 'yyyy-MM-dd'),
        entries
      });
      
      toast.success('Timesheet saved successfully!');
      
      // Refresh timesheets
      const timesheetsResponse = await axios.get(`${base_url}/api/timesheets/my`);
      setTimesheets(timesheetsResponse.data);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to save timesheet';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const submitTimesheet = async () => {
    if (isWeekSubmitted) return;
    
    // First save the timesheet
    await saveTimesheet();
    
    setIsSubmitting(true);
    
    try {
      await axios.post(`${base_url}/api/timesheets/submit`, {
        weekStart: format(currentWeekStart, 'yyyy-MM-dd')
      });
      
      toast.success('Timesheet submitted successfully!');
      
      // Refresh timesheets
      const timesheetsResponse = await axios.get(`${base_url}/api/timesheets/my`);
      setTimesheets(timesheetsResponse.data);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to submit timesheet';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get week days
  const weekDays = eachDayOfInterval({
    start: currentWeekStart,
    end: endOfWeek(currentWeekStart, { weekStartsOn: 1 })
  });

  // Filter tasks for current week
  const weekTasks = tasks.filter(task => {
    const taskDate = parseISO(task.date);
    return taskDate >= currentWeekStart && taskDate <= endOfWeek(currentWeekStart, { weekStartsOn: 1 });
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
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Weekly Timesheet</h2>
            <div className="flex space-x-2">
              <button
                onClick={prevWeek}
                className="inline-flex items-center p-1 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={currentWeek}
                className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Current Week
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
            Week of {format(currentWeekStart, 'MMMM d, yyyy')}
            {isWeekSubmitted && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Submitted
              </span>
            )}
          </div>
        </div>
        
        {/* Timesheet Form */}
        <div className="px-6 py-4">
          {weekTasks.length === 0 ? (
            <div className="py-10 text-center">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks for this week</h3>
              <p className="mt-1 text-sm text-gray-500">
                There are no tasks assigned to you for this week.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Task
                    </th>
                    {weekDays.map((day, index) => (
                      <th key={index} scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div>{format(day, 'EEE')}</div>
                        <div>{format(day, 'MMM d')}</div>
                      </th>
                    ))}
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {weekTasks.map(task => {
                    const taskDate = parseISO(task.date);
                    const dayOfWeek = getDay(taskDate);
                    
                    // Calculate total hours for this task
                    const totalHours = weekDays.reduce((sum, day) => {
                      const key = `${task._id}-${format(day, 'yyyy-MM-dd')}`;
                      const hours = timeEntries[key] || 0;
                      return sum + (hours === '' ? 0 : parseFloat(hours));
                    }, 0);
                    
                    return (
                      <tr key={task._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <div>{task.description}</div>
                          <div className="text-xs text-gray-500">Est: {task.estimatedHours} hrs</div>
                        </td>
                        {weekDays.map((day, dayIndex) => {
                          const isTaskDay = isSameDay(day, taskDate);
                          const key = `${task._id}-${format(day, 'yyyy-MM-dd')}`;
                          
                          return (
                            <td key={dayIndex} className="px-3 py-4 whitespace-nowrap text-sm text-center">
                              <input
                                type="number"
                                min="0"
                                step="0.5"
                                value={timeEntries[key] || ''}
                                onChange={(e) => handleHoursChange(task._id, format(day, 'yyyy-MM-dd'), e.target.value)}
                                disabled={isWeekSubmitted}
                                className={`w-16 p-1 text-center border rounded ${
                                  isTaskDay ? 'border-blue-300 bg-blue-50' : 'border-gray-300'
                                } ${isWeekSubmitted ? 'bg-gray-100' : ''}`}
                                placeholder={isTaskDay ? task.estimatedHours : '0'}
                              />
                            </td>
                          );
                        })}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium">
                          {totalHours.toFixed(1)} hrs
                        </td>
                      </tr>
                    );
                  })}
                  
                  {/* Daily Totals Row */}
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Daily Total
                    </td>
                    {weekDays.map((day, dayIndex) => {
                      // Calculate total hours for this day
                      const dailyTotal = weekTasks.reduce((sum, task) => {
                        const key = `${task._id}-${format(day, 'yyyy-MM-dd')}`;
                        const hours = timeEntries[key] || 0;
                        return sum + (hours === '' ? 0 : parseFloat(hours));
                      }, 0);
                      
                      return (
                        <td key={dayIndex} className="px-3 py-4 whitespace-nowrap text-sm font-medium text-center">
                          {dailyTotal.toFixed(1)} hrs
                        </td>
                      );
                    })}
                    
                    {/* Weekly Total */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                      {weekTasks.reduce((sum, task) => {
                        const taskTotal = weekDays.reduce((daySum, day) => {
                          const key = `${task._id}-${format(day, 'yyyy-MM-dd')}`;
                          const hours = timeEntries[key] || 0;
                          return daySum + (hours === '' ? 0 : parseFloat(hours));
                        }, 0);
                        return sum + taskTotal;
                      }, 0).toFixed(1)} hrs
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Actions */}
        {!isWeekSubmitted && weekTasks.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-4">
            <button
              onClick={saveTimesheet}
              disabled={isSaving}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isSaving ? (
                <span className="inline-flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                <span className="inline-flex items-center">
                  <Save className="h-5 w-5 mr-2" />
                  Save as Draft
                </span>
              )}
            </button>
            <button
              onClick={submitTimesheet}
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isSubmitting ? (
                <span className="inline-flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                <span className="inline-flex items-center">
                  <Check className="h-5 w-5 mr-2" />
                  Submit Timesheet
                </span>
              )}
            </button>
          </div>
        )}
      </div>
      
      {/* Previous Timesheets */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Previous Timesheets</h3>
        </div>
        
        {timesheets.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-gray-500">No previous timesheets available.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {timesheets.map(timesheet => (
              <li key={timesheet._id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Week of {format(parseISO(timesheet.weekStart), 'MMMM d, yyyy')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {timesheet.entries.length} entries &middot; {
                        timesheet.entries.reduce((sum, entry) => sum + entry.actualHours, 0)
                      } hours logged
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    timesheet.status  === 'submitted'
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {   timesheet.status  === 'submitted'? 'Submitted' : 'Draft'}
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

export default MyTimesheets;