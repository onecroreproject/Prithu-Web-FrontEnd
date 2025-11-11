import React from "react";
import { Stack, Avatar, Typography } from "@mui/material";
import PostOptionsMenu from "../PostOptionsMenu";

const PostHeader = ({ userId, userName, profileAvatar, timeAgo, navigate, feedId, tempUser, token, onHidePost, onNotInterested }) => (
  <Stack direction="row" justifyContent="space-between" alignItems="center" p={2}>
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      sx={{ cursor: "pointer" }}
      onClick={() => navigate(`/profile/${userId}`)}
    >
      <Avatar src={profileAvatar} sx={{ width: 44, height: 44 }} />
      <Stack>
        <Typography fontWeight={600}>{userName}</Typography>
        <Typography variant="caption" color="text.secondary">
          {timeAgo || "Recently"}
        </Typography>
      </Stack>
    </Stack>

    <PostOptionsMenu
      feedId={feedId}
      authUserId={tempUser._id}
      token={token}
      onHidePost={onHidePost}
      onNotInterested={onNotInterested}
    />
  </Stack>
);

export default PostHeader;
