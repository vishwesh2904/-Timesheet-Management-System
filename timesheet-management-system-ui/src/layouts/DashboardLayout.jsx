import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { 
  Clock, Menu, X, LogOut, User, LayoutDashboard, 
  Clipboard, Calendar, PlusCircle, FileText
} from 'lucide-react';

function DashboardLayout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const isActive = (path) => location.pathname === path;
  
  const managerLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Assign Task', path: '/assign-task', icon: <PlusCircle className="w-5 h-5" /> },
    { name: 'View Timesheets', path: '/view-timesheets', icon: <FileText className="w-5 h-5" /> },
  ];
  
  const associateLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'My Tasks', path: '/my-tasks', icon: <Clipboard className="w-5 h-5" /> },
    { name: 'My Timesheets', path: '/my-timesheets', icon: <Calendar className="w-5 h-5" /> },
  ];
  
  const links = user?.role === 'manager' ? managerLinks : associateLinks;

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      
      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 flex flex-col z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-full ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-blue-600" />
            <h1 className="ml-2 text-xl font-bold text-gray-900 truncate">TimeTrack</h1>
          </div>
          <button
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {/* Sidebar content */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          <nav className="flex-1 px-2 py-4 space-y-1">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  isActive(link.path)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className={`mr-3 ${isActive(link.path) ? 'text-blue-500' : 'text-gray-500'}`}>
                  {link.icon}
                </span>
                {link.name}
              </Link>
            ))}
          </nav>
          
          {/* User profile and logout */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center mb-3">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
            <div className="space-y-1">
              <Link
                to="/profile"
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  isActive('/profile')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <User className={`mr-3 h-5 w-5 ${isActive('/profile') ? 'text-blue-500' : 'text-gray-500'}`} />
                Profile
              </Link>
              <button
                onClick={logout}
                className="flex w-full items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
              >
                <LogOut className="mr-3 h-5 w-5 text-gray-500" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 w-full bg-white shadow-sm flex items-center px-4">
          <button
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="ml-4 lg:ml-0">
            <h1 className="text-xl font-semibold text-gray-800">
              {location.pathname === '/dashboard' && 'Dashboard'}
              {location.pathname === '/assign-task' && 'Assign Task'}
              {location.pathname === '/view-timesheets' && 'View Timesheets'}
              {location.pathname === '/my-tasks' && 'My Tasks'}
              {location.pathname === '/my-timesheets' && 'My Timesheets'}
              {location.pathname === '/profile' && 'Profile'}
            </h1>
          </div>
        </header>
        
        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;