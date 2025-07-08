import React from 'react';

const Settings: React.FC = () => {
  // Placeholder for settings data and modal state
  return (
    <div className="p-8 min-h-screen bg-[#1a2236] text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold">
          Add Setting
        </button>
      </div>
      <div className="bg-[#232b42] rounded-xl overflow-x-auto p-8 text-center text-gray-400">
        Settings list coming soon...
      </div>
    </div>
  );
};

export default Settings; 