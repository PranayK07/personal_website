'use client';

import { useState, useEffect } from 'react';
// Chat is rendered outside Hero to keep initial view fully centered

export default function Hero() {
  const [typedName, setTypedName] = useState('');
  const [typedRole, setTypedRole] = useState('');
  const [showNameCursor, setShowNameCursor] = useState(true);
  const [showRoleCursor, setShowRoleCursor] = useState(false);
  const [nameComplete, setNameComplete] = useState(false);
  const [roleComplete, setRoleComplete] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [mounted, setMounted] = useState(false);
  // Chat should be present at all times; no scroll-triggered mount

  const fullName = 'Pranay Kakkar';
  const fullRole = 'CS @ UConn';

  useEffect(() => {
    setMounted(true);

    // Type the name first
    let nameIndex = 0;
    const nameTypingInterval = setInterval(() => {
      if (nameIndex <= fullName.length) {
        setTypedName(fullName.slice(0, nameIndex));
        nameIndex++;
      } else {
        clearInterval(nameTypingInterval);
        setNameComplete(true);
        setShowNameCursor(false);

        // Start typing the role after a short delay
        setTimeout(() => {
          setShowRoleCursor(true);
          let roleIndex = 0;
          const roleTypingInterval = setInterval(() => {
            if (roleIndex <= fullRole.length) {
              setTypedRole(fullRole.slice(0, roleIndex));
              roleIndex++;
            } else {
              clearInterval(roleTypingInterval);
              setRoleComplete(true);

              // Show description after role is complete
              setTimeout(() => {
                setShowDescription(true);
              }, 300);
            }
          }, 60);
        }, 400);
      }
    }, 100);

    const nameCursorInterval = setInterval(() => {
      setShowNameCursor((prev) => !prev);
    }, 500);

    const roleCursorInterval = setInterval(() => {
      setShowRoleCursor((prev) => !prev);
    }, 500);

    return () => {
      clearInterval(nameTypingInterval);
      clearInterval(nameCursorInterval);
      clearInterval(roleCursorInterval);
    };
  }, []);

  // Removed scroll-triggered chat visibility to avoid layout jumps

  return (
    <section
      id="home"
      className={`flex items-center justify-center relative px-4`}
      style={{
        // Center hero under the fixed nav; hide chat initially by placing it outside Hero
        paddingTop: 'var(--pillnav-safe-top, 192px)',
        minHeight: 'calc(100vh - var(--pillnav-safe-top, 192px))',
        scrollMarginTop: 'var(--pillnav-safe-top, 192px)'
      }}
    >
      <div className="w-full max-w-4xl mx-auto text-center relative z-10">
        {/* Name with typing animation */}
        <div className="mb-6 min-h-[5rem] md:min-h-[6rem] lg:min-h-[7rem] flex items-center justify-center">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-foreground tracking-tight">
            {typedName}
            {!nameComplete && (
              <span className={`inline-block w-1 h-16 md:h-20 lg:h-24 bg-foreground ml-2 transition-opacity duration-100 ${showNameCursor ? 'opacity-100' : 'opacity-0'}`} />
            )}
          </h1>
        </div>

        {/* Typing effect role */}
        <div className="text-xl md:text-2xl mb-8 min-h-[2.5rem] flex items-center justify-center">
          <span className="text-accent font-medium tracking-wide">
            {typedRole}
            {!roleComplete && (
              <span className={`inline-block w-0.5 h-6 md:h-7 bg-accent ml-1 transition-opacity duration-100 ${showRoleCursor ? 'opacity-100' : 'opacity-0'}`} />
            )}
          </span>
        </div>

        {/* Location */}
        {roleComplete && (
          <div
            className={`transform transition-all duration-700 ease-out ${
              showDescription ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            <div className="flex items-center justify-center gap-2 text-foreground/60 mb-10">
              <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">Connecticut</span>
            </div>
          </div>
        )}

        {/* Bio with unique reveal animation */}
        {roleComplete && (
          <div
            className={`transform transition-all duration-1000 ease-out flex justify-center ${
              showDescription
                ? 'translate-x-0 opacity-100 scale-100 blur-0'
                : 'translate-x-8 opacity-0 scale-95 blur-sm'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            <p className="text-base md:text-lg text-foreground/70 w-full max-w-2xl mb-12 leading-relaxed font-light text-center px-4">
              Hi, I'm Pranay Kakkar, a Computer Science major at UConn, passionate about applying data and machine learning to real-world problems. I've researched cryptography, ML, and physics while also enjoying soccer, astronomy, and side projects that help me learn new skills.
            </p>
          </div>
        )}

  {/* Chat removed from Hero for initial centered layout */}

      </div>
    </section>
  );
}
