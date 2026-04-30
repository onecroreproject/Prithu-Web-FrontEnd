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

      <div className="flex items-center gap-2 mb-6 text-sm text-gray-500 font-medium">
        <span className="w-2 h-2 rounded-full bg-green-500"></span>
        Last Updated: April 29, 2026
      </div>

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

        {/* Child Safety */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 text-sm">
              8
            </span>
            Child Safety
          </h2>

          <div className="pl-10 space-y-4">
            <div>
              <h4 className="font-bold text-gray-800 mb-1">Child Safety Standards Policy</h4>
              <p className="text-gray-600">
                We maintain a zero-tolerance policy for any content that exploits or harms children. We use advanced detection technologies and human review to identify and remove such content.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-1">Violation of Child Safety Standards Policy</h4>
              <p className="text-gray-600">
                Violations result in immediate permanent bans and reporting to law enforcement and safety organizations like the National Center for Missing & Exploited Children (NCMEC).
              </p>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 text-sm">
              9
            </span>
            Contact Us
          </h2>

          <p className="text-gray-600 pl-10">
            If you have any questions or concerns regarding this Privacy
            Policy, please contact us through the official support channels
            provided on the Prithu platform.
          </p>
        </section>

        {/* Changes to This Policy */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 text-sm">
              10
            </span>
            Changes to This Policy
          </h2>

          <p className="text-gray-600 pl-10">
            We may update this Privacy Policy from time to time to reflect changes in our practices or for legal, regulatory, or operational reasons. We will notify you of any significant changes by posting the new policy on this page and updating the "Last Updated" date at the top of the policy. We encourage you to review this policy periodically to stay informed about how we are protecting your information.
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
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              7. Child Safety Standards
            </h3>
            <p className="text-gray-600 pl-4 mb-2">
              Prithu is committed to providing a safe and secure environment for all users, especially children. We maintain a zero-tolerance policy regarding any content or behavior that violates child safety standards.
            </p>
            <div className="pl-4 space-y-4">
              <div>
                <h4 className="font-bold text-gray-800 mb-1">Child Safety Standards Policy</h4>
                <p className="text-gray-600 mb-2">
                  All users must adhere to strict safety standards to protect minors. We prohibit any content or activity that exploits, harms, or threatens to harm children. This includes, but is not limited to:
                </p>
                <ul className="list-disc pl-10 space-y-1 text-gray-600">
                  <li><strong>Child Sexual Abuse Material (CSAM):</strong> Sharing, uploading, or distributing any imagery or videos depicting the sexual abuse or exploitation of minors is strictly prohibited.</li>
                  <li><strong>Grooming and Solicitation:</strong> Any attempt to contact minors for sexual purposes or to entice them into illegal activities is a severe violation.</li>
                  <li><strong>Physical Harm and Endangerment:</strong> Content that promotes or depicts physical violence, self-harm, or dangerous activities involving minors.</li>
                  <li><strong>Privacy Violations:</strong> Sharing private information or non-consensual imagery of minors without parental or legal guardian consent.</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-gray-800 mb-1">Detection and Monitoring</h4>
                <p className="text-gray-600">
                  We use a combination of automated scanning technologies, manual reviews, and user reports to identify and remove content that violates our child safety standards. We proactively cooperate with global safety organizations to stay updated on emerging threats.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-gray-800 mb-1">Violation of Child Safety Standards Policy</h4>
                <p className="text-gray-600">
                  Any violation of our child safety standards is treated with the highest severity. If we detect such activity, we will take immediate action:
                </p>
                <ul className="list-disc pl-10 space-y-1 text-gray-600 mt-2">
                  <li><strong>Account Termination:</strong> The offending account will be permanently banned without notice.</li>
                  <li><strong>Content Removal:</strong> All violating content will be immediately deleted from our servers.</li>
                  <li><strong>Legal Reporting:</strong> We will report the violation to the National Center for Missing & Exploited Children (NCMEC) and relevant law enforcement agencies in India and internationally.</li>
                  <li><strong>Preservation of Evidence:</strong> We will preserve all necessary data to assist law enforcement in their investigations.</li>
                </ul>
              </div>
            </div>
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