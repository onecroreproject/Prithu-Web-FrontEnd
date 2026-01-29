import api from "../api/axios";

// 1. Get all subscription plans
export const getAllSubscriptionPlans = async () => {
    try {
        const response = await api.get("/api/user/subscription/plans");
        console.log("all subcription", response.data)
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// 2. Get user's active subscription detail
export const getUserSubscriptionActive = async () => {
    try {
        const response = await api.get("/api/user/subscription/active");
        console.log("active subcription", response.data)
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// 3. Check if user has an active subscription
export const checkUserActiveSubscription = async () => {
    try {
        const response = await api.get("/api/user/subscription/check-active");
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// 4. Subscribe to a plan
export const subscribePlan = async (payload) => {
    try {
        const response = await api.post("/api/user/plan/subscription", payload);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// 5. Cancel subscription
export const cancelSubscriptionApi = async (subscriptionId) => {
    try {
        const response = await api.put("/api/user/subscription/cancel", { subscriptionId });
        console.log("cancel subcription", response.data)
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// 6. Activate trial plan
export const activateTrialPlanApi = async () => {
    try {
        const response = await api.post("/api/user/subscription/activate-trial");
        console.log("activate trial plan", response.data)
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// 7. Check trial plan eligibility
export const checkTrialEligibilityApi = async () => {
    try {
        const response = await api.get("/api/user/subscription/trial-eligibility");
        console.log("check trial eligibility", response.data)
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// 8. Create Razorpay Order
export const createOrderApi = async (planId) => {
    try {
        const response = await api.post("/api/user/subscription/create-order", { planId });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// 9. Verify Razorpay Payment
export const verifyPaymentApi = async (paymentDetails) => {
    try {
        const response = await api.post("/api/user/subscription/verify-payment", paymentDetails);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
