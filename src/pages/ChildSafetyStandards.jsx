import React from "react";
import SEO from "../components/SEO";

const ChildSafetyStandards = () => {
  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto text-gray-800 min-h-screen">
      <SEO
        title="Child Safety Standards | Prithu App"
        description="Our commitment to protecting children on the Prithu platform. Read our Child Safety Standards and zero-tolerance policy for CSAE."
      />

      <h1 className="text-3xl md:text-4xl font-extrabold mb-8 border-b pb-6 border-gray-100">
        Child Safety Standards
      </h1>

      <div className="flex items-center gap-2 mb-6 text-sm text-gray-500 font-medium">
        <span className="w-2 h-2 rounded-full bg-green-500"></span>
        Last Updated: May 6, 2026
      </div>

      <p className="mb-8 text-lg leading-relaxed text-gray-600">
        <strong>D.L.K TECHNOLOGIES PRIVATE LIMITED</strong>, the developer of the <strong>Prithu</strong> app, is committed to providing a safe and secure environment for all users, especially children. We maintain a zero-tolerance policy regarding any content or behavior that violates child safety standards.
      </p>

      <div className="space-y-10">
        {/* Our Commitment */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 text-sm">
              1
            </span>
            Our Commitment
          </h2>
          <p className="text-gray-600 pl-10">
            We maintain a zero-tolerance policy for any content that exploits or harms children. We strictly prohibit <strong>Child Sexual Abuse and Exploitation (CSAE)</strong> and <strong>Child Sexual Abuse Material (CSAM)</strong>. This policy applies to all users of the <strong>Prithu</strong> platform globally and is functional across all our services.
          </p>
        </section>

        {/* Prohibited Content */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 text-sm">
              2
            </span>
            Prohibited Content and Activity
          </h2>
          <p className="text-gray-600 mb-4 pl-10">
            All users must adhere to strict safety standards to protect minors. We strictly prohibit any content or activity that exploits, harms, or threatens to harm children. This includes, but is not limited to:
          </p>
          <ul className="list-disc pl-20 space-y-3 text-gray-600">
            <li>
              <strong>Child Sexual Abuse and Exploitation (CSAE) & Child Sexual Abuse Material (CSAM):</strong>
              Sharing, uploading, or distributing any imagery, videos, or text depicting the sexual abuse or exploitation of minors is strictly prohibited.
            </li>
            <li>
              <strong>Grooming and Solicitation:</strong>
              Any attempt to contact minors for sexual purposes or to entice them into illegal or harmful activities.
            </li>
            <li>
              <strong>Physical Harm and Endangerment:</strong>
              Content that promotes or depicts physical violence, self-harm, or dangerous activities involving minors.
            </li>
            <li>
              <strong>Privacy Violations:</strong>
              Sharing private information or non-consensual imagery of minors without parental or legal guardian consent.
            </li>
          </ul>
        </section>

        {/* Detection and Monitoring */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 text-sm">
              3
            </span>
            Detection and Monitoring
          </h2>
          <p className="text-gray-600 pl-10">
            <strong>Prithu</strong> uses a combination of advanced automated scanning technologies, manual reviews, and user reports to identify and remove content that violates our child safety standards. We proactively cooperate with global safety organizations to stay updated on emerging threats and ensure our platform remains safe.
          </p>
        </section>

        {/* Violation Policy */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 text-sm">
              4
            </span>
            Violation and Enforcement
          </h2>
          <p className="text-gray-600 mb-4 pl-10">
            Any violation of the Child Safety Standards Policy is treated with the highest severity. If we detect such activity, <strong>D.L.K TECHNOLOGIES PRIVATE LIMITED</strong> will take immediate action:
          </p>
          <ul className="list-disc pl-20 space-y-3 text-gray-600">
            <li>
              <strong>Immediate Termination:</strong> The offending account will be permanently banned from the <strong>Prithu</strong> app without notice.
            </li>
            <li>
              <strong>Content Removal:</strong> All violating content will be immediately deleted from our servers.
            </li>
            <li>
              <strong>Reporting to Authorities:</strong> We will report the violation to the <strong>National Center for Missing & Exploited Children (NCMEC)</strong> and relevant law enforcement agencies globally.
            </li>
            <li>
              <strong>Evidence Preservation:</strong> We will preserve all necessary data to assist law enforcement in their investigations.
            </li>
          </ul>
        </section>

        {/* Reporting Mechanism */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 text-sm">
              5
            </span>
            How to Report a Violation
          </h2>
          <p className="text-gray-600 pl-10">
            If you encounter any content or behavior on the <strong>Prithu</strong> app that you believe violates our Child Safety Standards, please report it immediately using the in-app reporting tools or by emailing us at Your report can help protect children and keep our community safe.
          </p>
        </section>

        {/* Company Details */}
        <section className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Developer & App Information</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li><strong>App Name:</strong> Prithu</li>
            <li><strong>Developer:</strong> D.L.K TECHNOLOGIES PRIVATE LIMITED</li>
            <li><strong>Website:</strong> https://prithu.app</li>
            <li><strong>Email:</strong> info@prithu.app</li>
            <li><strong>Address:</strong> Ground Floor, Raahat Plaza, No - 68/70, Vadapalani, Chennai, Tamil Nadu – 600026, India</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default ChildSafetyStandards;
