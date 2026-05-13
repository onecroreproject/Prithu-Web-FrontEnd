import React, { useState, useEffect } from 'react';
import {
    FileText,
    Download,
    AlertCircle,
    CheckCircle,
    XCircle,
    Clock,
    ArrowRight
} from 'lucide-react';
import { getUserInvoicesApi, downloadInvoiceApi } from '../../API_Services/subscriptionServices';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useDownloads } from '../../context/DownloadContext';



const InvoiceHistory = () => {
    const { user } = useAuth();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const { setIsDownloadPopUpOpen } = useDownloads();


    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const data = await getUserInvoicesApi();
            if (data.success) {
                setInvoices(data.invoices || []);
            }
        } catch (err) {
            console.error('Error fetching invoices:', err);
            toast.error('Failed to load billing history');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadInvoice = async (invoice) => {
        setIsDownloadPopUpOpen(true);
    };



    const getStatusIcon = (status) => {
        switch (status) {
            case 'paid':
                return <CheckCircle className="w-4 h-4 text-emerald-500" />;
            case 'failed':
                return <XCircle className="w-4 h-4 text-red-500" />;
            case 'pending':
                return <Clock className="w-4 h-4 text-amber-500" />;
            default:
                return <AlertCircle className="w-4 h-4 text-gray-400" />;
        }
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'paid':
                return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'failed':
                return 'bg-red-50 text-red-700 border-red-100';
            case 'pending':
                return 'bg-amber-50 text-amber-700 border-amber-100';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-100';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-16 bg-gray-100 rounded-xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-gray-800">Billing History</h3>
                    <p className="text-sm text-gray-500 mt-1">View and download your past invoices</p>
                </div>

                <div className="p-3 bg-blue-50 rounded-xl text-blue-500">
                    <FileText className="w-6 h-6" />
                </div>
            </div>

            <div className="overflow-x-auto">
                {invoices.length > 0 ? (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-sm font-medium">
                                <th className="px-6 py-4">Invoice</th>
                                <th className="px-6 py-4">Plan</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {invoices.map((invoice) => (
                                <tr key={invoice._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                            {invoice.invoiceNumber}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-medium text-gray-700">
                                            {invoice.planId?.name || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-bold text-gray-900">
                                            ₹{invoice.amount}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {formatDate(invoice.createdAt)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyles(invoice.status)}`}>
                                            {getStatusIcon(invoice.status)}
                                            <span className="capitalize">{invoice.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {invoice.status === 'paid' && (
                                            <button
                                                onClick={() => handleDownloadInvoice(invoice)}
                                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors group"
                                                title="Download Invoice"
                                            >
                                                <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                            </button>
                                        )}
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-gray-300" />
                        </div>
                        <h4 className="text-gray-900 font-bold mb-1">No invoices found</h4>
                        <p className="text-gray-500 text-sm">You haven't made any subscription payments yet.</p>
                    </div>
                )}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100">
                <button className="text-blue-500 text-sm font-bold flex items-center gap-2 hover:gap-3 transition-all mx-auto">
                    View Detailed History
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default InvoiceHistory;
