import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Globe } from "lucide-react";
import axios from "../api/axios";
import { getSocket } from "../webSocket/socket";
import { useAuth } from "../context/AuthContext";
import { iconMap, cardStyles } from "../utils/iconMap";

const Footer = () => {
    const { user } = useAuth();
    const [footerData, setFooterData] = useState({
        logo: "/prithulogo.png",
        brandName: "Prithu",
        description: "Empowering creators and businesses with a premium SaaS experience. Connect, share, and grow with Prithu.",
        sections: [],
        socialLinks: [],
        email: "support@prithu.app",
        address: "Chennai, Tamil Nadu, India",
        paymentTitle: "Secure & Verified Payments",
        paymentIcons: ["Visa", "Mastercard", "UPI", "PayPal"],
        kycNote: "Identity verification is required for high-volume transactions to ensure platform safety.",
    });

    useEffect(() => {
        const fetchFooterData = async () => {
            try {
                const response = await axios.get("/api/footer");
                console.log(response.data)
                if (response.data.success) {
                    const data = response.data.data;
                    setFooterData(prev => ({
                        ...prev,
                        ...data,
                        sections: data.sections || [],
                        socialLinks: data.socialLinks || []
                    }));
                }
            } catch (error) {
                console.error("Error fetching footer data:", error);
            }
        };

        fetchFooterData();

        const socket = getSocket ? getSocket() : null;
        if (socket) {
            socket.on("footerUpdated", (newData) => {
                setFooterData(prev => ({
                    ...prev,
                    ...newData,
                    sections: newData.sections || [],
                    socialLinks: newData.socialLinks || []
                }));
            });
            return () => socket.off("footerUpdated");
        }
    }, []);

    return (
        <footer className="bg-[#f8fafc] border-t border-gray-200 pt-10 pb-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
                    {/* Brand Identity */}
                    <div className="space-y-5">
                        <Link to="/" className="flex items-center gap-3">
                            <img src={footerData.logo || "/prithulogo.png"} alt={`${footerData.brandName} Logo`} className="h-10 w-auto object-contain" />
                            <span className="text-xl font-bold text-[#0f172a] tracking-tight">{footerData.brandName}</span>
                        </Link>
                        <p className="text-slate-600 leading-relaxed text-sm">
                            {footerData.description}
                        </p>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-slate-600">
                                <iconMap.Mail size={16} className="text-[#6366f1]" />
                                <span className="text-sm">{footerData.email}</span>
                            </div>
                        </div>
                    </div>

                    {/* Dynamic Nav Sections (Column 1, 2, 3) */}
                    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-8">
                        {footerData.sections.map((section, sIdx) => (
                            <div key={sIdx} className="space-y-4">
                                <h3 className="text-xs font-bold text-[#0f172a] uppercase tracking-widest border-b border-gray-100 pb-2">
                                    {section.title}
                                </h3>
                                <ul className="space-y-3">
                                    {section.links
                                        .filter((_, lIdx) => !(sIdx === 1 && lIdx === 0))
                                        .map((link, lIdx) => (
                                        <li key={lIdx}>
                                            <Link 
                                                to={link.href} 
                                                className="text-slate-600 hover:text-[#6366f1] text-sm font-medium transition-all duration-200 hover:translate-x-1 inline-block"
                                            >
                                                {link.label || link.title || link.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Column 4 - Payment & Verification */}
                    <div className="space-y-5">
                        <h3 className="text-xs font-bold text-[#0f172a] uppercase tracking-widest border-b border-gray-100 pb-2">
                            {footerData.paymentTitle}
                        </h3>

                        {/* Payment Icons */}
                        <div className="flex flex-wrap gap-2">
                            {footerData.paymentIcons.map((iconName, idx) => {
                                const Icon = iconMap[iconName] || (() => <span className="text-[10px]">{iconName}</span>);

                                return (
                                    <div
                                        key={idx}
                                        className={`w-12 h-8 rounded-md border-0 flex items-center justify-center shadow-sm hover:scale-105 transition-transform duration-200 ${cardStyles[iconName] || 'bg-white border border-gray-200'}`}
                                        title={iconName}
                                    >
                                        <Icon />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Bottom Bar: Social & Copyright */}
                <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <p className="text-slate-500 text-xs font-medium">
                            &copy; {new Date().getFullYear()} {footerData.brandName}. All rights reserved.
                        </p>
                        <div className="hidden md:block w-px h-4 bg-gray-200"></div>
                        <Link 
                            to="/how-to-delete-account" 
                            className="text-slate-500 text-xs font-medium hover:text-[#6366f1] transition-all"
                        >
                            How to Delete Account
                        </Link>
                        <div className="hidden md:block w-px h-4 bg-gray-200"></div>
                        <p className="text-slate-500 text-xs font-medium">
                            Powered by{" "}
                            <a
                                href="https://digitalmarketing.dlktech.co.in/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#6366f1] font-semibold hover:underline transition-all"
                            >
                                DLK Technologies PVT ltd
                            </a>
                        </p>
                    </div>

                    <div className="flex gap-4">
                        {footerData.socialLinks.map((social, idx) => {
                            const Icon = iconMap[social.icon] || Globe;
                            return (
                                <a
                                    key={idx}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-slate-400 hover:bg-[#6366f1] hover:text-white hover:border-[#6366f1] hover:rotate-6 transition-all duration-300 shadow-sm"
                                    title={social.platform}
                                >
                                    <Icon size={14} />
                                </a>
                            );
                        })}
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes pulse-subtle {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.8; }
                }
                .animate-pulse-subtle {
                    animation: pulse-subtle 2s infinite ease-in-out;
                }
            `}</style>
        </footer >
    );
};

export default Footer;
