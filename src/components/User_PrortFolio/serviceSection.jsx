/* ✅ src/components/serviceSection.jsx */
import { motion } from "framer-motion";
import {
  Code2,
  Palette,
  Laptop,
  Database,
  Smartphone,
  Globe2,
} from "lucide-react";

export default function ServicesSection({ user }) {
  const services = [
    {
      title: "Web Development",
      icon: <Code2 size={28} />,
      description:
        "Building responsive, user-friendly, and high-performing websites using modern technologies like React, Node.js, and MongoDB.",
    },
    {
      title: "UI/UX Design",
      icon: <Palette size={28} />,
      description:
        "Creating intuitive and visually appealing designs focused on user experience, usability, and branding consistency.",
    },
    {
      title: "Mobile App Development",
      icon: <Smartphone size={28} />,
      description:
        "Developing fast and efficient mobile applications using React Native and modern design principles.",
    },
    {
      title: "Backend APIs",
      icon: <Database size={28} />,
      description:
        "Designing and integrating RESTful APIs and backend systems with robust authentication and security.",
    },
    {
      title: "Full Stack Solutions",
      icon: <Laptop size={28} />,
      description:
        "End-to-end development — from design to deployment — tailored to your business needs and user goals.",
    },
    {
      title: "SEO & Optimization",
      icon: <Globe2 size={28} />,
      description:
        "Optimizing your website’s performance and SEO rankings for better visibility and faster loading.",
    },
  ];

  return (
    <section id="services" className="mb-12">
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

        {/* 🧠 Bio Summary */}
        <motion.p
          className="max-w-3xl mx-auto mt-4 text-gray-600 dark:text-gray-300 leading-relaxed text-base sm:text-lg"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {user?.bio ||
            "I’m a passionate developer focused on creating clean, efficient, and visually engaging digital experiences. My goal is to merge functionality with creativity, delivering products that make an impact."}
        </motion.p>
      </div>

      {/* 🧩 Services Section */}
      <motion.h2
        className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-gray-900 dark:text-white text-center"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        My Projects
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {services.map((service, index) => (
          <motion.div
            key={index}
            className="p-6 sm:p-8 rounded-lg transition-colors
                       bg-white hover:bg-gray-50
                       dark:bg-[#2d2d3a] dark:hover:bg-[#34343f] shadow-sm hover:shadow-md"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.35, delay: index * 0.05 }}
          >
            <div className="text-[#ffc107] mb-4">{service.icon}</div>
            <h3 className="text-lg sm:text-xl font-semibold mb-3 text-gray-900 dark:text-white">
              {service.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-5 leading-relaxed">
              {service.description}
            </p>
            <a
              href="#contact"
              className="text-[#ffc107] text-sm font-semibold hover:text-[#ffb300] inline-flex items-center"
            >
            Check the Link
            </a>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
