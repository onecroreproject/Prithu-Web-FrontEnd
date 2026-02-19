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
import { getUserInvoicesApi } from '../../API_Services/subscriptionServices';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import { useAuth } from '../../context/AuthContext';
import PrithuLogo from '../../assets/prithu_logo.webp';



const InvoiceHistory = () => {
    const { user } = useAuth();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);


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

    const generateInvoicePDF = async (invoice) => {
        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const accentColor = [5, 150, 105]; // Emerald 600 - Professional Green

            const margin = 20;

            // Helper to load image
            const loadImage = (url) => {
                return new Promise((resolve, reject) => {
                    const img = new Image();
                    img.src = url;
                    img.crossOrigin = 'Anonymous';
                    img.onload = () => resolve(img);
                    img.onerror = (e) => reject(e);
                });
            };

            // -- 1. Header Section --
            // Top Left: Company Info
            doc.setTextColor(31, 41, 55); // Dark Gray
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Prithu Inc.', margin, 20);

            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(107, 114, 128); // Medium Gray
            doc.text('Official Subscription Services', margin, 26);
            doc.text('Chennai, Tamil Nadu, India', margin, 31);
            doc.text('support@prithu.app', margin, 36);

            // Top Right: Logo
            try {
                const logoImg = await loadImage(PrithuLogo);
                // Position logo on top right
                doc.addImage(logoImg, 'PNG', pageWidth - margin - 15, 15, 15, 15, undefined, 'FAST');
            } catch (err) {
                console.error('Logo loading failed:', err);
            }

            // Big "INVOICE" Title
            doc.setFontSize(40);
            doc.setTextColor(...accentColor);
            doc.setFont('helvetica', 'bold');
            doc.text('INVOICE', pageWidth - margin, 65, { align: 'right' });

            // -- 2. Billing & Metadata Area --
            const contentY = 85;

            // Bill To (Left)
            doc.setTextColor(...accentColor);
            doc.setFontSize(10);
            doc.text('Bill To', margin, contentY);

            doc.setTextColor(31, 41, 55);
            doc.setFontSize(12);
            doc.text(user?.userName || 'Valued Customer', margin, contentY + 8);

            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(107, 114, 128);
            doc.text(user?.email || '', margin, contentY + 14);
            doc.text(user?.phone || '', margin, contentY + 20);

            // Invoice Metadata (Right)
            const metaX = pageWidth - margin - 45;
            const metaValueX = pageWidth - margin;

            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...accentColor);
            doc.text('Invoice #', metaX, contentY + 8);
            doc.text('Invoice date', metaX, contentY + 16);
            doc.text('Status', metaX, contentY + 24);

            doc.setTextColor(31, 41, 55);
            doc.setFont('helvetica', 'normal');
            doc.text(invoice.invoiceNumber, metaValueX, contentY + 8, { align: 'right' });
            doc.text(formatDate(invoice.createdAt), metaValueX, contentY + 16, { align: 'right' });
            doc.setFont('helvetica', 'bold');
            doc.text(invoice.status.toUpperCase(), metaValueX, contentY + 24, { align: 'right' });

            // -- 3. Table Section --
            const tableY = 125;
            doc.setFillColor(...accentColor);
            doc.rect(margin, tableY, pageWidth - (margin * 2), 10, 'F');

            doc.setTextColor(255, 255, 255);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text('QTY', margin + 5, tableY + 6.5);
            doc.text('Description', margin + 20, tableY + 6.5);
            doc.text('Unit Price', pageWidth - margin - 45, tableY + 6.5, { align: 'right' });
            doc.text('Amount', pageWidth - margin - 5, tableY + 6.5, { align: 'right' });

            // Item Row
            const rowY = tableY + 18;
            doc.setTextColor(31, 41, 55);
            doc.setFont('helvetica', 'normal');
            doc.text('1.00', margin + 5, rowY);
            doc.text(`Subscription: ${invoice.planId?.name || 'Pro Plan'} (${invoice.planId?.planType || 'Premium'})`, margin + 20, rowY);
            doc.text(`${invoice.amount}.00`, pageWidth - margin - 45, rowY, { align: 'right' });
            doc.text(`${invoice.amount}.00`, pageWidth - margin - 5, rowY, { align: 'right' });

            // Table Divider
            doc.setDrawColor(...accentColor);
            doc.setLineWidth(0.5);
            doc.line(margin, tableY + 25, pageWidth - margin, tableY + 25);

            // -- 4. Totals --
            const totalsY = tableY + 35;
            const totalX = pageWidth - margin - 60;

            doc.setFontSize(10);
            doc.text('Subtotal', totalX, totalsY);
            doc.text(`${invoice.amount}.00`, metaValueX, totalsY, { align: 'right' });

            doc.text('Sales Tax (0%)', totalX, totalsY + 8);
            doc.text('0.00', metaValueX, totalsY + 8, { align: 'right' });

            // Total Block
            doc.setDrawColor(...accentColor);
            doc.line(totalX, totalsY + 12, metaValueX, totalsY + 12);

            doc.setTextColor(...accentColor);
            doc.setFont('helvetica', 'bold');
            doc.text('Total Paid (INR)', totalX, totalsY + 18);
            doc.text(`${invoice.amount}.00`, metaValueX, totalsY + 18, { align: 'right' });
            doc.line(totalX, totalsY + 22, metaValueX, totalsY + 22);

            // -- 5. Terms & Footer --
            const footerY = 240;
            doc.setTextColor(...accentColor);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.text('Terms and Conditions', margin, footerY);

            doc.setTextColor(107, 114, 128);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.text('Payment is processed via Razorpay.', margin, footerY + 8);
            doc.text('Please keep this receipt for your records.', margin, footerY + 14);
            doc.text('For queries, contact support@prithu.app', margin, footerY + 20);

            // Save PDF
            doc.save(`Prithu_Invoice_${invoice.invoiceNumber}.pdf`);
            toast.success('Professional invoice downloaded');
        } catch (err) {
            console.error('PDF Generation Error:', err);
            toast.error('Failed to generate PDF');
        }
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
                                                onClick={() => generateInvoicePDF(invoice)}
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
