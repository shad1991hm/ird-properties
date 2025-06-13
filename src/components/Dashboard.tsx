import React from 'react';
import { Package, FileText, CheckSquare, TrendingUp, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { properties, requests, issuedProperties, loading } = useData();

  const getStats = () => {
    const totalProperties = properties.reduce((sum, p) => sum + p.quantity, 0);
    const totalValue = properties.reduce((sum, p) => sum + p.totalPrice, 0);
    const lowStockItems = properties.filter(p => p.availableQuantity < p.quantity * 0.1).length;
    const pendingRequests = requests.filter(r => r.status === 'pending').length;
    const approvedRequests = requests.filter(r => r.status === 'approved' || r.status === 'adjusted').length;
    const issuedToday = issuedProperties.filter(ip => 
      new Date(ip.issuedAt).toDateString() === new Date().toDateString()
    ).length;

    return {
      totalProperties,
      totalValue,
      lowStockItems,
      pendingRequests,
      approvedRequests,
      issuedToday,
      userRequests: requests.filter(r => r.userId === user?.id).length,
      userPendingRequests: requests.filter(r => r.userId === user?.id && r.status === 'pending').length
    };
  };

  const stats = getStats();

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
    change?: string;
  }> = ({ title, value, icon: Icon, color, change }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 xl:p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 xl:p-4 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 xl:w-7 xl:h-7 text-white" />
        </div>
        {change && (
          <span className="text-sm xl:text-base text-green-600 font-medium">{change}</span>
        )}
      </div>
      <div>
        <p className="text-2xl xl:text-3xl font-bold text-gray-900">{value}</p>
        <p className="text-sm xl:text-base text-gray-600">{title}</p>
      </div>
    </div>
  );

  const RecentActivity: React.FC = () => {
    const recentRequests = requests
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'pending': return 'bg-warning-100 text-warning-800';
        case 'approved': return 'bg-success-100 text-success-800';
        case 'rejected': return 'bg-error-100 text-error-800';
        case 'adjusted': return 'bg-primary-100 text-primary-800';
        case 'issued': return 'bg-secondary-100 text-secondary-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 xl:p-6">
        <h3 className="text-lg xl:text-xl font-semibold text-gray-900 mb-4 xl:mb-6">Recent Activity</h3>
        <div className="space-y-4">
          {recentRequests.map((request) => (
            <div key={request.id} className="flex items-center justify-between py-2 xl:py-3">
              <div className="flex-1">
                <p className="text-sm xl:text-base font-medium text-gray-900">{request.propertyName}</p>
                <p className="text-xs xl:text-sm text-gray-500">
                  Requested by {request.userName} • {new Date(request.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span className={`px-2 py-1 xl:px-3 xl:py-1.5 text-xs xl:text-sm font-medium rounded-full ${getStatusColor(request.status)}`}>
                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
              </span>
            </div>
          ))}
          {recentRequests.length === 0 && (
            <p className="text-sm xl:text-base text-gray-500 text-center py-4 xl:py-6">No recent activity</p>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 xl:w-16 xl:h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-gray-600 text-base xl:text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const renderAdminDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 xl:gap-6 mb-6 xl:mb-8">
        <StatCard
          title="Total Properties"
          value={stats.totalProperties}
          icon={Package}
          color="bg-primary-600"
          change="+12%"
        />
        <StatCard
          title="Total Value"
          value={`${stats.totalValue.toLocaleString()} ETB`}
          icon={TrendingUp}
          color="bg-secondary-600"
          change="+8%"
        />
        <StatCard
          title="Pending Requests"
          value={stats.pendingRequests}
          icon={FileText}
          color="bg-warning-600"
        />
        <StatCard
          title="Low Stock Items"
          value={stats.lowStockItems}
          icon={AlertTriangle}
          color="bg-error-600"
        />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 xl:gap-6">
        <RecentActivity />
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 xl:p-6">
          <h3 className="text-lg xl:text-xl font-semibold text-gray-900 mb-4 xl:mb-6">Quick Actions</h3>
          <div className="space-y-3 xl:space-y-4">
            <button className="w-full text-left p-3 xl:p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3 xl:space-x-4">
                <Package className="w-5 h-5 xl:w-6 xl:h-6 text-primary-600" />
                <span className="text-sm xl:text-base font-medium">Register New Property</span>
              </div>
            </button>
            <button className="w-full text-left p-3 xl:p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3 xl:space-x-4">
                <FileText className="w-5 h-5 xl:w-6 xl:h-6 text-secondary-600" />
                <span className="text-sm xl:text-base font-medium">View Pending Requests</span>
              </div>
            </button>
            <button className="w-full text-left p-3 xl:p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3 xl:space-x-4">
                <TrendingUp className="w-5 h-5 xl:w-6 xl:h-6 text-accent-600" />
                <span className="text-sm xl:text-base font-medium">Generate Reports</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );

  const renderUserDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 xl:gap-6 mb-6 xl:mb-8">
        <StatCard
          title="Available Properties"
          value={properties.length}
          icon={Package}
          color="bg-primary-600"
        />
        <StatCard
          title="My Requests"
          value={stats.userRequests}
          icon={FileText}
          color="bg-secondary-600"
        />
        <StatCard
          title="Pending Requests"
          value={stats.userPendingRequests}
          icon={AlertTriangle}
          color="bg-warning-600"
        />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 xl:gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 xl:p-6">
          <h3 className="text-lg xl:text-xl font-semibold text-gray-900 mb-4 xl:mb-6">My Recent Requests</h3>
          <div className="space-y-4">
            {requests
              .filter(r => r.userId === user?.id)
              .slice(0, 5)
              .map((request) => (
                <div key={request.id} className="flex items-center justify-between py-2 xl:py-3">
                  <div className="flex-1">
                    <p className="text-sm xl:text-base font-medium text-gray-900">{request.propertyName}</p>
                    <p className="text-xs xl:text-sm text-gray-500">
                      Quantity: {request.requestedQuantity} • {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 xl:px-3 xl:py-1.5 text-xs xl:text-sm font-medium rounded-full ${
                    request.status === 'pending' ? 'bg-warning-100 text-warning-800' :
                    request.status === 'approved' ? 'bg-success-100 text-success-800' :
                    request.status === 'rejected' ? 'bg-error-100 text-error-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>
              ))}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 xl:p-6">
          <h3 className="text-lg xl:text-xl font-semibold text-gray-900 mb-4 xl:mb-6">Quick Actions</h3>
          <div className="space-y-3 xl:space-y-4">
            <button className="w-full text-left p-3 xl:p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3 xl:space-x-4">
                <Package className="w-5 h-5 xl:w-6 xl:h-6 text-primary-600" />
                <span className="text-sm xl:text-base font-medium">Browse Available Properties</span>
              </div>
            </button>
            <button className="w-full text-left p-3 xl:p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3 xl:space-x-4">
                <FileText className="w-5 h-5 xl:w-6 xl:h-6 text-secondary-600" />
                <span className="text-sm xl:text-base font-medium">Submit New Request</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );

  const renderStoreManagerDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 xl:gap-6 mb-6 xl:mb-8">
        <StatCard
          title="Approved Requests"
          value={stats.approvedRequests}
          icon={CheckSquare}
          color="bg-primary-600"
        />
        <StatCard
          title="Issued Today"
          value={stats.issuedToday}
          icon={Package}
          color="bg-secondary-600"
        />
        <StatCard
          title="Total Issued"
          value={issuedProperties.length}
          icon={TrendingUp}
          color="bg-accent-600"
        />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 xl:gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 xl:p-6">
          <h3 className="text-lg xl:text-xl font-semibold text-gray-900 mb-4 xl:mb-6">Pending Issuance</h3>
          <div className="space-y-4">
            {requests
              .filter(r => r.status === 'approved' || r.status === 'adjusted')
              .slice(0, 5)
              .map((request) => (
                <div key={request.id} className="flex items-center justify-between py-2 xl:py-3">
                  <div className="flex-1">
                    <p className="text-sm xl:text-base font-medium text-gray-900">{request.propertyName}</p>
                    <p className="text-xs xl:text-sm text-gray-500">
                      {request.userName} • Qty: {request.approvedQuantity || request.requestedQuantity}
                    </p>
                  </div>
                  <button className="px-3 py-1 xl:px-4 xl:py-2 text-xs xl:text-sm font-medium text-primary-600 hover:text-primary-700">
                    Issue
                  </button>
                </div>
              ))}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 xl:p-6">
          <h3 className="text-lg xl:text-xl font-semibold text-gray-900 mb-4 xl:mb-6">Quick Actions</h3>
          <div className="space-y-3 xl:space-y-4">
            <button className="w-full text-left p-3 xl:p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3 xl:space-x-4">
                <CheckSquare className="w-5 h-5 xl:w-6 xl:h-6 text-primary-600" />
                <span className="text-sm xl:text-base font-medium">Issue Properties</span>
              </div>
            </button>
            <button className="w-full text-left p-3 xl:p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3 xl:space-x-4">
                <FileText className="w-5 h-5 xl:w-6 xl:h-6 text-secondary-600" />
                <span className="text-sm xl:text-base font-medium">View Issued Properties</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="space-y-6 xl:space-y-8">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <h1 className="text-2xl xl:text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}
          </h1>
          <p className="text-gray-600 text-base xl:text-lg">
            Here's what's happening with your property management system today.
          </p>
        </div>
        <div className="text-left xl:text-right">
          <p className="text-sm xl:text-base text-gray-500">Today</p>
          <p className="text-lg xl:text-xl font-medium text-gray-900">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>

      {user?.role === 'admin' && renderAdminDashboard()}
      {user?.role === 'user' && renderUserDashboard()}
      {user?.role === 'store_manager' && renderStoreManagerDashboard()}
    </div>
  );
};

export default Dashboard;