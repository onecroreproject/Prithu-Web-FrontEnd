import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, MessageSquare } from "lucide-react";
import axios from "../api/axios";
import { toast } from "react-hot-toast";
import { useEffect } from "react";
import { getSocket } from "../webSocket/socket";
import SEO from "../components/SEO";

const ContactPage = () => {
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    });

    const [contactInfo, setContactInfo] = useState({
        email: "support@prithu.app",
    });

    useEffect(() => {
        const fetchContactInfo = async () => {
            try {
                const response = await axios.get("/api/footer");
                if (response.data.success) {
                    setContactInfo({
                        email: response.data.data.email,
                    });
                }
            } catch (error) {
                console.error("Error fetching contact info:", error);
            }
        };

        fetchContactInfo();

        const socket = getSocket ? getSocket() : null;
        if (socket) {
            socket.on("footerUpdated", (newData) => {
                setContactInfo({
                    email: newData.email,
                });
            });
            return () => socket.off("footerUpdated");
        }
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await axios.post("/api/feedback/submit", {
                ...formData,
                section: "help",
                type: "feedback",
                category: "other",
                guestName: formData.name,
                guestEmail: formData.email,
                title: formData.subject
            });
            toast.success("Message sent successfully!");
            setFormData({ name: "", email: "", subject: "", message: "" });
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("Failed to send message. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] py-8 px-4 sm:px-6 lg:px-8">
            <SEO
                title="Contact Us - Prithu"
                description="Get in touch with Prithu support team for any assistance or inquiries."
            />

            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-extrabold text-[#0f172a] sm:text-3xl tracking-tight">
                        Get in Touch
                    </h1>
                    <p className="mt-2 text-base text-slate-600">
                        For quick assistance, please email us or fill out the contact form below.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Contact Information */}
                    <div className="space-y-4">
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow duration-300">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-[#6366f1] flex-shrink-0">
                                <Mail size={20} />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-[#0f172a] mb-0.5">Email Us</h3>
                                <p className="text-slate-500 text-xs mb-1">Our team is here to help.</p>
                                <a href={`mailto:${contactInfo.email}`} className="text-[#6366f1] text-sm font-semibold hover:underline">
                                    {contactInfo.email}
                                </a>
                            </div>
                        </div>

                    </div>

                    {/* Contact Form */}
                    <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-xl shadow-indigo-100/50 border border-gray-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-[#6366f1]">
                                <MessageSquare size={16} />
                            </div>
                            <h2 className="text-xl font-bold text-[#0f172a]">Send a Message</h2>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6366f1] focus:border-transparent transition-all outline-none text-sm"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6366f1] focus:border-transparent transition-all outline-none text-sm"
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Subject</label>
                                <input
                                    type="text"
                                    name="subject"
                                    required
                                    value={formData.subject}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6366f1] focus:border-transparent transition-all outline-none text-sm"
                                    placeholder="How can we help?"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Message</label>
                                <textarea
                                    name="message"
                                    required
                                    rows={4}
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6366f1] focus:border-transparent transition-all outline-none resize-none text-sm"
                                    placeholder="Your message here..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-3 bg-[#6366f1] hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? (
                                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <Send size={20} />
                                        Send Message
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
