import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious,
} from "@/components/ui/carousel";
import { INDEX_ONLY_STATUSES, STATUS_LABELS } from "@/data/status";
import { translateType } from "@/i18n/ui";
import type { ResolvedProject } from "@/lib/images";

interface ProjectsListProps {
  projects: ResolvedProject[];
  locale?: "en" | "ro";
}

const COUNTRY_CODES: Record<string, string> = { Romania: "RO" };
/** Only cities whose Romanian form differs from the English one need an entry. */
const CITY_RO: Record<string, string> = { Bucharest: "București" };

/** "Cluj Napoca, Romania" -> "Cluj Napoca, RO" (DOCA asked for country abbreviations). */
const formatLocation = (location: string, locale: "en" | "ro") => {
  const parts = location.split(",").map((p) => p.trim());
  if (parts.length < 2) return location;
  const country = parts[parts.length - 1];
  const cities = parts
    .slice(0, -1)
    .map((c) => (locale === "ro" ? CITY_RO[c] ?? c : c));
  return [...cities, COUNTRY_CODES[country] ?? country].join(", ");
};

const ProjectsList = ({ projects, locale = "en" }: ProjectsListProps) => {
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<ResolvedProject | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const listRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  const navigateImage = (dir: "left" | "right") => {
    setDirection(dir);
    if (!selectedProject) return;
    const last = selectedProject.images.length - 1;
    setCurrentImageIndex((prev) =>
      dir === "left" ? (prev === 0 ? last : prev - 1) : prev === last ? 0 : prev + 1
    );
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) navigateImage("right");
    if (distance < -minSwipeDistance) navigateImage("left");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (listRef.current && !listRef.current.contains(event.target as Node)) {
        setExpandedProject(null);
      }
    };
    if (expandedProject && !selectedProject) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [expandedProject, selectedProject]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedProject(null);
      else if (event.key === "ArrowLeft") navigateImage("left");
      else if (event.key === "ArrowRight") navigateImage("right");
    };
    if (selectedProject) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedProject]);

  const ProjectRow = ({ project }: { project: ResolvedProject }) => {
    const isExpanded = expandedProject === project.id;
    // Index-only entries exist to show breadth of work. DOCA's brief: they must read as
    // not clickable and must not expand, and are de-emphasised against finished work.
    const isIndexOnly =
      INDEX_ONLY_STATUSES.includes(project.status) || project.images.length === 0;

    const cells = (
      <>
        <div
          className={`text-sm md:col-span-3 ${
            isIndexOnly ? "font-normal text-text-secondary" : "font-medium text-text-primary"
          }`}
        >
          {project.title}
        </div>
        <div className="text-text-secondary text-sm md:col-span-3">{translateType(project.type, locale)}</div>
        <div className="text-text-secondary text-sm hidden md:block md:col-span-2 text-center">
          {STATUS_LABELS[project.status][locale]}
        </div>
        <div className="text-text-secondary text-sm hidden md:block md:col-span-2 text-center">
          {formatLocation(project.location, locale)}
        </div>
        <div className="text-text-secondary text-sm hidden md:block md:col-span-2 text-right">
          {project.year}
        </div>
      </>
    );

    if (isIndexOnly) {
      return (
        <div className="border-b border-border">
          <div
            className="grid grid-cols-2 md:grid-cols-12 gap-4 py-3 px-4 cursor-default select-none"
            aria-disabled="true"
          >
            {cells}
          </div>
        </div>
      );
    }

    return (
      <div className="border-b border-border overflow-hidden">
        <button
          type="button"
          aria-expanded={isExpanded}
          className="w-full text-left grid grid-cols-2 md:grid-cols-12 gap-4 py-3 px-4 cursor-pointer hover:bg-muted/30 transition-colors"
          onClick={() => setExpandedProject(isExpanded ? null : project.id)}
        >
          {cells}
        </button>

        <div
          className={`transition-all duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
            isExpanded ? "max-h-[600px] md:max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-4 pb-4 flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-2/3 px-0 md:px-12">
              <Carousel className="w-full">
                <CarouselContent>
                  {project.images.map((image, index) => (
                    <CarouselItem key={image.id} className="basis-auto shrink-0 grow-0 w-fit">
                      <div className="p-1">
                        <img
                          src={image.src}
                          srcSet={image.srcSet}
                          sizes="(max-width: 768px) 100vw, 640px"
                          alt={image.alt}
                          loading="lazy"
                          decoding="async"
                          className="h-auto max-h-60 md:max-h-72 w-full md:w-auto object-contain cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProject(project);
                            setCurrentImageIndex(index);
                          }}
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {project.images.length > 1 && (
                  <>
                    <CarouselPrevious className="-left-12 hidden md:flex" />
                    <CarouselNext className="-right-12 hidden md:flex" />
                  </>
                )}
              </Carousel>
            </div>

            <div className="w-full md:w-1/3">
              <div className="h-60 md:h-72 bg-muted/20 flex flex-col p-6 overflow-y-auto">
                <p className="text-sm text-text-secondary leading-relaxed">{project.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div ref={listRef} className="bg-card rounded-lg shadow-sm overflow-hidden">
        {projects.map((project) => (
          <ProjectRow key={project.id} project={project} />
        ))}
      </div>

      <AnimatePresence>
        {selectedProject && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              className="fixed inset-0 bg-black/90"
              onClick={() => setSelectedProject(null)}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            />
            <motion.div
              className="relative max-w-6xl w-[90vw] h-[80vh] z-10"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <button
                onClick={() => setSelectedProject(null)}
                aria-label="Close"
                className="absolute top-4 right-4 z-10 bg-black hover:bg-gray-800 p-2 rounded-full transition-all duration-300"
              >
                <X className="h-5 w-5 text-white" />
              </button>

              <div
                className="h-full flex items-center justify-center relative group"
                onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
              >
                {selectedProject.images.length > 1 && (
                  <button
                    onClick={() => navigateImage("left")}
                    aria-label="Previous image"
                    className="absolute left-4 z-10 bg-black hover:bg-gray-800 p-3 rounded-full shadow-lg hidden md:flex md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 hover:scale-105"
                  >
                    <ChevronLeft className="h-6 w-6 text-white" />
                  </button>
                )}

                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImageIndex}
                    src={selectedProject.images[currentImageIndex]?.src}
                    srcSet={selectedProject.images[currentImageIndex]?.srcSet}
                    sizes="100vw"
                    alt={selectedProject.images[currentImageIndex]?.alt}
                    className="max-w-full max-h-full object-contain"
                    initial={{ opacity: 0, x: direction === "right" ? 50 : -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: direction === "right" ? -50 : 50 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  />
                </AnimatePresence>

                {selectedProject.images.length > 1 && (
                  <button
                    onClick={() => navigateImage("right")}
                    aria-label="Next image"
                    className="absolute right-4 z-10 bg-black hover:bg-gray-800 p-3 rounded-full shadow-lg hidden md:flex md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 hover:scale-105"
                  >
                    <ChevronRight className="h-6 w-6 text-white" />
                  </button>
                )}

                {selectedProject.images.length > 1 && (
                  <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3">
                    {selectedProject.images.map((_, index) => (
                      <button
                        key={index}
                        aria-label={`Image ${index + 1}`}
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
    </>
  );
};

export default ProjectsList;
