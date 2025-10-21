'use client';

export default function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 text-heading tracking-tight leading-tight">
          Pranay Kakkar
        </h1>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-medium mb-4 text-accent-cyan">
          Computer Science Student
        </h2>
        <p className="text-base sm:text-lg text-text-muted mb-8">
          South Windsor, CT
        </p>
        <p className="text-base sm:text-lg text-foreground/80 max-w-2xl mx-auto leading-relaxed">
          Passionate about creating innovative solutions and building exceptional digital experiences.
          Currently exploring cutting-edge technologies and contributing to open-source projects.
        </p>
      </div>
    </section>
  );
}
