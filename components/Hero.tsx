'use client';

export default function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-4 text-heading tracking-tight">
          Pranay Kakkar
        </h1>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium mb-6 text-accent-cyan">
          Computer Science Student
        </h2>
        <p className="text-lg sm:text-xl text-text-muted mb-4">
          South Windsor, CT
        </p>
        <p className="text-base sm:text-lg text-foreground max-w-2xl mx-auto leading-relaxed">
          Passionate about creating innovative solutions and building exceptional digital experiences.
          Currently exploring cutting-edge technologies and contributing to open-source projects.
        </p>
      </div>
    </section>
  );
}
