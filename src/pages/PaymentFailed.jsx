import React from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentFailed = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 text-center bg-white p-10 rounded-xl shadow-lg">
                <div>
                    <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100">
                        <svg className="h-12 w-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Payment Failed</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Oops! Something went wrong with your transaction. Please try again.
                    </p>
                </div>
                <div className="mt-8 space-y-4">
                    <button
                        onClick={() => navigate('/subscription')}
                        className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        Retry Payment
                    </button>
                    <button
                        onClick={() => navigate('/contact')}
                        className="group relative w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Contact Support
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentFailed;
