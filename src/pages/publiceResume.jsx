import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Mail, Phone, MapPin, Github, Linkedin, Facebook, Globe } from "lucide-react";
import api from "../api/axios";

export default function PublicResume() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get(`/api/public/resume/${username}`);
        if (!data.success && !data.data) throw new Error(data.message);
        setProfile(data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Invalid or unpublished resume link.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  /* 🔄 Skeleton Loader */
  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="bg-white shadow-md rounded-lg w-[210mm] h-[297mm] p-8 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-1 space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
            <div className="col-span-2 space-y-3">
              <div className="h-5 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col justify-center items-center h-screen text-center">
        <p className="text-red-500 text-lg font-semibold mb-3">{error}</p>
        <p className="text-gray-500 text-sm">Please verify the link or contact the owner.</p>
      </div>
    );

  const {
    name,
    lastName,
    userName,
    bio,
    phoneNumber,
    userId,
    city,
    country,
    experience,
    education,
    skills,
    certifications,
    socialLinks,
    socialLinksVisibility,
    references, // ✅ Added from backend
  } = profile;

  /* 🧾 A4 Layout (Portrait: 210mm x 297mm) */
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center py-10 print:bg-white">
      <div
        className="bg-white shadow-lg grid grid-cols-3 print:shadow-none"
        style={{
          width: "210mm",
          height: "297mm",
          boxShadow: "0 0 8px rgba(0,0,0,0.1)",
        }}
      >
        {/* LEFT COLUMN */}
        <div className="bg-gray-50 p-6 flex flex-col justify-between border-r border-gray-200">
          <div>
            {/* Skills */}
            {skills?.length > 0 && (
              <section className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 border-b-2 border-gray-800 pb-1 mb-3">
                  SKILLS
                </h2>
                <ul className="text-sm text-gray-700 space-y-1">
                  {skills.map((s, i) => (
                    <li key={i} className="list-disc ml-4">
                      {s.name}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Certifications */}
            {certifications?.length > 0 && (
              <section className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 border-b-2 border-gray-800 pb-1 mb-3">
                  CERTIFICATIONS
                </h2>
                {certifications.map((cert, i) => (
                  <div key={i} className="mb-3">
                    <p className="font-medium text-gray-800">{cert.title}</p>
                    <p className="text-xs text-gray-600">{cert.issuingOrganization}</p>
                  </div>
                ))}
              </section>
            )}

            {/* ✅ References (only if available) */}
            {references?.length > 0 && (
              <section className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 border-b-2 border-gray-800 pb-1 mb-3">
                  REFERENCES
                </h2>
                <div className="text-sm text-gray-700 space-y-3">
                  {references.map((ref, i) => (
                    <p key={i}>
                      <span className="font-medium">{ref.name}</span>{" "}
                      {ref.position && `— ${ref.position}`}
                      <br />
                      {ref.company && <span>{ref.company}</span>}
                      {ref.phone && (
                        <>
                          <br />
                          📞 {ref.phone}
                        </>
                      )}
                      {ref.email && (
                        <>
                          <br />
                          ✉️ {ref.email}
                        </>
                      )}
                    </p>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Contact Info */}
          <div className="border-t border-gray-300 pt-4 text-sm text-gray-700 space-y-2">
            <p>
              <Phone className="inline w-4 h-4 mr-2 text-gray-600" />
              {phoneNumber || "+91 00000 00000"}
            </p>
            <p>
              <Mail className="inline w-4 h-4 mr-2 text-gray-600" />
              {userId?.email || "example@email.com"}
            </p>
            <p>
              <MapPin className="inline w-4 h-4 mr-2 text-gray-600" />
              {city || "Chennai"}, {country || "India"}
            </p>

            {/* Social Links */}
            <div className="flex flex-wrap gap-2 pt-2 text-gray-700">
              {socialLinksVisibility?.facebook && socialLinks?.facebook && (
                <a href={socialLinks.facebook} target="_blank" rel="noreferrer">
                  <Facebook className="w-4 h-4 inline text-gray-700" />
                </a>
              )}
              {socialLinksVisibility?.linkedin && socialLinks?.linkedin && (
                <a href={socialLinks.linkedin} target="_blank" rel="noreferrer">
                  <Linkedin className="w-4 h-4 inline text-gray-700" />
                </a>
              )}
              {socialLinksVisibility?.github && socialLinks?.github && (
                <a href={socialLinks.github} target="_blank" rel="noreferrer">
                  <Github className="w-4 h-4 inline text-gray-700" />
                </a>
              )}
              {socialLinksVisibility?.website && socialLinks?.website && (
                <a href={socialLinks.website} target="_blank" rel="noreferrer">
                  <Globe className="w-4 h-4 inline text-gray-700" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="col-span-2 p-8 overflow-y-auto">
          {/* Header */}
          <div className="border-b border-gray-300 pb-4 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-wide">
              {name} {lastName}
            </h1>
            <p className="text-sm text-gray-600">@{userName}</p>
          </div>

          {/* About Me */}
          {bio && (
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 border-b-2 border-gray-800 pb-1 mb-2">
                ABOUT ME
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed">{bio}</p>
            </section>
          )}

          {/* Education */}
          {education?.length > 0 && (
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 border-b-2 border-gray-800 pb-1 mb-3">
                EDUCATION
              </h2>
              {education.map((edu, i) => (
                <div key={i} className="mb-4">
                  <h3 className="font-semibold text-gray-800">{edu.level}</h3>
                  <p className="text-sm text-gray-600">
                    {edu.schoolOrCollege} • {edu.boardOrUniversity}
                  </p>
                  {edu.fieldOfStudy && (
                    <p className="text-sm text-gray-600">{edu.fieldOfStudy}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    {edu.startYear} – {edu.endYear}
                  </p>
                </div>
              ))}
            </section>
          )}

          {/* Experience */}
          {experience?.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900 border-b-2 border-gray-800 pb-1 mb-3">
                EXPERIENCE
              </h2>
              {experience.map((exp, i) => (
                <div key={i} className="mb-4">
                  <h3 className="font-semibold text-gray-800">{exp.jobTitle}</h3>
                  <p className="text-sm text-gray-600">
                    {exp.companyName} • {exp.employmentType}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(exp.startDate).toLocaleDateString()} –{" "}
                    {exp.currentlyWorking
                      ? "Present"
                      : exp.endDate
                      ? new Date(exp.endDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                  {exp.description && (
                    <p className="text-sm text-gray-700 mt-1">{exp.description}</p>
                  )}
                </div>
              ))}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
