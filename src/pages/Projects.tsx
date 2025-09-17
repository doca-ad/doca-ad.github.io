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

const Projects = () => {
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Sort projects by year (newest first)
  const sortedProjects = [...projects].sort((a, b) => b.year - a.year);

  const toggleExpanded = (projectId: string) => {
    setExpandedProject(expandedProject === projectId ? null : projectId);
  };

  // Close expanded project when clicking outside (disabled while modal is open)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (listRef.current && !listRef.current.contains(event.target as Node)) {
        setExpandedProject(null);
      }
    };

    if (expandedProject && !selectedImage) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [expandedProject, selectedImage]);

  const ProjectRow = ({ project }: { project: Project }) => {
    const isExpanded = expandedProject === project.id;

    return (
      <div className="border-b border-border overflow-hidden">
        <div
          className="grid grid-cols-4 gap-4 py-3 px-4 cursor-pointer hover:bg-muted/30 transition-colors"
          onClick={() => toggleExpanded(project.id)}
        >
          <div className="font-medium text-text-primary text-sm">{project.title}</div>
          <div className="text-text-secondary text-sm">{project.type}</div>
          <div className="text-text-secondary text-sm">{project.location}</div>
          <div className="text-text-secondary text-sm">{project.year}</div>
        </div>

        <div
          className={`transition-all duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
            isExpanded ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-4 pb-4">
            <Carousel className="w-full">
              <CarouselContent>
                {project.images.map((image) => (
                  <CarouselItem
                    key={image.id}
                    className="basis-auto shrink-0 grow-0 w-fit"
                  >
                    <div className="p-1">
                      <img
                        src={image.url}
                        alt={image.alt}
                        className="h-auto max-h-48 w-auto object-contain shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation(); // prevent collapsing/expanding project
                          setSelectedImage(image.url);
                        }}
                      />
                    </div>
                  </CarouselItem>
                ))}
                {/* Description card */}
                <CarouselItem className="md:basis-1/2 lg:basis-1/2">
                  <div className="p-1">
                    <div className="h-48 bg-muted/20 flex flex-col justify-center p-6">
                      <h3 className="text-lg font-medium text-text-primary mb-3">
                        {project.title}
                      </h3>
                      <p className="text-sm text-text-secondary leading-relaxed">
                        {project.description}
                      </p>
                    </div>
                  </div>
                </CarouselItem>
              </CarouselContent>
              {project.images.length > 2 && (
                <>
                  <CarouselPrevious className="left-2" />
                  <CarouselNext className="right-2" />
                </>
              )}
            </Carousel>
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
          <div className="max-w-6xl mx-auto px-8">
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
        {selectedImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImage(null);
            }}
          >
            <div
              className="relative max-w-6xl w-[90vw] h-[80vh] z-10"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >

            <button
              className="absolute top right-6 text-white text-3xl font-bold"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
              }}
            >
              ✕
            </button>
              <div className="h-full flex items-center justify-center relative group">

            <img
              src={selectedImage}
              alt="Expanded"
              className="max-w-full max-h-full object-contain transform"
              onClick={(e) => e.stopPropagation()} // prevent close when clicking image itself
            />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Projects;
