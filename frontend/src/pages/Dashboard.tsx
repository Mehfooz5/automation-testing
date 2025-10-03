import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/axios"; // make sure this points to your axios instance

interface Provider {
  provider: string;
  accessToken: string;
  providerId: string;
  igUserId?: string;
  pages?: any[];
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [providers, setProviders] = useState<Provider[]>([]);

  const handleLogout = async () => await logout();

  const fetchProviders = async () => {
    try {
      const res = await api.get("/provider/connected");
      setProviders(res.data);
    } catch (err) {
      console.error("Failed to fetch providers:", err);
    }
  };

  useEffect(() => {
    if (user) fetchProviders();
  }, [user]);

  const connectYouTube = () => {
    window.location.href = `http://localhost:3000/api/provider/youtube/connect?userId=${user?.id}`;
  };

  const connectInstagram = () => {
    window.location.href = `http://localhost:3000/api/provider/facebook/connect?userId=${user?.id}`;
  };

  return (
    <div className="max-w-2xl mx-auto my-12 p-5">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h2>

      {/* User Info */}
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
        <div className="flex space-x-4 mb-4">
          <button
            onClick={connectYouTube}
            className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Connect YouTube
          </button>
          <button
            onClick={connectInstagram}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Connect Instagram
          </button>
        </div>

        {/* Display Connected Providers */}
        <div>
          <h4 className="text-lg font-semibold mb-2">Connected Accounts:</h4>
          {providers.length === 0 ? (
            <p className="text-gray-500">No providers connected yet.</p>
          ) : (
            providers.map((p, idx) => (
              <div key={idx} className="p-3 mb-2 bg-gray-100 rounded">
                <p><strong>Provider:</strong> {p.provider}</p>
                <p><strong>Provider ID:</strong> {p.providerId}</p>
                {p.igUserId && <p><strong>Instagram Business ID:</strong> {p.igUserId}</p>}
                {p.pages && p.pages.length > 0 && (
                  <div>
                    <strong>Pages:</strong>
                    <ul className="list-disc list-inside">
                      {p.pages.map((page, i) => <li key={i}>{page.name}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="px-5 py-2.5 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
      >
        Logout
      </button>
    </div>
  );
};

export default Dashboard;
