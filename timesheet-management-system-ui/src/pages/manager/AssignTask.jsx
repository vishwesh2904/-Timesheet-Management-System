import React, { useState, useEffect } from 'react';
import { UserPlus, AlertCircle, Clock, Calendar, FileText, Users, Sparkles } from 'lucide-react';

function AssignTask() {
  const base_url = "https://timesheet-management-system-api.vercel.app";
  const [associates, setAssociates] = useState([]);
  const [formData, setFormData] = useState({
    description: '',
    estimatedHours: '',
    date: new Date().toISOString().split('T')[0],
    assignedTo: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    const fetchAssociates = async () => {
      try {
        const response = await fetch(`${base_url}/api/users/associates`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Add authorization header if needed
            'Authorization': localStorage.getItem('token')
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const associatesData = data.associates || data.data || data;
        
        // Add avatar initials for each associate
        const associatesWithAvatars = associatesData.map(associate => ({
          ...associate,
          avatar: associate.name ? associate.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'A'
        }));

        setAssociates(associatesWithAvatars);
        if (associatesWithAvatars.length > 0) {
          setFormData(prev => ({ ...prev, assignedTo: associatesWithAvatars[0]._id }));
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching associates:', err);
        setFetchError(`Failed to load associates: ${err.message}`);
        setLoading(false);
      }
    };
    
    fetchAssociates();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
   
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };
  
  const validate = () => {
    const newErrors = {};
    if (!formData.description.trim()) {
      newErrors.description = 'Task description is required';
    }
    
    if (!formData.estimatedHours) {
      newErrors.estimatedHours = 'Estimated hours are required';
    } else if (isNaN(formData.estimatedHours) || Number(formData.estimatedHours) <= 0) {
      newErrors.estimatedHours = 'Estimated hours must be a positive number';
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    
    if (!formData.assignedTo) {
      newErrors.assignedTo = 'Please select an associate';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async () => {
    if (!validate()) return;
    
    setSubmitting(true);
    
    try {
      const taskData = {
        description: formData.description.trim(),
        estimatedHours: parseFloat(formData.estimatedHours),
        date: formData.date,
        assignedTo: formData.assignedTo
      };

      const response = await fetch(`${base_url}/api/tasks/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if needed
          'Authorization': localStorage.getItem('token')
        },
        body: JSON.stringify(taskData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Task assigned successfully:', result);
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      // Reset form
      setFormData({
        description: '',
        estimatedHours: '',
        date: new Date().toISOString().split('T')[0],
        assignedTo: associates.length > 0 ? associates[0]._id : ''
      });
    } catch (error) {
      console.error('Error assigning task:', error);
      setApiError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-blue-600" />
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading associates...</p>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full border border-red-100">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Oops! Something went wrong</h3>
            <p className="text-gray-600 mb-6">{fetchError}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      {/* Success Animation */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 shadow-2xl transform animate-pulse">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Task Assigned Successfully!</h3>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {apiError && (
        <div className="max-w-4xl mx-auto mb-6">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700 font-medium">Failed to assign task: {apiError}</p>
              <button 
                onClick={() => setApiError(null)}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <UserPlus className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Assign New Task</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Create and assign tasks to your team members with detailed specifications and time estimates.
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
          <div className="p-8">
            <div className="space-y-8">
              {/* Task Description */}
              <div className="group">
                <label htmlFor="description" className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <FileText className="h-4 w-4 mr-2 text-blue-600" />
                  Task Description
                </label>
                <div className="relative">
                  <textarea
                    id="description"
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                    className={`w-full rounded-xl border-2 transition-all duration-200 ${
                      errors.description 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-gray-200 focus:border-blue-500 hover:border-gray-300'
                    } shadow-sm focus:ring-2 focus:ring-blue-500/20 resize-none p-4 text-gray-900 placeholder-gray-400`}
                    placeholder="Describe the task in detail. What needs to be accomplished? Any specific requirements or deliverables?"
                  />
                  <div className="absolute bottom-3 right-3">
                    <span className="text-xs text-gray-400">
                      {formData.description.length} characters
                    </span>
                  </div>
                </div>
                {errors.description && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Time and Date Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Estimated Hours */}
                <div className="group">
                  <label htmlFor="estimatedHours" className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                    <Clock className="h-4 w-4 mr-2 text-purple-600" />
                    Estimated Hours
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="estimatedHours"
                      name="estimatedHours"
                      min="0.5"
                      step="0.5"
                      value={formData.estimatedHours}
                      onChange={handleChange}
                      className={`w-full rounded-xl border-2 transition-all duration-200 ${
                        errors.estimatedHours 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-200 focus:border-purple-500 hover:border-gray-300'
                      } shadow-sm focus:ring-2 focus:ring-purple-500/20 p-4 text-gray-900 placeholder-gray-400`}
                      placeholder="e.g., 4.5"
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <span className="text-sm text-gray-400">hours</span>
                    </div>
                  </div>
                  {errors.estimatedHours && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.estimatedHours}
                    </p>
                  )}
                </div>

                {/* Task Date */}
                <div className="group">
                  <label htmlFor="date" className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                    <Calendar className="h-4 w-4 mr-2 text-green-600" />
                    Task Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className={`w-full rounded-xl border-2 transition-all duration-200 ${
                      errors.date 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-gray-200 focus:border-green-500 hover:border-gray-300'
                    } shadow-sm focus:ring-2 focus:ring-green-500/20 p-4 text-gray-900`}
                  />
                  {errors.date && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.date}
                    </p>
                  )}
                </div>
              </div>

              {/* Assign To */}
              <div className="group">
                <label htmlFor="assignedTo" className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <Users className="h-4 w-4 mr-2 text-indigo-600" />
                  Assign To
                </label>
                {associates.length === 0 ? (
                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                    <p className="text-yellow-800 text-sm flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      No associates available. Please add associates to the system first.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {associates?.map(associate => (
                      <label
                        key={associate._id}
                        className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                          formData.assignedTo === associate._id
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="assignedTo"
                          value={associate._id}
                          checked={formData.assignedTo === associate._id}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold mr-4 ${
                          formData.assignedTo === associate._id
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}>
                          {associate.avatar}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{associate.name}</p>
                          <p className="text-sm text-gray-500">{associate.email}</p>
                        </div>
                        {formData.assignedTo === associate._id && (
                          <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                          </div>
                        )}
                      </label>
                    ))}
                  </div>
                )}
                {errors.assignedTo && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.assignedTo}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting || associates.length === 0}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Assigning Task...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <UserPlus className="h-5 w-5 mr-2" />
                      Assign Task
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AssignTask;