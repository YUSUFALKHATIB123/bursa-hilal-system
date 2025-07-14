import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../contexts/LanguageContext";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import ConnectionStatus from "./ConnectionStatus";

interface LayoutProps {
  children?: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Start closed by default
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      const mobile = width < 768;
      const tablet = width >= 768 && width < 1024;
      
      setIsMobile(mobile);
      setIsTablet(tablet);
      
      // Auto-close sidebar on mobile/tablet for better UX
      if (mobile || tablet) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true); // Open on desktop
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Close sidebar on mobile/tablet when clicking outside or navigating
  const closeSidebar = () => {
    if (isMobile || isTablet) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-hidden">
      {/* Mobile/Tablet Overlay with blur effect */}
      <AnimatePresence>
        {sidebarOpen && (isMobile || isTablet) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={closeSidebar}
            style={{ touchAction: "none" }}
          />
        )}
      </AnimatePresence>

      <div className="flex h-screen overflow-hidden">
        {/* Sidebar - Optimized for mobile */}
        <AnimatePresence mode="wait">
          {sidebarOpen && (
            <motion.div
              initial={{ 
                x: isMobile ? "-100%" : isTablet ? "-100%" : 0,
                opacity: isMobile || isTablet ? 0 : 1 
              }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ 
                x: isMobile ? "-100%" : isTablet ? "-100%" : 0,
                opacity: isMobile || isTablet ? 0 : 1 
              }}
              transition={{ 
                type: "spring",
                damping: 25,
                stiffness: 200,
                duration: 0.3
              }}
              className={`
                ${(isMobile || isTablet) ? "fixed z-50" : "relative"} 
                ${isMobile ? "w-80 max-w-[85vw]" : isTablet ? "w-72" : "w-64"} 
                h-full bg-white shadow-xl border-r border-gray-200 
                flex-shrink-0 overflow-hidden
              `}
            >
              <Sidebar onItemClick={closeSidebar} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Navbar */}
          <Navbar
            sidebarOpen={sidebarOpen}
            toggleSidebar={toggleSidebar}
            isMobile={isMobile}
          />

          {/* Page Content - Optimized scrolling */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
            <div className="p-3 sm:p-4 md:p-6 max-w-full">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="w-full"
              >
                {children || <Outlet />}
              </motion.div>
            </div>
          </main>
        </div>
        
        {/* Connection Status Indicator */}
        <ConnectionStatus />
      </div>
    </div>
  );
}
