import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const PaymentVerification = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const hasCalledRef = useRef(false);

    useEffect(() => {
        if (hasCalledRef.current) return;

        const verifyPayment = async () => {
            const merchantTxnId = searchParams.get('merchantTxnId');
            const orderId = searchParams.get('orderId');

            if (!merchantTxnId) {
                toast.error("Invalid transaction details");
                navigate('/payment-failed');
                return;
            }

            hasCalledRef.current = true;
            try {
                const response = await axios.post(`${process.env.REACT_APP_API_URL || '/api'}/payment/verify-payment`, {
                    merchantTxnId,
                    orderId
                }, { withCredentials: true });

                if (response.data.success && response.data.status === "SUCCESS") {
                    toast.success("Payment Verified!");
                    navigate('/payment-success');
                } else {
                    toast.error("Payment Verification Failed");
                    navigate('/payment-failed');
                    hasCalledRef.current = false;
                }
            } catch (error) {
                console.error("Verification error:", error);
                toast.error("Error verifying payment");
                navigate('/payment-failed');
                hasCalledRef.current = false;
            } finally {
                setLoading(false);
            }
        };

        verifyPayment();
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
                <h2 className="mt-4 text-xl font-semibold text-gray-700">Verifying your payment...</h2>
                <p className="text-gray-500">Please do not refresh or close this page.</p>
            </div>
        </div>
    );
};

export default PaymentVerification;
