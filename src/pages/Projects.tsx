import { useState, useRef, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { projects } from "@/data/projects";
import { Project } from "@/data/projects";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

const Projects = () => {
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const listRef = useRef<HTMLDivElement>(null);

  // Sort projects by year (newest first)
  const sortedProjects = [...projects].sort((a, b) => b.year - a.year);

  const toggleExpanded = (projectId: string) => {
    setExpandedProject(expandedProject === projectId ? null : projectId);
  };

  const navigateImage = (dir: "left" | "right") => {
    setDirection(dir);
    if (!selectedProject) return;

    if (dir === "left") {
      setCurrentImageIndex((prev) =>
        prev === 0 ? selectedProject.images.length - 1 : prev - 1
      );
    } else {
      setCurrentImageIndex((prev) =>
        prev === selectedProject.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handleImageClick = (project: Project, imageIndex: number) => {
    setSelectedProject(project);
    setCurrentImageIndex(imageIndex);
  };

  // Close expanded project when clicking outside (disabled while modal is open)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (listRef.current && !listRef.current.contains(event.target as Node)) {
        setExpandedProject(null);
      }
    };

    if (expandedProject && !selectedProject) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [expandedProject, selectedProject]);

  // Close modal on Escape key + navigate with arrows
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedProject(null);
      } else if (event.key === "ArrowLeft") {
        navigateImage("left");
      } else if (event.key === "ArrowRight") {
        navigateImage("right");
      }
    };

    if (selectedProject) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedProject]);

  const ProjectRow = ({ project }: { project: Project }) => {
    const isExpanded = expandedProject === project.id;

    return (
      <div className="border-b border-border overflow-hidden">
        <div
          className="grid grid-cols-2 md:grid-cols-12 gap-4 py-3 px-4 cursor-pointer hover:bg-muted/30 transition-colors"
          onClick={() => toggleExpanded(project.id)}
        >
          <div className="font-medium text-text-primary text-sm md:col-span-6">{project.title}</div>
          <div className="text-text-secondary text-sm md:col-span-2">{project.type}</div>
          <div className="text-text-secondary text-sm hidden md:block md:col-span-2 text-center">{project.location}</div>
          <div className="text-text-secondary text-sm hidden md:block md:col-span-2 text-right">{project.year}</div>
        </div>

        <div
          className={`transition-all duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
            isExpanded ? "max-h-[600px] md:max-h-80 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-4 pb-4 flex flex-col md:flex-row gap-4">
            {/* Carousel - full width on mobile, 2/3 width on desktop */}
            <div className="w-full md:w-2/3 px-12">
              <Carousel className="w-full">
                <CarouselContent>
                  {project.images.map((image, index) => (
                    <CarouselItem
                      key={image.id}
                      className="basis-auto shrink-0 grow-0 w-fit"
                    >
                      <div className="p-1">
                        <img
                          src={image.url}
                          alt={image.alt}
                          className="h-auto max-h-60 w-auto object-contain shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleImageClick(project, index);
                          }}
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>

                {project.images.length > 1 && (
                  <>
                    <CarouselPrevious className="-left-12" />
                    <CarouselNext className="-right-12" />
                  </>
                )}
              </Carousel>
            </div>

            {/* Description - full width on mobile, 1/3 width on desktop */}
            <div className="w-full md:w-1/3">
              <div className="h-60 bg-muted/20 flex flex-col p-6 overflow-y-auto">
                <h3 className="text-lg font-medium text-text-primary mb-3">
                  {project.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {project.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <title>Projects</title>
      <meta
        name="description"
        content="Explore our complete portfolio of architectural, branding, and digital design projects."
      />

      <div className="min-h-screen bg-background">
        <Navigation />

        <main className="pt-32 pb-16">
          <div className="max-w-7xl mx-auto px-8">
            <h1 className="text-4xl md:text-5xl font-light text-text-primary text-center mb-16">
              Our Projects
            </h1>

            <div
              ref={listRef}
              className="bg-card rounded-lg shadow-sm overflow-hidden"
            >
              {/* Project List */}
              <div>
                {sortedProjects.map((project) => (
                  <ProjectRow key={project.id} project={project} />
                ))}
              </div>
            </div>
          </div>
        </main>

        {/* Image Modal */}
        <AnimatePresence>
          {selectedProject && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Backdrop */}
              <motion.div
                className="fixed inset-0 bg-black/90"
                onClick={() => setSelectedProject(null)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />

              {/* Modal box */}
              <motion.div
                className="relative max-w-6xl w-[90vw] h-[80vh] z-10"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <button
                  onClick={() => setSelectedProject(null)}
                  className="absolute top-4 right-4 z-10 bg-black hover:bg-gray-800 p-2 rounded-full transition-all duration-300"
                >
                  <X className="h-5 w-5 text-white" />
                </button>

                <div className="h-full flex items-center justify-center relative group">
                  {/* Left Arrow */}
                  {selectedProject.images.length > 1 && (
                    <button
                      onClick={() => navigateImage("left")}
                      className="absolute left-4 z-10 bg-black hover:bg-gray-800 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-105"
                    >
                      <ChevronLeft className="h-6 w-6 text-white" />
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

                  {/* Right Arrow */}
                  {selectedProject.images.length > 1 && (
                    <button
                      onClick={() => navigateImage("right")}
                      className="absolute right-4 z-10 bg-black hover:bg-gray-800 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-105"
                    >
                      <ChevronRight className="h-6 w-6 text-white" />
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
                            index === currentImageIndex ? "bg-white scale-110" : "bg-gray-500"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default Projects;
