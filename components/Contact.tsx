'use client';

import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useState, RefObject } from 'react';

export default function Contact() {
  const [ref, isVisible] = useScrollAnimation(0.2);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <section id="contact" className="section py-20" style={{ scrollMarginTop: 'var(--pillnav-safe-top, 192px)' }}>
      <div className="container text-center">
        <div
          ref={ref as RefObject<HTMLDivElement>}
          className={`scroll-fade-in ${isVisible ? 'visible' : ''}`}
        >
          <h2 className="heading-2 text-center mb-12 relative inline-block">
            Get In Touch
            <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-50" />
          </h2>
          <div className="card max-w-2xl mx-auto relative overflow-hidden backdrop-blur-md bg-background/40">
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-accent/5 opacity-50" />

            <div className="relative z-10">
              <div className="text-center mb-8">
                <h3 className="heading-3 mb-4">
                  Let's Connect
                </h3>
                <p className="text-muted max-w-md mx-auto">
                  Feel free to reach out for collaborations, opportunities, or just to say hello!
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <div
                  onMouseEnter={() => setHoveredCard('email')}
                  onMouseLeave={() => setHoveredCard(null)}
                  className="flex flex-col items-center p-6 bg-section-bg/50 backdrop-blur-sm rounded-xl transition-all duration-300 group"
                >
                  <div className={`text-4xl mb-3 transition-transform duration-300 ${hoveredCard === 'email' ? 'scale-110' : ''}`}>
                    📧
                  </div>
                  <p className="text-xs text-muted mb-2 uppercase tracking-wider">Email</p>
                  <a
                    href="mailto:pranay.kakkar@outlook.com"
                    className="text-sm text-accent hover:text-accent-hover transition-colors font-medium"
                  >
                    pranay.kakkar@outlook.com
                  </a>
                </div>

                <div
                  onMouseEnter={() => setHoveredCard('location')}
                  onMouseLeave={() => setHoveredCard(null)}
                  className="flex flex-col items-center p-6 bg-section-bg/50 backdrop-blur-sm rounded-xl transition-all duration-300 group"
                >
                  <div className={`text-4xl mb-3 transition-transform duration-300 ${hoveredCard === 'location' ? 'scale-110' : ''}`}>
                    📍
                  </div>
                  <p className="text-xs text-muted mb-2 uppercase tracking-wider">Location</p>
                  <p className="text-sm text-foreground font-medium">Connecticut</p>
                </div>
              </div>

              <div className="pt-6">
                <h4 className="text-base font-semibold text-foreground mb-6 text-center flex items-center justify-center gap-2">
                  <span className="h-px w-8 bg-gradient-to-r from-transparent to-accent" />
                  Social Links
                  <span className="h-px w-8 bg-gradient-to-l from-transparent to-accent" />
                </h4>
                <div className="flex flex-wrap justify-center gap-3">
                  <a
                    href="https://github.com/PranayK07"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-3 bg-section-bg/50 backdrop-blur-sm rounded-xl hover:bg-accent/10 transition-all duration-300 hover:scale-105 group"
                  >
                    <svg className="w-5 h-5 text-foreground group-hover:text-accent transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                    </svg>
                    <span className="text-sm text-foreground group-hover:text-accent transition-colors font-medium">GitHub</span>
                  </a>

                  <a
                    href="https://linkedin.com/in/pranay-kakkar"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-3 bg-section-bg/50 backdrop-blur-sm rounded-xl hover:bg-accent/10 transition-all duration-300 hover:scale-105 group"
                  >
                    <svg className="w-5 h-5 text-foreground group-hover:text-accent transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    <span className="text-sm text-foreground group-hover:text-accent transition-colors font-medium">LinkedIn</span>
                  </a>

                  <a
                    href="https://twitter.com/pranay_kakkar"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-3 bg-section-bg/50 backdrop-blur-sm rounded-xl hover:bg-accent/10 transition-all duration-300 hover:scale-105 group"
                  >
                    <svg className="w-5 h-5 text-foreground group-hover:text-accent transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                    <span className="text-sm text-foreground group-hover:text-accent transition-colors font-medium">Twitter</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
