import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { User, Mail, Briefcase, LogOut } from 'lucide-react';

function Profile() {
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-16">
          <div className="flex justify-center">
            <div className="h-32 w-32 rounded-full bg-white flex items-center justify-center p-1">
              <div className="h-full w-full rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-16 w-16 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="px-6 py-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center">
            {user?.name}
          </h2>
          <p className="mt-1 text-gray-500 text-center capitalize">{user?.role}</p>
          
          <div className="mt-8 space-y-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Email Address</p>
                <p className="text-lg text-gray-900">{user?.email}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Role</p>
                <p className="text-lg text-gray-900 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-12">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isLoggingOut ? (
                <span className="inline-flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging out...
                </span>
              ) : (
                <span className="inline-flex items-center">
                  <LogOut className="h-5 w-5 mr-2" />
                  Sign Out
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;