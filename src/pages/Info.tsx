import Navigation from "@/components/Navigation";

const Info = () => {
  return (
    <>
      <title>Info - Premium Creative Studio</title>
      <meta name="description" content="Learn about our creative studio's philosophy, approach, and commitment to exceptional design." />
      
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <main className="pt-32 pb-16">
          <div className="max-w-4xl mx-auto px-8">
            <h1 className="text-4xl md:text-5xl font-light text-text-primary text-center mb-16">
              About Our Studio
            </h1>
            
            <div className="space-y-12 text-center">
              <div className="max-w-3xl mx-auto">
                <p className="text-lg text-text-secondary leading-relaxed mb-8">
                  We are a creative studio dedicated to crafting exceptional experiences through 
                  thoughtful design and meticulous attention to detail.
                </p>
                
                <p className="text-base text-text-tertiary leading-relaxed">
                  Our work spans architecture, brand identity, and digital experiences, 
                  always with a focus on minimalism, functionality, and timeless elegance.
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8 mt-16">
                <div className="text-center">
                  <h3 className="text-xl font-medium text-text-primary mb-4">Philosophy</h3>
                  <p className="text-text-secondary">Less is more. Every element serves a purpose.</p>
                </div>
                
                <div className="text-center">
                  <h3 className="text-xl font-medium text-text-primary mb-4">Approach</h3>
                  <p className="text-text-secondary">Collaborative process with attention to detail.</p>
                </div>
                
                <div className="text-center">
                  <h3 className="text-xl font-medium text-text-primary mb-4">Quality</h3>
                  <p className="text-text-secondary">Uncompromising standards in every project.</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Info;