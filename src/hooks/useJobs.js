// src/hooks/useJobs.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { toast } from 'react-hot-toast';

/**
 * Fetch top ranked jobs


/**
 * Fetch top roles
 */
export function useTopRoles() {
    return useQuery({
        queryKey: ['topRoles'],
        queryFn: async () => {
            const { data } = await api.get('/job/top/roles');
            return data.jobs || [];
        },
        staleTime: 15 * 60 * 1000, // 15 minutes
    });
}

/**
 * Fetch latest job openings
 */
export function useLatestOpenings() {
    return useQuery({
        queryKey: ['latestOpenings'],
        queryFn: async () => {
            const { data } = await api.get('/job/latest/openings');
            return data.jobs || [];
        },
        staleTime: 10 * 60 * 1000,
    });
}

/**
 * Fetch featured companies
 */
export function useFeaturedCompanies() {
    return useQuery({
        queryKey: ['featuredCompanies'],
        queryFn: async () => {
            const { data } = await api.get('/job/featured/companies');
            return data.jobs || [];
        },
        staleTime: 15 * 60 * 1000,
    });
}

/**
 * Fetch user's jobs
 */
export function useUserJobs() {
    return useQuery({
        queryKey: ['userJobs'],
        queryFn: async () => {
            const { data } = await api.get('/job/get/jobs/by/userId');
            return data.jobs || [];
        },
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * Fetch single job details
 */
export function useJobDetails(jobId) {
    return useQuery({
        queryKey: ['jobDetails', jobId],
        queryFn: async () => {
            const { data } = await api.get(`/job/get/jb/${jobId}`);
            return data.job;
        },
        enabled: !!jobId,
        staleTime: 10 * 60 * 1000,
    });
}

/**
 * Fetch job statistics
 */
export function useJobStats(jobId) {
    return useQuery({
        queryKey: ['jobStats', jobId],
        queryFn: async () => {
            const { data } = await api.get(`/job/stats/${jobId}`);
            return data;
        },
        enabled: !!jobId,
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * Create job mutation
 */
export function useCreateJob() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (jobData) => {
            return await api.post('/job/create', jobData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userJobs'] });
            queryClient.invalidateQueries({ queryKey: ['latestOpenings'] });
            toast.success('Job created successfully!');
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to create job');
        },
    });
}

/**
 * Update job mutation
 */
export function useUpdateJob() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ jobId, jobData }) => {
            return await api.put(`/job/update/${jobId}`, jobData);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['userJobs'] });
            queryClient.invalidateQueries({ queryKey: ['jobDetails', variables.jobId] });
            toast.success('Job updated successfully!');
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to update job');
        },
    });
}

/**
 * Delete job mutation
 */
export function useDeleteJob() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (jobId) => {
            return await api.delete(`/job/delete/${jobId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userJobs'] });
            toast.success('Job deleted successfully!');
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to delete job');
        },
    });
}

/**
 * Apply to job mutation
 */
export function useApplyToJob() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ jobId, applicationData }) => {
            return await api.post(`/job/apply/${jobId}`, applicationData);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['jobStats', variables.jobId] });
            toast.success('Application submitted successfully!');
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to submit application');
        },
    });
}







