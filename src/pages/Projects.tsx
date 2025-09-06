import Navigation from "@/components/Navigation";
import { projects } from "@/data/projects";

const Projects = () => {
  return (
    <>
      <title>Projects - Premium Creative Studio</title>
      <meta name="description" content="Explore our complete portfolio of architectural, branding, and digital design projects." />
      
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <main className="pt-32 pb-16">
          <div className="max-w-6xl mx-auto px-8">
            <h1 className="text-4xl md:text-5xl font-light text-text-primary text-center mb-16">
              Our Projects
            </h1>
            
            <div className="grid gap-16">
              {projects.map((project) => (
                <section key={project.id} className="text-center">
                  <h2 className="text-2xl font-light text-text-primary mb-8">
                    {project.title}
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-8">
                    {project.images.map((image) => (
                      <div key={image.id} className="group">
                        <img
                          src={image.url}
                          alt={image.alt}
                          className="w-full h-80 object-cover rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Projects;