import React, { useState, useRef, useEffect } from "react";
import { 
  Cpu, 
  BarChart3, 
  Code, 
  Layout, 
  Layers, 
  Smartphone, 
  Cloud, 
  Shield,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const tabs = [
  { id: "aiml", label: "AI/ML", icon: Cpu },
  { id: "data", label: "Data Analytics & BI", icon: BarChart3 },
  { id: "backend", label: "Backend", icon: Code },
  { id: "frontend", label: "Frontend", icon: Layout },
  { id: "fullstack", label: "Full Stack", icon: Layers },
  { id: "mobile", label: "Mobile Application", icon: Smartphone },
  { id: "devops", label: "DevOps/SRE", icon: Cloud },
  { id: "cybersecurity", label: "Cyber Security", icon: Shield },
];

// Updated course data with programming languages
const coursesData = {
  "aiml": [
    { 
      title: "Artificial Intelligence", 
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995", 
      languages: ["Python", "TensorFlow", "PyTorch", "Keras", "Scikit-learn", "R", "NumPy", "Pandas"]
    },
    { 
      title: "Machine Learning", 
      image: "https://images.unsplash.com/photo-1517142089942-ba376ce32a0e", 
      languages: ["Python", "TensorFlow", "PyTorch", "Scikit-learn", "Pandas", "NumPy", "Matplotlib", "Seaborn"]
    },
    { 
      title: "Natural Language Processing", 
      image: "https://images.unsplash.com/photo-1507209696998-3c532be9b2b5", 
      languages: ["Python", "NLTK", "spaCy", "Transformers", "BERT", "GPT", "Hugging Face"]
    },
    { 
      title: "Generative AI", 
      image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485", 
      languages: ["Python", "TensorFlow", "PyTorch", "Hugging Face", "OpenAI API", "LangChain", "DALL-E", "Stable Diffusion"]
    },
    { 
      title: "Predictive Modeling", 
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71", 
      languages: ["Python", "R", "Scikit-learn", "Statsmodels", "XGBoost", "LightGBM", "CatBoost"]
    },
    { 
      title: "Large Language Models", 
      image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb", 
      languages: ["Python", "TensorFlow", "PyTorch", "Transformers", "Hugging Face", "OpenAI", "Anthropic"]
    },
    { 
      title: "AI Interface Design", 
      image: "https://images.unsplash.com/photo-1551650975-87deedd944c3", 
      languages: ["Python", "JavaScript", "React", "Streamlit", "Gradio", "FastAPI", "Flask"]
    },
    { 
      title: "Query Segmentation", 
      image: "https://images.unsplash.com/photo-1543286386-2e659306cd6c", 
      languages: ["Python", "NLTK", "spaCy", "Regex", "BeautifulSoup", "Scrapy", "Elasticsearch"]
    },
  ],
  "data": [
    { 
      title: "Analytics", 
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71", 
      languages: ["SQL", "Python", "R", "Excel", "Power BI", "Tableau", "Statistics", "Data Visualization"]
    },
    { 
      title: "Data Science", 
      image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c", 
      languages: ["Python", "R", "SQL", "Jupyter", "Pandas", "NumPy", "Scikit-learn", "Matplotlib"]
    },
    { 
      title: "Data Mining", 
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475", 
      languages: ["Python", "R", "SQL", "Weka", "RapidMiner", "KNIME", "Orange", "Clustering"]
    },
    { 
      title: "Tableau", 
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71", 
      languages: ["Tableau", "SQL", "Data Blending", "Calculated Fields", "Parameters", "Dashboard Design", "Storytelling"]
    },
    { 
      title: "Power BI", 
      image: "https://images.unsplash.com/photo-1556155092-490a1ba16284", 
      languages: ["DAX", "Power Query", "M Language", "SQL", "Excel", "Data Modeling", "Dashboard Design"]
    },
    { 
      title: "Quantitative Analytics", 
      image: "https://images.unsplash.com/photo-1554224154-22dec7ec8818", 
      languages: ["Python", "R", "MATLAB", "QuantLib", "Statistical Analysis", "Calculus", "Linear Algebra"]
    },
    { 
      title: "Data Visualization", 
      image: "https://images.unsplash.com/photo-1517142089942-ba376ce32a0e", 
      languages: ["D3.js", "Plotly", "Matplotlib", "Seaborn", "ggplot2", "Chart.js", "JavaScript", "HTML/CSS"]
    },
    { 
      title: "Data Analyst", 
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c", 
      languages: ["SQL", "Excel", "Python", "R", "Tableau", "Power BI", "Statistics", "Data Cleaning"]
    },
  ],
  "backend": [
    { 
      title: "Python", 
      image: "https://images.unsplash.com/photo-1526378722484-bd91ca387e72", 
      languages: ["Python", "Django", "Flask", "FastAPI", "SQLAlchemy", "Celery", "Redis", "PostgreSQL"]
    },
    { 
      title: "Java", 
      image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c", 
      languages: ["Java", "Spring Boot", "Hibernate", "Maven", "Gradle", "JPA", "JUnit", "Microservices"]
    },
    { 
      title: "Go", 
      image: "https://images.unsplash.com/photo-1592609931041-40265b692757", 
      languages: ["Go", "Gin", "Echo", "GORM", "Go Kit", "Protocol Buffers", "gRPC", "Docker"]
    },
    { 
      title: "Node.js", 
      image: "https://images.unsplash.com/photo-1614332287897-cdc485fa562d", 
      languages: ["Node.js", "Express.js", "NestJS", "TypeScript", "MongoDB", "Redis", "Socket.io", "JWT"]
    },
    { 
      title: "Spring Framework", 
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31", 
      languages: ["Spring Boot", "Spring MVC", "Spring Security", "Spring Data", "Spring Cloud", "Hibernate", "JPA"]
    },
    { 
      title: "Django", 
      image: "https://images.unsplash.com/photo-1556075798-4825dfaaf498", 
      languages: ["Django", "Django REST", "PostgreSQL", "Celery", "Redis", "Docker", "Nginx", "Gunicorn"]
    },
    { 
      title: "RESTful APIs", 
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64", 
      languages: ["REST", "GraphQL", "OpenAPI", "Swagger", "Postman", "OAuth2", "JWT", "API Gateway"]
    },
    { 
      title: "Microservices", 
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64", 
      languages: ["Docker", "Kubernetes", "Service Mesh", "API Gateway", "Circuit Breaker", "Load Balancing", "Monitoring"]
    },
  ],
  "frontend": [
    { 
      title: "React.js", 
      image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee", 
      languages: ["React", "JavaScript", "TypeScript", "Redux", "React Router", "Material-UI", "Tailwind CSS", "Next.js"]
    },
    { 
      title: "Angular", 
      image: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a", 
      languages: ["Angular", "TypeScript", "RxJS", "Angular Material", "NgRx", "SCSS", "PWA", "Unit Testing"]
    },
    { 
      title: "JavaScript", 
      image: "https://images.unsplash.com/photo-1627398242454-45a1465c2479", 
      languages: ["JavaScript", "ES6+", "TypeScript", "Webpack", "Babel", "NPM", "Yarn", "Jest"]
    },
    { 
      title: "UI/UX Design", 
      image: "https://images.unsplash.com/photo-1561070791-2526d30994b5", 
      languages: ["Figma", "Adobe XD", "Sketch", "HTML5", "CSS3", "Sass", "Accessibility", "Responsive Design"]
    },
    { 
      title: "Bootstrap", 
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176", 
      languages: ["Bootstrap", "CSS", "JavaScript", "Responsive Design", "Grid System", "Components", "Theming"]
    },
    { 
      title: "jQuery", 
      image: "https://images.unsplash.com/photo-1545235617-9465d2a55698", 
      languages: ["jQuery", "JavaScript", "AJAX", "DOM Manipulation", "Event Handling", "Animations", "Plugins"]
    },
    { 
      title: "Modern CSS", 
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d", 
      languages: ["CSS3", "Sass", "Less", "CSS Grid", "Flexbox", "Animations", "Transitions", "CSS Variables"]
    },
    { 
      title: "Frontend Testing", 
      image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12", 
      languages: ["Jest", "React Testing Library", "Cypress", "Selenium", "Mocha", "Chai", "Enzyme", "Storybook"]
    },
  ],
  "fullstack": [
    { 
      title: "MERN Stack", 
      image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee", 
      languages: ["MongoDB", "Express.js", "React", "Node.js", "JavaScript", "Redux", "JWT", "REST API"]
    },
    { 
      title: "MEAN Stack", 
      image: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a", 
      languages: ["MongoDB", "Express.js", "Angular", "Node.js", "TypeScript", "RxJS", "JWT", "REST API"]
    },
    { 
      title: "LAMP Stack", 
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31", 
      languages: ["Linux", "Apache", "MySQL", "PHP", "JavaScript", "HTML/CSS", "WordPress", "Laravel"]
    },
    { 
      title: "Full Stack Python", 
      image: "https://images.unsplash.com/photo-1526378722484-bd91ca387e72", 
      languages: ["Python", "Django/Flask", "React/Angular", "PostgreSQL", "Docker", "AWS", "REST API", "Celery"]
    },
    { 
      title: "Full Stack Java", 
      image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c", 
      languages: ["Java", "Spring Boot", "React/Angular", "PostgreSQL", "Docker", "AWS", "Microservices", "JWT"]
    },
    { 
      title: "Serverless Stack", 
      image: "https://images.unsplash.com/photo-1614332287897-cdc485fa562d", 
      languages: ["AWS Lambda", "API Gateway", "DynamoDB", "React", "Amplify", "Cognito", "S3", "CloudFront"]
    },
    { 
      title: "Jamstack", 
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64", 
      languages: ["Next.js", "Gatsby", "Contentful", "Netlify", "Vercel", "Headless CMS", "GraphQL", "CDN"]
    },
    { 
      title: "Full Stack DevOps", 
      image: "https://images.unsplash.com/photo-1556155092-490a1ba16284", 
      languages: ["Docker", "Kubernetes", "CI/CD", "Monitoring", "React", "Node.js", "PostgreSQL", "AWS"]
    },
  ],
  "mobile": [
    { 
      title: "iOS Development", 
      image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c", 
      languages: ["Swift", "SwiftUI", "UIKit", "Xcode", "Core Data", "Combine", "ARKit", "TestFlight"]
    },
    { 
      title: "Android Development", 
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176", 
      languages: ["Kotlin", "Java", "Android Studio", "Jetpack Compose", "Room", "Coroutines", "Material Design", "Google Play"]
    },
    { 
      title: "React Native", 
      image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee", 
      languages: ["React Native", "JavaScript", "TypeScript", "Redux", "React Navigation", "Expo", "Native Modules", "Firebase"]
    },
    { 
      title: "Flutter", 
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64", 
      languages: ["Dart", "Flutter", "Provider", "Bloc", "Firebase", "Google Maps", "In-App Purchases", "Push Notifications"]
    },
    { 
      title: "Ionic", 
      image: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a", 
      languages: ["Ionic", "Angular/React", "TypeScript", "Capacitor", "Cordova", "PWA", "Native Plugins", "App Store"]
    },
    { 
      title: "Mobile UI/UX", 
      image: "https://images.unsplash.com/photo-1561070791-2526d30994b5", 
      languages: ["Figma", "Adobe XD", "Material Design", "Human Interface", "Prototyping", "User Testing", "Accessibility"]
    },
    { 
      title: "Mobile Backend", 
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64", 
      languages: ["Firebase", "AWS Amplify", "GraphQL", "REST API", "Push Notifications", "Analytics", "Authentication", "Storage"]
    },
    { 
      title: "Mobile Testing", 
      image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12", 
      languages: ["Appium", "Detox", "Espresso", "XCUITest", "Jest", "Cypress", "Performance Testing", "Security Testing"]
    },
  ],
  "devops": [
    { 
      title: "Site Reliability", 
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31", 
      languages: ["Monitoring", "Alerting", "Incident Response", "Capacity Planning", "Performance", "Reliability", "SLAs", "SLOs"]
    },
    { 
      title: "AWS", 
      image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c", 
      languages: ["EC2", "S3", "Lambda", "RDS", "VPC", "IAM", "CloudFormation", "CloudWatch"]
    },
    { 
      title: "Azure", 
      image: "https://images.unsplash.com/photo-1627398242454-45a1465c2479", 
      languages: ["Azure VMs", "Blob Storage", "Functions", "SQL Database", "AKS", "Azure DevOps", "Monitor", "Active Directory"]
    },
    { 
      title: "Cloud Architecture", 
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64", 
      languages: ["Multi-cloud", "Microservices", "Serverless", "Containers", "Networking", "Security", "Cost Optimization", "Disaster Recovery"]
    },
    { 
      title: "Docker", 
      image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12", 
      languages: ["Docker", "Docker Compose", "Dockerfile", "Container Registry", "Orchestration", "Security", "Networking", "Volumes"]
    },
    { 
      title: "Kubernetes", 
      image: "https://images.unsplash.com/photo-1627398242454-45a1465c2479", 
      languages: ["K8s", "Helm", "Ingress", "Services", "Deployments", "ConfigMaps", "Secrets", "Operators"]
    },
    { 
      title: "CI/CD", 
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64", 
      languages: ["Jenkins", "GitLab CI", "GitHub Actions", "CircleCI", "ArgoCD", "Spinnaker", "Testing", "Deployment"]
    },
    { 
      title: "Infrastructure as Code", 
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176", 
      languages: ["Terraform", "CloudFormation", "Ansible", "Puppet", "Chef", "SaltStack", "Pulumi", "CDK"]
    },
  ],
  "cybersecurity": [
    { 
      title: "Cyber Security", 
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71", 
      languages: ["Network Security", "Endpoint Security", "Threat Intelligence", "Vulnerability Management", "Penetration Testing", "SOC", "SIEM", "Firewalls"]
    },
    { 
      title: "Cloud Security", 
      image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c", 
      languages: ["AWS Security", "Azure Security", "GCP Security", "Cloud Compliance", "Identity Management", "Encryption", "Monitoring", "CSPM"]
    },
    { 
      title: "CISSP", 
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31", 
      languages: ["Security Governance", "Risk Management", "Asset Security", "Security Architecture", "Communication Security", "Identity Management", "Assessment", "Operations"]
    },
    { 
      title: "CISM", 
      image: "https://images.unsplash.com/photo-1627398242454-45a1465c2479", 
      languages: ["Information Security Governance", "Risk Management", "Program Development", "Incident Management", "Compliance", "Audit", "Strategy", "Metrics"]
    },
    { 
      title: "Information Security", 
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64", 
      languages: ["Policy Development", "Compliance", "Risk Assessment", "Audit", "Governance", "Training", "Awareness", "Standards"]
    },
    { 
      title: "Data Security", 
      image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12", 
      languages: ["Encryption", "Data Loss Prevention", "Classification", "Masking", "Tokenization", "GDPR", "HIPAA", "PCI DSS"]
    },
    { 
      title: "IT Security Strategy", 
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176", 
      languages: ["Roadmapping", "Budgeting", "Vendor Management", "Technology Selection", "Implementation Planning", "ROI Analysis", "Stakeholder Management", "Metrics"]
    },
    { 
      title: "Network Security", 
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71", 
      languages: ["Firewalls", "VPN", "IDS/IPS", "Network Segmentation", "NAC", "Wireless Security", "DNS Security", "Network Monitoring"]
    },
  ]
};

export default function CoursesSection() {
  const [activeTab, setActiveTab] = useState("aiml");
  const [scrollPosition, setScrollPosition] = useState(0);
  const [tabsScrollPosition, setTabsScrollPosition] = useState(0);
  const coursesContainerRef = useRef(null);
  const tabsContainerRef = useRef(null);

  const courses = coursesData[activeTab] || [];

  // Scroll functions for courses
  const scrollCoursesLeft = () => {
    if (coursesContainerRef.current) {
      const newPosition = Math.max(scrollPosition - 300, 0);
      coursesContainerRef.current.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });
      setScrollPosition(newPosition);
    }
  };

  const scrollCoursesRight = () => {
    if (coursesContainerRef.current) {
      const maxScroll = coursesContainerRef.current.scrollWidth - coursesContainerRef.current.clientWidth;
      const newPosition = Math.min(scrollPosition + 300, maxScroll);
      coursesContainerRef.current.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });
      setScrollPosition(newPosition);
    }
  };

  // Scroll functions for tabs
  const scrollTabsLeft = () => {
    if (tabsContainerRef.current) {
      const newPosition = Math.max(tabsScrollPosition - 150, 0);
      tabsContainerRef.current.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });
      setTabsScrollPosition(newPosition);
    }
  };

  const scrollTabsRight = () => {
    if (tabsContainerRef.current) {
      const maxScroll = tabsContainerRef.current.scrollWidth - tabsContainerRef.current.clientWidth;
      const newPosition = Math.min(tabsScrollPosition + 150, maxScroll);
      tabsContainerRef.current.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });
      setTabsScrollPosition(newPosition);
    }
  };

  // Handle scroll events
  const handleCoursesScroll = () => {
    if (coursesContainerRef.current) {
      setScrollPosition(coursesContainerRef.current.scrollLeft);
    }
  };

  const handleTabsScroll = () => {
    if (tabsContainerRef.current) {
      setTabsScrollPosition(tabsContainerRef.current.scrollLeft);
    }
  };

  // Update scroll buttons state
  useEffect(() => {
    if (tabsContainerRef.current) {
      const maxScroll = tabsContainerRef.current.scrollWidth - tabsContainerRef.current.clientWidth;
      setTabsScrollPosition(tabsContainerRef.current.scrollLeft);
    }
  }, [activeTab]);

  return (
    <section className="w-full bg-white py-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Top Navigation with Scroll Arrows */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={scrollTabsLeft}
            disabled={tabsScrollPosition === 0}
            className={`p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all ${
              tabsScrollPosition === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>

          <div 
            ref={tabsContainerRef}
            onScroll={handleTabsScroll}
            className="flex flex-1 overflow-x-auto scrollbar-hide mx-4"
            style={{ scrollBehavior: 'smooth' }}
          >
            <div className="flex gap-2 pb-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setScrollPosition(0);
                    }}
                    className={`flex flex-col items-center gap-2 flex-shrink-0 min-w-[140px] px-3 py-2 rounded-lg transition-all ${
                      isActive 
                        ? "bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 shadow-sm" 
                        : "hover:bg-gray-50 border border-gray-200"
                    }`}
                  >
                    <Icon
                      className={`w-6 h-6 ${
                        isActive ? "text-green-600" : "text-gray-400"
                      }`}
                    />
                    <span
                      className={`text-xs font-semibold text-center leading-tight ${
                        isActive ? "text-green-700" : "text-gray-600"
                      }`}
                    >
                      {tab.label}
                    </span>
                    {isActive && (
                      <div className="w-12 h-1 bg-green-600 rounded-full mt-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <button 
            onClick={scrollTabsRight}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Courses Grid with Scroll Arrows */}
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Courses</h3>
            <div className="flex gap-2">
              <button
                onClick={scrollCoursesLeft}
                disabled={scrollPosition === 0}
                className={`p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all ${
                  scrollPosition === 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <ChevronLeft className="w-4 h-4 text-gray-700" />
              </button>
              <button
                onClick={scrollCoursesRight}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all"
              >
                <ChevronRight className="w-4 h-4 text-gray-700" />
              </button>
            </div>
          </div>

          <div 
            ref={coursesContainerRef}
            onScroll={handleCoursesScroll}
            className="flex overflow-x-auto gap-6 pb-4 scrollbar-hide"
            style={{ scrollBehavior: 'smooth' }}
          >
            {courses.map((course, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-64"
              >
                <div
                  className="relative h-48 rounded-lg overflow-hidden shadow-md group cursor-pointer border border-gray-200 hover:border-green-400 hover:shadow-lg transition-all duration-300"
                >
                  <img
                    src={course.image}
                    alt={course.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />
                  <div className="absolute inset-0 flex flex-col justify-end p-4">
                    <h3 className="text-white text-lg font-bold mb-2">
                      {course.title}
                    </h3>
                    <div className="flex items-center gap-1">
                      {course.languages.slice(0, 3).map((lang, idx) => (
                        <span 
                          key={idx}
                          className="px-2 py-1 bg-white/20 text-white text-xs rounded-full backdrop-blur-sm"
                        >
                          {lang}
                        </span>
                      ))}
                      {course.languages.length > 3 && (
                        <span className="px-2 py-1 bg-white/20 text-white text-xs rounded-full backdrop-blur-sm">
                          +{course.languages.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}