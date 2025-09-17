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
              Contact
            </h1>
            
            <div className="text-center mb-16">
              <p className="text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
                We are always looking forward to meeting passionate people. Don't hesitate to contact us!
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-12 text-center">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-background-subtle rounded-full flex items-center justify-center mb-4">
                  <Mail className="h-5 w-5 text-accent-primary" />
                </div>
                <h3 className="text-lg font-medium text-text-primary mb-2">Email</h3>
                <a 
                  href="mailto:office@doca-ad.ro" 
                  className="text-text-secondary hover:text-accent-hover transition-colors duration-200"
                >
                  office@doca-ad.ro
                </a>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-background-subtle rounded-full flex items-center justify-center mb-4">
                  <Phone className="h-5 w-5 text-accent-primary" />
                </div>
                <h3 className="text-lg font-medium text-text-primary mb-2">Phone</h3>
                <a 
                  href="tel:+40760972231" 
                  className="text-text-secondary hover:text-accent-hover transition-colors duration-200"
                >
                  +40 760972231
                </a>
                <a 
                  href="tel:+40723340088" 
                  className="text-text-secondary hover:text-accent-hover transition-colors duration-200"
                >
                  +40 723340088
                </a>

              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-background-subtle rounded-full flex items-center justify-center mb-4">
                  <MapPin className="h-5 w-5 text-accent-primary" />
                </div>
                <h3 className="text-lg font-medium text-text-primary mb-2">Studio</h3>
                <p className="text-text-secondary">
                  Bucharest<br />
                  Romania
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
