import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';

function ProfileSettings() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Implement actual API call to update profile
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast.success('Profile updated successfully!');
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <Icon icon="mdi:arrow-left" className="text-xl" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
          <p className="text-gray-400">Manage your account settings and preferences</p>
        </div>
      </div>

      <div className="max-w-2xl">
        {/* Profile Information */}
        <div className="bg-[#1a2236] rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Profile Information</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#232b42] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Enter username"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#232b42] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Enter email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Role
              </label>
              <div className="px-3 py-2 bg-[#232b42] border border-gray-600 rounded-lg text-gray-300">
                {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'N/A'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <div className="px-3 py-2 bg-[#232b42] border border-gray-600 rounded-lg text-gray-300">
                {user?.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : 'N/A'}
              </div>
            </div>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-[#1a2236] rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Change Password</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-[#232b42] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="Enter current password"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#232b42] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Enter new password"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#232b42] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Icon icon="mdi:content-save" />
                    Update Profile
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Account Actions */}
        <div className="bg-[#1a2236] rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Account Actions</h2>
          
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 bg-[#232b42] hover:bg-[#2a3246] rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <Icon icon="mdi:shield-check" className="text-cyan-400" />
                <span className="text-gray-300">Two-Factor Authentication</span>
              </div>
              <Icon icon="mdi:chevron-right" className="text-gray-400" />
            </button>
            
            <button className="w-full flex items-center justify-between p-3 bg-[#232b42] hover:bg-[#2a3246] rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <Icon icon="mdi:bell" className="text-cyan-400" />
                <span className="text-gray-300">Notification Preferences</span>
              </div>
              <Icon icon="mdi:chevron-right" className="text-gray-400" />
            </button>
            
            <button className="w-full flex items-center justify-between p-3 bg-[#232b42] hover:bg-[#2a3246] rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <Icon icon="mdi:download" className="text-cyan-400" />
                <span className="text-gray-300">Export Data</span>
              </div>
              <Icon icon="mdi:chevron-right" className="text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileSettings; 