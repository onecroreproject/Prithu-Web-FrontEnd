import React, { useState, useEffect } from "react";
import axios from "../api/axios";
import { getSocket } from "../webSocket/socket";
import SEO from "./SEO";

const StaticPageLayout = ({ slug }) => {
    const [pageData, setPageData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPageContent = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`/api/static-page/${slug}`);
                if (response.data.success) {
                    setPageData(response.data.data);
                }
            } catch (err) {
                console.error(`Error fetching page ${slug}:`, err);
                setError("Page not found or failed to load.");
            } finally {
                setLoading(false);
            }
        };

        fetchPageContent();

        const socket = getSocket ? getSocket() : null;
        if (socket) {
            socket.on("staticPageUpdated", (updatedPage) => {
                if (updatedPage.slug === slug) {
                    setPageData(updatedPage);
                }
            });
            return () => socket.off("staticPageUpdated");
        }
    }, [slug]);

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-6 md:p-10 animate-pulse">
                <div className="h-10 bg-gray-200 rounded-lg w-2/3 mb-8"></div>
                <div className="space-y-4">
                    <div className="h-4 bg-gray-100 rounded w-full"></div>
                    <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-100 rounded w-4/6"></div>
                    <div className="h-32 bg-gray-50 rounded w-full mt-10"></div>
                    <div className="h-4 bg-gray-100 rounded w-full"></div>
                    <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <>
                <SEO title={`Error - ${slug}`} />
                <div className="max-w-4xl mx-auto p-10 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-red-500 mb-6">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Content Not Found</h1>
                    <p className="text-gray-600 mb-8">{error}</p>
                    <button onClick={() => window.history.back()} className="text-indigo-600 font-semibold hover:text-indigo-700">Go Back</button>
                </div>
            </>
        );
    }

    const formattedDate = pageData?.updatedAt ? new Date(pageData.updatedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }) : null;

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-10 text-gray-800 min-h-[60vh]">
            <SEO
                title={`${pageData?.title || 'Loading...'} | Prithu`}
                description={`Read our ${pageData?.title} to learn more about Prithu's policies and guidelines.`}
            />
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b pb-6 border-gray-100">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">{pageData?.title}</h1>
                {formattedDate && (
                    <span className="text-xs font-medium text-gray-400">Last updated: {formattedDate}</span>
                )}
            </div>
            <div
                className="prose prose-indigo prose-lg max-w-none leading-relaxed text-gray-600"
                dangerouslySetInnerHTML={{ __html: pageData?.content }}
            />
        </div>
    );
};

export default StaticPageLayout;
