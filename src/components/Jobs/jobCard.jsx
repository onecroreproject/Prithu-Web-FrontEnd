/* ✅ src/components/JobPageComponent/JobCard.jsx */
import React, { useState, useEffect } from "react";
import {
  Avatar,
  Card,
  Stack,
  Typography,
  Box,
  Button,
  IconButton,
  Skeleton,
  Snackbar,
  CardMedia,
} from "@mui/material";
import {
  FavoriteBorder as FavoriteBorderIcon,
  Favorite as FavoriteIcon,
  ShareOutlined as ShareOutlinedIcon,
  WorkOutline as WorkOutlineIcon,
  LocationOn as LocationOnIcon,
  CurrencyRupee as CurrencyRupeeIcon,
  Business as BusinessIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import api from "../../api/axios";
import JobDetailsPopup from "./jobCardPop-Up";

const JobCard = ({ jobData }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalLikes: 0, totalShares: 0 });
  const [showPopup, setShowPopup] = useState(false);

  const {
    _id,
    title = "Job Title",
    companyName = "Unknown Company",
    location = "Not specified",
    salaryRange = "—",
    experience = "—",
    jobType = "Full-time",
    description = "",
    image = "",
    profileAvatar,
    userName,
    createdAt,
  } = jobData || {};

  // 🕒 Time formatting helper
  const timeAgo = (date) => {
    if (!date) return "Recently posted";
    const diff = Date.now() - new Date(date);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days < 1) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      return hours <= 0 ? "Just now" : `${hours}h ago`;
    }
    return `${days}d ago`;
  };

  // 🧩 Fallbacks
  const jobImage =
    image && image.trim() !== ""
      ? image
      : "https://cdn-icons-png.flaticon.com/512/1187/1187541.png";

  const avatarImg =
    profileAvatar && profileAvatar.trim() !== ""
      ? profileAvatar
      : "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  // 📊 Fetch engagement stats
  const fetchStats = async () => {
    try {
      const { data } = await api.get(`/job/stats/${_id}`);
      setStats({
        totalLikes: data.stats.totalLikes,
        totalShares: data.stats.totalShares,
      });
    } catch (err) {
      console.error("Error fetching job stats:", err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    fetchStats();
    return () => clearTimeout(timer);
  }, []);

  // ❤️ Like API
  const handleLike = async () => {
    try {
      await api.post("/job/update", { jobId: _id, actionType: "like" });
      setIsLiked((prev) => !prev);
      fetchStats();
      setToastMsg(isLiked ? "Removed from favorites" : "Added to favorites");
    } catch (err) {
      console.error("Error liking job:", err);
      setToastMsg("Failed to update like.");
    }
  };

  // 🔗 Share API
  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/jobs/${_id}`;
      await navigator.clipboard.writeText(shareUrl);
      await api.post("/job/update", { jobId: _id, actionType: "share" });
      fetchStats();
      setToastMsg("Job link copied & share recorded!");
    } catch (err) {
      console.error("Error sharing job:", err);
      setToastMsg("Failed to share job.");
    }
  };

  // 🧱 Skeleton Loader
  if (loading) {
    return (
      <Card
        sx={{
          width: "100%",
          maxWidth: 600,
          mx: "auto",
          mb: 3,
          borderRadius: 3,
          p: 2,
        }}
      >
        <Skeleton variant="rectangular" width="100%" height={200} />
        <Stack direction="row" alignItems="center" spacing={2} p={2}>
          <Skeleton variant="circular" width={50} height={50} />
          <Stack flex={1}>
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="30%" />
          </Stack>
        </Stack>
        <Stack p={2}>
          <Skeleton variant="text" width="90%" />
          <Skeleton variant="text" width="60%" />
        </Stack>
      </Card>
    );
  }

  return (
    <>
      {/* ✅ Animated Job Card */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <Card
          sx={{
            width: "100%",
            maxWidth: 600,
            mx: "auto",
            mb: 3,
            borderRadius: 3,
            boxShadow: "0px 3px 10px rgba(0,0,0,0.08)",
            transition: "0.3s",
            "&:hover": {
              boxShadow: "0px 6px 18px rgba(0,0,0,0.15)",
            },
          }}
        >
          {/* 🧠 Header */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            p={2}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar
                src={avatarImg}
                alt={userName}
                sx={{
                  width: 45,
                  height: 45,
                  border: "1px solid #ddd",
                }}
              />
              <Stack>
                <Typography fontWeight={600}>{userName}</Typography>
                <Typography variant="caption" color="gray">
                  {timeAgo(createdAt)}
                </Typography>
              </Stack>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <motion.div whileTap={{ scale: 0.8 }}>
                <IconButton onClick={handleLike}>
                  {isLiked ? (
                    <FavoriteIcon color="error" />
                  ) : (
                    <FavoriteBorderIcon />
                  )}
                </IconButton>
              </motion.div>
              <Typography variant="caption">{stats.totalLikes}</Typography>

              <motion.div whileTap={{ scale: 0.8 }}>
                <IconButton onClick={handleShare}>
                  <ShareOutlinedIcon />
                </IconButton>
              </motion.div>
              <Typography variant="caption">{stats.totalShares}</Typography>
            </Stack>
          </Stack>

          {/* 🧠 Job Details */}
          <Box px={2} pb={2}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
              {title}
            </Typography>

            <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
              <BusinessIcon fontSize="small" color="action" />
              <Typography variant="body2">{companyName}</Typography>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
              <WorkOutlineIcon fontSize="small" color="action" />
              <Typography variant="body2">{jobType}</Typography>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
              <LocationOnIcon fontSize="small" color="action" />
              <Typography variant="body2">{location}</Typography>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
              <CurrencyRupeeIcon fontSize="small" color="success" />
              <Typography variant="body2">{salaryRange}</Typography>
            </Stack>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 1,
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                lineHeight: 1.4,
              }}
            >
              {description || "No description provided."}
            </Typography>

            {/* 🖼️ Job Image */}
            <Box mt={2}>
              <CardMedia
                component="img"
                height="180"
                image={jobImage}
                alt={title}
                sx={{
                  objectFit: "cover",
                  borderRadius: 2,
                  border: "1px solid #eee",
                }}
              />
            </Box>

            {/* Footer */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
              mt={2}
              spacing={{ xs: 1.5, sm: 0 }}
            >
              <Typography variant="caption" color="text.secondary">
                Experience: {experience}
              </Typography>
              <Button
                variant="contained"
                size="small"
                sx={{
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: 500,
                  px: 2,
                  mt: { xs: 1, sm: 0 },
                }}
                onClick={() => setShowPopup(true)}
              >
                View Details
              </Button>
            </Stack>
          </Box>

          {/* 🧠 Toast */}
          <Snackbar
            open={!!toastMsg}
            autoHideDuration={2000}
            onClose={() => setToastMsg("")}
            message={toastMsg}
          />
        </Card>
      </motion.div>

      {/* 🪟 Popup */}
      {showPopup && (
        <JobDetailsPopup
          open={showPopup}
          onClose={() => setShowPopup(false)}
          job={jobData}
        />
      )}
    </>
  );
};

export default JobCard;
