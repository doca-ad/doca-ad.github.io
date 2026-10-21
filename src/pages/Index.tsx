import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import ProjectCarousel from "@/components/ProjectCarousel";
import Seo from "@/components/Seo";

const Index = () => {
    const [isAnimating, setIsAnimating] = useState(true);
    const [showWhite, setShowWhite] = useState(true);

    useEffect(() => {
        // Start the navbar animation after a brief delay
        const animationTimer = setTimeout(() => {
            setIsAnimating(false);
        }, 2000);

        // Keep white background a bit longer
        const whiteTimer = setTimeout(() => {
            setShowWhite(false);
        }, 3000);

        return () => {
            clearTimeout(animationTimer);
            clearTimeout(whiteTimer);
        };
    }, []);

    return (
        <>
            <Seo
                title="DOCA Architecture & Design — Architecture studio in Bucharest"
                description="Bucharest-based architecture and interior design studio founded in 2024 by Ștefan Diaconescu and Vlad Căpitanu. Space efficiency, usability, urban integration and human-scale architecture."
                path="/"
            />

            {/* White Background Overlay During Animation */}
            {showWhite && (
                <div className="fixed inset-0 bg-white z-30 transition-opacity duration-1000" />
            )}

            {/* Main Portfolio Interface */}
            <div className="min-h-screen bg-background">
                {/* Navigation */}
            <Navigation isAnimating={isAnimating} whiteTimer={showWhite}/>

                {/* Main Content Area - Ensures 65%+ white background coverage */}
                <main className="min-h-screen bg-background">
                    <div className="h-screen bg-background px-4 md:px-8">
                        <ProjectCarousel landing="statement" />
                    </div>
                </main>
            </div>
        </>
    );
};

export default Index;
