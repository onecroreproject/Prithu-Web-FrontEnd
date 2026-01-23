import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";


export const useProfileMutations = () => {
  const queryClient = useQueryClient();

  const addProject = useMutation({
    mutationFn: async ({ projectData }) => {
      const res = await api.post("/api/user/add/education/project", projectData);
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries(["userProfile"]),
  });

  // ✅ Update Project
  const updateProject = useMutation({
    mutationFn: async ({ projectId, data }) => {
      const res = await api.put(`/api/user/update/projects/${projectId}`, data);
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries(["userProfile"]),
  });

  // ✅ Delete Project
  const deleteProject = useMutation({
    mutationFn: async ({ projectId }) => {
      const res = await api.delete(`/api/user/delete/projects/${projectId}`);
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries(["userProfile"]),
  });

 return {
    addProject,
    updateProject,
    deleteProject,
  };
}
