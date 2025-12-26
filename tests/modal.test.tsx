import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Modal } from '../src/components/ui/modal';

describe('Modal Component', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  describe('Rendering', () => {
    it('sollte nicht rendern, wenn isOpen false ist', () => {
      const { container } = render(
        <Modal isOpen={false} onClose={mockOnClose} title="Test">
          <div>Inhalt</div>
        </Modal>
      );

      expect(container.firstChild).toBeNull();
    });

    it('sollte rendern, wenn isOpen true ist', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test">
          <div>Inhalt</div>
        </Modal>
      );

      expect(screen.getByText('Test')).toBeInTheDocument();
      expect(screen.getByText('Inhalt')).toBeInTheDocument();
    });

    it('sollte korrekte accessibility attributes haben', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
          <div>Inhalt</div>
        </Modal>
      );

      const modalContainer = screen.getByRole('dialog');
      expect(modalContainer).toHaveAttribute('aria-modal', 'true');
      expect(modalContainer).toHaveAttribute('aria-labelledby', 'modal-title');
    });

    it('sollte ohne title rendern, wenn keiner angegeben', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Inhalt ohne Titel</div>
        </Modal>
      );

      expect(screen.getByText('Inhalt ohne Titel')).toBeInTheDocument();
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });
  });

  describe('Escape Key Handler', () => {
    it('sollte onClose aufrufen, wenn Escape gedrückt wird (closeOnEscape=true)', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test">
          <div>Inhalt</div>
        </Modal>
      );

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('sollte NICHT onClose aufrufen, wenn closeOnEscape=false', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} closeOnEscape={false} title="Test">
          <div>Inhalt</div>
        </Modal>
      );

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('sollte NICHT onClose aufrufen, wenn andere Taste gedrückt wird', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test">
          <div>Inhalt</div>
        </Modal>
      );

      fireEvent.keyDown(document, { key: 'Enter' });

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('sollte Event Listener cleanup machen, wenn Modal geschlossen wird', () => {
      const { rerender } = render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test">
          <div>Inhalt</div>
        </Modal>
      );

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(mockOnClose).toHaveBeenCalledTimes(1);

      rerender(
        <Modal isOpen={false} onClose={mockOnClose} title="Test">
          <div>Inhalt</div>
        </Modal>
      );

      // Reset mock
      mockOnClose.mockClear();

      // Event Listener sollte nicht mehr aktiv sein
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Backdrop Click Handler', () => {
    it('sollte onClose aufrufen, wenn Backdrop geklickt wird (closeOnBackdropClick=true)', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test">
          <div>Inhalt</div>
        </Modal>
      );

      const backdrop = screen.getByRole('dialog');
      fireEvent.click(backdrop);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('sollte NICHT onClose aufrufen, wenn Modal-Inhalt geklickt wird (stopPropagation)', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test">
          <div data-testid="modal-content">Inhalt</div>
        </Modal>
      );

      const content = screen.getByTestId('modal-content');
      fireEvent.click(content);

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('sollte NICHT onClose aufrufen, wenn closeOnBackdropClick=false', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} closeOnBackdropClick={false} title="Test">
          <div>Inhalt</div>
        </Modal>
      );

      const backdrop = screen.getByRole('dialog');
      fireEvent.click(backdrop);

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Size Variants', () => {
    it('sollte max-w-sm haben, wenn size="sm"', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} size="sm" title="Test">
          <div>Inhalt</div>
        </Modal>
      );

      const modalContent = screen.getByRole('dialog').firstElementChild;
      expect(modalContent).toHaveClass('max-w-sm');
    });

    it('sollte max-w-md haben, wenn size="md" (default)', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test">
          <div>Inhalt</div>
        </Modal>
      );

      const modalContent = screen.getByRole('dialog').firstElementChild;
      expect(modalContent).toHaveClass('max-w-md');
    });

    it('sollte max-w-lg haben, wenn size="lg"', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} size="lg" title="Test">
          <div>Inhalt</div>
        </Modal>
      );

      const modalContent = screen.getByRole('dialog').firstElementChild;
      expect(modalContent).toHaveClass('max-w-lg');
    });
  });

  describe('Focus Management', () => {
    it('sollte auf Modal-Inhalt focussen, wenn geöffnet', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test">
          <div>Inhalt</div>
        </Modal>
      );

      const modalContent = screen.getByRole('dialog').firstElementChild;
      expect(modalContent).toHaveAttribute('tabIndex', '-1');
    });
  });

  describe('Modal.Footer Subcomponent', () => {
    it('sollte Footer mit korrekten Styles rendern', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test">
          <div>Content</div>
          <Modal.Footer>
            <button>Abbrechen</button>
            <button>Bestätigen</button>
          </Modal.Footer>
        </Modal>
      );

      expect(screen.getByText('Abbrechen')).toBeInTheDocument();
      expect(screen.getByText('Bestätigen')).toBeInTheDocument();

      const footerContainer = screen.getByText('Abbrechen').parentElement;
      expect(footerContainer).toHaveClass('flex', 'gap-4', 'justify-end', 'mt-6');
    });
  });

  describe('Styling', () => {
    it('sollte korrekte Synthwave Styles haben', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test">
          <div>Inhalt</div>
        </Modal>
      );

      const modalContainer = screen.getByRole('dialog');
      expect(modalContainer).toHaveClass(
        'fixed',
        'inset-0',
        'bg-void/80',
        'flex',
        'items-center',
        'justify-center',
        'z-50'
      );

      const modalContent = modalContainer.firstElementChild;
      expect(modalContent).toHaveClass(
        'bg-void-light',
        'border',
        'border-cyber-cyan/30',
        'rounded-2xl',
        'p-6',
        'shadow-glow-cyan'
      );
    });
  });
});
