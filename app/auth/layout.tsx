"use client";
import React from 'react';

const AuthLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  const [isMobile, setIsMobile] = React.useState<boolean>(false);

  // Check if the client is mobile
  React.useEffect(() => {
    const userAgent = typeof window.navigator === "undefined" ? "" : navigator.userAgent;
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    setIsMobile(mobileRegex.test(userAgent) || window.innerWidth <= 768);
  }, []);

  return (
    <main className="min-h-screen h-full flex tex-fore">
      {/* Left Section */}
      {
        !isMobile &&
        (<div className="h-screen flex-grow flex items-center justify-center">
          {children}
        </div>)
      }
    </main>
  );
};

export default AuthLayout;