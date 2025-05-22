import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { UserPlus, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

function AssignTask() {
  const base_url = "https://timesheet-management-system-api.vercel.app";
  const [associates, setAssociates] = useState([]);
  const [formData, setFormData] = useState({
    description: '',
    estimatedHours: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    assignedTo: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    const fetchAssociates = async () => {

      try {
        // Assuming there's an API endpoint to get associates
        // If not, you might need to filter users with 'associate' role from a users endpoint
        const response = await axios.get(`${base_url}/api/users/associates`);
        setAssociates(response.data.associates);
        if (response.data.length > 0) {
          setFormData(prev => ({ ...prev, assignedTo: response.data.associates[0]._id }));
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching associates:', err);
        setFetchError('Failed to load associates. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchAssociates();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    console.log(name, value);
    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };
  
  const validate = () => {
    console.log(formData)
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
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setSubmitting(true);
    
    try {
      await axios.post(`${base_url}/api/tasks/assign`, formData);
      toast.success('Task assigned successfully!');
      // Reset form
      setFormData({
        description: '',
        estimatedHours: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        assignedTo: associates.length > 0 ? associates[0]._id : ''
      });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to assign task';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
        <div className="flex items-center">
          <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
          <p className="text-red-700">{fetchError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">Assign New Task</h2>
          <p className="mt-1 text-sm text-gray-600">
            Create a new task and assign it to an associate.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Task Description
            </label>
            <textarea
              id="description"
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              } shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm`}
              placeholder="Describe the task in detail..."
            ></textarea>
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="estimatedHours" className="block text-sm font-medium text-gray-700">
                Estimated Hours
              </label>
              <input
                type="number"
                id="estimatedHours"
                name="estimatedHours"
                min="0.5"
                step="0.5"
                value={formData.estimatedHours}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border ${
                  errors.estimatedHours ? 'border-red-300' : 'border-gray-300'
                } shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm`}
                placeholder="4"
              />
              {errors.estimatedHours && (
                <p className="mt-1 text-sm text-red-600">{errors.estimatedHours}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                Task Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border ${
                  errors.date ? 'border-red-300' : 'border-gray-300'
                } shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm`}
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date}</p>
              )}
            </div>
          </div>
          
          <div>
            <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700">
              Assign To
            </label>
            {associates.length === 0 ? (
              <p className="mt-1 text-sm text-yellow-600">
                No associates available. Please add associates to the system first.
              </p>
            ) : (
              <select
                id="assignedTo"
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border ${
                  errors.assignedTo ? 'border-red-300' : 'border-gray-300'
                } shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm`}
              >
                {associates?.map(associate => (
                  <option key={associate._id} value={associate._id}>
                    {associate.name} ({associate.email}) {associate._id}
                  </option>
                ))}
              </select>
            )}
            {errors.assignedTo && (
              <p className="mt-1 text-sm text-red-600">{errors.assignedTo}</p>
            )}
          </div>
          
          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting || associates.length === 0}
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {submitting ? (
                <span className="inline-flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Assigning Task...
                </span>
              ) : (
                <span className="inline-flex items-center">
                  <UserPlus className="h-5 w-5 mr-2" />
                  Assign Task
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AssignTask;