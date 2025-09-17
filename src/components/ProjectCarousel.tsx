import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
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
        className="h-screen overflow-y-scroll scroll-smooth snap-y snap-mandatory scrollbar-hide"
      >
        
        {projects.map((project, projectIndex) => {
          if (project.home)
            return (
          <div 
            key={project.id} 
            className="h-screen flex items-center justify-center px-8 snap-start"
          >
            <div className="relative max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <div className="relative">
                  <div 
                    className="cursor-pointer hover:scale-105 transition-transform duration-300"
                    onClick={() => handleImageClick(project)}
                  >
                    <img
                      src={project.images[0].url}
                      alt={project.images[0].alt}
                      className="w-full h-96 md:h-[500px] object-cover shadow-lg"
                    />
                    
                    {/* Image Text Overlay - Left aligned bottom */}
                    <div className="absolute bottom-4 left-4 text-left">
                      <p className="text-white text-sm md:text-base font-light drop-shadow-lg">
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          )
        }
        )
          
        }
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
              className="fixed inset-0 "
              onClick={() => setIsModalOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Modal box */}
            <motion.div
              className="relative max-w-6xl w-[90vw] h-[80vh] bg-background z-10"
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
                <div className="h-full flex items-center justify-center relative group">
                  {/* Left Arrow - Only visible on hover */}
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
                      className="max-w-full max-h-full object-contain transform scale-130"
                      initial={{ opacity: 0, x: direction === "right" ? 50 : -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: direction === "right" ? -50 : 50 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    />
                  </AnimatePresence>
                
                  {/* Right Arrow - Only visible on hover */}
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
