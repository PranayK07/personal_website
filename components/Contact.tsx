'use client';

export default function Contact() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8" id="contact">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-heading mb-16 text-center">
          Get In Touch
        </h2>
        <div className="bg-card-bg/60 backdrop-blur-sm rounded-2xl p-8 sm:p-10 border border-card-border shadow-xl">
          <div className="text-center mb-8">
            <h3 className="text-xl sm:text-2xl font-semibold text-heading mb-3">
              Let's Connect
            </h3>
            <p className="text-foreground/80 text-sm sm:text-base">
              Feel free to reach out for collaborations, opportunities, or just to say hello!
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="flex flex-col items-center p-5 bg-background/50 rounded-xl border border-card-border hover:border-accent-cyan/30 transition-all">
              <div className="text-3xl mb-2">📧</div>
              <p className="text-xs text-text-muted mb-1">Email</p>
              <a 
                href="mailto:your.email@example.com" 
                className="text-sm text-accent-cyan hover:text-accent-cyan-light transition-colors font-medium"
              >
                your.email@example.com
              </a>
            </div>
            
            <div className="flex flex-col items-center p-5 bg-background/50 rounded-xl border border-card-border">
              <div className="text-3xl mb-2">📍</div>
              <p className="text-xs text-text-muted mb-1">Location</p>
              <p className="text-sm text-foreground font-medium">South Windsor, CT</p>
            </div>
          </div>

          <div className="pt-6 border-t border-card-border">
            <h4 className="text-base font-semibold text-heading mb-5 text-center">
              Social Links
            </h4>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href="https://github.com/yourusername"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 bg-background/50 rounded-xl border border-card-border hover:border-accent-cyan/40 hover:bg-accent-cyan/5 transition-all group"
              >
                <svg className="w-5 h-5 text-foreground group-hover:text-accent-cyan transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                <span className="text-sm text-foreground group-hover:text-accent-cyan transition-colors font-medium">GitHub</span>
              </a>
              
              <a
                href="https://linkedin.com/in/yourusername"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 bg-background/50 rounded-xl border border-card-border hover:border-accent-cyan/40 hover:bg-accent-cyan/5 transition-all group"
              >
                <svg className="w-5 h-5 text-foreground group-hover:text-accent-cyan transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <span className="text-sm text-foreground group-hover:text-accent-cyan transition-colors font-medium">LinkedIn</span>
              </a>
              
              <a
                href="https://twitter.com/yourusername"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 bg-background/50 rounded-xl border border-card-border hover:border-accent-cyan/40 hover:bg-accent-cyan/5 transition-all group"
              >
                <svg className="w-5 h-5 text-foreground group-hover:text-accent-cyan transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
                <span className="text-sm text-foreground group-hover:text-accent-cyan transition-colors font-medium">Twitter</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
