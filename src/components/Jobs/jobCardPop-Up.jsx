
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  Box,
  Stack,
  IconButton,
  Avatar,
  Divider,
  Button,
  useMediaQuery,
  useTheme,
  Slide,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

// ✅ Transition Animation (Slide-Up + Fade)
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} timeout={400} />;
});

const JobDetailsPopup = ({ open, onClose, job }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (!job) return null;

  const {
    title,
    companyName,
    location,
    salaryRange,
    description,
    experience,
    contactLink,
    mobileNumber,
    image,
    profileAvatar,
    userName,
  } = job;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      fullScreen
      PaperProps={{
        sx: {
          bgcolor: "#fff",
          overflow: "hidden",
        },
      }}
    >
      {/* ---------- Header ---------- */}
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: { xs: 2, md: 4 },
          py: { xs: 1.5, md: 2 },
          bgcolor: "#f9fafb",
          borderBottom: "1px solid #e5e7eb",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <Typography
          fontWeight={700}
          fontSize={{ xs: "1rem", md: "1.25rem" }}
          color="text.primary"
        >
          {title}
        </Typography>

        <IconButton
          onClick={onClose}
          sx={{
            bgcolor: "#fff",
            border: "1px solid #e5e7eb",
            "&:hover": { bgcolor: "#f3f4f6" },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* ---------- Content ---------- */}
      <DialogContent
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          overflowY: "auto",
          height: "100%",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 3,
        }}
      >
        {/* 🖼️ Left — Image Section */}
        <Box
          flex={1}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mb: { xs: 2, md: 0 },
          }}
        >
          <img
            src={
              image ||
              "https://cdn-icons-png.flaticon.com/512/1187/1187541.png"
            }
            alt={title}
            style={{
              width: isMobile ? "100%" : "90%",
              height: isMobile ? "auto" : "80vh",
              objectFit: "cover",
              borderRadius: "12px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
              transition: "transform 0.4s ease",
            }}
          />
        </Box>

        {/* 📄 Right — Job Details Section */}
        <Box
          flex={1}
          sx={{
            p: { xs: 1, sm: 2 },
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          {/* Creator Info */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
            mb={2}
            sx={{
              borderBottom: "1px solid #eee",
              pb: 1.5,
            }}
          >
            <Avatar
              src={
                profileAvatar ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              alt={userName}
              sx={{ width: 48, height: 48 }}
            />
            <Typography fontWeight={600} fontSize="1rem">
              {userName}
            </Typography>
          </Stack>

          {/* Company Info */}
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, mb: 0.5, color: "text.primary" }}
          >
            {companyName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {location}
          </Typography>

          <Divider sx={{ my: 2 }} />

          {/* Job Description */}
          <Typography
            variant="body1"
            color="text.primary"
            sx={{
              mb: 2,
              lineHeight: 1.6,
              whiteSpace: "pre-line",
            }}
          >
            {description || "No description provided."}
          </Typography>

          <Stack spacing={0.6} mb={2}>
            <Typography variant="body2" color="text.secondary">
              <strong>Experience:</strong> {experience}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Salary:</strong> {salaryRange}
            </Typography>
          </Stack>

          {/* Contact Info */}
          {contactLink && (
            <Box mt={2}>
              <Button
                href={contactLink}
                target="_blank"
                variant="contained"
                color="primary"
                sx={{
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: 500,
                }}
              >
                Contact via Link
              </Button>
            </Box>
          )}

          {mobileNumber && (
            <Typography mt={2} variant="body2">
              📞 <strong>Mobile:</strong> {mobileNumber}
            </Typography>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default JobDetailsPopup;
