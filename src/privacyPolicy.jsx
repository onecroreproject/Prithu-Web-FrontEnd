import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto text-gray-800">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy for Prithu App</h1>
      <p className="mb-4 font-semibold">Last updated: October 29, 2025</p>

      <p className="mb-4">
        Welcome to <strong>Prithu App</strong> (“we”, “our”, “us”). Your privacy is important to us.
        This Privacy Policy explains how we collect, use, and protect your personal information
        when you use our mobile application <strong>Prithu App</strong> (the “App”).
      </p>

      <p className="mb-4">
        By using the App, you agree to the collection and use of information in accordance with this policy.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">1. Information We Collect</h2>
      <ul className="list-disc ml-6 space-y-2">
        <li>
          <strong>Personal Information:</strong> Name, Email address, Phone number, Profile photo and bio, Date of birth (optional).
        </li>
        <li>
          <strong>Account & Login Information:</strong> Email and password for authentication, Referral code (if used).
        </li>
        <li>
          <strong>User-Generated Content:</strong> Posts, comments, likes, shares, saved items, reels, and media uploaded by users.
        </li>
        <li>
          <strong>Usage Information:</strong> App activity such as posts viewed, liked, or shared, time spent, interactions with other users.
        </li>
        <li>
          <strong>Device & Technical Information:</strong> Device model, OS, IP address, app version, crash logs, diagnostic data.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">2. How We Use Your Information</h2>
      <ul className="list-disc ml-6 space-y-2">
        <li>Create and manage your account</li>
        <li>Display posts, reels, and user profiles</li>
        <li>Allow likes, comments, shares, and saves</li>
        <li>Provide referral and reward (coin earning) features</li>
        <li>Show trending and personalized feeds</li>
        <li>Improve app performance and experience</li>
        <li>Communicate updates or support</li>
        <li>Prevent fraud and ensure platform safety</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">3. Sharing of Information</h2>
      <p className="mb-4">
        We do not sell or rent your personal data to third parties. We may share information with:
      </p>
      <ul className="list-disc ml-6 space-y-2">
        <li>Service providers (hosting, analytics, cloud storage)</li>
        <li>Authorities when required by law or for safety</li>
        <li>Other users, with your consent (e.g., public posts)</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">4. Security of Your Data</h2>
      <p className="mb-4">
        We use industry-standard encryption and secure protocols. However, no online platform is 100% secure.
        You are responsible for maintaining the confidentiality of your login credentials.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">5. Your Rights and Choices</h2>
      <ul className="list-disc ml-6 space-y-2">
        <li>Access or update your profile information</li>
        <li>Delete your account and associated data</li>
        <li>Control who can see your posts and profile</li>
        <li>Disable notifications if desired</li>
      </ul>
      <p className="mt-2">
        To delete your account or request data removal, contact us at{" "}
        <a href="mailto:prithuapp@gmail.com" className="text-blue-600 underline">
          prithuapp@gmail.com
        </a>.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">6. Children’s Privacy</h2>
      <p className="mb-4">
        Our App is intended for users aged 13 and above. We do not knowingly collect data from children under 13.
        If we discover such data, we will delete it immediately.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">7. Third-Party Services</h2>
      <p className="mb-4">
        The App may use third-party services such as Google Analytics or Firebase for analytics, authentication,
        storage, or ads. These services have their own privacy policies, which we encourage you to review.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">8. Updates to This Policy</h2>
      <p className="mb-4">
        We may update this Privacy Policy from time to time. Updates will be reflected in the “Last updated” date above.
        Continued use of the App means you accept those changes.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">9. Contact Us</h2>
      <ul className="list-none space-y-1">
        <li>
          <strong>Email:</strong>{" "}
          <a href="mailto:prithuapp@gmail.com" className="text-blue-600 underline">
            prithuapp@gmail.com
          </a>
        </li>
        <li><strong>Developer:</strong> DLK Technologies</li>
        <li><strong>App Name:</strong> Prithu App</li>
      </ul>
    </div>
  );
};

export default PrivacyPolicy;
