import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';

const PromptUnlockHistory = () => {
  const [unlocks, setUnlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchUnlocks();
  }, []);

  const fetchUnlocks = async () => {
    try {
      const res = await api.get(`/api/wallet/unlocks`);
      if (res.data.success) {
        setUnlocks(res.data.unlocks);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load prompt unlock history");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto text-white">
      <h1 className="text-3xl font-bold mb-6">Prompt Unlock History</h1>

      <div className="bg-gray-800/80 rounded-xl border border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : unlocks.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No prompts unlocked yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-900/50 text-gray-400 uppercase">
                <tr>
                  <th className="px-6 py-4">Unlock Date</th>
                  <th className="px-6 py-4">Prompt Title</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Credits Used</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {unlocks.map(item => (
                  <tr key={item._id} className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">{new Date(item.unlockedAt).toLocaleString()}</td>
                    <td className="px-6 py-4 font-medium text-blue-400">{item.promptId?.title || "Deleted Prompt"}</td>
                    <td className="px-6 py-4 text-gray-400">{item.promptId?.category || "N/A"}</td>
                    <td className="px-6 py-4 font-semibold text-red-400">-{item.creditsUsed} CR</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptUnlockHistory;
