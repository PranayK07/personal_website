'use client';

interface Tech {
  name: string;
  bgColor: string;
}

const techStack: Tech[] = [
  { name: 'React', bgColor: 'from-cyan-400 to-blue-500' },
  { name: 'Next.js', bgColor: 'from-gray-700 to-gray-900' },
  { name: 'TypeScript', bgColor: 'from-blue-500 to-blue-700' },
  { name: 'JavaScript', bgColor: 'from-yellow-400 to-yellow-600' },
  { name: 'Node.js', bgColor: 'from-green-500 to-green-700' },
  { name: 'Python', bgColor: 'from-blue-400 to-yellow-400' },
  { name: 'Java', bgColor: 'from-red-500 to-orange-600' },
  { name: 'Git', bgColor: 'from-orange-500 to-red-600' },
  { name: 'Docker', bgColor: 'from-blue-400 to-blue-600' },
  { name: 'AWS', bgColor: 'from-orange-400 to-yellow-500' },
  { name: 'MongoDB', bgColor: 'from-green-500 to-green-700' },
  { name: 'PostgreSQL', bgColor: 'from-blue-600 to-indigo-700' },
];

export default function TechStack() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-heading mb-16 text-center">
          Tech Stack
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 sm:gap-6">
          {techStack.map((tech, index) => (
            <div
              key={index}
              className="group flex flex-col items-center justify-center p-5 bg-card-bg rounded-xl border border-card-border hover:border-accent-cyan/40 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-accent-cyan/10"
            >
              <div className={`w-12 h-12 sm:w-14 sm:h-14 mb-3 rounded-lg bg-gradient-to-br ${tech.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <span className="text-white font-bold text-xs sm:text-sm">
                  {tech.name.substring(0, 2).toUpperCase()}
                </span>
              </div>
              <span className="text-xs sm:text-sm font-medium text-foreground text-center">
                {tech.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
