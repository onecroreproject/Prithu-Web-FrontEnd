// ✅ FINAL SharePostPage.jsx (OG-SAFE & ROUTE-CORRECT)
import { useEffect } from "react";
import { useParams } from "react-router-dom";

function SharePostPage() {
  const { feedId } = useParams();

  useEffect(() => {
    // Real users only – OG already handled by backend HTML
    const timer = setTimeout(() => {
      window.location.replace(`/home/retrivefeed/${feedId}`);
    }, 800);

    return () => clearTimeout(timer);
  }, [feedId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent mx-auto"></div>
        <p className="mt-4 text-gray-700 font-medium">
          Redirecting to post…
        </p>
      </div>
    </div>
  );
}

export default SharePostPage;
