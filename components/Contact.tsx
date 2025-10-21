'use client';

export default function Contact() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8" id="contact">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-heading mb-12 text-center">
          Get In Touch
        </h2>
        <div className="bg-card-bg rounded-lg p-8 border border-accent-cyan/20">
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-heading mb-4">
                Let's Connect
              </h3>
              <p className="text-foreground mb-6">
                Feel free to reach out for collaborations, opportunities, or just to say hello!
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-background/50 rounded-lg">
                <span className="text-2xl">📧</span>
                <div>
                  <p className="text-sm text-text-muted">Email</p>
                  <a 
                    href="mailto:your.email@example.com" 
                    className="text-accent-cyan hover:text-accent-cyan-light transition-colors"
                  >
                    your.email@example.com
                  </a>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-background/50 rounded-lg">
                <span className="text-2xl">📍</span>
                <div>
                  <p className="text-sm text-text-muted">Location</p>
                  <p className="text-foreground">South Windsor, CT</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-accent-cyan/20">
              <h4 className="text-lg font-semibold text-heading mb-4 text-center">
                Social Links
              </h4>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="https://github.com/yourusername"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-background/50 rounded-lg border border-accent-cyan/30 hover:border-accent-cyan hover:bg-accent-cyan/10 transition-all"
                >
                  <span className="text-xl">🐙</span>
                  <span className="text-foreground">GitHub</span>
                </a>
                
                <a
                  href="https://linkedin.com/in/yourusername"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-background/50 rounded-lg border border-accent-cyan/30 hover:border-accent-cyan hover:bg-accent-cyan/10 transition-all"
                >
                  <span className="text-xl">💼</span>
                  <span className="text-foreground">LinkedIn</span>
                </a>
                
                <a
                  href="https://twitter.com/yourusername"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-background/50 rounded-lg border border-accent-cyan/30 hover:border-accent-cyan hover:bg-accent-cyan/10 transition-all"
                >
                  <span className="text-xl">🐦</span>
                  <span className="text-foreground">Twitter</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
