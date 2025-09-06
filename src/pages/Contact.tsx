import Navigation from "@/components/Navigation";
import { Mail, Phone, MapPin } from "lucide-react";

const Contact = () => {
  return (
    <>
      <title>Contact - Premium Creative Studio</title>
      <meta name="description" content="Get in touch with our creative studio for your next project. We're here to bring your vision to life." />
      
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <main className="pt-32 pb-16">
          <div className="max-w-4xl mx-auto px-8">
            <h1 className="text-4xl md:text-5xl font-light text-text-primary text-center mb-16">
              Let's Work Together
            </h1>
            
            <div className="text-center mb-16">
              <p className="text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
                Ready to start your next project? We'd love to hear about your vision 
                and explore how we can bring it to life.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-12 text-center">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-background-subtle rounded-full flex items-center justify-center mb-4">
                  <Mail className="h-5 w-5 text-accent-primary" />
                </div>
                <h3 className="text-lg font-medium text-text-primary mb-2">Email</h3>
                <a 
                  href="mailto:hello@studio.com" 
                  className="text-text-secondary hover:text-accent-hover transition-colors duration-200"
                >
                  hello@studio.com
                </a>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-background-subtle rounded-full flex items-center justify-center mb-4">
                  <Phone className="h-5 w-5 text-accent-primary" />
                </div>
                <h3 className="text-lg font-medium text-text-primary mb-2">Phone</h3>
                <a 
                  href="tel:+1234567890" 
                  className="text-text-secondary hover:text-accent-hover transition-colors duration-200"
                >
                  +1 (234) 567-890
                </a>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-background-subtle rounded-full flex items-center justify-center mb-4">
                  <MapPin className="h-5 w-5 text-accent-primary" />
                </div>
                <h3 className="text-lg font-medium text-text-primary mb-2">Studio</h3>
                <p className="text-text-secondary">
                  New York, NY<br />
                  United States
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Contact;