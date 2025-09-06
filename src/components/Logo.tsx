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
        }, 1200);
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
      <div className={`logo-centered ${isAnimating ? 'logo-transitioning' : ''}`}>
        <img 
          src={logoImage} 
          alt="Company Logo" 
          className={`${isAnimating ? logoSizes.small : logoSizes.hero} transition-all duration-1500 ease-in-out ${
            isAnimating ? 'transform translate-x-0 translate-y-[-45vh]' : ''
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