// ✅ src/hooks/userProfile.js
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getUserProfile,
  togglePublish,
} from "../Service/profileService";
import { toast } from "react-hot-toast";


// 🔹 Fetch Curriculum Profile (Education, Skills, etc.)
export const useUserCurriculamProfile = (token) => {
  return useQuery({
    queryKey: ["userCurriculamProfile"],
    queryFn: () => getUserCurriculamProfile(token),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};


export const useTogglePublish = (token) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (publish) => togglePublish(publish, token),
    onSuccess: (data) => {
      queryClient.invalidateQueries(["userProfile"]);
    },
    onError: () => toast.error("❌ Failed to toggle publish status"),
  });
};



// 🔹 Fetch General User Profile (Avatar, Cover, Display Info)
export const useUserProfile = (token, userId) => {
  return useQuery({
    queryKey: ["userProfile", userId || "self"],
    queryFn: () => getUserProfile(token, userId),
    enabled: !!token || !!userId,   // allow fetching by id even if no token
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: true,
    onError: (err) => {
      console.error("❌ User Profile Fetch Error:", err);
      toast.error("Failed to load user profile");
    },
  });
};



// 🔹 All profile mutations (Education, Experience, Skill, Certification)
export const useProfileMutations = (token) => {
  const queryClient = useQueryClient();

  // Helper function to invalidate all relevant queries
  const invalidateProfile = () => {
    queryClient.invalidateQueries({ queryKey: ["userCurriculamProfile"] });
    queryClient.invalidateQueries({ queryKey: ["userProfile"] });
  };

  // ✅ Education Mutations
  const addEducationMutation = useMutation({
    mutationFn: (data) => addEducation(data, token),
    onSuccess: () => {
      invalidateProfile();
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "❌ Error adding education"),
  });

  const updateEducationMutation = useMutation({
    mutationFn: ({ userId, educationId, data }) =>
      updateEducation(userId, educationId, data, token),
    onSuccess: () => {
      toast.success("✅ Education updated");
      invalidateProfile();
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "❌ Error updating education"),
  });

  const deleteEducationMutation = useMutation({
    mutationFn: ({ userId, educationId }) =>
      deleteEducation(userId, educationId, token),
    onSuccess: () => {
      toast.success("✅ Education deleted");
      invalidateProfile();
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "❌ Error deleting education"),
  });

  // ✅ Experience Mutations
  const addExperienceMutation = useMutation({
    mutationFn: (data) => addExperience(data, token),
    onSuccess: () => {
      toast.success("✅ Experience added");
      invalidateProfile();
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "❌ Error adding experience"),
  });

  const updateExperienceMutation = useMutation({
    mutationFn: ({ userId, experienceId, data }) =>
      updateExperience(userId, experienceId, data, token),
    onSuccess: () => {
      toast.success("✅ Experience updated");
      invalidateProfile();
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "❌ Error updating experience"),
  });

  const deleteExperienceMutation = useMutation({
    mutationFn: ({ userId, experienceId }) =>
      deleteExperience(userId, experienceId, token),
    onSuccess: () => {
      toast.success("✅ Experience deleted");
      invalidateProfile();
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "❌ Error deleting experience"),
  });

  // ✅ Skill Mutations
  const addSkillMutation = useMutation({
    mutationFn: (data) => addSkill(data, token),
    onSuccess: () => {
      toast.success("✅ Skill added");
      invalidateProfile();
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "❌ Error adding skill"),
  });

  const updateSkillMutation = useMutation({
    mutationFn: ({ userId, skillId, data }) =>
      updateSkill(userId, skillId, data, token),
    onSuccess: () => {
      toast.success("✅ Skill updated");
      invalidateProfile();
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "❌ Error updating skill"),
  });

  const deleteSkillMutation = useMutation({
    mutationFn: ({ userId, skillId }) => deleteSkill(userId, skillId, token),
    onSuccess: () => {
      toast.success("✅ Skill deleted");
      invalidateProfile();
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "❌ Error deleting skill"),
  });

  // ✅ Certification Mutations
  const addCertificationMutation = useMutation({
    mutationFn: (data) => addCertification(data, token),
    onSuccess: () => {
      toast.success("✅ Certification added");
      invalidateProfile();
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "❌ Error adding certification"),
  });

  const updateCertificationMutation = useMutation({
    mutationFn: ({ userId, certificationId, data }) =>
      updateCertification(userId, certificationId, data, token),
    onSuccess: () => {
      toast.success("✅ Certification updated successfully");
      invalidateProfile();
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "❌ Error updating certification"),
  });

  const deleteCertificationMutation = useMutation({
    mutationFn: ({ userId, certificationId }) =>
      deleteCertification(userId, certificationId, token),
    onSuccess: () => {
      toast.success("✅ Certification deleted");
      invalidateProfile();
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "❌ Error deleting certification"),
  });




  // 🔹 Return all mutation hooks together
  return {
    // Education
    addEducation: addEducationMutation,
    updateEducation: updateEducationMutation,
    deleteEducation: deleteEducationMutation,

    // Experience
    addExperience: addExperienceMutation,
    updateExperience: updateExperienceMutation,
    deleteExperience: deleteExperienceMutation,

    // Skill
    addSkill: addSkillMutation,
    updateSkill: updateSkillMutation,
    deleteSkill: deleteSkillMutation,

    // Certification
    addCertification: addCertificationMutation,
    updateCertification: updateCertificationMutation,
    deleteCertification: deleteCertificationMutation,
  };
};
