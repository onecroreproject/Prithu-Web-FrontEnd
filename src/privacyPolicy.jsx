import React from "react";
import { Link } from "react-router-dom";
import SEO from "./components/SEO";

const PrivacyPolicy = () => {
  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto text-gray-800 min-h-screen bg-white">
      <SEO
        title="Privacy Policy & Terms | Prithu Social Media App"
        description="Read the official Privacy Policy and Terms of Use for Prithu, developed by D.L.K TECHNOLOGIES PRIVATE LIMITED. Learn about our location data handling, third-party integrations, and user rights."
      />

      <div className="border-b pb-8 mb-8">
        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
          Privacy Policy & Terms of Service
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 font-medium">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
            Last Updated: June 2, 2026
          </div>
          <span className="text-gray-300">|</span>
          <div>Developer: D.L.K TECHNOLOGIES PRIVATE LIMITED</div>
          <span className="text-gray-300">|</span>
          <div>Platform: Prithu (Mobile & Web Versions)</div>
        </div>
      </div>

      {/* Overview Alert */}
      <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 mb-8 rounded-r-lg">
        <p className="text-sm text-indigo-900 leading-relaxed">
          <strong>Important Regulatory Notice:</strong> This document serves as our official disclosure regarding personal data collection, precise location services, third-party SDK integrations, child safety standards, and account deletion protocols. It has been drafted in strict compliance with the <strong>Google Play Developer Policies</strong>, <strong>Apple App Store Privacy Guidelines</strong>, the <strong>General Data Protection Regulation (GDPR)</strong>, the Indian <strong>Digital Personal Data Protection Act (DPDPA), 2023</strong>, and the **Information Technology Act, 2000**.
        </p>
      </div>

      <div className="space-y-12">
        {/* Section 1: Information We Collect */}
        <section className="bg-gray-50 p-6 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-600 text-white font-bold text-sm shadow-md">
              1
            </span>
            Information We Collect
          </h2>
          <p className="text-gray-600 mb-4 pl-12 leading-relaxed">
            When you register, personalize your profile, upload content, or interact with the Prithu platform on mobile or web, we collect several types of data. This data is essential for account security, social connectivity, and regulatory compliance.
          </p>

          <div className="pl-12 space-y-4">
            <h3 className="font-semibold text-gray-800 text-lg">Categories of Data Collected:</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li><strong>User Identity Data:</strong> Legal Name, custom Username, Email Address, and Mobile Number.</li>
              <li><strong>Personal Profile Data:</strong> Profile Photo (avatar), cover photo, and social media links added to your biography.</li>
              <li><strong>User-Generated Content (UGC):</strong> Feeds, posts, comments, photos, videos, tags, and hashtags that you publish or share.</li>
              <li><strong>Device & Connectivity Details:</strong> IP Address, Unique Device Identifier (UUID), operating system version, browser parameters, and usage telemetry.</li>
              <li><strong>Usage Analytics:</strong> Interactions, engagement duration, popular categories, and features accessed.</li>
              <li><strong>Push Notification Tokens:</strong> Device registration keys utilized to route system alerts and interaction notifications.</li>
              <li><strong>Precise Location Data:</strong> Precise GPS coordinates (latitude and longitude) captured via foreground device location APIs.</li>
            </ul>
          </div>
        </section>

        {/* Section 2: Precise Location Data Handling */}
        <section className="p-6 border border-gray-100 rounded-xl shadow-sm bg-white">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-600 text-white font-bold text-sm shadow-md">
              2
            </span>
            Precise Location Data Handling
          </h2>
          <p className="text-gray-600 mb-4 pl-12 leading-relaxed">
            Our application collects and processes **precise location data (latitude & longitude)**. We respect your privacy, and location parameters are **only** accessed and stored after you grant explicit runtime permissions on your mobile device or web browser.
          </p>

          <div className="pl-12 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-4">
            <h4 className="font-bold text-blue-900 mb-2">Location Data Usage Purposes:</h4>
            <ol className="list-decimal pl-6 space-y-2 text-blue-800 text-sm">
              <li>
                <strong>Weather Information Delivery:</strong> We fetch localized weather forecasts to display real-time weather cards customized to your current location.
              </li>
              <li>
                <strong>Location-Based Feeds & Feeds Relevance:</strong> We populate your home feeds, community discussions, and category feeds with content and trends relevant to your immediate geographic area.
              </li>
              <li>
                <strong>Content Personalization & Experience Enhancements:</strong> We personalize recommendations, support proximity-based safety features, and let you voluntarily tag posts with local landmarks.
              </li>
            </ol>
          </div>
          <p className="text-gray-600 pl-12 text-sm italic">
            Note: You can revoke location permissions at any time through your operating system settings. Revoking permission will limit weather widgets and geo-targeted feed ordering, but will not disable core social posting capabilities.
          </p>
        </section>

        {/* Section 3: Device Permissions Explained */}
        <section className="bg-gray-50 p-6 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-600 text-white font-bold text-sm shadow-md">
              3
            </span>
            Mobile App Device Permissions
          </h2>
          <p className="text-gray-600 mb-4 pl-12 leading-relaxed">
            Depending on your device platform (Android or iOS), Prithu requests permission to access sensitive physical hardware or system features. Below is the functional mapping of these permissions:
          </p>

          <div className="pl-12 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border bg-white rounded-lg overflow-hidden text-left text-sm text-gray-600">
              <thead className="bg-gray-100 font-bold text-gray-950">
                <tr>
                  <th className="px-4 py-3 border">Permission Label</th>
                  <th className="px-4 py-3 border">System Name</th>
                  <th className="px-4 py-3 border">Functional Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3 border font-semibold">Precise Location</td>
                  <td className="px-4 py-3 border text-xs font-mono">ACCESS_FINE_LOCATION</td>
                  <td className="px-4 py-3 border">Gathers high-accuracy GPS coordinates for weather widgets, region feeds, and safety personalization.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 border font-semibold">Camera</td>
                  <td className="px-4 py-3 border text-xs font-mono">CAMERA</td>
                  <td className="px-4 py-3 border">Captures pictures and record clips directly for profile custom photos and posting media.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 border font-semibold">Photos / Media Library</td>
                  <td className="px-4 py-3 border text-xs font-mono">READ_MEDIA_IMAGES</td>
                  <td className="px-4 py-3 border">Accesses and uploads images and media files stored in your local storage/gallery.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 border font-semibold">Push Notifications</td>
                  <td className="px-4 py-3 border text-xs font-mono">POST_NOTIFICATIONS</td>
                  <td className="px-4 py-3 border">Routes immediate notifications for feed comments, likes, follower alerts, and subscription updates.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 4: Third-Party Service & SDK Integrations */}
        <section className="p-6 border border-gray-100 rounded-xl shadow-sm bg-white">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-600 text-white font-bold text-sm shadow-md">
              4
            </span>
            Third-Party SDKs & Service Disclosures
          </h2>
          <p className="text-gray-600 mb-4 pl-12 leading-relaxed">
            To provide safe, secure, and performant operations, we utilize industry-standard Software Development Kits (SDKs) and infrastructure providers. These services process data in accordance with their respective privacy standards:
          </p>

          <div className="pl-12 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border text-left text-sm text-gray-600">
              <thead className="bg-gray-50 font-bold text-gray-950">
                <tr>
                  <th className="px-4 py-3 border">Partner / SDK</th>
                  <th className="px-4 py-3 border">Functional Integration</th>
                  <th className="px-4 py-3 border">Data Shared & Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3 border font-semibold">Firebase Authentication</td>
                  <td className="px-4 py-3 border">Identity Management</td>
                  <td className="px-4 py-3 border">Protects credential verification, login authorizations, and user accounts from spoofing.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 border font-semibold">Firebase Cloud Messaging (FCM)</td>
                  <td className="px-4 py-3 border">Notification Routing</td>
                  <td className="px-4 py-3 border">Transmits push notification tokens to send interactive alerts to the specific device.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 border font-semibold">Firebase Analytics</td>
                  <td className="px-4 py-3 border">Product Usage Optimization</td>
                  <td className="px-4 py-3 border">Gathers anonymized device telemetry and screen interaction records to diagnose crashes.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 border font-semibold">Cloudinary</td>
                  <td className="px-4 py-3 border">Media Asset Processing</td>
                  <td className="px-4 py-3 border">Stores and optimizes profile pictures, cover arts, and feed attachments on a secure CDN.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 border font-semibold">Google Play Services</td>
                  <td className="px-4 py-3 border">OS Integration API</td>
                  <td className="px-4 py-3 border">Provides system map components, hardware integrity verification, and location service access APIs.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 border font-semibold">Instifi</td>
                  <td className="px-4 py-3 border">Payment Gateway</td>
                  <td className="px-4 py-3 border">Processes secure subscription orders in INR. Shares customer email, phone, name, and billing details.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 5: Irrevocable Account Deletion Policy */}
        <section className="bg-gray-50 p-6 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-600 text-white font-bold text-sm shadow-md">
              5
            </span>
            Irrevocable Account Deletion
          </h2>
          <div className="pl-12 space-y-4 text-gray-600 leading-relaxed">
            <p>
              In absolute alignment with the **Google Play Account Deletion Policy** and **Apple App Store Review Guideline 5.1.1(v)**, Prithu makes it incredibly simple to request permanent account erasure. You are not forced to email or contact support to erase your footprint.
            </p>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2">How to Request Deletion:</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>In-App Path:</strong> Navigate to <strong>Settings &gt; Account Management &gt; Delete Account</strong> within the Prithu application interface.
                </li>
                <li>
                  <strong>Web Portal:</strong> Submit an instantaneous web deletion request on our dedicated deletion interface: <a href="https://prithu.app/delete-data" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline font-medium">https://prithu.app/delete-data</a>.
                </li>
              </ul>
            </div>
            <p>
              <strong>Data Deletion Scope & Timeline:</strong> Once you trigger account deletion, your profile details, verification records, login parameters, precise location history log records, and UGC posts/comments/feeds are immediately hidden. All assets hosted on Cloudinary are permanently removed via automated queues within 30 days. No archival index or backup of personal details remains.
            </p>
            <p className="text-sm text-gray-500">
              Note: Billing and payment records generated through Instifi subscriptions are retained strictly for financial reporting, auditing, and tax compliance as legally required under Indian IT Act and reserve regulations.
            </p>
          </div>
        </section>

        {/* Section 6: Child Safety Standards & COPPA/GDPR-K Compliance */}
        <section className="p-6 border border-gray-100 rounded-xl shadow-sm bg-white">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-600 text-white font-bold text-sm shadow-md">
              6
            </span>
            Child Safety Standards & Age Gating
          </h2>
          <div className="pl-12 space-y-4 text-gray-600 leading-relaxed">
            <p>
              <strong>Strict Age Requirement:</strong> The Prithu platform is designed for general audiences. It is strictly prohibited to individuals under **13 years of age** (or 16 years within EU/EEA jurisdictions). We do not knowingly solicit or collect personal information from children under 13. If a parent or guardian becomes aware that their ward has created an account, contact us at <strong>info@prithu.app</strong> for immediate deletion.
            </p>
            <p>
              <strong>CSAM & CSAE Proactive Zero-Tolerance:</strong> D.L.K TECHNOLOGIES PRIVATE LIMITED enforces an absolute zero-tolerance standard for **Child Sexual Abuse Material (CSAM)** or **Child Sexual Abuse and Exploitation (CSAE)**. We deploy automated hashing technologies and manual moderating queues to scan feed uploads. Any offending user will be immediately banned, and all relevant account metadata will be preserved and reported directly to the **National Center for Missing & Exploited Children (NCMEC)** and law enforcement.
            </p>
          </div>
        </section>

        {/* Section 7: GDPR & CCPA/CPRA Legal Rights */}
        <section className="bg-gray-50 p-6 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-600 text-white font-bold text-sm shadow-md">
              7
            </span>
            Global Privacy Frameworks & User Rights
          </h2>
          <div className="pl-12 space-y-4 text-gray-600 leading-relaxed">
            <p>
              Regardless of where you reside, Prithu respects your rights over your personal data. Below are your rights under global privacy frameworks (GDPR and CCPA):
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Right to Access & Rectify:</strong> You have the right to request access to the exact data categories we hold, and correct any inaccuracies inside your profile fields.</li>
              <li><strong>Right to Erasure (Right to Be Forgotten):</strong> You can completely purge your personal files through the in-app or web portal deletion flow.</li>
              <li><strong>Right to Restrict & Object:</strong> You can object to data analytical processing, revoke precise location permission, or request limit-based restrictions on how device logs are reviewed.</li>
              <li><strong>Right to Portability:</strong> You can request an electronic export of your profile information, posts, and feeds in a standardized format.</li>
              <li><strong>Opt-Out of Data Sale & Sharing:</strong> We do not sell or rent your personal information to marketing brokers. You have the right to object to any future sharing practices.</li>
            </ul>
          </div>
        </section>

        {/* Section 8: DPDPA 2023 & Indian IT Act Grievance Redressal */}
        <section className="p-6 border border-gray-100 rounded-xl shadow-sm bg-white">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-600 text-white font-bold text-sm shadow-md">
              8
            </span>
            Indian DPDPA, 2023 & IT Act Grievance Redressal
          </h2>
          <div className="pl-12 space-y-4 text-gray-600 leading-relaxed">
            <p>
              As an Indian company operating under **D.L.K TECHNOLOGIES PRIVATE LIMITED**, we fully comply with the **Digital Personal Data Protection Act (DPDPA), 2023** and the **Information Technology Act, 2000**.
            </p>
            <p>
              In compliance with national law, we have designated a Grievance Officer who is responsible for addressing queries, complaints, or grievance requests related to user data collection, security breaches, or deletion issues:
            </p>
            <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
              <ul className="space-y-2 text-sm">
                <li><strong>Designated Officer:</strong> Grievance Redressal Cell / Data Protection Officer</li>
                <li><strong>Company Address:</strong> D.L.K TECHNOLOGIES PRIVATE LIMITED, Ground Floor, Raahat Plaza, No - 68/70, Near AVM, Opposite to VIJAYA HOSPITAL, Vadapalani, Chennai, Tamil Nadu – 600026, India.</li>
                <li><strong>Official Email:</strong> <a href="mailto:info@prithu.app" className="text-indigo-600 hover:underline font-semibold">info@prithu.app</a></li>
              </ul>
            </div>
            <p className="text-sm">
              We pledge to acknowledge all grievances within 36 hours and fully resolve complaints in accordance with the regulatory timelines prescribed under DPDPA, 2023.
            </p>
          </div>
        </section>

        {/* Section 9: Data Security & Global Transfers */}
        <section className="bg-gray-50 p-6 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-600 text-white font-bold text-sm shadow-md">
              9
            </span>
            Data Security & Data Transfers
          </h2>
          <div className="pl-12 space-y-4 text-gray-600 leading-relaxed">
            <p>
              We implement industry-standard encryption protocols (SSL/TLS in transit, and robust hashing at rest) to safeguard user identities, location history records, and billing data. However, please remember that no web connection or mobile hardware is completely impenetrable.
            </p>
            <p>
              <strong>Global Data Transfers:</strong> Since the corporate entity is in Chennai, India, your data will be hosted on secure servers in India and US regions. We utilize Standard Contractual Clauses (SCCs) to govern data transfers from EU regions, guaranteeing the preservation of user data rights globally.
            </p>
          </div>
        </section>
      </div>

      {/* Terms and Conditions Section */}
      <div className="border-t border-gray-200 pt-10 mt-16">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-6">
          Terms & Conditions of Service
        </h2>

        <p className="mb-4 text-gray-600 leading-relaxed">
          This document is an electronic record in accordance with the
          Information Technology Act, 2000 and applicable rules. This electronic
          record is generated by a computer system and does not require any
          physical or digital signatures.
        </p>

        <p className="mb-8 text-gray-600 leading-relaxed">
          By accessing, installing, or registering an account on the Prithu platform, you agree to comply with
          these Terms of Use and all applicable laws and regulations. If you do not agree, you must immediately uninstall the app.
        </p>

        <div className="space-y-8">
          <section className="pl-4 border-l-4 border-indigo-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              1. Eligibility & Registration
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Users must provide accurate, truthful, and complete information during
              registration. You are strictly responsible for preserving the confidentiality of your login codes and all activities conducted through your active account. You must be at least 13 years of age to register.
            </p>
          </section>

          <section className="pl-4 border-l-4 border-indigo-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              2. Use of the Platform & Code of Conduct
            </h3>
            <p className="text-gray-600 leading-relaxed">
              You agree to use the platform only for lawful purposes. You shall not upload any material that is defamatory, obscene, harassing, hateful, threatening, or violates third-party copyrights. Prohibited acts include data mining, scraping, or trying to inject malicious exploit codes into backend routing vectors.
            </p>
          </section>

          <section className="pl-4 border-l-4 border-indigo-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              3. Intellectual Property Rights
            </h3>
            <p className="text-gray-600 leading-relaxed">
              All platform components, including logos, visual interface styles, CSS animations, JavaScript files, database layouts, and patents remain the sole intellectual property of **D.L.K TECHNOLOGIES PRIVATE LIMITED** or its licensors.
            </p>
          </section>

          <section className="pl-4 border-l-4 border-indigo-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              4. Prohibited Activities & Security Auditing
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Any attempt to bypass security layers, access unencrypted database tables, spoof GPS location records, or execute brute-force attacks on our APIs will result in immediate termination of service and referral to cybercrime authorities under Section 43 and Section 66 of the Indian Information Technology Act, 2000.
            </p>
          </section>

          <section className="pl-4 border-l-4 border-indigo-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              5. Limitation of Liability
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Prithu is provided strictly on an "as is" and "as available" basis without warranties of any kind. D.L.K TECHNOLOGIES PRIVATE LIMITED is not liable for user-generated content, database link blackouts, device performance issues, or transaction delays resulting from Instifi gateway disconnects.
            </p>
          </section>

          <section className="pl-4 border-l-4 border-indigo-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              6. Governing Law & Dispute Redressal
            </h3>
            <p className="text-gray-600 leading-relaxed">
              These terms are governed by the laws of the Republic of India. Any litigation, dispute, or claim arising from these disclosures shall fall under the exclusive jurisdiction of the competent courts in Chennai, Tamil Nadu, India.
            </p>
          </section>

          <section className="pl-4 border-l-4 border-indigo-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              7. Child Safety Standards Policy
            </h3>
            <p className="text-gray-600 mb-2 leading-relaxed">
              <strong>D.L.K TECHNOLOGIES PRIVATE LIMITED</strong> is dedicated to delivering a healthy, positive, and safe social environment. We strictly enforce policies protecting minors:
            </p>
            <div className="space-y-4 pl-4 text-sm text-gray-600">
              <p>
                <strong>Zero Tolerance for CSAE & CSAM:</strong> We completely prohibit the creation, upload, or sharing of any child sexual exploitation material. Accounts attempting to share CSAM are immediately deleted, banned, and reported globally.
              </p>
              <p>
                <strong>Reporting Violation Mechanisms:</strong> Users can flag violating content immediately inside the app by choosing the safety flag button on any post. Reports are handled with priority and resolved within 24 hours.
              </p>
            </div>
          </section>

          <section className="pl-4 border-l-4 border-indigo-200 bg-gray-50 p-4 rounded-r-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Corporate Identity</h3>
            <ul className="list-none space-y-1 text-sm text-gray-600">
              <li><strong>Platform:</strong> Prithu Social Media</li>
              <li><strong>Website:</strong> <a href="https://prithu.app" className="text-indigo-600 hover:underline">https://prithu.app</a></li>
              <li><strong>Incorporated Entity:</strong> D.L.K TECHNOLOGIES PRIVATE LIMITED</li>
              <li><strong>Registered Office:</strong> Ground Floor, Raahat Plaza, No - 68/70, Near AVM, Opposite to VIJAYA HOSPITAL, Vadapalani, Chennai, Tamil Nadu – 600026, India.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;