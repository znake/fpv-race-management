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
    <header className="bg-night border-b-2 border-neon-pink shadow-glow-pink px-3 lg:px-8 py-2 lg:py-4 flex justify-between items-center gap-2">
      {/* Logo - Responsive: kurz auf Mobile, voll auf Desktop */}
      <h1 className="font-display text-base lg:text-beamer-heat tracking-widest shrink-0">
        <a 
          href="https://fpvooe.com/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:opacity-80 transition-opacity"
        >
          <span className="text-neon-cyan">#</span>
          <span className="bg-gradient-to-r from-neon-pink to-neon-magenta bg-clip-text text-transparent">
            FPVOOE
          </span>
          <span className="text-steel hidden lg:inline"> - </span>
          <span className="text-chrome hidden lg:inline">Racing Management</span>
        </a>
      </h1>
      
      {/* Centered Tab Navigation - Responsive: relativ auf Mobile, absolut zentriert auf Desktop */}
      {activeTab && onTabChange && (
        <nav className="flex gap-1 lg:absolute lg:left-1/2 lg:transform lg:-translate-x-1/2">
          <button
            onClick={() => onTabChange('piloten')}
            className={`px-2 lg:px-4 py-1.5 lg:py-2 rounded-lg font-semibold text-xs lg:text-sm transition-all duration-200 ${
              activeTab === 'piloten'
                ? 'bg-neon-pink/20 text-neon-pink border border-neon-pink/50'
                : 'text-steel hover:text-chrome hover:bg-night-light'
            }`}
          >
            PILOTEN
          </button>
          <button
            onClick={() => onTabChange('turnier')}
            className={`px-2 lg:px-4 py-1.5 lg:py-2 rounded-lg font-semibold text-xs lg:text-sm transition-all duration-200 ${
              activeTab === 'turnier'
                ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50'
                : 'text-steel hover:text-chrome hover:bg-night-light'
            }`}
          >
            TURNIER
          </button>
        </nav>
      )}
      
      {/* Right side: Sponsor + Menu */}
      <div className="flex items-center gap-4">
        {/* Sponsor - nur auf Tablet+ sichtbar */}
        <a 
          href="https://last-space.at" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-2 text-steel hover:text-chrome transition-colors"
        >
          <span className="text-xs uppercase tracking-wider">supported by</span>
          <svg width="66" height="30" viewBox="0 0 66 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-80 hover:opacity-100 transition-opacity">
            <path d="M36.6999 20.942L41.6407 21.9526C43.1753 22.2707 43.4186 22.8883 43.4186 23.5246C43.4186 24.3294 42.8946 24.9844 41.3225 24.9844C39.9002 24.9844 39.0954 24.3294 39.058 22.7199H30.9357V17.7043C30.9357 17.4984 30.9357 17.2926 30.9357 17.0867C31.8715 19.5758 34.267 20.4367 36.6999 20.942ZM21.859 22.514C21.859 23.8802 20.8858 24.6475 19.8004 24.6475C18.6775 24.6475 17.7043 24.1609 17.7043 22.8322C17.7043 21.5783 18.3968 20.287 21.0917 20.1185L21.859 20.0811V22.514ZM62.0586 20.8484V14.6163H65.6893V8.47785H62.0586V2.82595H52.8509V8.47785H49.8565V10.3306C48.0225 8.55271 44.9532 7.84155 41.1728 7.84155C35.0343 7.84155 31.0106 9.80661 30.5427 13.6806C29.5883 9.69432 26.781 7.84155 20.68 7.84155C14.2046 7.84155 9.35745 9.69432 9.35745 15.2714H17.854C17.854 13.3624 18.8646 12.8384 19.9127 12.8384C21.4099 12.8384 21.8964 13.8116 21.8964 15.1029V16.1135L21.0543 16.151C14.9906 16.4504 10.6488 17.6107 9.24517 20.8297V0H0V29.345H9.20774V26.0512C10.2745 28.6712 12.932 29.8316 15.9638 29.8316C18.5465 29.8316 21.1853 29.0268 22.6263 26.912V29.345H30.917V26.3319C32.4891 29.083 36.1385 30 40.8921 30C47.199 30 52.0462 27.8665 52.0462 23.3375C52.0462 19.4635 49.7442 17.592 46.7124 16.9557L42.015 15.9451C40.0312 15.4959 39.2265 15.1778 39.2265 14.2046C39.2265 13.3063 40.1248 12.8759 41.2102 12.8759C42.6326 12.8759 43.2314 13.6806 43.2314 14.9719H51.6344C51.6344 14.8596 51.6344 14.7473 51.6157 14.6538H52.7948V21.4473C52.7948 28.1098 56.1073 29.7006 60.9919 29.7006C62.4517 29.7006 63.9488 29.5883 65.6332 29.3824V23.0006C65.0343 23.1691 64.4541 23.1691 64.0237 23.1691C62.5265 23.1129 62.0586 22.383 62.0586 20.8484Z" fill="currentColor"/>
          </svg>
        </a>
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
