import React, { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { X, Download, Share2 } from "lucide-react";
import { toast } from "react-hot-toast";

const ReferralQRCodePopUp = ({ isOpen, onClose, referralCode }) => {
    const qrRef = useRef(null);

    if (!isOpen) return null;

    const referralLink = `${window.location.origin}/signup?ref=${referralCode}`;

    const downloadQRCode = () => {
        const canvas = qrRef.current.querySelector("canvas");
        if (!canvas) return;

        const url = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = url;
        link.download = `referral-qr-${referralCode}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("QR Code downloaded!");
    };

    const shareQRCode = async () => {
        if (navigator.share) {
            try {
                const canvas = qrRef.current.querySelector("canvas");
                const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
                const file = new File([blob], "referral-qr.png", { type: "image/png" });

                await navigator.share({
                    title: "Referral QR Code",
                    text: `Join me on Prithu! Use my referral code: ${referralCode}`,
                    files: [file],
                });
            } catch (error) {
                if (error.name !== "AbortError") {
                    toast.error("Sharing failed");
                }
            }
        } else {
            toast.error("Web Share API not supported on this browser");
        }
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
       <div
    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
    onClick={handleBackdropClick}
>
    <div className="bg-white rounded-2xl w-full max-w-xs overflow-hidden shadow-xl animate-in zoom-in duration-200">
        <div className="p-4 text-center border-b border-gray-100 relative">
            <button
                onClick={onClose}
                className="absolute right-3 top-3 p-1.5 hover:bg-gray-100 rounded-full transition-colors"
            >
                <X className="text-gray-400 w-4 h-4" />
            </button>

            
            <h2 className="text-xl font-bold text-gray-900">QR Code</h2>
            <p className="text-gray-500 text-sm mt-1">Scan to join</p>
        </div>

        <div className="p-5 flex flex-col items-center">
            <div
                ref={qrRef}
                className="bg-white p-3 rounded-xl border border-gray-100 mb-5"
            >
                <QRCodeCanvas
                    value={referralLink}
                    size={160}
                    level={"H"}
                    includeMargin={true}
                    imageSettings={{
                        src: "/logo.png",
                        height: 32,
                        width: 32,
                        excavate: true,
                    }}
                />
            </div>

            <div className="flex flex-col w-full gap-2">
                <button
                    onClick={downloadQRCode}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold text-sm hover:shadow-md transition-all active:scale-95"
                >
                    <Download className="w-4 h-4" />
                    Download
                </button>
            </div>

            <div className="mt-5 text-center">
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Code</p>
                <p className="text-base font-mono font-bold text-gray-800 tracking-wide">{referralCode}</p>
            </div>
        </div>
    </div>
</div>
    );
};

export default ReferralQRCodePopUp;
