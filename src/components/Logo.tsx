import { useState, useEffect } from "react";
import logoImage from "@/assets/logo.png";

interface LogoProps {
  isAnimated?: boolean;
  size?: "small" | "large";
  className?: string;
}

const Logo = ({ isAnimated = false, size = "large", className = "" }: LogoProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(!isAnimated);

  useEffect(() => {
    if (isAnimated) {
      // Start animation after 3 seconds
      const timer = setTimeout(() => {
        setIsAnimating(true);
        // Complete animation after transition
        setTimeout(() => {
          setAnimationComplete(true);
        }, 800);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isAnimated]);

  const logoSizes = {
    small: "h-8 w-auto",
    large: "h-16 w-auto md:h-20",
    hero: "h-32 w-auto md:h-40"
  };

  if (isAnimated && !animationComplete) {
    return (
      <div className={`logo-centered ${isAnimating ? 'opacity-0' : 'opacity-100'} transition-opacity duration-800`}>
        <img 
          src={logoImage} 
          alt="Company Logo" 
          className={`${logoSizes.hero} transition-all duration-800 ease-out ${
            isAnimating ? 'transform scale-50 translate-y-[-50vh]' : ''
          }`}
        />
      </div>
    );
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