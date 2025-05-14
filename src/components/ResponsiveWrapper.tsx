
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
 */
export function ResponsiveWrapper({
  children,
  className = "",
  mobileClassName = "",
  desktopClassName = "",
}: ResponsiveWrapperProps) {
  const isMobile = useIsMobile();
  
  const combinedClassName = React.useMemo(() => {
    return `${className} ${isMobile ? mobileClassName : desktopClassName}`.trim();
  }, [className, mobileClassName, desktopClassName, isMobile]);
  
  return (
    <div className={combinedClassName}>
      {children}
    </div>
  );
}
