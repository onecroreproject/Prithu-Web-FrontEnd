import api from "../api/axios";

// 1. Get all subscription plans
export const getAllSubscriptionPlans = async () => {
    try {
        const response = await api.get("/api/subscription/plans");
        console.log("all subcription", response.data)
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// 2. Get user's active subscription detail
export const getUserSubscriptionActive = async () => {
    try {
        const response = await api.get("/api/subscription/active");
        console.log("active subcription", response.data)
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// 3. Check if user has an active subscription
export const checkUserActiveSubscription = async () => {
    try {
        const response = await api.get("/api/subscription/check-active");
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// 4. Subscribe to a plan
export const subscribePlan = async (payload) => {
    try {
        const response = await api.post("/api/plan/subscription", payload);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// 5. Cancel subscription
export const cancelSubscriptionApi = async (subscriptionId) => {
    try {
        const response = await api.put("/api/subscription/cancel", { subscriptionId });
        console.log("cancel subcription", response.data)
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// 6. Activate trial plan
export const activateTrialPlanApi = async () => {
    try {
        const response = await api.post("/api/subscription/activate-trial");
        console.log("activate trial plan", response.data)
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// 7. Check trial plan eligibility
export const checkTrialEligibilityApi = async () => {
    try {
        const response = await api.get("/api/subscription/trial-eligible");
        console.log("check trial eligibility", response.data)
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Razorpay functions removed. Use createInstifiPaymentApi and verifyInstifiPaymentApi.

// 11. Get User Invoices
export const getUserInvoicesApi = async () => {
    try {
        const response = await api.get("/api/subscription/invoices");
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// 12. Download Invoice PDF
export const downloadInvoiceApi = async (invoiceId) => {
    try {
        const response = await api.get(`/api/subscription/invoice/download/${invoiceId}`, {
            responseType: 'blob'
        });
        return response;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// 13. Create Instifi Payment
export const createInstifiPaymentApi = async (payload) => {
    try {
        const response = await api.post("/api/payment/create-payment", payload);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// 14. Verify Instifi Payment
export const verifyInstifiPaymentApi = async (payload) => {
    try {
        const response = await api.post("/api/payment/verify-payment", payload);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
