import { useState, useEffect } from "react";
import logoImage from "@/assets/logo.png";

interface LogoProps {
  isAnimated?: boolean;
  size?: "small" | "large";
  className?: string;
}

const Logo = ({ isAnimated = false, size = "large", className = "" }: LogoProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(!isAnimated);

  useEffect(() => {
    if (isAnimated) {
      const startAnimationTimer = setTimeout(() => {
        setIsAnimating(true);

        // Start fade-out shortly before animation ends
        setTimeout(() => {
          setFadeOut(true);
        }, 100); // start fading near end of logo animation

        // Fully remove after everything is done
        setTimeout(() => {
          setAnimationComplete(true);
        }, 300); // slightly after full fade-out
      }, 1000); // delay before animation starts

      return () => clearTimeout(startAnimationTimer);
    }
  }, [isAnimated]);

  const logoSizes = {
    small: "h-8 w-auto",
    large: "h-16 w-auto md:h-20",
    hero: "h-32 w-auto md:h-40"
  };

  if (isAnimated && !animationComplete) {
    return (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-white transition-opacity duration-[100ms] ease-in-out
        ${fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <img
          src={logoImage}
          alt="Company Logo"
          className={`
            transition-transform duration-[300ms] ease-in-out transform
            ${isAnimating ? 'translate-y-[-46vh] scale-[0.20]' : 'translate-y-0 scale-100'}
            ${logoSizes.hero}
          `}
        /> 
      </div>
    );     
  }

  if (isAnimated && animationComplete) {
    return null; // let another component render the static logo
  }
           
  return ( 
    <img
      src={logoImage}
      alt="Company Logo"
      className={`${logoSizes[size]} logo-nav ${className}`}
    />
  );
};

export default Logo;
