import React, { ReactNode } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Player from "./Player";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="h-screen flex flex-col" style={{ background: "#0a0a0a" }}>
      <div className="flex flex-1 min-h-0 gap-2 p-2">
        <Sidebar />
        <div
          className="flex-1 rounded-2xl relative flex flex-col overflow-hidden"
          style={{
            background:
              "linear-gradient(160deg, #1a1a2e 0%, #111111 40%, #0d0d0d 100%)",
          }}
        >
          {/* Subtle top gradient accent */}
          <div
            className="absolute top-0 left-0 right-0 h-48 pointer-events-none z-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(29,185,84,0.04) 0%, transparent 100%)",
            }}
          />
          {/* Sticky navbar — never scrolls with content */}
          <div className="relative z-20 px-6 pt-4 pb-2 flex-shrink-0">
            <Navbar />
          </div>
          {/* Scrollable content area */}
          <div className="flex-1 overflow-auto relative z-10 px-6 pt-2 pb-6">
            {children}
          </div>
        </div>
      </div>
      <Player />
    </div>
  );
};

export default Layout;
