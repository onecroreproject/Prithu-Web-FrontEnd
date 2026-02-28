import api from "../api/axios";

/**
 * Get all published blogs
 */
export const getAllBlogs = async () => {
    try {
        const { data } = await api.get("/api/blogs/all");
        return data;
    } catch (error) {
        console.error("Error fetching blogs:", error);
        return [];
    }
};

/**
 * Get a single blog by slug
 * @param {string} slug 
 */
export const getBlogBySlug = async (slug) => {
    try {
        const { data } = await api.get(`/api/blogs/${slug}`);
        return data;
    } catch (error) {
        console.error("Error fetching blog:", error);
        return null;
    }
};
