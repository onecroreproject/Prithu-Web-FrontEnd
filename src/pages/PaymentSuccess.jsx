import React from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentSuccess = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 text-center bg-white p-10 rounded-xl shadow-lg">
                <div>
                    <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100">
                        <svg className="h-12 w-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Payment Successful!</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Thank you for your purchase. Your subscription is now active.
                    </p>
                </div>
                <div className="mt-8">
                    <button
                        onClick={() => navigate('/feed')}
                        className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;
