import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X, Mail, Phone, MapPin } from "lucide-react";
import { projects, Project } from "@/data/projects";
import { motion, AnimatePresence } from "framer-motion";

const ProjectCarousel = () => {
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentProject = projects[currentProjectIndex];
  const currentImage = currentProject?.images[currentImageIndex];

  const [direction, setDirection] = useState<"left" | "right">("right");

  const navigateImage = (dir: "left" | "right", project?: Project) => {
    setDirection(dir);
    const targetProject = project || selectedProject;
    if (!targetProject) return;

    if (dir === "left") {
      setCurrentImageIndex((prev) =>
        prev === 0 ? targetProject.images.length - 1 : prev - 1
      );
    } else {
      setCurrentImageIndex((prev) =>
        prev === targetProject.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  // Handle scroll with snap behavior
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      const newIndex = Math.round(scrollTop / containerHeight);
      setCurrentProjectIndex(Math.min(Math.max(newIndex, 0), projects.length - 1));
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Reset image index when project changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [currentProjectIndex]);

  // Auto-scroll after 30 seconds of inactivity
  useEffect(() => {
    const container = containerRef.current;
    if (!container || isModalOpen) return;

    let inactivityTimer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        const homeProjects = projects.filter(p => p.home);
        const currentIndex = homeProjects.findIndex(p => p.id === projects[currentProjectIndex]?.id);
        const nextIndex = (currentIndex + 1) % homeProjects.length;
        const nextProjectIndex = projects.findIndex(p => p.id === homeProjects[nextIndex]?.id);

        container.scrollTo({
          top: nextProjectIndex * container.clientHeight,
          behavior: 'smooth'
        });
      }, 30000);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, resetTimer);
    });

    resetTimer();

    return () => {
      clearTimeout(inactivityTimer);
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [currentProjectIndex, isModalOpen]);

  // Close modal on Escape key + navigate with arrows
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsModalOpen(false);
      } else if (event.key === "ArrowLeft") {
        navigateImage("left");
      } else if (event.key === "ArrowRight") {
        navigateImage("right");
      }
    };

    if (isModalOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, selectedProject]); 

  const handleImageClick = (project: Project) => {
    setSelectedProject(project);
    setCurrentImageIndex(0);
    setIsModalOpen(true);
  };

  return (
    <>
      {/* Vertical Scroll Container */}
      <div
        ref={containerRef}
        className="h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        style={{ scrollBehavior: 'smooth' }}
      >
        {projects.map((project) => project.home && (
          <div
            key={project.id}
            className="h-screen flex flex-col justify-center px-8 snap-start pt-24 md:pt-32 pb-16"
          >
            <div className="relative max-w-4xl mx-auto w-full">
              <div className="text-center">
                <div className="relative">
                  <div
                    className="cursor-pointer hover:scale-105 transition-transform duration-300"
                    onClick={() => handleImageClick(project)}
                  >
                    <img
                      src={project.images[0].url}
                      alt={project.images[0].alt}
                      className="w-auto max-h-[60vh] md:max-h-[66.67vh] mx-auto"
                    />
                  </div>
                </div>
                <h2 className="mt-4 md:mt-8 text-xl md:text-2xl font-light text-text-primary">
                  {project.title}
                </h2>
              </div>
            </div>
          </div>
        ))}

        {/* Contact Section */}
        <div className="h-screen flex flex-col justify-center items-center px-4 md:px-8 snap-start py-16 md:pt-32 md:pb-16 overflow-hidden">
          <div className="max-w-4xl mx-auto w-full">
            <div className="text-center mb-4 md:mb-16">
              <p className="text-sm md:text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed mb-3 md:mb-4">
                We are always looking forward to meeting passionate people. Don't hesitate to contact us!
              </p>
              <p className="text-sm md:text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
                You can also find us on social media platforms:{" "}
                <a
                  href="https://www.instagram.com/doca_architecture/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-primary hover:text-accent-hover transition-colors duration-200"
                >
                  Instagram
                </a>
                {" and "}
                <a
                  href="https://www.linkedin.com/company/doca-architecture-design/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-primary hover:text-accent-hover transition-colors duration-200"
                >
                  LinkedIn
                </a>
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-5 md:gap-12 text-center">
              <div className="flex flex-col items-center">
                <a
                  href="mailto:office@doca-ad.ro"
                  className="w-10 h-10 md:w-12 md:h-12 bg-background-subtle rounded-full flex items-center justify-center mb-2 md:mb-4 hover:bg-background-soft transition-colors duration-200"
                >
                  <Mail className="h-4 w-4 md:h-5 md:w-5 text-accent-primary" />
                </a>
                <h3 className="text-base md:text-lg font-medium text-text-primary mb-1 md:mb-2">Email</h3>
                <a
                  href="mailto:office@doca-ad.ro"
                  className="text-sm md:text-base text-text-secondary hover:text-accent-hover transition-colors duration-200"
                >
                  office@doca-ad.ro
                </a>
              </div>

              <div className="flex flex-col items-center">
                <a
                  href="tel:+40723340088"
                  className="w-10 h-10 md:w-12 md:h-12 bg-background-subtle rounded-full flex items-center justify-center mb-2 md:mb-4 hover:bg-background-soft transition-colors duration-200"
                >
                  <Phone className="h-4 w-4 md:h-5 md:w-5 text-accent-primary" />
                </a>
                <h3 className="text-base md:text-lg font-medium text-text-primary mb-1 md:mb-2">Phone</h3>
                <a
                  href="tel:+40760972231"
                  className="text-sm md:text-base text-text-secondary hover:text-accent-hover transition-colors duration-200"
                >
                  +40 760972231
                </a>
                <a
                  href="tel:+40723340088"
                  className="text-sm md:text-base text-text-secondary hover:text-accent-hover transition-colors duration-200"
                >
                  +40 723340088
                </a>
              </div>

              <div className="flex flex-col items-center">
                <a
                  href="https://www.google.com/maps/space/moon/@47.8248832,79.6698943,22671584m/data=!3m1!1e3?entry=ttu&g_ep=EgoyMDI1MDkzMC4wIKXMDSoASAFQAw%3D%3D"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 md:w-12 md:h-12 bg-background-subtle rounded-full flex items-center justify-center mb-2 md:mb-4 hover:bg-background-soft transition-colors duration-200"
                >
                  <MapPin className="h-4 w-4 md:h-5 md:w-5 text-accent-primary" />
                </a>
                <h3 className="text-base md:text-lg font-medium text-text-primary mb-1 md:mb-2">Studio</h3>
                <p className="text-sm md:text-base text-text-secondary">
                  Bucharest<br />
                  Romania
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Horizontal Carousel */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0"
              onClick={() => setIsModalOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Modal box */}
            <motion.div
              className="relative w-full h-full md:max-w-6xl md:w-[90vw] md:h-[80vh] bg-background z-10 px-4 md:px-0"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 z-10 bg-background-subtle hover:bg-background-soft p-2 rounded-full transition-all duration-300"
              >
                <X className="h-5 w-5 text-text-primary" />
              </button>

              {selectedProject && (
                <div className="h-full flex items-center justify-center relative group overflow-y-auto">
                  {/* Left Arrow */}
                  {selectedProject.images.length > 1 && (
                    <button
                      onClick={() => navigateImage("left")}
                      className="absolute left-4 z-10 bg-background-subtle hover:bg-background-soft p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-105"
                    >
                      <ChevronLeft className="h-6 w-6 text-text-primary" />
                    </button>
                  )}

                  {/* Image */}
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={currentImageIndex}
                      src={selectedProject.images[currentImageIndex]?.url}
                      alt={selectedProject.images[currentImageIndex]?.alt}
                      className="max-w-full max-h-full object-contain"
                      initial={{ opacity: 0, x: direction === "right" ? 50 : -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: direction === "right" ? -50 : 50 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    />
                  </AnimatePresence>

                  {/* Right Arrow */}
                  {selectedProject.images.length > 1 && (
                    <button
                      onClick={() => navigateImage("right")}
                      className="absolute right-4 z-10 bg-background-subtle hover:bg-background-soft p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-105"
                    >
                      <ChevronRight className="h-6 w-6 text-text-primary" />
                    </button>
                  )}

                  {/* Image Dots */}
                  {selectedProject.images.length > 1 && (
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3">
                      {selectedProject.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-3 h-3 rounded-full transition-all duration-300 hover:scale-125 ${
                            index === currentImageIndex ? "bg-text-primary scale-110" : "bg-text-tertiary"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProjectCarousel;
