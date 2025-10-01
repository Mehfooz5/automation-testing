import React from "react";
import { useAuth } from "../context/AuthContext";

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const connectYoutube = () => {
    // hit backend provider route
    window.location.href = "http://localhost:3000/api/provider/youtube";
  };

  const connectFacebook = () => {
    window.location.href = "http://localhost:3000/api/provider/facebook";
  };

  return (
    <div className="max-w-2xl mx-auto my-12 p-5">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h2>

      {/* User Info Card */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm">
        <p className="text-lg text-gray-700 mb-2">
          Welcome, <span className="font-semibold">{user?.email}</span>!
        </p>
        <p className="text-md text-gray-600">
          User ID: <span className="font-mono">{user?.id}</span>
        </p>
      </div>

      {/* Connect Providers */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-3">
          Connect Your Accounts
        </h3>
        <div className="flex space-x-4">
          <button
            onClick={connectYoutube}
            className="px-5 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
          >
            Connect YouTube
          </button>
          <button
            onClick={connectFacebook}
            className="px-5 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Connect Instagram
          </button>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="px-5 py-2.5 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2"
      >
        Logout
      </button>
    </div>
  );
};

export default Dashboard;
