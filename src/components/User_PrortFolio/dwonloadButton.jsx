/* ✅ src/components/DownloadResumeButton.jsx */
import { ArrowDownToLine } from "lucide-react";

export default function DownloadResumeButton({
  href = "/resume.pdf",
  label = "Download Resume",
}) {
  return (
    <a
      href={href}
      download
      className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold
                 bg-[#ffc107] text-black hover:bg-[#ffb300] active:scale-[.98]
                 dark:bg-amber-400 dark:hover:bg-amber-300 transition-all shadow-sm"
    >
      <ArrowDownToLine size={16} />
      {label}
    </a>
  );
}
