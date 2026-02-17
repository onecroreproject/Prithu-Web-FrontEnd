import React from "react";
import {
    Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin,
    ArrowRight, Globe, Info, Layout, Share2, Save, RefreshCw, Image as ImageIcon
} from "lucide-react";

export const iconMap = {
    // Basic Icons
    Mail,
    Phone,
    MapPin,
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
    ArrowRight,
    Globe,
    Info,
    Layout,
    Share2,
    Save,
    RefreshCw,
    ImageIcon,

    // Branding & Payment
    Visa: () => <span className="text-[9px] font-black italic tracking-tighter text-white">VISA</span>,
    Mastercard: () => (
        <div className="flex items-center">
            <div className="w-2.5 h-2.5 rounded-full bg-[#eb001b] -mr-1"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#f79e1b] opacity-80"></div>
        </div>
    ),
    Maestro: () => (
        <div className="flex items-center">
            <div className="w-2.5 h-2.5 rounded-full bg-[#0061b1] -mr-1"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#eb001b] opacity-80"></div>
        </div>
    ),
    PayPal: () => <span className="text-[8px] font-black italic text-white leading-none">PayPal</span>,
    RuPay: () => (
        <div className="flex items-center gap-0.5">
            <span className="text-[9px] font-black italic text-white tracking-tighter">RuPay</span>
            <div className="flex flex-col gap-[1px]">
                <div className="w-1.5 h-[2px] bg-[#f98d41]"></div>
                <div className="w-1.5 h-[2px] bg-[#219245]"></div>
            </div>
        </div>
    ),
    UPI: () => <span className="text-[8px] font-bold text-slate-800">UPI</span>
};

export const cardStyles = {
    Visa: "bg-[#254da5]",
    Mastercard: "bg-[#0a2351]",
    Maestro: "bg-[#0a2351]",
    PayPal: "bg-[#003087]",
    RuPay: "bg-[#111111]"
};

export default iconMap;
