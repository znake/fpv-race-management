import { useState, useRef, useEffect } from 'react'

type Tab = 'piloten' | 'turnier'

interface HeaderProps {
  onResetAll?: () => void
  activeTab?: Tab
  onTabChange?: (tab: Tab) => void
}

export function Header({ onResetAll, activeTab, onTabChange }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuOpen])

  return (
    <header className="bg-night border-b-2 border-neon-pink shadow-glow-pink px-8 py-4 flex justify-between items-center">
      {/* Logo - Beamer-optimiert (min 36px) */}
      <h1 className="font-display text-beamer-heat tracking-widest">
        <span className="text-neon-cyan">#</span>
        <span className="bg-gradient-to-r from-neon-pink to-neon-magenta bg-clip-text text-transparent">
          FPVOOE
        </span>
        <span className="text-steel"> - </span>
        <span className="text-chrome">Racing Management</span>
      </h1>
      
      {/* Centered Tab Navigation */}
      {activeTab && onTabChange && (
        <nav className="absolute left-1/2 transform -translate-x-1/2 flex gap-1">
          <button
            onClick={() => onTabChange('piloten')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
              activeTab === 'piloten'
                ? 'bg-neon-pink/20 text-neon-pink border border-neon-pink/50'
                : 'text-steel hover:text-chrome hover:bg-night-light'
            }`}
          >
            PILOTEN
          </button>
          <button
            onClick={() => onTabChange('turnier')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
              activeTab === 'turnier'
                ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50'
                : 'text-steel hover:text-chrome hover:bg-night-light'
            }`}
          >
            TURNIER
          </button>
        </nav>
      )}
      
      {/* Right side: Menu - Beamer-optimiert */}
      <div className="flex items-center gap-4">
        {/* Settings Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 text-steel hover:text-neon-cyan transition-colors rounded-lg hover:bg-night-light"
            aria-label="Menü öffnen"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            {/* Three dots icon */}
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="currentColor"
            >
              <circle cx="12" cy="5" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="19" r="2" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {menuOpen && (
            <div 
              className="absolute right-0 top-full mt-2 bg-night border border-steel/30 rounded-lg shadow-lg overflow-hidden min-w-[200px] z-50"
              role="menu"
            >
              {onResetAll && (
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    onResetAll()
                  }}
                  className="w-full px-4 py-3 text-left text-loser-red hover:bg-loser-red/10 transition-colors text-beamer-body font-medium flex items-center gap-2 min-h-[48px]"
                  role="menuitem"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                  Alles löschen
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
