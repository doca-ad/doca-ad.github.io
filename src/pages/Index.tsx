import { useState, useEffect } from "react";
import Logo from "@/components/Logo";
import Navigation from "@/components/Navigation";
import ProjectCarousel from "@/components/ProjectCarousel";

const Index = () => {
    const [showInitialLogo, setShowInitialLogo] = useState(true);

    useEffect(() => {
        // Hide initial logo after animation completes
        const timer = setTimeout(() => {
            setShowInitialLogo(false);
        }, 4000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            {/* SEO Optimization */}
            <title>DOCA - Architecture & Design</title>
            <meta name="description" content="Discover our premium portfolio of architectural projects, brand identity design, and digital experiences. Minimalist design meets sophisticated creativity." />
      
            {/* Initial Logo Animation */}
            {showInitialLogo && <Logo isAnimated />}
      
            {/* Main Portfolio Interface */}
            <div className="min-h-screen bg-background">
                {/* Navigation */}
                <Navigation />
        
                {/* Main Content Area - Ensures 65%+ white background coverage */}
                <main className="pt-20 min-h-screen bg-background">
                    <div className="min-h-screen bg-background px-4 md:px-8">
                        <ProjectCarousel />
                    </div>
                </main>
            </div>
        </>
    );
};

export default Index;
