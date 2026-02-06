import React, { useState, useEffect } from 'react';
import { X, Landmark, CreditCard, Building, MapPin, Smartphone, User, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getBankDetails, saveBankDetails, initiateWithdrawal, updateWithdrawalRequest } from '../../API_Services/referralServices';

const WithdrawalModal = ({ isOpen, onClose, balance, onWithdrawalSuccess, initialData = null }) => {
    const [loading, setLoading] = useState(false);
    const [fetchingBank, setFetchingBank] = useState(false);
    const [step, setStep] = useState(1); // 1: Bank Details, 2: Confirmation
    const [notes, setNotes] = useState(initialData?.notes || "");
    const [showAccountNumber, setShowAccountNumber] = useState(false);
    const [formData, setFormData] = useState({
        accountHolderName: initialData?.bankDetails?.accountHolderName || '',
        mobileNumber: initialData?.bankDetails?.mobileNumber || '',
        ifscCode: initialData?.bankDetails?.ifscCode || '',
        bankName: initialData?.bankDetails?.bankName || '',
        branch: initialData?.bankDetails?.branch || '',
        bankAddress: initialData?.bankDetails?.bankAddress || '',
        accountNumber: initialData?.bankDetails?.accountNumber || '',
        accountType: initialData?.bankDetails?.accountType || 'Savings'
    });

    const isEditMode = !!initialData;

    useEffect(() => {
        if (isOpen) {
            if (isEditMode && initialData) {
                setNotes(initialData.notes || "");
                setFormData({
                    accountHolderName: initialData.bankDetails?.accountHolderName || '',
                    mobileNumber: initialData.bankDetails?.mobileNumber || '',
                    ifscCode: initialData.bankDetails?.ifscCode || '',
                    bankName: initialData.bankDetails?.bankName || '',
                    branch: initialData.bankDetails?.branch || '',
                    bankAddress: initialData.bankDetails?.bankAddress || '',
                    accountNumber: initialData.bankDetails?.accountNumber || '',
                    accountType: initialData.bankDetails?.accountType || 'Savings'
                });
                setStep(1);
            } else {
                fetchUserBank();
                setNotes("");
                setStep(1);
            }
        }
    }, [isOpen, initialData, isEditMode]);

    const fetchUserBank = async () => {
        try {
            const res = await getBankDetails();
            if (res.success && res.data) {
                setFormData(prev => ({ ...prev, ...res.data }));
            }
            console.log(res.data)
        } catch (error) {
            console.error("Error fetching user bank details:", error);
        }
    };

    const handleIFSCFetch = async (ifsc) => {
        if (!ifsc || ifsc.length !== 11) return;

        setFetchingBank(true);
        try {
            const response = await fetch(`https://ifsc.razorpay.com/${ifsc}`);
            if (response.ok) {
                const data = await response.json();
                setFormData(prev => ({
                    ...prev,
                    bankName: data.BANK || '',
                    branch: data.BRANCH || '',
                    bankAddress: data.ADDRESS || ''
                }));
                toast.success("Bank details fetched successfully");
            } else {
                toast.error("Invalid IFSC code");
                setFormData(prev => ({
                    ...prev,
                    bankName: '',
                    branch: '',
                    bankAddress: ''
                }));
            }
        } catch (error) {
            console.error("IFSC fetch error:", error);
            toast.error("Failed to fetch bank details");
        } finally {
            setFetchingBank(false);
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        if (step === 1) {
            setStep(2);
            return;
        }

        setLoading(true);
        try {
            if (isEditMode) {
                const res = await updateWithdrawalRequest(initialData._id, {
                    notes,
                    bankDetails: formData
                });
                if (res.success) {
                    toast.success("Request updated successfully!");
                    onWithdrawalSuccess();
                    onClose();
                }
            } else {
                await saveBankDetails(formData);
                const res = await initiateWithdrawal(notes);
                if (res.success) {
                    toast.success("Request submitted successfully!");
                    onWithdrawalSuccess();
                    onClose();
                }
            }
        } catch (error) {
            toast.error(error.message || `Failed to ${isEditMode ? 'update' : 'process'} withdrawal`);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[95vh]">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-4 text-white relative flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 p-1.5 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                            <Landmark className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold leading-tight">{isEditMode ? 'Update Request' : 'Withdraw Earnings'}</h2>
                            <p className="text-blue-100 text-xs mt-0.5">{isEditMode ? 'Modify your pending request details' : `Balance: ₹${balance}`}</p>
                        </div>
                    </div>
                </div>

                <div className="p-5 overflow-y-auto custom-scrollbar">
                    {step === 1 ? (
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* Account Holder Name */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Account Holder</label>
                                    <div className="relative group">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                        <input
                                            required
                                            type="text"
                                            value={formData.accountHolderName}
                                            onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                                            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                            placeholder="Full name"
                                        />
                                    </div>
                                </div>

                                {/* Mobile Number */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Mobile Number</label>
                                    <div className="relative group">
                                        <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                        <input
                                            required
                                            type="tel"
                                            value={formData.mobileNumber}
                                            onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                                            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                            placeholder="Phone number"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* IFSC & Bank Info */}
                            <div className="bg-gray-50/50 rounded-xl p-3 border border-gray-100 space-y-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">IFSC Code</label>
                                    <div className="relative group">
                                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                        <input
                                            required
                                            type="text"
                                            value={formData.ifscCode}
                                            onChange={(e) => {
                                                const val = e.target.value.toUpperCase();
                                                setFormData({ ...formData, ifscCode: val });
                                                if (val.length === 11) handleIFSCFetch(val);
                                            }}
                                            className="w-full pl-9 pr-12 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-mono"
                                            placeholder="e.g. SBIN0001234"
                                            maxLength={11}
                                        />
                                        {fetchingBank && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-blue-500 animate-spin" />}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Bank Name</label>
                                        <input
                                            readOnly
                                            type="text"
                                            value={formData.bankName}
                                            className="w-full px-3 py-2 bg-gray-100/50 border border-transparent rounded-lg text-xs text-gray-500 cursor-not-allowed outline-none"
                                            placeholder="Auto-filled"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Branch</label>
                                        <input
                                            readOnly
                                            type="text"
                                            value={formData.branch}
                                            className="w-full px-3 py-2 bg-gray-100/50 border border-transparent rounded-lg text-xs text-gray-500 cursor-not-allowed outline-none"
                                            placeholder="Auto-filled"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Account Details */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Account Number</label>
                                    <div className="relative group">
                                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                        <input
                                            required
                                            type={showAccountNumber ? "text" : "password"}
                                            value={formData.accountNumber}
                                            onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                                            className="w-full pl-9 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                            placeholder="Acc number"
                                            autoComplete="off"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowAccountNumber(!showAccountNumber)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors"
                                        >
                                            {showAccountNumber ? (
                                                <EyeOff className="w-4 h-4" />
                                            ) : (
                                                <Eye className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Account Type</label>
                                    <select
                                        value={formData.accountType}
                                        onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="Savings">Savings</option>
                                        <option value="Current">Current</option>
                                    </select>
                                </div>
                            </div>

                            {/* Notes Field */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Notes (Optional)</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={1}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                                    placeholder="Add remarks..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={!formData.bankName}
                                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                            >
                                Continue
                            </button>
                        </form>
                    ) : (
                        <div className="space-y-4 py-2">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-3">
                                    <AlertCircle className="w-7 h-7 text-blue-500" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800">Confirm Withdrawal</h3>
                                <p className="text-gray-500 text-sm mt-1">Review the details before proceeding.</p>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Amount:</span>
                                    <span className="font-bold text-gray-800">₹{balance}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Bank:</span>
                                    <span className="font-medium text-gray-800">{formData.bankName}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Account:</span>
                                    <span className="font-medium text-gray-800">••••{formData.accountNumber.slice(-4)}</span>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-4">
                                <button
                                    onClick={() => setStep(1)}
                                    className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all text-sm"
                                >
                                    Go Back
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 hover:shadow-blue-500/25 transition-all text-sm"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4" /> Confirm</>}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WithdrawalModal;
