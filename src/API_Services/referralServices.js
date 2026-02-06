import api from "../api/axios";



/**
 * Fetch user's unique referral code
 */
export const getUserReferralCode = async () => {
    try {
        const res = await api.get(`/api/user/referal/code`);
        console.log("code", res.data)
        return res.data;
    } catch (error) {
        console.error("Error fetching referral code:", error);
        throw error.response?.data || error;
    }
};

/**
 * Get total earnings with optional date filters
 * @param {string} fromDate - Optional YYYY-MM-DD
 * @param {string} toDate - Optional YYYY-MM-DD
 */
export const getUserEarningsTotal = async (fromDate, toDate) => {
    try {
        const params = {};
        if (fromDate) params.fromDate = fromDate;
        if (toDate) params.toDate = toDate;

        const res = await api.get(`/api/user/earnings/total`, { params });
        console.log("earnings", res.data)
        return res.data;
    } catch (error) {
        console.error("Error fetching user earnings:", error);
        throw error.response?.data || error;
    }
};

/**
 * Get paginated list of referred people
 */
export const getReferredPeople = async (page = 1, limit = 10) => {
    try {
        const res = await api.get(`/api/user/referred/people`, {
            params: { page, limit }
        });
        console.log("people", res.data)
        return res.data;
    } catch (error) {
        console.error("Error fetching referred people:", error);
        throw error.response?.data || error;
    }
};

/**
 * Log referral related activities (share, invite, etc.)
 */
export const logReferralActivity = async (activityData) => {
    try {
        const res = await api.post(`/api/user/referral/activity/log`, activityData);
        console.log("activity", res.data)
        return res.data;
    } catch (error) {
        console.error("Error logging referral activity:", error);
        throw error.response?.data || error;
    }
};

/**
 * Get recent referral and earnings activities
 */
export const getRecentActivities = async (limit = 20) => {
    try {
        const res = await api.get(`/api/user/referral/recent-activities`, {
            params: { limit }
        });
        console.log("recent", res.data)
        return res.data;
    } catch (error) {
        console.error("Error fetching recent activities:", error);
        throw error.response?.data || error;
    }
};

/**
 * Get balance summary (Earnings, Withdrawn, Balance)
 */
export const getUserBalance = async () => {
    try {
        const res = await api.get(`/api/user/balance/amount`);
        console.log("balance", res.data)
        return res.data;
    } catch (error) {
        console.error("Error fetching user balance:", error);
        throw error.response?.data || error;
    }
};

/**
 * Get withdrawal history and details
 */
export const getWithdrawalDetails = async () => {
    try {
        const res = await api.get(`/api/user/withdrawal/details`);
        console.log("withdrawal", res.data)
        return res.data;
    } catch (error) {
        console.error("Error fetching withdrawal details:", error);
        throw error.response?.data || error;
    }
};

/**
 * Validate a referral code and get referrer details (public API)
 */
export const validateReferralCode = async (code) => {
    try {
        const res = await api.get(`/api/auth/user/referral/validate/${code}`);
        return res.data;
    } catch (error) {
        console.error("Error validating referral code:", error);
        throw error.response?.data || error;
    }
};

/**
 * Fetch user's bank details
 */
export const getBankDetails = async () => {
    try {
        const res = await api.get(`/api/user/bank/details`);
        return res.data;
    } catch (error) {
        console.error("Error fetching bank details:", error);
        throw error.response?.data || error;
    }
};

/**
 * Save or update user's bank details
 */
export const saveBankDetails = async (bankData) => {
    try {
        const res = await api.post(`/api/user/bank/save`, bankData);
        return res.data;
    } catch (error) {
        console.error("Error saving bank details:", error);
        throw error.response?.data || error;
    }
};

/**
 * Initiate a full-amount withdrawal
 */
export const initiateWithdrawal = async (notes = "") => {
    try {
        const res = await api.post(`/api/user/withdrawal/request`, { notes });
        return res.data;
    } catch (error) {
        console.error("Error initiating withdrawal:", error);
        throw error.response?.data || error;
    }
};

/**
 * Update a pending withdrawal request
 */
export const updateWithdrawalRequest = async (requestId, data) => {
    try {
        const res = await api.patch(`/api/user/withdrawal/update/${requestId}`, data);
        return res.data;
    } catch (error) {
        console.error("Error updating withdrawal request:", error);
        throw error.response?.data || error;
    }
};

/**
 * Fetch all referral cycles
 */
export const getReferralCycles = async () => {
    try {
        const res = await api.get(`/api/user/referral/cycles`);
        return res.data;
    } catch (error) {
        console.error("Error fetching referral cycles:", error);
        throw error.response?.data || error;
    }
};

/**
 * Fetch detailed referral users for a specific cycle
 */
export const getCycleDetails = async (cycleId) => {
    try {
        const res = await api.get(`/api/user/referral/cycle/${cycleId}/details`);
        return res.data;
    } catch (error) {
        console.error("Error fetching cycle details:", error);
        throw error.response?.data || error;
    }
};
