import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, Search, Video, Image, User, PlusCircle } from "lucide-react";
import { motion } from "framer-motion";

const BottomNav = () => {
    const location = useLocation();

    const navItems = [
        { to: "/home", Icon: Home, label: "Home" },
        {
            onClick: () => window.dispatchEvent(new CustomEvent("openMobileSearch")),
            Icon: Search,
            label: "Search",
            isAction: true
        },
        { to: "/home/reels", Icon: Video, label: "Reels" },
        { to: "/home/images", Icon: Image, label: "Images" },
        { to: "/home/profile", Icon: User, label: "Profile" },
    ];

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 w-full z-50">
            <div className="bg-white/80 backdrop-blur-lg border-t border-gray-100 shadow-lg flex items-center justify-around py-2 px-1 safe-area-bottom">
                {navItems.map((item) => {
                    const { to, Icon, label, onClick, isAction } = item;

                    const content = (isActive = false) => (
                        <div className="flex flex-col items-center justify-center p-2 rounded-xl transition-all">
                            <motion.div
                                whileTap={{ scale: 0.9 }}
                                className={`${isAction ? "bg-blue-600 text-white p-2 rounded-full shadow-md -translate-y-1" : ""} relative`}
                            >
                                <Icon size={isAction ? 24 : 24} strokeWidth={isActive ? 2.5 : 2} />
                                {isActive && !isAction && (
                                    <motion.div
                                        layoutId="bottomNavDot"
                                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"
                                    />
                                )}
                            </motion.div>
                            {!isAction && <span className="text-[10px] mt-1 font-medium">{label}</span>}
                        </div>
                    );

                    if (isAction) {
                        return (
                            <button key={label} onClick={onClick} className="text-gray-500">
                                {content()}
                            </button>
                        );
                    }

                    return (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) =>
                                isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-900"
                            }
                        >
                            {({ isActive }) => content(isActive)}
                        </NavLink>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNav;
