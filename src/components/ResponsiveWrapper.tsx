
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ResponsiveWrapperProps {
  children: React.ReactNode;
  className?: string;
  mobileClassName?: string;
  desktopClassName?: string;
}

/**
 * A wrapper component that applies different classNames based on screen size
 * Optimized for mobile-first responsive design
 */
export function ResponsiveWrapper({
  children,
  className = "",
  mobileClassName = "",
  desktopClassName = "",
}: ResponsiveWrapperProps) {
  const isMobile = useIsMobile();
  
  const combinedClassName = React.useMemo(() => {
    const baseClasses = "transition-all duration-200";
    const responsiveClasses = isMobile ? mobileClassName : desktopClassName;
    return `${baseClasses} ${className} ${responsiveClasses}`.trim();
  }, [className, mobileClassName, desktopClassName, isMobile]);
  
  return (
    <div className={combinedClassName}>
      {children}
    </div>
  );
}

/**
 * Hook for responsive breakpoints
 */
export function useResponsiveBreakpoints() {
  const [breakpoint, setBreakpoint] = React.useState<'mobile' | 'tablet' | 'desktop'>('mobile');

  React.useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setBreakpoint('mobile');
      } else if (width < 1024) {
        setBreakpoint('tablet');
      } else {
        setBreakpoint('desktop');
      }
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return {
    breakpoint,
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop',
    isMobileOrTablet: breakpoint === 'mobile' || breakpoint === 'tablet',
  };
}
