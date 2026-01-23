import {
  FaCamera, FaMapMarkerAlt, FaSmile, FaUserTag, FaUsers,
  FaLink, FaPlayCircle, FaBook, FaAd
} from "react-icons/fa";

export const GIPHY_API_KEY = "YOUR_GIPHY_API_KEY";

export const buttons = [
  { label: "Photo / Video", icon: <FaCamera />, type: "media" },
  { label: "Post Gif", icon: <FaSmile />, type: "gif" },
  { label: "Share in Group", icon: <FaUsers />, type: "group" },
  { label: "Go Live", icon: <FaPlayCircle />, type: "live" },
  { label: "Post A Book", icon: <FaBook />, type: "book" },
  { label: "Post Location", icon: <FaMapMarkerAlt />, type: "location" },
  { label: "Tag to Friend", icon: <FaUserTag />, type: "tag" },
  { label: "Share Link", icon: <FaLink />, type: "link" },
  { label: "Post Online Course", icon: <FaBook />, type: "course" },
  { label: "Post an Ad", icon: <FaAd />, type: "ad" },
];
