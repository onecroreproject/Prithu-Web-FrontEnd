import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const WalletDashboard = () => {
  const [wallet, setWallet] = useState({ balance: 0, totalPurchasedCredits: 0, totalSpentCredits: 0 });
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchWalletData();
    fetchPackages();
  }, []);

  const fetchWalletData = async () => {
    try {
      const res = await api.get(`/api/wallet/balance`);
      if (res.data.success) {
        setWallet(res.data.wallet);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load wallet balance");
    } finally {
      setLoading(false);
    }
  };

  const fetchPackages = async () => {
    try {
      const res = await api.get(`/api/wallet/packages`);
      if (res.data.success) {
        setPackages(res.data.packages);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBuyCredits = async (pkg) => {
    try {
      // Direct mock purchase for demo
      const res = await api.post(`/api/wallet/buy`, {
        packageId: pkg._id,
        credits: pkg.credits,
        price: pkg.price
      });

      if (res.data.success) {
        toast.success(`Successfully added ${pkg.credits} credits!`);
        fetchWalletData(); // Refresh balance
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to buy credits");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading Wallet...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto text-white">
      <h1 className="text-3xl font-bold mb-6">Wallet Dashboard</h1>
      
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-6 rounded-2xl shadow-lg border border-indigo-700/50">
          <p className="text-indigo-200 text-sm font-medium uppercase tracking-wider mb-2">Available Balance</p>
          <h2 className="text-4xl font-bold text-white flex items-center">
            {wallet.balance} <span className="text-xl ml-2 text-indigo-300">CR</span>
          </h2>
        </div>
        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700">
          <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">Total Purchased</p>
          <h2 className="text-3xl font-bold text-white">{wallet.totalPurchasedCredits} CR</h2>
        </div>
        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700">
          <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">Total Spent</p>
          <h2 className="text-3xl font-bold text-white">{wallet.totalSpentCredits} CR</h2>
        </div>
      </div>

      {/* Quick Links */}
      <div className="flex flex-wrap gap-4 mb-8">
        <Link to="/wallet/transactions" className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-sm font-medium transition-colors">
          Transaction History
        </Link>
        <Link to="/wallet/unlocks" className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-sm font-medium transition-colors">
          Prompt Unlocks
        </Link>
        <Link to="/wallet/generations" className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-sm font-medium transition-colors">
          AI Generations
        </Link>
      </div>

      {/* Buy Packages */}
      <h3 className="text-2xl font-bold mb-4">Buy Credits</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {packages.map((pkg) => (
          <div key={pkg._id} className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-all flex flex-col items-center text-center">
            <h4 className="text-lg font-semibold text-gray-300 mb-2">{pkg.name}</h4>
            <div className="text-4xl font-bold text-blue-400 mb-4">{pkg.credits}</div>
            <p className="text-gray-400 mb-6 font-medium">₹ {pkg.price}</p>
            <button 
              onClick={() => handleBuyCredits(pkg)}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Buy Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WalletDashboard;
