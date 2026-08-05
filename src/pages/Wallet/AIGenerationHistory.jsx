import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';

const AIGenerationHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get(`/wallet/generations`);
      if (res.data.success) {
        setHistory(res.data.history);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load generation history");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto text-white">
      <h1 className="text-3xl font-bold mb-6">AI Generation History</h1>

      <div className="bg-gray-800/80 rounded-xl border border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : history.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No AI generations found.</div>
        ) : (
          <div className="p-6 space-y-8">
            {history.map(item => (
              <div key={item._id} className="bg-gray-900/50 p-6 rounded-lg border border-gray-700">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-blue-400">
                      {item.promptId ? item.promptId.title : "Custom Generation"}
                    </h3>
                    <p className="text-sm text-gray-400">{new Date(item.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-gray-800 text-red-400 rounded-full text-xs font-bold border border-red-900/30">
                      -{item.creditsUsed} CR
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {item.generatedImages.map((imgUrl, index) => (
                    <div key={index} className="relative group aspect-square rounded-md overflow-hidden bg-gray-800 border border-gray-600">
                      <img src={imgUrl} alt={`Generated ${index}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <a 
                          href={imgUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          download
                          className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded text-sm font-medium"
                        >
                          View / Download
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIGenerationHistory;
