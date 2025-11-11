import React from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../api/axios";
import { CircularProgress } from "@mui/material";

/* ----------------------------- 📦 API Fetch ----------------------------- */
const fetchUserActivities = async () => {
  const { data } = await api.get("/api/get/user/activity");
  return data.activities || [];
};

/* ----------------------------- 🎯 Component ----------------------------- */
const RecentActivity = () => {
  const {
    data: activities = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["userActivities"],
    queryFn: fetchUserActivities,
    staleTime: 1000 * 60 * 5, // cache for 5 minutes
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 flex justify-center">
        <CircularProgress size={24} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 text-center text-red-500">
        Failed to load recent activities.{" "}
        <button
          onClick={refetch}
          className="text-blue-600 underline text-sm font-medium"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!activities.length) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 text-center text-gray-500">
        No recent activities found.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Recent Activity
      </h3>

      <ul className="space-y-3">
        {activities.map((activity, index) => {
          const target =
            activity?.targetId?.title ||
            activity?.targetId?.userName ||
            activity?.targetId?.companyName ||"";

          const time = new Date(activity.createdAt).toLocaleString([], {
            dateStyle: "medium",
            timeStyle: "short",
          });

          return (
            <li
              key={activity._id || index}
              className="flex items-start gap-2 border-b border-gray-100 pb-2"
            >
              <div className="w-2 h-2 bg-purple-600 rounded-full mt-1.5 flex-shrink-0"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900 leading-tight">
                  <span className="font-semibold">
                    {activity.userId?.userName || "You"}
                  </span>{" "}
                  {activity.actionType
                    .replace(/_/g, " ")
                    .toLowerCase()
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                  {" "}
                  <span className="text-gray-600 font-medium">
                    {target}
                  </span>
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{time}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default RecentActivity;
