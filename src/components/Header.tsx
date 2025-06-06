
import { useState } from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import DonatingWidget from "./DonatingWidget";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDonatingWidget, setShowDonatingWidget] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handlePricingClick = () => {
    setShowDonatingWidget(true);
    setIsMenuOpen(false);
  };

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="font-bold text-xl flex items-center gap-1">
            <span className="gradient-text">InstructAI</span>
          </Link>
        </div>

        {/* Mobile menu button */}
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={toggleMenu} className="md:hidden">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        )}

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              location.pathname === "/" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Home
          </Link>
          <Link
            to="/ai-applications"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              location.pathname === "/ai-applications" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            AI Applications
          </Link>
          <Link
            to="#"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Documentation
          </Link>
          <button
            onClick={handlePricingClick}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Pricing
          </button>
        </nav>

        {/* Mobile navigation */}
        {isMobile && isMenuOpen && (
          <div className="fixed inset-0 top-[57px] z-50 bg-background">
            <nav className="flex flex-col p-4 space-y-4">
              <Link
                to="/"
                className={`text-lg font-medium transition-colors hover:text-primary ${
                  location.pathname === "/" ? "text-primary" : "text-muted-foreground"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/ai-applications"
                className={`text-lg font-medium transition-colors hover:text-primary ${
                  location.pathname === "/ai-applications" ? "text-primary" : "text-muted-foreground"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                AI Applications
              </Link>
              <Link
                to="#"
                className="text-lg font-medium text-muted-foreground transition-colors hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Documentation
              </Link>
              <button
                onClick={handlePricingClick}
                className="text-lg font-medium text-muted-foreground transition-colors hover:text-primary text-left"
              >
                Pricing
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* DonatingWidget Dialog */}
      {showDonatingWidget && (
        <div className="fixed inset-0 z-50">
          <DonatingWidget
            upiId="adnanmuhammad4393@okicici"
            name="Muhammed Adnan"
            amount={399}
            position="bottom-right"
            primaryColor="#8B5CF6"
            buttonText="Pyam"
            theme="modern"
            icon="gift"
            showPulse={true}
            showGradient={true}
            title="Pay to me "
            description="Scan this QR code to make a Pyam"
          />
          <div 
            className="fixed inset-0 bg-black/50" 
            onClick={() => setShowDonatingWidget(false)}
          />
        </div>
      )}
    </header>
  );
}
