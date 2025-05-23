import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import { FileCheck, AlertCircle, Filter, ChevronDown, ChevronUp } from 'lucide-react';

function ViewTimesheets() {
  const base_url = "https://timesheet-management-system-api.vercel.app";
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedTimesheets, setExpandedTimesheets] = useState({});
  const [filters, setFilters] = useState({
    status: 'all', // 'all', 'submitted', 'draft'
    associate: 'all'
  });
  const [associates, setAssociates] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchTimesheets = async () => {
      try {
        const response = await axios.get(`${base_url}/api/timesheets/all`);
        setTimesheets(response.data.timesheets);
        
        // Extract unique associates?
        const uniqueAssociates = [...new Set(response.data.timesheets?.map(ts => ts.userId))];
        setAssociates(uniqueAssociates.map(id => {
          const timesheet = response.data.timesheets?.find(ts => ts.userId === id);
          console.log(timesheet.userId.name)
          return {
            id : timesheet.userId._id,
            name: timesheet.userId.name || 'Unknown'
          };
        }));
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching timesheets:', err);
        setError('Failed to load timesheets. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchTimesheets();
  }, []);

  const toggleTimesheet = (id) => {
    setExpandedTimesheets(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filteredTimesheets = timesheets.filter(timesheet => {
    if (filters.status !== 'all') {
      const isSubmitted = timesheet.status;
      if (filters.status === 'submitted' && !isSubmitted) return false;
      if (filters.status === 'draft' && isSubmitted) return false;
    }
    
    if (filters.associate !== 'all' && timesheet.userId._id !== filters.associate) {
      return false;
    }
    
    return true;
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
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Timesheets</h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Filter className="h-4 w-4 mr-1" />
            Filters
          </button>
        </div>
        
        {/* Filters */}
        {showFilters && (
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
              <select
                id="status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="all">All</option>
                <option value="submitted">Submitted</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="associate" className="block text-sm font-medium text-gray-700">Associate</label>
              <select
                id="associate"
                name="associate"
                value={filters.associate}
                onChange={handleFilterChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="all">All Associates</option>
                {associates.map(associate => (
                  <option key={associate.id} value={associate.id}>
                    {associate.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
        
        {/* Timesheets List */}
        {filteredTimesheets.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500">No timesheets found.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredTimesheets.map(timesheet => (
              <li key={timesheet._id} className="hover:bg-gray-50">
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleTimesheet(timesheet._id)}>
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                           timesheet.status==='submitted' ? 'bg-green-100' : 'bg-yellow-100'
                        }`}>
                          <FileCheck className={`h-6 w-6 ${
                            timesheet.status ==='submitted' ? 'text-green-600' : 'text-yellow-600'
                          }`} />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {timesheet?.userId?.name || 'Unknown User'}
                        </div>
                        <div className="text-sm text-gray-500">
                          Week of {format(parseISO(timesheet.weekStart), 'MMM dd, yyyy')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                       timesheet.status ==='submitted'
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {timesheet?.status === 'submitted' ? 'Submitted' : 'Draft'}
                      </span>
                      <div className="ml-4">
                        {expandedTimesheets[timesheet._id] ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Expanded Timesheet Details */}
                  {expandedTimesheets[timesheet._id] && (
                    <div className="mt-4 border-t border-gray-200 pt-4">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Est. Hours</th>
                              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actual Hours</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {timesheet.entries.map((entry, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                  {format(parseISO(entry?.taskId?.date), 'MMM dd, yyyy')}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                  {entry?.taskId?.description || 'Unknown Task'}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                  {entry?.taskId?.estimatedHours || 'N/A'}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                  {entry?.taskId?.actualHours}
                                </td>
                              </tr>
                            ))}
                            
                            {/* Total Row */}
                            <tr className="bg-gray-50">
                              <td colSpan="2" className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                                Total Hours:
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                {timesheet.entries.reduce((sum, entry) => sum + (entry.estimatedHours || 0), 0)}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                {timesheet.entries.reduce((sum, entry) => sum + entry.actualHours, 0)}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      
                      {timesheet.submitted && (
                        <div className="mt-4 text-xs text-gray-500">
                          Submitted on {format(parseISO(timesheet.submittedAt), 'MMM dd, yyyy HH:mm')}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default ViewTimesheets;