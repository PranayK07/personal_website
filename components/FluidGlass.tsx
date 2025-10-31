'use client';

interface NavItem {
  label: string;
  link: string;
}

interface FluidGlassProps {
  navItems?: NavItem[];
}

export default function FluidGlass({ navItems = [] }: FluidGlassProps) {
  const handleNavigate = (link: string) => {
    if (!link) return;
    if (link.startsWith('#')) {
      const element = document.getElementById(link.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.location.href = link;
    }
  };

  return (
    <div 
      className="w-full h-full flex items-center justify-center"
      style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
      }}
    >
      <nav className="flex items-center justify-center gap-8 px-8">
        {navItems.map(({ label, link }) => (
          <button
            key={label}
            onClick={() => handleNavigate(link)}
            className="text-white font-medium text-sm md:text-base px-4 py-2 rounded-lg transition-all duration-300 hover:bg-white/20 hover:scale-105 cursor-pointer"
            style={{
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
            }}
          >
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}
