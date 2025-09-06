import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { projects, Project } from "@/data/projects";

const ProjectCarousel = () => {
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const currentProject = projects[currentProjectIndex];
  const currentImage = currentProject?.images[currentImageIndex];

  // Reset image index when project changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [currentProjectIndex]);

  const navigateProject = (direction: "up" | "down") => {
    if (direction === "up") {
      setCurrentProjectIndex((prev) => 
        prev === 0 ? projects.length - 1 : prev - 1
      );
    } else {
      setCurrentProjectIndex((prev) => 
        prev === projects.length - 1 ? 0 : prev + 1
      );
    }
  };

  const navigateImage = (direction: "left" | "right") => {
    if (!currentProject) return;
    
    if (direction === "left") {
      setCurrentImageIndex((prev) => 
        prev === 0 ? currentProject.images.length - 1 : prev - 1
      );
    } else {
      setCurrentImageIndex((prev) => 
        prev === currentProject.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  if (!currentProject || !currentImage) return null;

  return (
    <div className="carousel-container h-screen flex items-center justify-center px-8">
      <div className="relative max-w-4xl mx-auto">
        {/* Main Project Display */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-light text-text-primary mb-12">
            {currentProject.title}
          </h2>
          
          <div className="relative group">
            <img
              src={currentImage.url}
              alt={currentImage.alt}
              className="w-full h-96 md:h-[500px] object-cover rounded-lg shadow-lg project-slide"
              key={`${currentProjectIndex}-${currentImageIndex}`}
            />
            
            {/* Image Navigation - Only show if multiple images */}
            {currentProject.images.length > 1 && (
              <>
                <button
                  onClick={() => navigateImage("left")}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <ChevronLeft className="h-5 w-5 text-accent-primary" />
                </button>
                
                <button
                  onClick={() => navigateImage("right")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <ChevronRight className="h-5 w-5 text-accent-primary" />
                </button>

                {/* Image Dots */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {currentProject.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                        index === currentImageIndex ? "bg-white" : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Project Navigation */}
        <div className="flex items-center justify-center gap-8">
          <button
            onClick={() => navigateProject("up")}
            className="flex flex-col items-center gap-2 p-4 hover:bg-background-soft rounded-lg transition-colors duration-200"
          >
            <ChevronUp className="h-6 w-6 text-text-secondary" />
            <span className="text-xs text-text-tertiary">Previous</span>
          </button>

          {/* Project Indicators */}
          <div className="flex flex-col gap-2">
            {projects.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentProjectIndex(index)}
                className={`w-2 h-8 rounded-full transition-colors duration-200 ${
                  index === currentProjectIndex ? "bg-accent-primary" : "bg-background-subtle"
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => navigateProject("down")}
            className="flex flex-col items-center gap-2 p-4 hover:bg-background-soft rounded-lg transition-colors duration-200"
          >
            <ChevronDown className="h-6 w-6 text-text-secondary" />
            <span className="text-xs text-text-tertiary">Next</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectCarousel;