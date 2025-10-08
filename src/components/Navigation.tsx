import { useState, useRef, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";
import { motion, AnimatePresence } from "framer-motion";

interface NavigationProps {
	isAnimating?: boolean;
	whiteTimer?: boolean;
}

const Navigation = ({ isAnimating = false, whiteTimer = false}: NavigationProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const menuItems = [
    { label: "Home", href: "/" },
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

          {/* Menu Button - Right */}
          <div className={`relative flex-none transition-opacity duration-700 ${whiteTimer ? 'opacity-0 invisible' : 'opacity-100 visible'}`}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2 text-text-primary hover:text-accent-hover transition-colors duration-200"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Full-height Side Panel */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Side Panel */}
            <motion.div
              ref={menuRef}
              className="fixed top-0 right-0 h-screen w-80 bg-white z-50 flex flex-col"
              style={{ boxShadow: "-4px 0 12px rgba(0, 0, 0, 0.1)" }}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              {/* Close Button */}
              <div className="flex justify-end p-6 bg-white">
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="text-black hover:text-gray-600 transition-colors duration-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Menu Items */}
              <nav className="flex flex-col px-8 py-4 space-y-2 bg-white flex-1">
                {menuItems.map((item, index) => (
                  <motion.a
                    key={index}
                    href={item.href}
                    className="text-2xl font-light text-black hover:text-gray-600 transition-colors duration-200 py-4"
                    onClick={() => setIsMenuOpen(false)}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {item.label}
                  </motion.a>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navigation;
