import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Building2,
  Package,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  Home,
  ShoppingCart,
  CheckSquare,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getNavigationItems = () => {
    const baseItems = [{ name: 'Dashboard', href: '/dashboard', icon: Home }];
    if (user?.role === 'admin') {
      return [
        ...baseItems,
        { name: 'Properties', href: '/properties', icon: Package },
        { name: 'Requests', href: '/requests', icon: FileText },
        { name: 'Reports', href: '/reports', icon: BarChart3 },
        { name: 'Settings', href: '/settings', icon: Settings },
      ];
    } else if (user?.role === 'user') {
      return [
        ...baseItems,
        { name: 'Available Properties', href: '/available-properties', icon: Package },
        { name: 'My Requests', href: '/my-requests', icon: ShoppingCart },
      ];
    } else if (user?.role === 'store_manager') {
      return [
        ...baseItems,
        { name: 'Issue Properties', href: '/issue-properties', icon: CheckSquare },
        { name: 'Issued Properties', href: '/issued-properties', icon: FileText },
        { name: 'Reports', href: '/reports', icon: BarChart3 },
      ];
    }
    return baseItems;
  };

  const navigationItems = getNavigationItems();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Overlay for all screen sizes */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 xl:w-72 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 xl:h-20 px-4 xl:px-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Building2 className="w-8 h-8 xl:w-10 xl:h-10 text-primary-600" />
            <div>
              <h1 className="text-lg xl:text-xl font-bold text-gray-900">IRD Properties</h1>
              <p className="text-xs xl:text-sm text-gray-500">EDU - IRD</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600"
            aria-label="Close sidebar"
            title="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-6 px-3 xl:px-4">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    navigate(item.href);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-3 xl:px-4 py-3 xl:py-3.5 text-sm xl:text-base font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="mr-3 xl:mr-4 h-5 w-5 xl:h-6 xl:w-6" />
                  {item.name}
                </button>
              );
            })}
          </div>
        </nav>

        {/* User info and logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 xl:p-6 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 xl:w-12 xl:h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 xl:w-6 xl:h-6 text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm xl:text-base font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs xl:text-sm text-gray-500 capitalize">
                {user?.role?.replace('_', ' ')}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 xl:px-4 py-2.5 xl:py-3 text-sm xl:text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="mr-3 xl:mr-4 h-4 w-4 xl:h-5 xl:w-5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 min-h-screen transition-all duration-300 ${sidebarOpen ? 'pl-64 xl:pl-72' : 'pl-0'}`}>
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 xl:h-20 px-4 xl:px-8">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600"
              aria-label="Open sidebar"
              title="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-4 xl:space-x-6">
              <div className="text-right">
                <p className="text-sm xl:text-base font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs xl:text-sm text-gray-500">{user?.department}</p>
              </div>
              <div className="w-8 h-8 xl:w-10 xl:h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 xl:w-5 xl:h-5 text-primary-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-4 xl:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
