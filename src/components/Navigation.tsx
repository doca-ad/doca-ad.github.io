import { useState, useRef, useEffect } from "react";
import { Menu } from "lucide-react";
import Logo from "./Logo";

interface NavigationProps {
	isAnimating?: boolean;
	whiteTimer?: boolean;
}

const Navigation = ({ isAnimating = false, whiteTimer = false}: NavigationProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuItems = [
    { label: "Projects", href: "/projects" },
    { label: "Info", href: "/info" },
    { label: "Contact", href: "/contact" }
  ];

  return (
    <nav
      className={`fixed left-0 right-0 z-40 transition-all duration-1000 ease-in-out ${
        isAnimating
          ? 'top-1/2 -translate-y-1/2 bg-transparent border-transparent'
          : 'top-0 translate-y-0 bg-background/80 backdrop-blur-lg border-b border-background-subtle'
      } ${whiteTimer ? 'border-b-0' : ''}`}
    >
      <div className="w-full px-8 py-6">
        <div className="flex items-center justify-between">

          {/* Text - Left */}
          <div className={`flex-none transition-opacity duration-700 ${whiteTimer ? 'opacity-0 invisible' : 'opacity-100 visible'}`}>
            <a href="/" className="hover:opacity-80 transition-opacity duration-200 text-lg">
              <span className="md:hidden">DOCA</span>
              <span className="hidden md:inline">DOCA &nbsp; | &nbsp; Architecture & Design</span>
            </a>
          </div>

          {/* Logo - Centered */}
          <div className={`absolute left-1/2 transform -translate-x-1/2 transition-all duration-1000 ease-in-out ${
            isAnimating ? 'scale-[2.9] md:scale-[3.6]' : 'scale-100'
          }`}>
            <a href="/" className={`hover:opacity-80 transition-opacity duration-200 ${isAnimating ? 'pointer-events-none' : ''}`}>
              <Logo size="small" />
            </a>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Dropdown Menu - Right */}
          <div className={`relative flex-none transition-opacity duration-700 ${whiteTimer ? 'opacity-0 invisible' : 'opacity-100 visible'}`} ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 text-text-primary hover:text-accent-hover transition-colors duration-200"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Dropdown */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 nav-dropdown rounded-lg overflow-hidden z-50">
                {menuItems.map((item, index) => (
                  <a
                    key={index}
                    href={item.href}
                    className="block px-6 py-3 text-sm text-text-primary hover:bg-background-subtle hover:text-accent-hover transition-colors duration-200"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
