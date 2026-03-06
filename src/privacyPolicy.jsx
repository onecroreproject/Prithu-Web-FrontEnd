import React from "react";
import SEO from "./components/SEO";

const PrivacyPolicy = () => {
  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto text-gray-800 min-h-screen">
      <SEO
        title="Privacy Policy | Prithu App"
        description="Read the Prithu App Privacy Policy to understand how we handle and protect your personal data."
      />

      <h1 className="text-3xl md:text-4xl font-extrabold mb-8 border-b pb-6 border-gray-100">
        Privacy Policy
      </h1>

      <p className="mb-8 text-lg leading-relaxed text-gray-600">
        Your privacy is very important to us. This Privacy Policy explains how
        Prithu ("we", "our", "us") collects, uses, and protects your personal
        information when you access or use our platform, website, and mobile
        application.
      </p>

      <div className="space-y-10">

        {/* Information We Collect */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 text-sm">
              1
            </span>
            Information We Collect
          </h2>

          <p className="text-gray-600 mb-2 pl-10">
            When you register or interact with the Prithu platform, we may
            collect the following information:
          </p>

          <ul className="list-disc pl-16 space-y-2 text-gray-600">
            <li>Name</li>
            <li>Username</li>
            <li>Email address</li>
            <li>Mobile number</li>
            <li>Profile photo or avatar</li>
            <li>Social media links added to your profile</li>
            <li>Content you create such as feeds, posts, comments, and hashtags</li>
            <li>Device information and IP address</li>
            <li>Browser type and operating system</li>
            <li>Platform usage activity</li>
          </ul>
        </section>

        {/* How We Use Information */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 text-sm">
              2
            </span>
            How We Use Your Information
          </h2>

          <p className="text-gray-600 mb-2 pl-10">
            We use the information we collect for the following purposes:
          </p>

          <ul className="list-disc pl-16 space-y-2 text-gray-600">
            <li>Create and manage your user account</li>
            <li>Display your profile and user-generated content</li>
            <li>Provide platform features such as feeds, posts, and interactions</li>
            <li>Improve platform performance and user experience</li>
            <li>Respond to user support requests</li>
            <li>Detect and prevent misuse, fraud, or security issues</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        {/* Sharing Information */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 text-sm">
              3
            </span>
            Sharing Your Information
          </h2>

          <p className="text-gray-600 pl-10 mb-2">
            We do not sell or rent your personal information to third parties.
            We may share information only in the following cases:
          </p>

          <ul className="list-disc pl-16 space-y-2 text-gray-600">
            <li>Trusted service providers who help operate our platform</li>
            <li>Government or legal authorities when required by law</li>
            <li>To protect the safety, rights, or property of users or the platform</li>
          </ul>
        </section>

        {/* User Content */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 text-sm">
              4
            </span>
            User Content
          </h2>

          <p className="text-gray-600 pl-10">
            Content you post on the platform such as feeds, comments, profile
            details, and interactions may be visible to other users depending
            on your privacy settings. You are responsible for the content you
            choose to share on the platform.
          </p>
        </section>

        {/* Data Security */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 text-sm">
              5
            </span>
            Data Security
          </h2>

          <p className="text-gray-600 pl-10">
            We implement reasonable security measures to protect your personal
            information from unauthorized access, misuse, or loss. However, no
            system is completely secure, and we cannot guarantee absolute
            security of your data.
          </p>
        </section>

        {/* Cookies */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 text-sm">
              6
            </span>
            Cookies
          </h2>

          <p className="text-gray-600 pl-10">
            Our platform may use cookies and similar technologies to improve
            user experience, analyze usage patterns, and enhance performance.
            You can manage or disable cookies through your browser settings.
          </p>
        </section>

        {/* User Rights */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 text-sm">
              7
            </span>
            Your Rights
          </h2>

          <p className="text-gray-600 mb-2 pl-10">
            As a user, you have the right to:
          </p>

          <ul className="list-disc pl-16 space-y-2 text-gray-600">
            <li>Access or update your personal information</li>
            <li>Request deletion of your account or personal data</li>
            <li>Control the visibility of your profile and content</li>
            <li>Opt out of promotional communications</li>
          </ul>
        </section>

        {/* Contact */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 text-sm">
              8
            </span>
            Contact Us
          </h2>

          <p className="text-gray-600 pl-10">
            If you have any questions or concerns regarding this Privacy
            Policy, please contact us through the official support channels
            provided on the Prithu platform.
          </p>
        </section>
      </div>

      {/* Terms */}
      <div className="border-t border-gray-200 pt-8 mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Terms & Conditions
        </h2>

        <p className="mb-4 text-gray-600">
          This document is an electronic record in accordance with the
          Information Technology Act, 2000 and applicable rules. This electronic
          record is generated by a computer system and does not require any
          physical or digital signatures.
        </p>

        <p className="mb-4 text-gray-600">
          By accessing or using the Prithu platform, you agree to comply with
          these Terms of Use and all applicable laws and regulations.
        </p>

        <div className="space-y-6">

          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              1. Eligibility & Registration
            </h3>
            <p className="text-gray-600 pl-4">
              Users must provide accurate and complete information during
              registration and are responsible for activities conducted through
              their accounts.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              2. Use of the Platform
            </h3>
            <p className="text-gray-600 pl-4">
              You agree to use the platform only for lawful purposes and in
              accordance with these Terms.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              3. Intellectual Property
            </h3>
            <p className="text-gray-600 pl-4">
              All platform content including design, code, graphics, and
              trademarks remain the intellectual property of Prithu.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              4. Prohibited Activities
            </h3>
            <p className="text-gray-600 pl-4">
              Users must not misuse the platform, upload harmful content,
              violate laws, or attempt to disrupt platform services.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              5. Limitation of Liability
            </h3>
            <p className="text-gray-600 pl-4">
              The platform is provided "as is". We are not liable for any
              indirect or consequential damages resulting from the use of the
              platform.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              6. Governing Law
            </h3>
            <p className="text-gray-600 pl-4">
              These Terms are governed by the laws of India and disputes shall
              fall under the jurisdiction of the applicable courts.
            </p>
          </section>
          <section>
  <h3 className="text-lg font-bold text-gray-900 mb-2">Company Details</h3>

  <ul className="list-disc pl-8 space-y-1 text-gray-600">
    <li>
      <strong>Platform Name:</strong> Prithu
    </li>

    <li>
      <strong>Website:</strong> https://prithu.app
    </li>

    <li>
      <strong>Company Name:</strong> DLK Technologies Pvt Ltd
    </li>

    <li>
      <strong>Registered Office Address:</strong> Ground Floor, Raahat Plaza,
      No - 68/70, Near AVM, Opposite to VIJAYA HOSPITAL, Vadapalani
    </li>

    <li>
      <strong>City & State:</strong> Chennai, Tamil Nadu – 600026, India
    </li>
  </ul>
</section>
<section>
  <h3 className="text-lg font-bold text-gray-900 mb-2">Contact Information</h3>

  <p className="text-gray-600 pl-4">
    For any questions or concerns about this Privacy Policy or our data
    practices, please contact us at:
  </p>

  <ul className="list-disc pl-8 space-y-1 text-gray-600 mt-2">
    <li>
      <strong>Email:</strong> [EMAIL_ADDRESS]
    </li>
  </ul>
</section>


        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;