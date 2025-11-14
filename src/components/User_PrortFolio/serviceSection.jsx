/* ✅ src/components/serviceSection.jsx */
import { motion } from "framer-motion";
import { ExternalLink, Github, Link2, Calendar } from "lucide-react";
import React from "react";

export default function ServicesSection({ user }) {
  const projects = user?.projects?.slice(0, 3) || [];

  return (
    <section id="projects" className="mb-16">
      {/* 🧩 Section Header */}
      <div className="mb-10 text-center">
        <motion.h2
          className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          Profile Summary
        </motion.h2>

        <motion.p
          className="max-w-3xl mx-auto mt-4 text-gray-600 dark:text-gray-300 leading-relaxed text-base sm:text-lg"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {user?.profileSummary ||
            user?.bio ||
            "I’m a passionate developer focused on creating clean, efficient, and visually engaging digital experiences. My goal is to merge functionality with creativity, delivering products that make an impact."}
        </motion.p>
      </div>

      {/* 🧩 Project Section */}
      <motion.h2
        className="text-2xl sm:text-3xl font-bold mb-8 text-gray-900 dark:text-white text-center"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        My Projects
      </motion.h2>

      {projects.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">
          No projects available.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={project._id || index}
              className="relative group w-full h-[300px] perspective"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              {/* 🧠 Card Flip Container */}
              <div className="relative w-full h-full transition-transform duration-700 transform-style-preserve-3d group-hover:rotate-y-180">
                {/* 🔹 Front Side */}
                <div className="absolute inset-0 bg-white dark:bg-[#2d2d3a] rounded-2xl overflow-hidden shadow-md border border-gray-100 dark:border-gray-700 backface-hidden">
                  <img
                    src={project.projectImage}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent opacity-100 flex flex-col justify-end p-4">
                    <h3 className="text-lg font-semibold text-white">
                      {project.title}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-300 text-xs mt-1">
                      <Calendar size={12} />
                      <span>
                        {project.isOngoing
                          ? "Ongoing"
                          : project.endDate
                          ? new Date(project.endDate).toLocaleDateString("en-IN", {
                              month: "short",
                              year: "numeric",
                            })
                          : "Completed"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 🔹 Back Side */}
                <div className="absolute inset-0 bg-white dark:bg-[#2d2d3a] rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700 rotate-y-180 backface-hidden flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {project.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-4">
                      {project.description || "No description available."}
                    </p>

                    {/* 🔹 Tech Stack */}
                    {project.technologies?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {project.technologies.map((tech, i) => (
                          <span
                            key={i}
                            className="text-xs bg-[#ffc107]/10 text-[#ffc107] px-2 py-1 rounded-full font-medium"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 🔗 Links */}
                  <div className="flex justify-end gap-4 mt-5">
                    {project.githubLink && (
                      <a
                        href={project.githubLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-[#ffc107] transition"
                        title="GitHub"
                      >
                        <Github size={18} />
                      </a>
                    )}
                    {project.liveDemoLink && (
                      <a
                        href={project.liveDemoLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-[#ffc107] transition"
                        title="Live Demo"
                      >
                        <ExternalLink size={18} />
                      </a>
                    )}
                    {project.projectLink && (
                      <a
                        href={project.projectLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-[#ffc107] transition"
                        title="Project Link"
                      >
                        <Link2 size={18} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
