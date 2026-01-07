# Story 2.1: Generisches Modal-Komponente erstellen

**Epic:** Komponenten Refactoring
**Aufwand:** S
**Priorität:** 3 (Sprint 3)
**Abhängigkeiten:** Keine

## Beschreibung

Als Entwickler möchte ich eine wiederverwendbare Modal-Komponente in `ui/` haben, damit alle 6 Modal-Implementierungen konsolidiert werden und zukünftige Dialoge konsistent implementiert werden können.

## Akzeptanzkriterien

- [ ] AC1: `src/components/ui/modal.tsx` existiert mit Props: `isOpen`, `onClose`, `title`, `children`, `size` (sm/md/lg)
- [ ] AC2: Modal verwendet einheitliches Pattern: `fixed inset-0 bg-void/80 flex items-center justify-center z-50`
- [ ] AC3: Escape-Taste schließt Modal
- [ ] AC4: Klick auf Backdrop schließbar via `closeOnBackdropClick` Prop (default: true)
- [ ] AC5: Accessibility: `role="dialog"`, `aria-modal="true"`, Focus-Trap implementiert
- [ ] AC6: Alle Tests für bestehende Modal-Nutzungen bleiben grün

## Technische Details

### Betroffene Dateien
- Neue Datei: `src/components/ui/modal.tsx`

### Implementierungsvorlage

```tsx
import { useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnBackdropClick = true,
  closeOnEscape = true,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Escape key handler
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, closeOnEscape]);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;
    modalRef.current?.focus();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-void/80 flex items-center justify-center z-50"
      onClick={closeOnBackdropClick ? onClose : undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        ref={modalRef}
        className={cn(
          'bg-void-light border border-cyber-cyan/30 rounded-2xl p-6',
          'shadow-glow-cyan',
          sizeClasses[size]
        )}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        {title && (
          <h2 id="modal-title" className="text-xl font-bold text-white mb-4">
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  );
}

// Optional: Subcomponents for composition
Modal.Footer = function ModalFooter({ children }: { children: React.ReactNode }) {
  return <div className="flex gap-4 justify-end mt-6">{children}</div>;
};
```

## Testplan

1. Neuer Test: `tests/modal.test.tsx`
   - Modal öffnet und schließt korrekt
   - Escape-Taste funktioniert
   - Backdrop-Click funktioniert
   - Focus-Trap funktioniert
2. `npm test` - alle Tests müssen grün bleiben
