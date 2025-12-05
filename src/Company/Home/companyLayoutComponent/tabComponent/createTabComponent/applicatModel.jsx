import React, { useState } from 'react';
import {
  FiCalendar,
  FiMail,
  FiPhone,
  FiUser,
  FiMapPin,
  FiBriefcase,
  FiX,
  FiGlobe,
  FiLinkedin,
  FiGithub,
  FiFileText,
  FiEye,
  FiXCircle,
  FiExternalLink,
  FiDownload,
  FiStar,
  FiCheckCircle
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'react-hot-toast';

const ApplicantModal = ({
  showModal,
  selectedApplicant,
  statusConfig,
  onClose,
  onAccept,
  onReject,
  onShortlist,
  onMarkAsReviewed,
  rawData
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  // Extract detailed data
   const getDetailedData = () => {
    if (!rawData) return selectedApplicant;

    const curriculum = rawData.curriculum || {};
    const profile = rawData.profileSettings || {};
    const application = rawData.application || {};
    const job = rawData.application?.jobId || {};

    return {
      ...selectedApplicant,
      detailedEducation: curriculum.education || [],
      detailedExperience: curriculum.experience || [],
      detailedSkills: curriculum.skills || [],
      projects: curriculum.projects || [],
      certifications: curriculum.certifications || [],
      professionalSummary:
        curriculum.professionalSummary ||
        profile.bio ||
        'No summary available',
      coverLetter: application.coverLetter || 'No cover letter provided',
      jobDetails: {
        employmentType: job.employmentType,
        workMode: job.workMode,
        location: `${job.city || ''}${job.city && job.state ? ', ' : ''}${job.state || ''}`,
        salaryRange:
          job.salaryMin && job.salaryMax
            ? `₹${job.salaryMin.toLocaleString()} - ₹${job.salaryMax.toLocaleString()}`
            : 'Not specified',
        jobCategory: job.jobCategory,
        jobRole: job.jobRole
      },
      applicationHistory: application.history || [],
      profileAvatar: profile.profileAvatar,
      bio: profile.bio || profile.profileSummary
    };
  };


  const detailedApplicant = getDetailedData();

   const downloadResume = () => {
    if (detailedApplicant.resume) {
      window.open(detailedApplicant.resume, '_blank');
    } else {
      alert('No resume available for download');
    }
  };

  // Build link list ONCE, so it can be reused in PDF
  const pdfLinks = [];

  if (detailedApplicant?.portfolio) {
    pdfLinks.push({
      label: 'Portfolio Website',
      url: detailedApplicant.portfolio
    });
  }
  if (detailedApplicant?.linkedin) {
    pdfLinks.push({
      label: 'LinkedIn Profile',
      url: detailedApplicant.linkedin
    });
  }
  if (detailedApplicant?.github) {
    pdfLinks.push({
      label: 'GitHub Profile',
      url: detailedApplicant.github
    });
  }
  if (detailedApplicant?.resume) {
    pdfLinks.push({
      label: 'Resume Download',
      url: detailedApplicant.resume
    });
  }


  const captureAndDownloadPDF = async () => {
    if (!detailedApplicant || isDownloading) return;

    setIsDownloading(true);

    try {
      // Create a temporary div for capturing
      const tempDiv = document.createElement('div');
      tempDiv.style.cssText = `
        position: absolute;
        top: -9999px;
        left: -9999px;
        width: 800px;
        padding: 40px;
        background: white;
        color: #374151;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.6;
        z-index: 9999;
        opacity: 1;
      `;

      const formatDate = (dateStr) => {
        try {
          const date = new Date(dateStr);
          return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
        } catch {
          return dateStr;
        }
      };

      // PDF content HTML (for the image snapshot)
      tempDiv.innerHTML = `
        <div style="max-width: 720px; margin: 0 auto;">
          <!-- Header -->
          <div style="border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px;">
            <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 15px;">
              <div style="width: 60px; height: 60px; background-color: #dbeafe; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #1d4ed8; font-weight: bold; font-size: 24px;">
                ${detailedApplicant.name?.charAt(0)?.toUpperCase() || ''}
              </div>
              <div>
                <h1 style="font-size: 28px; font-weight: bold; margin: 0 0 5px 0; color: #111827;">${detailedApplicant.name}</h1>
                <p style="font-size: 16px; color: #6b7280; margin: 0; font-weight: 500;">${detailedApplicant.position || ''}</p>
              </div>
            </div>

            <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 15px;">
              <div style="background-color: #dbeafe; color: #1d4ed8; padding: 6px 12px; border-radius: 16px; font-size: 12px; font-weight: 500;">
                📍 ${detailedApplicant.location || 'N/A'}
              </div>
              <div style="background-color: #f3f4f6; color: #4b5563; padding: 6px 12px; border-radius: 16px; font-size: 12px; font-weight: 500;">
                💼 ${detailedApplicant.experience || 'N/A'}
              </div>
                <div style="background-color: #f3f4f6; color: #4b5563; padding: 6px 12px; border-radius: 16px; font-size: 12px; font-weight: 500;">
                  📅 Applied: ${formatDate(detailedApplicant.appliedDate)}
                </div>
                <div style="background-color: #f3f4f6; color: #4b5563; padding: 6px 12px; border-radius: 16px; font-size: 12px; font-weight: 500;">
                  📊 ${statusConfig[detailedApplicant.status]?.label || detailedApplicant.status}
                </div>
              </div>
            </div>

            <!-- Professional Summary -->
            ${
              detailedApplicant.professionalSummary ? `
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                <h2 style="font-size: 16px; font-weight: 600; color: #1f2937; margin: 0 0 12px 0;">PROFESSIONAL SUMMARY</h2>
                <p style="font-size: 14px; color: #4b5563; margin: 0; line-height: 1.6;">${detailedApplicant.professionalSummary}</p>
              </div>` : ''
            }

            <!-- Main Content -->
            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 30px; margin-bottom: 30px;">
              <!-- Left Column -->
              <div>
                <!-- Candidate Match Score -->
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h3 style="font-size: 16px; font-weight: 600; color: #1f2937; margin: 0;">CANDIDATE MATCH SCORE</h3>
                    <span style="font-size: 24px; font-weight: bold; color: #1d4ed8;">${detailedApplicant.match || ''}</span>
                  </div>
                  <div style="width: 100%; height: 10px; background-color: #e5e7eb; border-radius: 5px; overflow: hidden; margin-bottom: 8px;">
                    <div style="width: ${detailedApplicant.match || '0%'}; height: 100%; background: linear-gradient(to right, #3b82f6, #1d4ed8);"></div>
                  </div>
                  <p style="font-size: 12px; color: #6b7280; margin: 0;">Based on skills match, experience level, and position requirements</p>
                </div>

                <!-- Skills & Expertise -->
                <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                  <h3 style="font-size: 16px; font-weight: 600; color: #1f2937; margin: 0 0 15px 0;">SKILLS & EXPERTISE</h3>
                  <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                    ${
                      (detailedApplicant.skills || []).map(skill =>
                        `<div style="background-color: #dbeafe; color: #1d4ed8; padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 500;">${skill}</div>`
                      ).join('')
                    }
                  </div>
                </div>

                <!-- Cover Letter -->
                <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
                  <h3 style="font-size: 16px; font-weight: 600; color: #1f2937; margin: 0 0 15px 0;">COVER LETTER</h3>
                  <p style="font-size: 14px; color: #4b5563; margin: 0; line-height: 1.6;">${detailedApplicant.coverLetter || 'No cover letter provided'}</p>
                </div>
              </div>

              <!-- Right Column -->
              <div>
                <!-- Contact Information -->
                <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                  <h3 style="font-size: 16px; font-weight: 600; color: #1f2937; margin: 0 0 15px 0;">CONTACT INFORMATION</h3>
                  <div style="display: flex; flex-direction: column; gap: 12px;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                      <div style="width: 32px; height: 32px; background-color: #f3f4f6; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #6b7280; font-size: 14px;">✉️</div>
                      <div style="font-size: 14px; color: #374151;">${detailedApplicant.email || ''}</div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px;">
                      <div style="width: 32px; height: 32px; background-color: #f3f4f6; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #6b7280; font-size: 14px;">📞</div>
                      <div style="font-size: 14px; color: #374151;">${detailedApplicant.phone || ''}</div>
                    </div>
                  </div>
                </div>

                <!-- Online Presence (visual only in image, links overlayed separately) -->
                <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                  <h3 style="font-size: 16px; font-weight: 600; color: #1f2937; margin: 0 0 15px 0;">ONLINE PRESENCE</h3>
                  <div style="height:100px; display: flex; flex-direction: column; gap: 12px;">
                    
                  </div>
                </div>

                <!-- Additional Information -->
                <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
                  <h3 style="font-size: 16px; font-weight: 600; color: #1f2937; margin: 0 0 15px 0;">ADDITIONAL INFORMATION</h3>
                  <div style="display: flex; flex-direction: column; gap: 8px; font-size: 14px; color: #6b7280;">
                    <div><strong>Education:</strong> ${detailedApplicant.education || 'N/A'}</div>
                    <div><strong>Expected Salary:</strong> ${detailedApplicant.salary || 'N/A'}</div>
                    <div><strong>Application ID:</strong> ${String(detailedApplicant.id || '').substring(0, 8)}</div>
                    <div><strong>Work Mode:</strong> ${detailedApplicant.jobDetails?.workMode || 'Not specified'}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 11px; color: #9ca3af;">
              Generated from Applicant Management System • ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        `;

      document.body.appendChild(tempDiv);

      // Wait for layout
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Capture content as canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true
      });

      document.body.removeChild(tempDiv);

      // Create PDF and add captured image
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - margin * 2;

      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // PDF Header text
      pdf.setFontSize(18);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Applicant Profile', pageWidth / 2, margin + 10, { align: 'center' });

      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Candidate: ${detailedApplicant.name || ''}`, margin, margin + 20);
      pdf.text(`Position: ${detailedApplicant.position || ''}`, margin, margin + 27);
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, margin, margin + 34);

      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, margin + 40, pageWidth - margin, margin + 40);

      // Add image snapshot
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', margin, margin + 45, imgWidth, imgHeight, undefined, 'FAST');

      // Overlay clickable links for online presence on right column (approximate positions)
      const rightColumnX = margin + contentWidth * 0.68; // adjust based on layout
      const imageTopY = margin + 47;

      const links = [];
      if (detailedApplicant?.portfolio)
        links.push({label: 'Portfolio Website', url: detailedApplicant.portfolio, y: imageTopY + 145 });
      if (detailedApplicant?.linkedin)
        links.push({ label: 'LinkedIn Profile', url: detailedApplicant.linkedin, y: imageTopY + 150 });
      if (detailedApplicant?.github)
        links.push({ label: 'GitHub Profile', url: detailedApplicant.github, y: imageTopY + 155 });
      if (detailedApplicant?.resume)
        links.push({ label: 'Resume Download', url: detailedApplicant.resume, y: imageTopY + 160 });

      pdf.setFontSize(10);
      pdf.setTextColor(37, 99, 235); // blue color #2563eb
      pdf.setFont(undefined, 'bold');

      links.forEach(link => {
        pdf.textWithLink(link.label, rightColumnX, link.y, { url: link.url });
      });

      // Footer text
      const footerY = pageHeight - margin;
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text('Confidential - For internal use only', pageWidth / 2, footerY - 5, { align: 'center' });
      pdf.text(`Application ID: ${String(detailedApplicant.id || '').substring(0, 8)}`, pageWidth / 2, footerY, { align: 'center' });

      const fileName = `applicant-${(detailedApplicant.name || '').replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.pdf`;
      pdf.save(fileName);

      toast.success(`PDF for "${detailedApplicant.name}" downloaded successfully!`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };


  return (
    <AnimatePresence>
      {showModal && detailedApplicant && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[100] flex items-start justify-center p-4 overflow-y-auto"
          >
            <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl my-8 overflow-hidden flex flex-col border border-gray-200">
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-50 rounded-lg flex items-center justify-center">
                      <FiUser className="text-xl text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {detailedApplicant.name}
                      </h2>
                      <p className="text-gray-600 text-sm">
                        {detailedApplicant.position}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={captureAndDownloadPDF}
                      disabled={isDownloading}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm font-medium"
                      title="Download as PDF"
                    >
                      <FiFileText className="text-sm" />
                      {isDownloading ? 'Generating PDF...' : 'Save as PDF'}
                    </button>
                    <button
                      onClick={onClose}
                      className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <FiX className="text-xl" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs">
                      <FiMapPin className="text-xs" />
                      <span>{detailedApplicant.location}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-xs">
                      <FiBriefcase className="text-xs" />
                      <span>{detailedApplicant.experience}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-xs">
                      <FiCalendar className="text-xs" />
                      <span>Applied: {detailedApplicant.appliedDate}</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        statusConfig[detailedApplicant.status]?.color ||
                        'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {statusConfig[detailedApplicant.status]?.label ||
                        detailedApplicant.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Body with Scroll */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Professional Summary */}
                    {detailedApplicant.professionalSummary && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-3 text-sm">
                          Professional Summary
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {detailedApplicant.professionalSummary}
                        </p>
                      </div>
                    )}

                    {/* Match Score */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900 text-sm">
                          Candidate Match Score
                        </h3>
                        <span className="text-xl font-bold text-blue-600">
                          {detailedApplicant.match}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                          style={{ width: detailedApplicant.match }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-2">
                        Based on skills match, experience level, and position
                        requirements
                      </p>
                    </div>

                    {/* Skills */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3 text-sm">
                        Skills & Expertise
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {(detailedApplicant.skills || []).map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Cover Letter */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3 text-sm">
                        Cover Letter
                      </h3>
                      <p className="text-gray-600 text-sm whitespace-pre-wrap">
                        {detailedApplicant.coverLetter}
                      </p>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Contact Info */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3 text-sm">
                        Contact Information
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <FiMail className="text-gray-400 text-sm" />
                          <a
                            href={`mailto:${detailedApplicant.email}`}
                            className="text-blue-600 hover:text-blue-800 text-sm break-all"
                          >
                            {detailedApplicant.email}
                          </a>
                        </div>
                        <div className="flex items-center gap-3">
                          <FiPhone className="text-gray-400 text-sm" />
                          <a
                            href={`tel:${String(
                              detailedApplicant.phone || ''
                            ).replace(/[^\d+]/g, '')}`}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            {detailedApplicant.phone}
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Social Links */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3 text-sm">
                        Online Presence
                      </h3>
                      <div className="space-y-3">
                        {detailedApplicant.portfolio && (
                          <a
                            href={detailedApplicant.portfolio}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 text-blue-600 hover:text-blue-800 text-sm"
                          >
                            <FiGlobe className="text-gray-400" />
                            <span>Portfolio Website</span>
                            <FiExternalLink className="text-xs" />
                          </a>
                        )}
                        {detailedApplicant.linkedin && (
                          <a
                            href={detailedApplicant.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 text-blue-600 hover:text-blue-800 text-sm"
                          >
                            <FiLinkedin className="text-gray-400" />
                            <span>LinkedIn Profile</span>
                            <FiExternalLink className="text-xs" />
                          </a>
                        )}
                        {detailedApplicant.github && (
                          <a
                            href={detailedApplicant.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 text-blue-600 hover:text-blue-800 text-sm"
                          >
                            <FiGithub className="text-gray-400" />
                            <span>GitHub Profile</span>
                            <FiExternalLink className="text-xs" />
                          </a>
                        )}
                        {detailedApplicant.resume && (
                          <a
                            href={detailedApplicant.resume}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 text-blue-600 hover:text-blue-800 text-sm"
                          >
                            <FiDownload className="text-gray-400" />
                            <span>Download Resume</span>
                            <FiExternalLink className="text-xs" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3 text-sm">
                        Additional Information
                      </h3>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div>
                          <strong>Education:</strong>{' '}
                          {detailedApplicant.education}
                        </div>
                        <div>
                          <strong>Expected Salary:</strong>{' '}
                          {detailedApplicant.salary}
                        </div>
                        <div>
                          <strong>Application ID:</strong>{' '}
                          {String(detailedApplicant.id || '').substring(0, 8)}
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3 text-sm">
                        Quick Actions
                      </h3>
                      <div className="flex flex-col gap-2">
                        {detailedApplicant.status === 'applied' && (
                          <button
                            onClick={() =>
                              onMarkAsReviewed(detailedApplicant.id)
                            }
                            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            <FiEye className="text-sm" />
                            Mark as Reviewed
                          </button>
                        )}

                        {detailedApplicant.status === 'reviewed' && (
                          <>
                            <button
                              onClick={() => onShortlist(detailedApplicant.id)}
                              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
                            >
                              <FiStar className="text-sm" />
                              Shortlist Applicant
                            </button>
                           
                            <button
                              onClick={() => onReject(detailedApplicant.id)}
                              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                            >
                              <FiXCircle className="text-sm" />
                              Reject Application
                            </button>
                          </>
                        )}

                        {detailedApplicant.status === 'shortlisted' && (
                          <>
                            <button
                              onClick={() => onAccept(detailedApplicant.id)}
                              disabled={detailedApplicant.status === 'accepted'}
                              className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                                detailedApplicant.status === 'accepted'
                                  ? 'bg-emerald-100 text-emerald-700 cursor-not-allowed'
                                  : 'bg-green-600 text-white hover:bg-green-700'
                              }`}
                            >
                              <FiCheckCircle className="text-sm" />
                              {detailedApplicant.status === 'accepted'
                                ? 'Already Accepted'
                                : 'Accept Application'}
                            </button>
                            <button
                              onClick={() => onReject(detailedApplicant.id)}
                              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                            >
                              <FiXCircle className="text-sm" />
                              Reject Application
                            </button>
                          </>
                        )}

                        {detailedApplicant.status === 'accepted' && (
                          <div className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium">
                            <FiCheckCircle className="text-sm" />
                            Already Accepted
                          </div>
                        )}

                        {detailedApplicant.status === 'rejected' && (
                          <div className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium">
                            <FiXCircle className="text-sm" />
                            Already Rejected
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="text-xs text-gray-600">
                    <span className="font-medium">Note:</span> Click "Save as
                    PDF" button above to download this profile
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                      Close
                    </button>
                    <button
                      onClick={() =>
                        window.open(
                          `mailto:${detailedApplicant.email}?subject=Interview Invitation - ${detailedApplicant.position}`,
                          '_blank'
                        )
                      }
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Schedule Interview
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ApplicantModal;
