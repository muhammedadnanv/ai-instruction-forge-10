
import * as React from "react";

type BreakpointSize = "sm" | "md" | "lg" | "xl" | "2xl";

const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

/**
 * Hook that returns whether the current window size is smaller than the specified breakpoint
 */
export function useMediaQuery(size: BreakpointSize): boolean {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    const query = `(max-width: ${breakpoints[size] - 1}px)`;
    const media = window.matchMedia(query);
    
    // Set initial value
    setMatches(media.matches);
    
    // Define callback function
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };
    
    // Add listener
    media.addEventListener("change", listener);
    
    // Clean up
    return () => {
      media.removeEventListener("change", listener);
    };
  }, [size]);

  return matches;
}

/**
 * Responsive helpers
 */
export function useIsSmallScreen() {
  return useMediaQuery("md"); // anything below medium (768px)
}

export function useIsLargeScreen() {
  return useMediaQuery("lg");
}
