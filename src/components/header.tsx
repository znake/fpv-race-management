export function Header() {
  return (
    <header className="bg-night border-b-2 border-neon-pink shadow-glow-pink px-8 py-4 flex justify-between items-center">
      {/* Logo */}
      <h1 className="font-display text-4xl tracking-widest">
        <span className="bg-gradient-to-r from-neon-pink to-neon-magenta bg-clip-text text-transparent">
          FPV RACING
        </span>{' '}
        <span className="text-neon-cyan">HEATS</span>
      </h1>
      
      {/* Club Name */}
      <div className="text-steel text-sm">
        FPV Oberösterreich
      </div>
    </header>
  )
}
