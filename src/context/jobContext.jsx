import { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchRankedJobs } from "../Service/jobservice";

const JobContext = createContext();

export const JobProvider = ({ children }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["rankedJobs"],
    queryFn: fetchRankedJobs,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const jobs = Array.isArray(data?.jobs)
    ? data.jobs
    : Array.isArray(data)
    ? data
    : [];

  return (
    <JobContext.Provider value={{ jobs, isLoading, isError }}>
      {children}
    </JobContext.Provider>
  );
};

export const useJobs = () => useContext(JobContext);
