import React from 'react';
import { Outlet } from 'react-router-dom';
import { Clock } from 'lucide-react';

function AuthLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center">
            <Clock className="h-8 w-8 text-blue-600" />
            <h1 className="ml-2 text-2xl font-bold text-gray-900">Timesheet Management System</h1>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white py-4 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Timesheet Management System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default AuthLayout;