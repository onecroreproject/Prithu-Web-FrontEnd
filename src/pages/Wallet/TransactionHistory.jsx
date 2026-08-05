import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchTransactions();
  }, [filter]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/wallet/transactions?type=${filter}`);
      if (res.data.success) {
        setTransactions(res.data.transactions);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto text-white">
      <h1 className="text-3xl font-bold mb-6">Transaction History</h1>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['ALL', 'PURCHASE', 'PROMPT_UNLOCK', 'AI_GENERATION', 'REFUND', 'ADMIN_ADJUSTMENT'].map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              filter === type ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {type.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="bg-gray-800/80 rounded-xl border border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No transactions found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-900/50 text-gray-400 uppercase">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Remarks</th>
                  <th className="px-6 py-4">Amount (₹)</th>
                  <th className="px-6 py-4">Credits</th>
                  <th className="px-6 py-4">Balance After</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {transactions.map(tx => (
                  <tr key={tx._id} className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">{new Date(tx.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        tx.credits > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {tx.transactionType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{tx.remarks}</td>
                    <td className="px-6 py-4 text-gray-400">{tx.amount ? `₹${tx.amount}` : '-'}</td>
                    <td className={`px-6 py-4 font-bold ${tx.credits > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {tx.credits > 0 ? '+' : ''}{tx.credits}
                    </td>
                    <td className="px-6 py-4 font-semibold text-blue-300">{tx.balanceAfter} CR</td>
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

export default TransactionHistory;
