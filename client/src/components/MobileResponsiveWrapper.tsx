'use client';

import { useEffect, useState } from 'react';

interface MobileResponsiveWrapperProps {
  children: React.ReactNode;
  className?: string;
  forceMobile?: boolean;
}

const MobileResponsiveWrapper = ({ children, className = '', forceMobile = false }: MobileResponsiveWrapperProps) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    const checkMobile = () => {
      setIsMobile(forceMobile || window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [forceMobile]);

  // Prevent hydration mismatch
  if (!isClient) {
    return (
      <div className={`${className} mobile-hidden`}>
        {children}
      </div>
    );
  }

  return (
    <div className={`
      ${className}
      ${isMobile 
        ? 'mobile-active md:hidden' 
        : 'mobile-hidden md:block'
      }
      touch-manipulation
      select-none
      -webkit-tap-highlight-color: transparent
    `}>
      {children}
    </div>
  );
};

// Helper hook for mobile detection
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile && isClient;
};

export default MobileResponsiveWrapper;