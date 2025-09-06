import { useState, useEffect } from "react";
import logoImage from "@/assets/logo.png";

interface LogoProps {
  isAnimated?: boolean;
  size?: "small" | "large";
  className?: string;
}

const Logo = ({ isAnimated = false, size = "large", className = "" }: LogoProps) => {
  const [isVisible, setIsVisible] = useState(isAnimated);
  const [animationComplete, setAnimationComplete] = useState(!isAnimated);

  useEffect(() => {
    if (isAnimated) {
      // Start animation after 3 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        setAnimationComplete(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isAnimated]);

  const logoSizes = {
    small: "h-8 w-auto",
    large: "h-16 w-auto md:h-20"
  };

  if (isAnimated && isVisible) {
    return (
      <div className="logo-centered">
        <img 
          src={logoImage} 
          alt="Company Logo" 
          className={`${logoSizes.large} transition-all duration-700 ease-out`}
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