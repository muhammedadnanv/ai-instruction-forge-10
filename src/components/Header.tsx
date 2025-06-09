
import { useState } from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between max-w-7xl">
        <div className="flex items-center gap-2">
          <Link to="/" className="font-bold text-xl flex items-center gap-1 touch-target">
            <span className="gradient-text">InstructAI</span>
          </Link>
        </div>

        {/* Mobile menu button */}
        {isMobile && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleMenu} 
            className="md:hidden touch-target"
            aria-label="Toggle navigation menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        )}

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className={`text-sm font-medium transition-colors hover:text-primary touch-target ${
              location.pathname === "/" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Home
          </Link>
          <Link
            to="/ai-applications"
            className={`text-sm font-medium transition-colors hover:text-primary touch-target ${
              location.pathname === "/ai-applications" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            AI Applications
          </Link>
          <Link
            to="#"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary touch-target"
          >
            Documentation
          </Link>
        </nav>

        {/* Mobile navigation */}
        {isMobile && isMenuOpen && (
          <div className="fixed inset-0 top-[60px] z-50 bg-background/95 backdrop-blur-sm">
            <nav className="flex flex-col p-4 space-y-4 safe-top">
              <Link
                to="/"
                className={`text-lg font-medium transition-colors hover:text-primary touch-target mobile-center ${
                  location.pathname === "/" ? "text-primary" : "text-muted-foreground"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/ai-applications"
                className={`text-lg font-medium transition-colors hover:text-primary touch-target mobile-center ${
                  location.pathname === "/ai-applications" ? "text-primary" : "text-muted-foreground"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                AI Applications
              </Link>
              <Link
                to="#"
                className="text-lg font-medium text-muted-foreground transition-colors hover:text-primary touch-target mobile-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Documentation
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
