import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Globe,
  Save,
  Users,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import UserManagement from './UserManagement';
import ProfileSettings from './ProfileSettings';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    language: 'en',
    notifications: {
      email: true,
      push: true,
      requests: true,
      approvals: true,
    },
    theme: 'light',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;

      if (name.includes('.')) {
        const [, child] = name.split('.') as [string, keyof typeof formData.notifications];
        setFormData((prev) => ({
          ...prev,
          notifications: {
            ...prev.notifications,
            [child]: checkbox.checked,
          },
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };


  const handleSave = () => {
    console.log('Saving settings:', formData);
    alert('Settings saved successfully!');
  };

  const getTabsForRole = () => {
    const baseTabs = [
      { id: 'profile', name: 'Profile', icon: User },
      { id: 'notifications', name: 'Notifications', icon: Bell },
      { id: 'preferences', name: 'Preferences', icon: Globe },
    ];

    if (user?.role === 'admin') {
      return [
        ...baseTabs,
        { id: 'users', name: 'User Management', icon: Users },
        { id: 'security', name: 'Security', icon: Shield },
      ];
    }

    return baseTabs;
  };

  const tabs = getTabsForRole();

  return (
    <div className="space-y-6 xl:space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-3 xl:space-x-4">
        <div className="w-10 h-10 xl:w-12 xl:h-12 bg-primary-100 rounded-lg flex items-center justify-center">
          <SettingsIcon className="w-6 h-6 xl:w-7 xl:h-7 text-primary-600" />
        </div>
        <div>
          <h1 className="text-2xl xl:text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 text-base xl:text-lg">
            Manage your account and application preferences
          </p>
        </div>
      </div>

      {/* Full Responsive Tabs (Top only, visible at all screen sizes) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 xl:gap-8">
        {/* Sidebar */}
        <div className="col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 xl:p-6">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-3 xl:px-4 xl:py-4 text-sm xl:text-base font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="mr-3 xl:mr-4 h-5 w-5 xl:h-6 xl:w-6" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 xl:p-8">
            {/* Profile */}
            {activeTab === 'profile' && <ProfileSettings />}

            {/* User Management */}
            {activeTab === 'users' && user?.role === 'admin' && <UserManagement />}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <div className="space-y-6 xl:space-y-8">
                <div>
                  <h3 className="text-lg xl:text-xl font-semibold text-gray-900 mb-4 xl:mb-6">
                    Notification Preferences
                  </h3>
                  <div className="space-y-4 xl:space-y-6">
                    {[
                      {
                        key: 'email',
                        title: 'Email Notifications',
                        desc: 'Receive notifications via email',
                      },
                      {
                        key: 'push',
                        title: 'Push Notifications',
                        desc: 'Receive push notifications in browser',
                      },
                      {
                        key: 'requests',
                        title: 'Request Updates',
                        desc: 'Get notified about request status changes',
                      },
                      {
                        key: 'approvals',
                        title: 'Approval Notifications',
                        desc: 'Get notified when requests need approval',
                      },
                    ].map(({ key, title, desc }) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm xl:text-base font-medium text-gray-900">{title}</h4>
                          <p className="text-sm xl:text-base text-gray-500">{desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            id={`notifications.${key}`}
                            type="checkbox"
                            name={`notifications.${key}`}
                            checked={formData.notifications[key as keyof typeof formData.notifications]}
                            onChange={handleInputChange}
                            className="sr-only peer"
                            aria-label={`${key} notification toggle`}
                          />

                          <div className="w-11 h-6 xl:w-12 xl:h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 xl:after:h-6 xl:after:w-6 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Preferences */}
            {activeTab === 'preferences' && (
              <div className="space-y-6 xl:space-y-8">
                <div>
                  <h3 className="text-lg xl:text-xl font-semibold text-gray-900 mb-4 xl:mb-6">
                    Application Preferences
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 xl:gap-8">
                    <div>
                      <label htmlFor="language" className="block text-sm xl:text-base font-medium text-gray-700 mb-2">
                        Language
                      </label>
                      <select
                        id="language"
                        name="language"
                        value={formData.language}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 xl:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base xl:text-lg"
                      >
                        <option value="en">English</option>
                        <option value="am">አማርኛ (Amharic)</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="theme" className="block text-sm xl:text-base font-medium text-gray-700 mb-2">
                        Theme
                      </label>
                      <select
                        id="theme"
                        name="theme"
                        value={formData.theme}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 xl:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base xl:text-lg"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="auto">Auto</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 xl:p-6">
                  <h4 className="text-sm xl:text-base font-medium text-blue-800 mb-2">About IRD Properties</h4>
                  <p className="text-sm xl:text-base text-blue-700">
                    Version 1.0.0 - Ethiopian Defence University Property Management System
                  </p>
                  <p className="text-sm xl:text-base text-blue-700 mt-1">
                    Developed for the Institute of Research and Development (IRD)
                  </p>
                </div>
              </div>
            )}

            {/* Security */}
            {activeTab === 'security' && user?.role === 'admin' && (
              <div className="space-y-6 xl:space-y-8">
                <div>
                  <h3 className="text-lg xl:text-xl font-semibold text-gray-900 mb-4 xl:mb-6">Security Settings</h3>
                  <div className="space-y-4 xl:space-y-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 xl:p-6">
                      <h4 className="text-sm xl:text-base font-medium text-yellow-800 mb-2">System Security</h4>
                      <ul className="text-sm xl:text-base text-yellow-700 space-y-1">
                        <li>• All user passwords are encrypted using bcrypt</li>
                        <li>• JWT tokens are used for secure authentication</li>
                        <li>• Database access is restricted to authenticated users</li>
                        <li>• All actions are logged for audit purposes</li>
                      </ul>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 xl:p-6">
                      <h4 className="text-sm xl:text-base font-medium text-green-800 mb-2">Best Practices</h4>
                      <ul className="text-sm xl:text-base text-green-700 space-y-1">
                        <li>• Regularly update user passwords</li>
                        <li>• Review user permissions periodically</li>
                        <li>• Monitor system access logs</li>
                        <li>• Keep the system updated</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            {(activeTab === 'notifications' || activeTab === 'preferences') && (
              <div className="flex justify-end pt-6 xl:pt-8 border-t border-gray-200 mt-6 xl:mt-8">
                <button
                  onClick={handleSave}
                  className="flex items-center px-6 py-3 xl:px-8 xl:py-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors text-base xl:text-lg"
                >
                  <Save className="w-5 h-5 xl:w-6 xl:h-6 mr-2" />
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
