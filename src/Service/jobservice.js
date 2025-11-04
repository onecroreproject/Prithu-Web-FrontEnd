import api from "../api/axios";


export const fetchRankedJobs = async () => {
  const { data } = await api.get("/job/top/ranked/jobs");
  return data?.jobs || [];
};